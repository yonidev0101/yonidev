export const runtime = "nodejs";

import { z } from "zod";
import { db, tasks } from "@/lib/db/client";
import { eq, sql } from "drizzle-orm";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";

const patchSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(["todo", "in_progress", "waiting", "blocked", "done", "canceled"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().nullable().optional(),
  nextAction: z.string().max(500).nullable().optional(),
  followUpAt: z.string().nullable().optional(),
  waitingOn: z.string().max(300).nullable().optional(),
  estimateMinutes: z.coerce.number().int().min(0).max(60 * 1000).nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  const parsed = await parseJson(req, patchSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const update: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.dueDate === "") update.dueDate = null;
    if (parsed.data.waitingOn === "") update.waitingOn = null;
    if (parsed.data.status === "done") update.completedAt = new Date();
    if (parsed.data.status && parsed.data.status !== "done") update.completedAt = null;

    // "waiting" metadata: stamp waitingSince on entry (idempotent), clear it on exit.
    if (parsed.data.status === "waiting") {
      update.waitingSince = sql`COALESCE(${tasks.waitingSince}, ${today})`;
    } else if (parsed.data.status) {
      update.waitingSince = null;
      update.waitingOn = null;
    }

    const [row] = await db.update(tasks).set(update).where(eq(tasks.id, id)).returning();
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
    await db.delete(tasks).where(eq(tasks.id, id));
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
