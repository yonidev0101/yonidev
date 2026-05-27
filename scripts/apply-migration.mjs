// One-off: apply a single drizzle SQL migration file via the neon-http driver.
// Usage: node scripts/apply-migration.mjs drizzle/0002_task_updates.sql
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-migration.mjs <path-to-sql>");
  process.exit(1);
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(url);
const raw = readFileSync(file, "utf8");
const statements = raw
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

console.log(`Applying ${statements.length} statement(s) from ${file}...`);
for (const [i, stmt] of statements.entries()) {
  const head = stmt.split("\n")[0].slice(0, 80);
  process.stdout.write(`  [${i + 1}/${statements.length}] ${head} ... `);
  try {
    await sql.query(stmt);
    console.log("ok");
  } catch (e) {
    console.log("FAILED");
    console.error(e.message);
    process.exit(1);
  }
}
console.log("Done.");
