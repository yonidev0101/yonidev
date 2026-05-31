export const runtime = "nodejs";

import { z } from "zod";
import { db, personalProjects } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(["idea", "active", "paused", "done", "archived"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  description: z.string().max(5000).nullable().optional(),
  nextAction: z.string().max(500).nullable().optional(),
  startDate: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    const [row] = await db.select().from(personalProjects).where(eq(personalProjects.id, id));
    if (!row) return notFound();
    return json({ ok: true, project: row });
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  const parsed = await parseJson(req, patchSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const update: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.startDate === "") update.startDate = null;
    if (parsed.data.targetDate === "") update.targetDate = null;
    // Stamp / clear archivedAt as the project moves in and out of archive.
    if (parsed.data.status === "archived") update.archivedAt = new Date();
    else if (parsed.data.status !== undefined) update.archivedAt = null;
    const [row] = await db
      .update(personalProjects)
      .set(update)
      .where(eq(personalProjects.id, id))
      .returning();
    if (!row) return notFound();
    return json({ ok: true, project: row });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    await db.delete(personalProjects).where(eq(personalProjects.id, id));
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
