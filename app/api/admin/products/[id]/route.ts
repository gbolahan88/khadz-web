// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { deleteBlobFile } from "@/lib/blob";

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

    // Fetch existing product to know the old image URL
    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) patch.name = String(body.name).trim();
    if (body.price !== undefined) patch.price = String(body.price).trim();
    if (body.image !== undefined) patch.image = String(body.image).trim();
    if (body.category !== undefined)
      patch.category = String(body.category).trim();
    if (body.description !== undefined)
      patch.description = body.description || null;
    if (body.rating !== undefined) patch.rating = body.rating;
    if (body.deliveryInfo !== undefined)
      patch.deliveryInfo = body.deliveryInfo || null;
    if (body.availabilityStatus !== undefined)
      patch.availabilityStatus = body.availabilityStatus;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(products)
      .set(patch)
      .where(eq(products.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // If the image was changed, delete the old one from Vercel Blob
    if (patch.image && patch.image !== existing.image) {
      await deleteBlobFile(existing.image);
    }

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("Product update failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await requireAdmin(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Clean up the image file from Vercel Blob
    await deleteBlobFile(deleted.image);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Foreign key error if product is in past orders
    console.error("Product delete failed:", error);
    return NextResponse.json(
      {
        error:
          "Cannot delete — this product appears in past orders. Edit it instead.",
      },
      { status: 400 },
    );
  }
}