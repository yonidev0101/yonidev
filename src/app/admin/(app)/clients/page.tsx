import Link from "next/link";
import { db, clients } from "@/lib/db/client";
import { desc } from "drizzle-orm";
import { CLIENT_STATUS_HE, fmtIls } from "@/lib/admin/format";
import ClientCreateForm from "@/components/admin/ClientCreateForm";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const rows = await db.select().from(clients).orderBy(desc(clients.createdAt));

  const grouped = {
    lead: rows.filter((r) => r.status === "lead"),
    negotiating: rows.filter((r) => r.status === "negotiating"),
    active: rows.filter((r) => r.status === "active"),
    paused: rows.filter((r) => r.status === "paused"),
    past: rows.filter((r) => r.status === "past"),
  };

  return (
    <div dir="rtl" className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
            לקוחות
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            {rows.length} לקוחות · ניהול לידים, פעילים, וישנים
          </p>
        </div>
      </header>

      <ClientCreateForm />

      {(["lead", "negotiating", "active", "paused", "past"] as const).map((status) => {
        const list = grouped[status];
        if (list.length === 0) return null;
        return (
          <section key={status}>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
              {CLIENT_STATUS_HE[status]} · {list.length}
            </h2>
            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden divide-y divide-[#F1F5F9]">
              {list.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/clients/${c.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] text-[#0F172A] truncate">
                      {c.name}
                      {c.company && (
                        <span className="text-[#94A3B8] font-normal mr-2">· {c.company}</span>
                      )}
                    </div>
                    <div className="text-[12px] text-[#94A3B8] truncate">
                      {c.email || "—"}
                      {c.phone && <span dir="ltr"> · {c.phone}</span>}
                    </div>
                  </div>
                  {c.defaultHourlyRateIls && (
                    <div className="text-[12px] text-[#64748B] tabular-nums">
                      {fmtIls(c.defaultHourlyRateIls)}/שעה
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {rows.length === 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl py-12 text-center text-[#94A3B8]">
          עדיין אין לקוחות. צור את הראשון למעלה.
        </div>
      )}
    </div>
  );
}
