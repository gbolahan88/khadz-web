// app/api/auth/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    // 1. Read the Authorization header ("Bearer <token>")
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify the Firebase ID token
    const decoded = await adminAuth.verifyIdToken(token);

    // 3. Upsert into Postgres
    const [user] = await db
      .insert(users)
      .values({
        firebaseUid: decoded.uid,
        email: decoded.email ?? "",
        name: decoded.name ?? null,
      })
      .onConflictDoUpdate({
        target: users.firebaseUid,
        set: {
          email: decoded.email ?? "",
          name: decoded.name ?? null,
        },
      })
      .returning();

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Sync failed:", error);
    return NextResponse.json(
      { error: "Invalid token or DB error" },
      { status: 401 },
    );
  }
}