// One-shot: applies generated SQL migrations directly to Neon via the serverless driver.
// Usage:  DATABASE_URL=... node scripts/db-push.mjs
import { neon } from "@neondatabase/serverless";
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "drizzle");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(url);

// Split a migration into individual statements. Drizzle uses --> statement-breakpoint markers
// for that purpose, which is more reliable than splitting on `;` (DO blocks contain inner ;).
function splitStatements(text) {
  return text
    .split(/--\s*>\s*statement-breakpoint/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

const files = (await readdir(MIGRATIONS_DIR))
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  const path = join(MIGRATIONS_DIR, file);
  console.log(`→ ${file}`);
  const text = await readFile(path, "utf8");
  const stmts = splitStatements(text);
  for (const stmt of stmts) {
    try {
      await sql.query(stmt);
      const head = stmt.split("\n")[0].slice(0, 80);
      console.log(`  ok  ${head}`);
    } catch (e) {
      const msg = String(e?.message || e);
      // tolerate "already exists" so the script is idempotent
      if (/already exists/i.test(msg)) {
        const head = stmt.split("\n")[0].slice(0, 80);
        console.log(`  skip ${head}  (already exists)`);
        continue;
      }
      console.error(`  FAIL ${stmt.slice(0, 200)}`);
      console.error(`  ${msg}`);
      process.exit(1);
    }
  }
}
console.log("done");
