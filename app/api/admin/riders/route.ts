// app/api/admin/riders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { riders } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const check = await requireAdmin(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const list = await db
      .select()
      .from(riders)
      .orderBy(desc(riders.createdAt));

    return NextResponse.json({ riders: list });
  } catch (error) {
    console.error("Riders list failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 },
      );
    }

    const [rider] = await db
      .insert(riders)
      .values({ name, phone })
      .returning();

    return NextResponse.json({ rider });
  } catch (error) {
    console.error("Rider create failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}