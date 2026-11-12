// app/api/orders/route.ts
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

    const userEmail = decoded.email;
    if (!userEmail) {
      return NextResponse.json({ error: "Email required for payment" }, { status: 400 });
    }

    const amountInKobo = Math.round(total * 100);

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        amount: amountInKobo,
        reference: `order_${order.id}`, 
        callback_url: `${baseUrl}/api/paystack/callback`,
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      total,
      authorizationUrl: paystackData.data.authorization_url,
    });

  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { error: "Could not create order" },
      { status: 500 },
    );
  }
}