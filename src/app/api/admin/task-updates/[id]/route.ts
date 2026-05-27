export const runtime = "nodejs";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, taskUpdates, timeEntries, communications } from "@/lib/db/client";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";

const patchSchema = z.object({
  summary: z.string().min(1).max(500).optional(),
  details: z.string().max(10000).nullable().optional(),
  happenedAt: z.string().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  const parsed = await parseJson(req, patchSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const patch: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.happenedAt) patch.happenedAt = new Date(parsed.data.happenedAt);
    const [row] = await db
      .update(taskUpdates)
      .set(patch)
      .where(eq(taskUpdates.id, id))
      .returning();
    if (!row) return notFound();
    return json({ ok: true, update: row });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    // Find linked entries before deleting (we delete them too so the timeline
    // and the linked rows stay consistent)
    const [row] = await db
      .select({
        timeEntryId: taskUpdates.timeEntryId,
        communicationId: taskUpdates.communicationId,
      })
      .from(taskUpdates)
      .where(eq(taskUpdates.id, id));
    if (!row) return notFound();

    await db.delete(taskUpdates).where(eq(taskUpdates.id, id));
    if (row.timeEntryId) {
      await db.delete(timeEntries).where(eq(timeEntries.id, row.timeEntryId));
    }
    if (row.communicationId) {
      await db.delete(communications).where(eq(communications.id, row.communicationId));
    }
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
