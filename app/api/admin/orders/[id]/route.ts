// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

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

    // Build the patch object — only include fields that were sent
    const patch: {
      status?: OrderStatus;
      riderId?: string | null;
    } = {};

    if (body.status !== undefined) {
      if (!ORDER_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 },
        );
      }
      patch.status = body.status;
    }

    if (body.riderId !== undefined) {
      // riderId can be null (unassign) or a UUID string
      patch.riderId = body.riderId === null ? null : String(body.riderId);
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(orders)
      .set(patch)
      .where(eq(orders.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}