export const runtime = "nodejs";

import { z } from "zod";
import { db, communications } from "@/lib/db/client";
import { desc, eq, and, SQL } from "drizzle-orm";
import { json, parseJson, serverError } from "@/lib/admin/http";

const createSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  projectId: z.coerce.number().int().positive().optional().nullable(),
  kind: z.enum(["call", "email", "meeting", "note", "decision"]).optional(),
  happenedAt: z.string().optional(),
  summary: z.string().min(1).max(500),
  details: z.string().max(10000).optional().nullable(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");
  const projectId = url.searchParams.get("projectId");
  try {
    const conds: SQL[] = [];
    if (clientId) conds.push(eq(communications.clientId, Number(clientId)));
    if (projectId) conds.push(eq(communications.projectId, Number(projectId)));
    const rows = await db
      .select()
      .from(communications)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(communications.happenedAt));
    return json({ ok: true, communications: rows });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const [created] = await db
      .insert(communications)
      .values({
        clientId: parsed.data.clientId,
        projectId: parsed.data.projectId ?? null,
        kind: parsed.data.kind ?? "note",
        happenedAt: parsed.data.happenedAt ? new Date(parsed.data.happenedAt) : new Date(),
        summary: parsed.data.summary,
        details: parsed.data.details ?? null,
      })
      .returning();
    return json({ ok: true, communication: created }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
