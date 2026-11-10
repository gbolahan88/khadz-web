// app/api/admin/products-list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const check = await requireAdmin(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const list = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    return NextResponse.json({ products: list });
  } catch (error) {
    console.error("Products list failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}