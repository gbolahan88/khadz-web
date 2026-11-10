// app/api/orders/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq, desc, inArray } from "drizzle-orm";
import { adminAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    // Fetch user's orders
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, decoded.uid))
      .orderBy(desc(orders.createdAt));

    if (userOrders.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // Fetch all items for those orders
    const orderIds = userOrders.map((o) => o.id);
    const allItems = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        quantity: orderItems.quantity,
        priceAtPurchase: orderItems.priceAtPurchase,
        productId: orderItems.productId,
        productName: products.name,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.orderId, orderIds));

    // Group items by order
    const itemsByOrder = new Map<string, typeof allItems>();
    for (const item of allItems) {
      if (!itemsByOrder.has(item.orderId)) itemsByOrder.set(item.orderId, []);
      itemsByOrder.get(item.orderId)!.push(item);
    }

    const shaped = userOrders.map((o) => ({
      id: o.id,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      items: (itemsByOrder.get(o.id) ?? []).map((it) => ({
        id: it.id,
        name: it.productName,
        quantity: it.quantity,
        priceAtPurchase: it.priceAtPurchase,
      })),
    }));

    return NextResponse.json({ orders: shaped });
  } catch (error) {
    console.error("List orders failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}