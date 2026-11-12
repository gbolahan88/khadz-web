// app/api/paystack/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
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
      return NextResponse.redirect(new URL("/cart?error=payment_failed", request.url));
    }

    const orderId = reference.replace("order_", "");
    
    // 2. Update the order in Postgres ONLY IF it is still "pending"
    // If the webhook already processed it, this query will return 0 rows.
    await db.update(orders)
      .set({ status: "preparing" })
      .where(and(eq(orders.id, orderId), eq(orders.status, "pending")));

    // 3. The email logic is now handled exclusively by the webhook.
    // We don't send it here to avoid duplicate emails.

    // 4. Redirect to the success page
    return NextResponse.redirect(new URL(`/orders?new=${orderId}`, request.url));

  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.redirect(new URL("/cart?error=verify_failed", request.url));
  }
}