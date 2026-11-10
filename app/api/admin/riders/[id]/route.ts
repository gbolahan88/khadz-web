// app/api/admin/riders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { riders } from "@/lib/db/schema";

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
      .delete(riders)
      .where(eq(riders.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Rider delete failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}