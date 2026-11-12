// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sql, eq, ne } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const check = await requireAdmin(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "daily";

    // 1. Basic Stats
    const revenueResult = await db
      .select({ total: sql<string>`SUM(${orders.total})` })
      .from(orders)
      .where(ne(orders.status, "pending"));
    const totalRevenue = Number(revenueResult[0]?.total || 0);

    const ordersCount = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const totalOrders = Number(ordersCount[0]?.count || 0);

    const activeOrdersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(sql`${orders.status} IN ('pending', 'preparing', 'on_the_way')`);
    const activeOrders = Number(activeOrdersResult[0]?.count || 0);

    const customersCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "customer"));
    const totalCustomers = Number(customersCount[0]?.count || 0);

    // 2. Revenue Chart Data (Dynamic based on period)
    let chartData: { label: string; revenue: number }[] = [];
    try {
      let dateFilter = sql``;
      let groupBy = sql``;
      let orderBy = sql``;
      let dateFormat = "";

      const now = new Date();

      if (period === "daily") {
        // Last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        dateFilter = sql`${orders.createdAt} >= ${sevenDaysAgo}`;
        dateFormat = "Dy"; // e.g., "Mon"
        groupBy = sql`TO_CHAR(${orders.createdAt}, 'Dy'), DATE(${orders.createdAt})`;
        orderBy = sql`DATE(${orders.createdAt})`;
      } else if (period === "weekly") {
        // Last 8 weeks
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(now.getDate() - 56);
        dateFilter = sql`${orders.createdAt} >= ${eightWeeksAgo}`;
        dateFormat = '"Wk" IW'; // e.g., "Wk 45"
        groupBy = sql`TO_CHAR(${orders.createdAt}, 'IYYY-IW'), TO_CHAR(${orders.createdAt}, '"Wk" IW')`;
        orderBy = sql`TO_CHAR(${orders.createdAt}, 'IYYY-IW')`;
      } else if (period === "monthly") {
        // Last 12 months
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(now.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);
        dateFilter = sql`${orders.createdAt} >= ${twelveMonthsAgo}`;
        dateFormat = "Mon YY"; // e.g., "Nov 26"
        groupBy = sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM'), TO_CHAR(${orders.createdAt}, 'Mon YY')`;
        orderBy = sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`;
      } else if (period === "yearly") {
        // Last 5 years
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(now.getFullYear() - 4);
        fiveYearsAgo.setMonth(0, 1);
        fiveYearsAgo.setHours(0, 0, 0, 0);
        dateFilter = sql`${orders.createdAt} >= ${fiveYearsAgo}`;
        dateFormat = "YYYY";
        groupBy = sql`TO_CHAR(${orders.createdAt}, 'YYYY')`;
        orderBy = sql`TO_CHAR(${orders.createdAt}, 'YYYY')`;
      }

      const result = await db
        .select({
          label: sql<string>`TO_CHAR(${orders.createdAt}, ${sql.raw(`'${dateFormat}'`)})`,
          revenue: sql<string>`SUM(${orders.total})`,
        })
        .from(orders)
        .where(
          sql`${dateFilter} AND ${orders.status} != 'pending'`
        )
        .groupBy(groupBy)
        .orderBy(orderBy);
      
      chartData = result.map((d) => ({
        label: d.label.trim(),
        revenue: Number(d.revenue || 0),
      }));
    } catch (e) {
      console.error("Revenue chart query failed (non-fatal):", e);
    }

    // 3. Status Chart Data
    let statusData: { name: string; value: number }[] = [];
    try {
      const statusCounts = await db
        .select({
          status: orders.status,
          count: sql<number>`count(*)`,
        })
        .from(orders)
        .groupBy(orders.status);
        
      statusData = statusCounts.map((s) => ({
        name: s.status.replace("_", " ").toUpperCase(),
        value: Number(s.count || 0),
      }));
    } catch (e) {
      console.error("Status chart query failed (non-fatal):", e);
    }

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      activeOrders,
      totalCustomers,
      chartData: {
        revenue: chartData,
        statuses: statusData,
      },
    });
  } catch (error) {
    console.error("Stats fetch failed:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}