export const runtime = "nodejs";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, personalTaskSteps } from "@/lib/db/client";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";

const patchSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  done: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  const parsed = await parseJson(req, patchSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const patch: Record<string, unknown> = { ...parsed.data };
    if (typeof parsed.data.title === "string") patch.title = parsed.data.title.trim();
    const [row] = await db
      .update(personalTaskSteps)
      .set(patch)
      .where(eq(personalTaskSteps.id, id))
      .returning();
    if (!row) return notFound();
    return json({ ok: true, step: row });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    await db.delete(personalTaskSteps).where(eq(personalTaskSteps.id, id));
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
