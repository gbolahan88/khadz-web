// lib/require-admin.ts
import { eq } from "drizzle-orm";
import { adminAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type AdminCheckResult =
  | { ok: true; uid: string; email: string }
  | { ok: false; status: number; error: string };

/**
 * Verify the Authorization header, decode the Firebase token,
 * and confirm the Postgres user has role = 'admin'.
 *
 * Usage in any admin API route:
 *
 *   const check = await requireAdmin(request);
 *   if (!check.ok) {
 *     return NextResponse.json({ error: check.error }, { status: check.status });
 *   }
 *   // check.uid is now the admin's Firebase UID
 */
export async function requireAdmin(
  request: Request,
): Promise<AdminCheckResult> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    return { ok: false, status: 401, error: "Invalid token" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.firebaseUid, decoded.uid))
    .limit(1);

  if (!user) {
    return { ok: false, status: 403, error: "User not found" };
  }

  if (user.role !== "admin") {
    return { ok: false, status: 403, error: "Forbidden: admin only" };
  }

  return { ok: true, uid: user.firebaseUid, email: user.email };
}