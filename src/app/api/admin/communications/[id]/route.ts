export const runtime = "nodejs";

import { z } from "zod";
import { db, communications } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";

const patchSchema = z.object({
  kind: z.enum(["call", "email", "meeting", "note", "decision"]).optional(),
  happenedAt: z.string().optional(),
  summary: z.string().min(1).max(500).optional(),
  details: z.string().max(10000).nullable().optional(),
  projectId: z.coerce.number().int().positive().nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  const parsed = await parseJson(req, patchSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const update: Record<string, unknown> = {};
    if (parsed.data.kind !== undefined) update.kind = parsed.data.kind;
    if (parsed.data.summary !== undefined) update.summary = parsed.data.summary;
    if (parsed.data.details !== undefined) update.details = parsed.data.details;
    if (parsed.data.projectId !== undefined) update.projectId = parsed.data.projectId;
    if (parsed.data.happenedAt !== undefined) update.happenedAt = new Date(parsed.data.happenedAt);

    const [row] = await db
      .update(communications)
      .set(update)
      .where(eq(communications.id, id))
      .returning();
    if (!row) return notFound();
    return json({ ok: true, communication: row });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    await db.delete(communications).where(eq(communications.id, id));
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
