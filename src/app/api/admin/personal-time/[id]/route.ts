export const runtime = "nodejs";

import { z } from "zod";
import { db, personalTimeEntries } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";

const patchSchema = z.object({
  startedAt: z.string().optional(),
  endedAt: z.string().nullable().optional(),
  durationSeconds: z.coerce.number().int().min(0).nullable().optional(),
  note: z.string().max(2000).nullable().optional(),
  taskId: z.coerce.number().int().positive().nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  const parsed = await parseJson(req, patchSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const update: Record<string, unknown> = {};
    if (parsed.data.startedAt !== undefined) update.startedAt = new Date(parsed.data.startedAt);
    if (parsed.data.endedAt !== undefined)
      update.endedAt = parsed.data.endedAt ? new Date(parsed.data.endedAt) : null;
    if (parsed.data.durationSeconds !== undefined)
      update.durationSeconds = parsed.data.durationSeconds;
    if (parsed.data.note !== undefined) update.note = parsed.data.note;
    if (parsed.data.taskId !== undefined) update.taskId = parsed.data.taskId;

    const [row] = await db
      .update(personalTimeEntries)
      .set(update)
      .where(eq(personalTimeEntries.id, id))
      .returning();
    if (!row) return notFound();
    return json({ ok: true, entry: row });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    await db.delete(personalTimeEntries).where(eq(personalTimeEntries.id, id));
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
