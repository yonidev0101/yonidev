export const runtime = "nodejs";

import { z } from "zod";
import { db, projects, clients } from "@/lib/db/client";
import { desc, eq, and, SQL } from "drizzle-orm";
import { json, parseJson, serverError } from "@/lib/admin/http";

const createSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  name: z.string().min(1).max(200),
  status: z.enum(["active", "paused", "done"]).optional(),
  hourlyRateIls: z.coerce.number().min(0).optional().nullable(),
  nextAction: z.string().max(500).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");
  const status = url.searchParams.get("status");
  try {
    const conds: SQL[] = [];
    if (clientId) conds.push(eq(projects.clientId, Number(clientId)));
    if (status === "active" || status === "paused" || status === "done") {
      conds.push(eq(projects.status, status));
    }
    const rows = await db
      .select({
        id: projects.id,
        clientId: projects.clientId,
        clientName: clients.name,
        name: projects.name,
        status: projects.status,
        hourlyRateIls: projects.hourlyRateIls,
        nextAction: projects.nextAction,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .leftJoin(clients, eq(clients.id, projects.clientId))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(projects.createdAt));
    return json({ ok: true, projects: rows });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const [created] = await db
      .insert(projects)
      .values({
        clientId: parsed.data.clientId,
        name: parsed.data.name,
        status: parsed.data.status ?? "active",
        hourlyRateIls:
          parsed.data.hourlyRateIls != null ? String(parsed.data.hourlyRateIls) : null,
        nextAction: parsed.data.nextAction ?? null,
        startDate: parsed.data.startDate || null,
        endDate: parsed.data.endDate || null,
        description: parsed.data.description ?? null,
      })
      .returning();
    return json({ ok: true, project: created }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
