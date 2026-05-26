export const runtime = "nodejs";

import { z } from "zod";
import { db, invoices, invoiceLines, clients } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";

const patchSchema = z.object({
  status: z.enum(["draft", "sent", "paid", "void"]).optional(),
  notes: z.string().max(5000).nullable().optional(),
  dueAt: z.string().nullable().optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    const [invoice] = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(clients.id, invoices.clientId))
      .where(eq(invoices.id, id))
      .limit(1);
    if (!invoice) return notFound();
    const lines = await db
      .select()
      .from(invoiceLines)
      .where(eq(invoiceLines.invoiceId, id));
    return json({
      ok: true,
      invoice: invoice.invoices,
      client: invoice.clients,
      lines,
    });
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
    if (parsed.data.status === "paid") update.paidAt = new Date();
    if (parsed.data.dueAt === "") update.dueAt = null;
    const [row] = await db.update(invoices).set(update).where(eq(invoices.id, id)).returning();
    if (!row) return notFound();
    return json({ ok: true, invoice: row });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    // Schema cascades invoice_lines and sets time_entries.invoiced_invoice_id back to null,
    // so the time entries are released back to "uninvoiced" instead of being lost.
    const [row] = await db.delete(invoices).where(eq(invoices.id, id)).returning();
    if (!row) return notFound();
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
