import { neon } from "@neondatabase/serverless";
const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set"); process.exit(1); }
const sql = neon(url);

const clients = await sql`SELECT id, name, status FROM clients ORDER BY id`;
const projects = await sql`SELECT id, client_id, name, status FROM projects ORDER BY id`;
const time = await sql`
  SELECT te.id, te.project_id, p.name AS project_name, te.started_at, te.ended_at,
         te.duration_seconds, te.note, te.invoiced_invoice_id
  FROM time_entries te
  LEFT JOIN projects p ON p.id = te.project_id
  ORDER BY te.started_at DESC
  LIMIT 50`;
const invoices = await sql`SELECT id, number, client_id, status, total_ils FROM invoices ORDER BY id`;

console.log("\n=== CLIENTS ===");
console.table(clients);
console.log("\n=== PROJECTS ===");
console.table(projects);
console.log("\n=== TIME ENTRIES (last 50) ===");
console.table(time);
console.log("\n=== INVOICES ===");
console.table(invoices);
