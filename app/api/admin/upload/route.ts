// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(request: NextRequest) {
  const check = await requireAdmin(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Basic validation (Vercel Blob also enforces limits)
    if (file.size > 4.5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 4.5MB on server upload)" },
        { status: 400 },
      );
    }

    const blob = await put(file.name, file, {
      access: "public", // Public so next/image can render it
      addRandomSuffix: true, // Prevents filename collisions [citation:7]
    });

    return NextResponse.json({ url: blob.url, key: blob.pathname });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}