// app/api/webhooks/paystack/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, users, orderItems, products } from "@/lib/db/schema";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    // 1. Get the raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 401 });
    }

    // 2. Verify the event is genuinely from Paystack
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.warn("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Parse the verified payload
    const payload = JSON.parse(rawBody);

    // We only care about successful charges
    if (payload.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const reference = payload.data.reference as string; // e.g., "order_uuid"
    const orderId = reference.replace("order_", "");

    // 4. Update the order (Idempotent)
    // We only update if the current status is "pending" to prevent overwriting
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: "preparing" })
      .where(eq(orders.id, orderId))
      .returning();

    // If no order was updated, it might have already been processed by the callback route.
    if (!updatedOrder) {
      console.log(`Order ${orderId} already processed or not found.`);
      return NextResponse.json({ received: true });
    }

    // 5. Send the Confirmation Email (Same logic as your callback route)
    const [customer] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.firebaseUid, updatedOrder.userId))
      .limit(1);

    if (customer?.email) {
      // Fetch items for the email
      const items = await db
        .select({
          name: products.name,
          quantity: orderItems.quantity,
          price: orderItems.priceAtPurchase,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, orderId));

      const itemsHtml = items
        .map((i) => `<li>${i.quantity}x ${i.name} - ₦${Number(i.price).toLocaleString()}</li>`)
        .join("");

      const resend = new Resend(process.env.RESEND_API_KEY);

      resend.emails.send({
        from: "Khadz Burger <onboarding@resend.dev>",
        to: "onigbolahan88@gmail.com", // Change to customer.email once domain is verified
        subject: `Payment Received: Order #${orderId.slice(0, 8)}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h1 style="color: #ea580c;">Khadz Burger</h1>
            <p>Hi ${customer.name || "there"},</p>
            <p>We've received your payment for order <strong>#${orderId.slice(0, 8)}</strong>.</p>
            <ul>${itemsHtml}</ul>
            <p>Total: <strong>₦${Number(updatedOrder.total).toLocaleString()}</strong></p>
            <p>We are preparing your food now!</p>
          </div>
        `,
      }).catch((err) => console.error("Webhook email failed:", err));
    }

    // 6. Always respond with 200 quickly so Paystack doesn't retry
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook processing failed:", error);
    // Return 500 so Paystack knows to retry later
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}