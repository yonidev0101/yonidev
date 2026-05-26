export const runtime = "nodejs";

import { db, invoices, invoiceLines, clients } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { json, notFound, serverError } from "@/lib/admin/http";
import { getTransporter } from "@/lib/email/transporter";
import { buildInvoiceEmail } from "@/lib/email/templates/invoice";
import { describePeriodHe } from "@/lib/admin/format";
import { EMAIL_FROM, EMAIL_TO } from "@/lib/contact/channels";

function formatDateHe(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    date,
  );
}

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();

  const mailer = getTransporter();
  if (!mailer) {
    return json({ ok: false, error: "Email service not configured" }, { status: 503 });
  }

  try {
    const [joined] = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(clients.id, invoices.clientId))
      .where(eq(invoices.id, id))
      .limit(1);
    if (!joined) return notFound();
    const invoice = joined.invoices;
    const client = joined.clients;
    if (!client) return notFound();
    if (!client.email) {
      return json({ ok: false, error: "ללקוח אין כתובת מייל" }, { status: 400 });
    }

    const lines = await db.select().from(invoiceLines).where(eq(invoiceLines.invoiceId, id));

    const periodLabel = describePeriodHe(invoice.periodFrom, invoice.periodTo);

    const email = buildInvoiceEmail({
      clientName: client.name,
      clientEmail: client.email,
      invoiceNumber: invoice.number,
      issuedAt: formatDateHe(invoice.issuedAt),
      periodLabel,
      dueAt: invoice.dueAt ? formatDateHe(invoice.dueAt) : null,
      lines: lines.map((l) => ({
        description: l.description,
        quantityHours: Number(l.quantityHours),
        rateIls: Number(l.rateIls),
        amountIls: Number(l.amountIls),
      })),
      subtotalIls: Number(invoice.subtotalIls),
      vatRate: Number(invoice.vatRate),
      totalIls: Number(invoice.totalIls),
      notes: invoice.notes,
    });

    await mailer.sendMail({
      from: EMAIL_FROM,
      to: client.email,
      bcc: EMAIL_TO,
      replyTo: EMAIL_TO,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    const [updated] = await db
      .update(invoices)
      .set({ status: "sent", sentAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();

    return json({ ok: true, invoice: updated });
  } catch (e) {
    return serverError(e);
  }
}
