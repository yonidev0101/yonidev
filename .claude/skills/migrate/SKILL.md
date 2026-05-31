---
name: migrate
description: Generate and apply a Drizzle DB migration for this project. Use when the schema in src/lib/db/schema.ts changed and the new tables/columns/enums need to reach the Neon database. Works around this environment's blocked-websocket issue by applying over Neon's HTTP driver instead of drizzle-kit push/migrate.
---

# Apply a Drizzle migration (HTTP path)

`drizzle-kit push` / `migrate` use a websocket connection that this environment's
corporate proxy blocks (same self-signed-cert issue that blocks `git fetch`), so they
hang. Generate the SQL normally, then apply it over Neon's HTTP driver.

The DB was provisioned via `push`, so drizzle's `__drizzle_migrations` tracking table is
empty — apply only the **new** migration file's statements, never the full migrator.

## Steps

1. Confirm `src/lib/db/schema.ts` already has the intended changes (don't edit it here).

2. Generate the migration SQL (offline — no DB connection, just needs `DATABASE_URL` set so
   the drizzle config doesn't throw):

   ```powershell
   $line = Get-Content .env.local | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
   $val = ($line -replace '^\s*DATABASE_URL\s*=\s*','').Trim().Trim('"').Trim("'")
   $env:DATABASE_URL = $val
   npm run db:generate
   ```

   Note the new file it prints, e.g. `drizzle/0004_xxx.sql`. **Read it** and sanity-check
   that it only adds the objects you expect (no unexpected DROPs).

3. Apply that one file over HTTP (TLS verification disabled to get past the self-signed cert):

   ```powershell
   $line = Get-Content .env.local | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
   $val = ($line -replace '^\s*DATABASE_URL\s*=\s*','').Trim().Trim('"').Trim("'")
   $env:DATABASE_URL = $val
   $env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
   node scripts/apply-migrations.mjs drizzle/<NEW_FILE>.sql
   ```

   `scripts/apply-migrations.mjs` splits the file on `--> statement-breakpoint` and runs each
   statement via the neon HTTP `sql.query()`. It prints `ok` per statement.

4. Verify: `npx tsc --noEmit` and `npm run lint` for the code that uses the new schema.

## Notes
- If a statement fails with `already exists`, the object was applied before — safe to skip,
  but check you're applying the right (newest) file.
- This whole flow is documented in CLAUDE.md under "Admin dashboard → Migrations".
