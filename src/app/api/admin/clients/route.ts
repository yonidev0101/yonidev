export const runtime = "nodejs";

import { z } from "zod";
import { db, clients } from "@/lib/db/client";
import { desc } from "drizzle-orm";
import { json, parseJson, serverError } from "@/lib/admin/http";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  company: z.string().max(200).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  status: z.enum(["lead", "negotiating", "active", "paused", "past"]).optional(),
  defaultHourlyRateIls: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export async function GET() {
  try {
    const rows = await db.select().from(clients).orderBy(desc(clients.createdAt));
    return json({ ok: true, clients: rows });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const [created] = await db
      .insert(clients)
      .values({
        name: parsed.data.name,
        company: parsed.data.company ?? null,
        email: parsed.data.email ?? null,
        phone: parsed.data.phone ?? null,
        status: parsed.data.status ?? "active",
        defaultHourlyRateIls:
          parsed.data.defaultHourlyRateIls != null
            ? String(parsed.data.defaultHourlyRateIls)
            : null,
        notes: parsed.data.notes ?? null,
      })
      .returning();
    return json({ ok: true, client: created }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
