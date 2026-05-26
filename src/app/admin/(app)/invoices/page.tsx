import Link from "next/link";
import { db, invoices, clients } from "@/lib/db/client";
import { eq, desc } from "drizzle-orm";
import { INVOICE_STATUS_HE, fmtDateHe, fmtIls } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
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
    })
    .from(invoices)
    .leftJoin(clients, eq(clients.id, invoices.clientId))
    .orderBy(desc(invoices.createdAt));

  const totals = {
    paid: rows.filter((r) => r.status === "paid").reduce((s, r) => s + Number(r.totalIls), 0),
    open: rows.filter((r) => r.status === "sent").reduce((s, r) => s + Number(r.totalIls), 0),
    draft: rows.filter((r) => r.status === "draft").reduce((s, r) => s + Number(r.totalIls), 0),
  };

  return (
    <div dir="rtl" className="space-y-6 max-w-5xl">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">חשבוניות</h1>
          <p className="text-[#64748B] text-sm mt-1">{rows.length} חשבוניות סה&quot;כ.</p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] text-white text-[14px] font-semibold px-5 py-2.5"
        >
          + חשבונית חדשה
        </Link>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="שולם" value={fmtIls(totals.paid)} color="emerald" />
        <Stat label="פתוח" value={fmtIls(totals.open)} color="amber" />
        <Stat label="טיוטה" value={fmtIls(totals.draft)} color="slate" />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        {rows.length === 0 ? (
          <p className="text-center text-[#94A3B8] py-12 text-[13px]">אין חשבוניות עדיין.</p>
        ) : (
          <ul className="divide-y divide-[#F1F5F9]">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/invoices/${r.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-[#0F172A]">
                      {r.clientName}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] flex items-center gap-2" dir="ltr">
                      <span>{r.number}</span>
                      <span>·</span>
                      <span>{fmtDateHe(r.issuedAt)}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      r.status === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : r.status === "sent"
                          ? "bg-amber-50 text-amber-700"
                          : r.status === "void"
                            ? "bg-red-50 text-red-600"
                            : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    {INVOICE_STATUS_HE[r.status]}
                  </span>
                  <span className="text-[14px] font-bold tabular-nums text-[#0F172A] min-w-[100px] text-left">
                    {fmtIls(r.totalIls)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: "emerald" | "amber" | "slate" }) {
  const colors = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    slate: "text-[#64748B]",
  };
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">{label}</div>
      <div className={`mt-1 text-xl font-bold tabular-nums ${colors[color]}`}>{value}</div>
    </div>
  );
}
