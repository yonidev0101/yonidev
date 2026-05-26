import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy initialization: the previous version threw at module load when
// DATABASE_URL was missing, which broke Vercel's build-time analysis even for
// pages marked `force-dynamic`. We now defer the connection until first use,
// and throw a clear error only when a request actually tries to query.

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let cached: DrizzleDb | null = null;

function getDb(): DrizzleDb {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local locally, or to Vercel project env vars in production.",
    );
  }
  const sql = neon(url);
  cached = drizzle(sql, { schema });
  return cached;
}

// Proxy that forwards every property access to the lazily-initialized db.
// Code that imports { db } continues to work unchanged; the connection just
// isn't created until the first .select / .insert / etc. call.
export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop as string];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(real) : value;
  },
});

export * from "./schema";
