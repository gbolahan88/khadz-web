// lib/firebase-admin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
  throw new Error("FIREBASE_ADMIN_PROJECT_ID is not set");
}
if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
  throw new Error("FIREBASE_ADMIN_CLIENT_EMAIL is not set");
}
if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
  throw new Error("FIREBASE_ADMIN_PRIVATE_KEY is not set");
}

// Reuse the app if already initialized (Next.js hot-reload safe)
const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          // Convert \n back to real newlines
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(
            /\\n/g,
            "\n",
          ),
        }),
      });

export const adminAuth = getAuth(adminApp);