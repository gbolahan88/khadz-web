// app/api/auth/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
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

    // 3. Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.firebaseUid, decoded.uid),
    });

    if (existingUser) {
      // If user exists, ONLY update name and email. Never touch the role.
      await db
        .update(users)
        .set({
          email: decoded.email ?? existingUser.email,
          name: decoded.name ?? existingUser.name,
        })
        .where(eq(users.firebaseUid, decoded.uid));

      return NextResponse.json({ user: existingUser, action: "updated" });
    }

    // 4. If user doesn't exist, insert them as a customer
    const [newUser] = await db
      .insert(users)
      .values({
        firebaseUid: decoded.uid,
        email: decoded.email ?? "",
        name: decoded.name ?? null,
        role: "customer", // Default role for new signups
      })
      .returning();

    return NextResponse.json({ user: newUser, action: "created" });
    
  } catch (error) {
    console.error("Sync failed:", error);
    return NextResponse.json(
      { error: "Invalid token or DB error" },
      { status: 401 },
    );
  }
}