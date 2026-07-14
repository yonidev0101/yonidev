export const runtime = "nodejs";

import { db, signatureRecipients } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { json, notFound, serverError } from "@/lib/admin/http";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    await db.delete(signatureRecipients).where(eq(signatureRecipients.id, id));
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
