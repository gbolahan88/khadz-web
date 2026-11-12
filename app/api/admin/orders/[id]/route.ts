// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/lib/order-status";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await requireAdmin(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const patch: {
      status?: OrderStatus;
      riderId?: string | null;
    } = {};

    if (body.status !== undefined) {
      if (!ORDER_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      patch.status = body.status;
    }

    if (body.riderId !== undefined) {
      patch.riderId = body.riderId === null ? null : String(body.riderId);
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(orders)
      .set(patch)
      .where(eq(orders.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Send email if status changed
    if (patch.status) {
      const [customer] = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.firebaseUid, updated.userId))
        .limit(1);

      if (customer?.email) {
        const statusLabel = STATUS_LABELS[patch.status] || patch.status;
        
        resend.emails.send({
          from: "Khadz Burger <onboarding@resend.dev>",
          to: "onigbolahan88@gmail.com", // Change to customer.email once domain is verified
          subject: `Order #${updated.id.slice(0, 8)} Update`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h1 style="color: #ea580c;">Khadz Burger</h1>
              <p>Hi ${customer.name || "there"},</p>
              <p>Your order status is now: <strong>${statusLabel}</strong>.</p>
              <p>Thanks for choosing Khadz Burger!</p>
            </div>
          `,
        }).catch((err) => console.error("Status email failed:", err));
      }
    }

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}