import Link from "next/link";
import { getDashboardData } from "@/lib/admin/queries";
import {
  actionableDate,
  fmtHours,
  fmtIls,
  relativeDayHe,
  daysSince,
  CLIENT_STATUS_HE,
  TASK_STATUS_HE,
} from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const todayStr = data.todayStr;

  return (
    <div className="space-y-8" dir="rtl">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
          דשבורד
        </h1>
        <p className="text-[#64748B] text-sm mt-1">סקירה מהירה של מה שקורה עכשיו.</p>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="לקוחות פעילים" value={data.activeClients.length.toString()} />
        <Kpi label="שעות בשבוע" value={fmtHours(data.weekHoursSeconds)} />
        <Kpi
          label="חשבוניות פתוחות"
          value={data.outstandingInvoices.length.toString()}
          sub={fmtIls(
            data.outstandingInvoices.reduce((a, b) => a + Number(b.totalIls), 0),
          )}
        />
        <Kpi
          label="משימות פתוחות"
          value={data.upcomingTasks.length.toString()}
          sub={
            data.upcomingTasks.filter((t) => {
              const d = actionableDate(t);
              return d && d < todayStr;
            }).length
              ? `${data.upcomingTasks.filter((t) => {
                  const d = actionableDate(t);
                  return d && d < todayStr;
                }).length} באיחור`
              : "בזמן"
          }
          accent={
            data.upcomingTasks.some((t) => {
              const d = actionableDate(t);
              return d && d < todayStr;
            })
              ? "red"
              : "default"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming tasks */}
        <Section
          title="משימות עכשיו"
          link={{ href: "/admin/tasks", label: "כל המשימות" }}
        >
          {data.upcomingTasks.length === 0 ? (
            <Empty>אין משימות פתוחות לשבוע הקרוב.</Empty>
          ) : (
            <ul className="divide-y divide-[#F1F5F9]">
              {data.upcomingTasks.slice(0, 8).map((t) => {
                const d = actionableDate(t);
                const overdue = d && d < todayStr;
                const dateLabel = t.followUpAt
                  ? relativeDayHe(t.followUpAt)
                  : d
                    ? relativeDayHe(d)
                    : TASK_STATUS_HE[t.status];
                return (
                  <li key={t.id} className="py-3 flex items-center gap-3">
                    <span
                      className={`shrink-0 w-2 h-2 rounded-full ${
                        overdue
                          ? "bg-red-500"
                          : t.priority === "high"
                            ? "bg-orange-500"
                            : "bg-[#2B7FFF]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/tasks/${t.id}`}
                        className="block text-[14px] font-medium text-[#0F172A] truncate hover:text-[#2B7FFF]"
                      >
                        {t.title}
                      </Link>
                      <div className="text-[12px] text-[#94A3B8] truncate">
                        {t.clientName} · {t.projectName}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-[12px] tabular-nums ${
                        overdue ? "text-red-600 font-semibold" : "text-[#64748B]"
                      }`}
                    >
                      {dateLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Follow-ups this week */}
        <Section
          title="מעקבים השבוע"
          link={{ href: "/admin/tasks", label: "כל המשימות" }}
        >
          {data.followUpsThisWeek.length === 0 ? (
            <Empty>אין מעקבים פתוחים לשבוע הקרוב.</Empty>
          ) : (
            <ul className="divide-y divide-[#F1F5F9]">
              {data.followUpsThisWeek.slice(0, 8).map((t) => {
                const overdue = t.followUpAt && t.followUpAt < todayStr;
                return (
                  <li key={t.id} className="py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        href={`/admin/tasks/${t.id}`}
                        className="text-[14px] font-medium text-[#0F172A] hover:text-[#2B7FFF] truncate flex-1 min-w-0"
                      >
                        {t.title}
                      </Link>
                      <span
                        className={`shrink-0 text-[12px] tabular-nums ${
                          overdue ? "text-red-600 font-semibold" : "text-[#64748B]"
                        }`}
                      >
                        {relativeDayHe(t.followUpAt)}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8] truncate">
                      {t.clientName} · {t.projectName}
                    </div>
                    {t.nextAction && (
                      <p className="text-[12px] text-[#475569] mt-1 leading-snug truncate">
                        → {t.nextAction}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Stale — tasks that haven't moved in 14+ days */}
        {data.staleTasks.length > 0 && (
          <Section
            title="לא זז"
            link={{ href: "/admin/tasks", label: "כל המשימות" }}
          >
            <ul className="divide-y divide-[#F1F5F9]">
              {data.staleTasks.slice(0, 8).map((t) => {
                const days = daysSince(t.lastUpdateAt ?? t.createdAt);
                return (
                  <li key={t.id} className="py-3 flex items-center gap-3">
                    <span className="shrink-0">💤</span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/tasks/${t.id}`}
                        className="block text-[14px] font-medium text-[#0F172A] truncate hover:text-[#2B7FFF]"
                      >
                        {t.title}
                      </Link>
                      <div className="text-[12px] text-[#94A3B8] truncate">
                        {t.clientName} · {t.projectName}
                      </div>
                    </div>
                    <span className="shrink-0 text-[12px] tabular-nums text-amber-700 font-semibold">
                      {days} ימ׳
                    </span>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {/* Outstanding invoices */}
        <Section
          title="חשבוניות פתוחות"
          link={{ href: "/admin/invoices", label: "כל החשבוניות" }}
        >
          {data.outstandingInvoices.length === 0 ? (
            <Empty>אין חשבוניות שמחכות לתשלום.</Empty>
          ) : (
            <ul className="divide-y divide-[#F1F5F9]">
              {data.outstandingInvoices.slice(0, 6).map((inv) => (
                <li key={inv.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/invoices/${inv.id}`}
                      className="block text-[13px] font-semibold text-[#0F172A] hover:text-[#2B7FFF] truncate"
                    >
                      {inv.clientName}
                    </Link>
                    <div className="text-[11px] text-[#94A3B8]" dir="ltr">{inv.number}</div>
                  </div>
                  <div className="text-[13px] font-bold text-[#2B7FFF] tabular-nums">
                    {fmtIls(inv.totalIls)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Leads / negotiating */}
        <Section
          title="לידים ומו״מ"
          link={{ href: "/admin/clients", label: "כל הלקוחות" }}
        >
          {data.activeClients.filter((c) => c.status === "lead" || c.status === "negotiating")
            .length === 0 ? (
            <Empty>אין לידים פתוחים.</Empty>
          ) : (
            <ul className="divide-y divide-[#F1F5F9]">
              {data.activeClients
                .filter((c) => c.status === "lead" || c.status === "negotiating")
                .slice(0, 6)
                .map((c) => (
                  <li key={c.id} className="py-3 flex items-center justify-between gap-3">
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="text-[14px] font-medium text-[#0F172A] hover:text-[#2B7FFF] truncate"
                    >
                      {c.name}
                      {c.company ? <span className="text-[#94A3B8]"> · {c.company}</span> : null}
                    </Link>
                    <span
                      className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        c.status === "lead"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-[#EFF6FF] text-[#2B7FFF]"
                      }`}
                    >
                      {CLIENT_STATUS_HE[c.status]}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  accent = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "default" | "red";
}) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-bold tabular-nums ${
          accent === "red" ? "text-red-600" : "text-[#0F172A]"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-[12px] text-[#64748B] mt-0.5">{sub}</div>}
    </div>
  );
}

function Section({
  title,
  link,
  children,
}: {
  title: string;
  link?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-[#E2E8F0] rounded-xl p-5">
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-bold text-[#0F172A]">{title}</h2>
        {link && (
          <Link
            href={link.href}
            className="text-[12px] font-semibold text-[#2B7FFF] hover:underline"
          >
            {link.label} ←
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] text-[#94A3B8] py-6 text-center">{children}</p>
  );
}
