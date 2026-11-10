// app/api/paystack/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(new URL("/cart?error=missing_ref", request.url));
  }

  try {
    // 1. Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      // Payment failed or was abandoned
      return NextResponse.redirect(new URL("/cart?error=payment_failed", request.url));
    }

    // 2. Payment is successful. Update the order in Postgres.
    // We used `order_{id}` as the reference, so extract the ID.
    const orderId = reference.replace("order_", "");
    
    // Optional: Verify the amount matches to prevent tampering
    // (Compare verifyData.data.amount / 100 with the order total in DB)

    await db.update(orders)
      .set({ status: "paid" }) // Or "confirmed", "preparing", etc.
      .where(eq(orders.id, orderId));

    // 3. Redirect to the success page
    // We pass the order ID so the frontend can show the success banner
    return NextResponse.redirect(new URL(`/orders?new=${orderId}`, request.url));

  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.redirect(new URL("/cart?error=verify_failed", request.url));
  }
}