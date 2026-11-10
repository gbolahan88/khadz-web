// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { orders, users, riders } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const check = await requireAdmin(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const rows = await db
      .select({
        id: orders.id,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        deliveryAddress: orders.deliveryAddress,
        deliveryPhone: orders.deliveryPhone,
        notes: orders.notes,
        userId: orders.userId,
        customerName: users.name,
        customerEmail: users.email,
        riderId: orders.riderId,
        riderName: riders.name,
        riderPhone: riders.phone,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.firebaseUid))
      .leftJoin(riders, eq(orders.riderId, riders.id))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({ orders: rows });
  } catch (error) {
    console.error("Admin list failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}