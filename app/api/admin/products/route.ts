// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  const check = await requireAdmin(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const price = String(body.price ?? "").trim();
    const image = String(body.image ?? "").trim();
    const category = String(body.category ?? "").trim();

    if (!name || !price || !image || !category) {
      return NextResponse.json(
        { error: "Name, price, image, and category are required" },
        { status: 400 },
      );
    }

    const [product] = await db
      .insert(products)
      .values({
        name,
        price,
        image,
        category,
        description: body.description || null,
        rating: body.rating ?? "0",
        deliveryInfo: body.deliveryInfo || null,
        availabilityStatus: body.availabilityStatus || "In Stock",
      })
      .returning();

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product create failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}