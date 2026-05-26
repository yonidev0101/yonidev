export const runtime = "nodejs";

import { z } from "zod";
import { db, projects } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(["active", "paused", "done"]).optional(),
  hourlyRateIls: z.coerce.number().min(0).nullable().optional(),
  nextAction: z.string().max(500).nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    const [row] = await db.select().from(projects).where(eq(projects.id, id));
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
    if (parsed.data.hourlyRateIls !== undefined) {
      update.hourlyRateIls =
        parsed.data.hourlyRateIls == null ? null : String(parsed.data.hourlyRateIls);
    }
    if (parsed.data.startDate === "") update.startDate = null;
    if (parsed.data.endDate === "") update.endDate = null;
    const [row] = await db.update(projects).set(update).where(eq(projects.id, id)).returning();
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
    await db.delete(projects).where(eq(projects.id, id));
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
