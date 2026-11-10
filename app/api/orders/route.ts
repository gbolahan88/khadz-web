import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { adminAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/db";
import { orders, orderItems, products, users } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const body = await request.json();
    const items: { productId: string; quantity: number }[] = body.items;
    const address: string = body.address;
    const phone: string = body.phone;
    const notes: string = body.notes ?? "";

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!address || !phone) {
      return NextResponse.json(
        { error: "Address and phone are required" },
        { status: 400 },
      );
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.firebaseUid, decoded.uid),
    });

    if (!existingUser) {
      await db.insert(users).values({
        firebaseUid: decoded.uid,
        email: decoded.email ?? "",
        name: decoded.name ?? null,
      });
    }

    const productIds = items.map((i) => i.productId);
    const dbProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products not found" },
        { status: 400 },
      );
    }

    const priceMap = new Map(dbProducts.map((p) => [p.id, Number(p.price)]));

    let total = 0;
    const lineItems = items.map((i) => {
      const unitPrice = priceMap.get(i.productId) ?? 0;
      total += unitPrice * i.quantity;
      return {
        productId: i.productId,
        quantity: i.quantity,
        priceAtPurchase: unitPrice.toFixed(2),
      };
    });

    const order = await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId: decoded.uid,
          total: total.toFixed(2),
          status: "pending",
          deliveryAddress: address,
          deliveryPhone: phone,
          notes: notes || null,
        })
        .returning();

      await tx.insert(orderItems).values(
        lineItems.map((li) => ({
          orderId: newOrder.id,
          productId: li.productId,
          quantity: li.quantity,
          priceAtPurchase: li.priceAtPurchase,
        })),
      );

      return newOrder;
    });

    return NextResponse.json({ orderId: order.id, total });
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { error: "Could not create order" },
      { status: 500 },
    );
  }
}