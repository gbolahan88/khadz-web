// test-db.mjs
import "dotenv/config";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);

sql`select 1 as ok`
  .then((r) => {
    console.log("✅ Connected:", r);
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌", e.message);
    process.exit(1);
  });