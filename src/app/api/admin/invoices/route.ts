export const runtime = "nodejs";

import { z } from "zod";
import { db, invoices, invoiceLines, timeEntries, clients } from "@/lib/db/client";
import { desc, eq, inArray } from "drizzle-orm";
import { json, parseJson, serverError } from "@/lib/admin/http";

const lineSchema = z.object({
  description: z.string().min(1).max(500),
  quantityHours: z.coerce.number().min(0),
  rateIls: z.coerce.number().min(0),
  sourceTimeEntryIds: z.array(z.coerce.number().int().positive()).optional(),
});

const createSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  number: z.string().min(1).max(50).optional(),
  issuedAt: z.string(),
  dueAt: z.string().optional().nullable(),
  periodFrom: z.string().optional().nullable(),
  periodTo: z.string().optional().nullable(),
  vatRate: z.coerce.number().min(0).max(1).optional(),
  notes: z.string().max(5000).optional().nullable(),
  lines: z.array(lineSchema).min(1),
});

async function generateInvoiceNumber(): Promise<string> {
  const all = await db.select({ number: invoices.number }).from(invoices);
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const max = all
    .map((r) => r.number)
    .filter((n) => n.startsWith(prefix))
    .map((n) => Number(n.slice(prefix.length)))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

export async function GET() {
  try {
    const rows = await db
      .select({
        id: invoices.id,
        number: invoices.number,
        clientId: invoices.clientId,
        clientName: clients.name,
        issuedAt: invoices.issuedAt,
        dueAt: invoices.dueAt,
        status: invoices.status,
        totalIls: invoices.totalIls,
        sentAt: invoices.sentAt,
        paidAt: invoices.paidAt,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .leftJoin(clients, eq(clients.id, invoices.clientId))
      .orderBy(desc(invoices.createdAt));
    return json({ ok: true, invoices: rows });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const number = parsed.data.number ?? (await generateInvoiceNumber());

    const lines = parsed.data.lines.map((l) => ({
      ...l,
      amountIls: l.quantityHours * l.rateIls,
    }));
    const subtotal = lines.reduce((sum, l) => sum + l.amountIls, 0);
    const vatRate = parsed.data.vatRate ?? 0;
    const total = subtotal * (1 + vatRate);

    const [invoice] = await db
      .insert(invoices)
      .values({
        clientId: parsed.data.clientId,
        number,
        issuedAt: parsed.data.issuedAt,
        dueAt: parsed.data.dueAt || null,
        periodFrom: parsed.data.periodFrom || null,
        periodTo: parsed.data.periodTo || null,
        status: "draft",
        subtotalIls: subtotal.toFixed(2),
        vatRate: vatRate.toFixed(2),
        totalIls: total.toFixed(2),
        notes: parsed.data.notes ?? null,
      })
      .returning();

    const insertedLines = await db
      .insert(invoiceLines)
      .values(
        lines.map((l) => ({
          invoiceId: invoice.id,
          description: l.description,
          quantityHours: l.quantityHours.toFixed(2),
          rateIls: l.rateIls.toFixed(2),
          amountIls: l.amountIls.toFixed(2),
          sourceTimeEntryId: l.sourceTimeEntryIds?.[0] ?? null,
        })),
      )
      .returning();

    // Mark all included time entries as invoiced
    const allEntryIds = lines.flatMap((l) => l.sourceTimeEntryIds ?? []);
    if (allEntryIds.length) {
      await db
        .update(timeEntries)
        .set({ invoicedInvoiceId: invoice.id })
        .where(inArray(timeEntries.id, allEntryIds));
    }

    return json({ ok: true, invoice, lines: insertedLines }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
