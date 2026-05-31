// One-off applier for a single migration file using Neon's HTTP (fetch) driver.
// drizzle-kit's push/migrate use a websocket connection that a corporate proxy
// blocks in this environment; plain HTTPS fetch works (same path the app uses).
// Usage: node scripts/apply-migrations.mjs drizzle/0003_organic_vivisector.sql
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-migrations.mjs <migration.sql>");
  process.exit(1);
}

const raw = readFileSync(file, "utf8");
const statements = raw
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

const sql = neon(url);

for (const [i, stmt] of statements.entries()) {
  process.stdout.write(`[${i + 1}/${statements.length}] ${stmt.slice(0, 60).replace(/\s+/g, " ")}… `);
  await sql.query(stmt);
  console.log("ok");
}

console.log(`✓ applied ${statements.length} statements from ${file}`);
