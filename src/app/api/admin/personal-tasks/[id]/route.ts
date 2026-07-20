export const runtime = "nodejs";

import { z } from "zod";
import { db, personalTasks } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";

const patchSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(["todo", "in_progress", "waiting", "blocked", "done", "canceled"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().nullable().optional(),
  estimateMinutes: z.coerce.number().int().min(0).nullable().optional(),
  nextAction: z.string().max(500).nullable().optional(),
  acceptance: z.string().max(5000).nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  const parsed = await parseJson(req, patchSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const update: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.dueDate === "") update.dueDate = null;
    // Keep completedAt in sync with the done status.
    if (parsed.data.status === "done") update.completedAt = new Date();
    else if (parsed.data.status !== undefined) update.completedAt = null;
    // Stamp when work actually began, the first time it moves into in_progress.
    if (parsed.data.status === "in_progress") {
      const [current] = await db
        .select({ startedAt: personalTasks.startedAt })
        .from(personalTasks)
        .where(eq(personalTasks.id, id));
      if (current && !current.startedAt) update.startedAt = new Date();
    }
    const [row] = await db
      .update(personalTasks)
      .set(update)
      .where(eq(personalTasks.id, id))
      .returning();
    if (!row) return notFound();
    return json({ ok: true, task: row });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    await db.delete(personalTasks).where(eq(personalTasks.id, id));
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
