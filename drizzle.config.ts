// drizzle.config.ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local explicitly — Next.js convention, not dotenv's default
config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});