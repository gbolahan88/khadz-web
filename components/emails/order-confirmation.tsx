// components/emails/order-confirmation.tsx
import * as React from "react";

interface OrderConfirmationEmailProps {
  customerName: string | null;
  orderId: string;
  total: string;
}

export function OrderConfirmationEmail({
  customerName,
  orderId,
  total,
}: OrderConfirmationEmailProps) {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1 style={{ color: "#ea580c" }}>Khadz Burger</h1>
      <p>Hi {customerName || "there"},</p>
      <p>Your order <strong>#{orderId.slice(0, 8)}</strong> has been received!</p>
      <p>Total: <strong>₦{Number(total).toLocaleString()}</strong></p>
      <p>We will notify you when your food is on the way.</p>
      <br />
      <p>Freshly made. Lovingly served.</p>
    </div>
  );
}