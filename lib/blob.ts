// lib/blob.ts
import { del } from "@vercel/blob";

/**
 * Delete a file from Vercel Blob by its public URL.
 * Safely no-ops if the URL isn't a Vercel Blob URL (e.g., Unsplash).
 */
export async function deleteBlobFile(publicUrl: string | null | undefined) {
  if (!publicUrl) return;
  
  // Vercel Blob URLs look like: https://xxxx.public.blob.vercel-storage.com/...
  if (!publicUrl.includes(".public.blob.vercel-storage.com")) {
    return; // Skip external images
  }

  try {
    await del(publicUrl);
  } catch (error) {
    console.error("Blob delete failed:", error);
    // Don't throw — orphaned files are OK, failed product ops are not
  }
}