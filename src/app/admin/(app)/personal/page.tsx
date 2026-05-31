import Link from "next/link";
import { getPersonalProjects } from "@/lib/admin/queries";
import { PERSONAL_PROJECT_STATUS_HE, TASK_PRIORITY_HE, fmtHours, fmtDateHe } from "@/lib/admin/format";
import PersonalProjectCreateForm from "@/components/admin/PersonalProjectCreateForm";

export const dynamic = "force-dynamic";

const STATUS_ORDER = ["active", "idea", "paused", "done", "archived"] as const;

export default async function PersonalProjectsPage() {
  const rows = await getPersonalProjects();

  const grouped = Object.fromEntries(
    STATUS_ORDER.map((s) => [s, rows.filter((r) => r.status === s)]),
  ) as Record<(typeof STATUS_ORDER)[number], typeof rows>;

  return (
    <div dir="rtl" className="space-y-6 max-w-5xl">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
            פרויקטים אישיים
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            {rows.length ? `${rows.length} פרויקטים · ` : ""}הצד-פרויקטים והמוצרים שלך — ללא לקוח, ללא חיוב.
          </p>
        </div>
        <PersonalProjectCreateForm />
      </header>

      {STATUS_ORDER.map((status) => {
        const list = grouped[status];
        if (list.length === 0) return null;
        return (
          <section key={status}>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
              {PERSONAL_PROJECT_STATUS_HE[status]} · {list.length}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {list.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/personal/${p.id}`}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-4 hover:border-[#2B7FFF]/40 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[15px] text-[#0F172A] truncate">{p.name}</h3>
                    <span
                      className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        p.priority === "high"
                          ? "bg-red-50 text-red-600"
                          : p.priority === "medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-[#F1F5F9] text-[#94A3B8]"
                      }`}
                    >
                      {TASK_PRIORITY_HE[p.priority]}
                    </span>
                  </div>
                  {p.description && (
                    <p className="text-[12px] text-[#64748B] mt-1 line-clamp-2 leading-snug">
                      {p.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-[12px] text-[#94A3B8]">
                    <span>{p.openTaskCount} משימות פתוחות</span>
                    {p.totalSeconds > 0 && <span className="tabular-nums">{fmtHours(p.totalSeconds)}</span>}
                    {p.targetDate && <span>יעד: {fmtDateHe(p.targetDate)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {rows.length === 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl py-12 text-center text-[#94A3B8]">
          עדיין אין פרויקטים אישיים. צור את הראשון למעלה.
        </div>
      )}
    </div>
  );
}
