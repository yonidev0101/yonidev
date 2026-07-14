export const runtime = "nodejs";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db, signatureRecipients, signatureOpens } from "@/lib/db/client";
import { desc, eq, sql } from "drizzle-orm";
import { json, parseJson, serverError } from "@/lib/admin/http";

const createSchema = z.object({
  email: z.string().email().max(320),
  note: z.string().max(500).optional().nullable(),
});

export async function GET() {
  try {
    const rows = await db
      .select({
        id: signatureRecipients.id,
        email: signatureRecipients.email,
        token: signatureRecipients.token,
        note: signatureRecipients.note,
        createdAt: signatureRecipients.createdAt,
        openCount: sql<number>`COUNT(${signatureOpens.id})::int`,
        lastOpenAt: sql<string | null>`MAX(${signatureOpens.openedAt})`,
      })
      .from(signatureRecipients)
      .leftJoin(signatureOpens, eq(signatureOpens.recipientId, signatureRecipients.id))
      .groupBy(signatureRecipients.id)
      .orderBy(desc(signatureRecipients.createdAt));
    return json({ ok: true, recipients: rows });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const [created] = await db
      .insert(signatureRecipients)
      .values({
        email: parsed.data.email.trim().toLowerCase(),
        note: parsed.data.note ?? null,
        token: randomBytes(16).toString("hex"),
      })
      .returning();
    return json({ ok: true, recipient: created }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
