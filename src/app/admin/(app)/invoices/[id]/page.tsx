import Link from "next/link";
import { notFound } from "next/navigation";
import { db, invoices, invoiceLines, clients } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { INVOICE_STATUS_HE, fmtDateHe, fmtIls, fmtHours, describePeriodHe } from "@/lib/admin/format";
import InvoiceActions from "@/components/admin/InvoiceActions";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const [joined] = await db
    .select()
    .from(invoices)
    .leftJoin(clients, eq(clients.id, invoices.clientId))
    .where(eq(invoices.id, id));
  if (!joined) notFound();
  const inv = joined.invoices;
  const client = joined.clients;
  const lines = await db.select().from(invoiceLines).where(eq(invoiceLines.invoiceId, id));

  const subtotal = Number(inv.subtotalIls);
  const vat = subtotal * Number(inv.vatRate);
  const periodLabel = describePeriodHe(inv.periodFrom, inv.periodTo);

  return (
    <div dir="rtl" className="space-y-6 max-w-3xl">
      <header>
        <Link href="/admin/invoices" className="text-[12px] text-[#94A3B8] hover:text-[#2B7FFF]">
          ← חשבוניות
        </Link>
        <div className="flex items-baseline gap-3 mt-2 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
            {periodLabel}
          </h1>
          <span className="text-[11px] font-mono text-[#94A3B8]" dir="ltr">
            {inv.number}
          </span>
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              inv.status === "paid"
                ? "bg-emerald-50 text-emerald-700"
                : inv.status === "sent"
                  ? "bg-amber-50 text-amber-700"
                  : inv.status === "void"
                    ? "bg-red-50 text-red-600"
                    : "bg-[#F1F5F9] text-[#64748B]"
            }`}
          >
            {INVOICE_STATUS_HE[inv.status]}
          </span>
        </div>
      </header>

      <InvoiceActions invoice={inv} clientHasEmail={!!client?.email} />

      {/* Invoice card */}
      <article className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_8px_32px_-12px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="h-1 bg-gradient-to-l from-[#EFF6FF] via-[#60a5fa] to-[#2B7FFF]" />
        <div className="p-8">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">לקוח</div>
              <div className="text-[16px] font-semibold text-[#0F172A] mt-1">
                {client?.name ?? "—"}
              </div>
              {client?.email && <div className="text-[12px] text-[#64748B] mt-0.5" dir="ltr">{client.email}</div>}
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">תאריכים</div>
              <div className="text-[13px] mt-1">
                <span className="text-[#64748B]">הופקה: </span>
                <span className="text-[#0F172A] font-medium">{fmtDateHe(inv.issuedAt)}</span>
              </div>
              {inv.dueAt && (
                <div className="text-[13px]">
                  <span className="text-[#64748B]">עד: </span>
                  <span className="text-[#0F172A] font-medium">{fmtDateHe(inv.dueAt)}</span>
                </div>
              )}
            </div>
          </div>

          <table className="w-full text-[13px]">
            <thead className="bg-[#F8FAFC]">
              <tr className="text-[11px] uppercase tracking-wider text-[#94A3B8]">
                <th className="text-right p-3 font-bold">תיאור</th>
                <th className="text-center p-3 font-bold w-24">שעות</th>
                <th className="text-center p-3 font-bold w-28">תעריף</th>
                <th className="text-left p-3 font-bold w-28">סכום</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {lines.map((l) => (
                <tr key={l.id}>
                  <td className="p-3 text-[#0F172A]">{l.description}</td>
                  <td className="p-3 text-center text-[#64748B] tabular-nums">{fmtHours(Number(l.quantityHours) * 3600)}</td>
                  <td className="p-3 text-center text-[#64748B] tabular-nums">{fmtIls(l.rateIls)}</td>
                  <td className="p-3 text-left font-semibold text-[#0F172A] tabular-nums">{fmtIls(l.amountIls)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 ml-auto max-w-xs space-y-1.5 text-[14px]">
            <div className="flex justify-between text-[#64748B]">
              <span>סכום ביניים</span>
              <span className="tabular-nums">{fmtIls(subtotal)}</span>
            </div>
            {Number(inv.vatRate) > 0 && (
              <div className="flex justify-between text-[#64748B]">
                <span>מע&quot;מ ({(Number(inv.vatRate) * 100).toFixed(0)}%)</span>
                <span className="tabular-nums">{fmtIls(vat)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#0F172A] font-bold text-[16px] pt-2 border-t-2 border-[#2B7FFF]">
              <span>סה&quot;כ</span>
              <span className="tabular-nums text-[#2B7FFF]">{fmtIls(inv.totalIls)}</span>
            </div>
          </div>

          {inv.notes && (
            <div className="mt-8 p-4 bg-[#F8FAFC] border-r-4 border-[#2B7FFF] rounded-md text-[13px] text-[#475569] whitespace-pre-wrap">
              {inv.notes}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
