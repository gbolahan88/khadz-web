// lib/sync-user.ts
"use client";

import type { User } from "firebase/auth";

/**
 * After a Firebase user logs in/signs up, verify their token
 * server-side and upsert them into Postgres `users` table.
 */
export async function syncUserToPostgres(firebaseUser: User): Promise<void> {
  try {
    const token = await firebaseUser.getIdToken(true);

    const res = await fetch("/api/auth/sync", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("Sync failed:", body.error ?? res.statusText);
    }
  } catch (err) {
    console.error("Sync error:", err);
  }
}