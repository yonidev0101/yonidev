export const runtime = "nodejs";

import { z } from "zod";
import { db, clients } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  company: z.string().max(200).nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  status: z.enum(["lead", "negotiating", "active", "paused", "past"]).optional(),
  defaultHourlyRateIls: z.coerce.number().min(0).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    const [row] = await db.select().from(clients).where(eq(clients.id, id));
    if (!row) return notFound();
    return json({ ok: true, client: row });
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
    if (parsed.data.defaultHourlyRateIls !== undefined) {
      update.defaultHourlyRateIls =
        parsed.data.defaultHourlyRateIls == null
          ? null
          : String(parsed.data.defaultHourlyRateIls);
    }
    const [row] = await db.update(clients).set(update).where(eq(clients.id, id)).returning();
    if (!row) return notFound();
    return json({ ok: true, client: row });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    await db.delete(clients).where(eq(clients.id, id));
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
