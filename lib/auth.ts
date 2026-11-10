// lib/auth.ts
"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

/**
 * Create a new Firebase user with email/password.
 * Also sets the displayName if provided.
 */
export async function signup(
  email: string,
  password: string,
  name: string,
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }
  return cred.user;
}

/**
 * Sign in an existing user with email/password.
 */
export async function login(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/**
 * Sign in, then verify the user is an admin in Postgres.
 * If not admin → signs out and throws an error.
 * Returns the user if admin.
 */
export async function loginAsAdmin(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  // Ask the server: is this user admin in Postgres?
  const token = await user.getIdToken(true);
  const res = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    await signOut(auth);
    throw new Error("Could not verify admin status");
  }

  const data = await res.json();
  if (data.user?.role !== "admin") {
    await signOut(auth);
    throw new Error("This account is not an admin");
  }

  return user;
}

/**
 * Sign out the current user.
 */
export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Translate Firebase error codes into human-readable messages.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null) return "Unknown error";
  const code = (error as { code?: string }).code;

  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered. Try logging in.";
    case "auth/invalid-email":
      return "That email address is not valid.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    default:
      return (error as { message?: string }).message ?? "Something went wrong.";
  }
}