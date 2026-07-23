import Link from "next/link";
import { getDashboardData } from "@/lib/admin/queries";
import {
  actionableDate,
  fmtHours,
  fmtIls,
  fmtTimeHe,
  fmtDateHe,
  relativeDayHe,
  daysSince,
  CLIENT_STATUS_HE,
  TASK_STATUS_HE,
  PERSONAL_PROJECT_STATUS_HE,
} from "@/lib/admin/format";
import {
  DOMAIN_ACCENT,
  DOMAIN_LABEL,
  DOMAIN_TONE,
  routes,
  type Domain,
} from "@/lib/admin/domain";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const todayStr = data.todayStr;

  return (
    <div className="space-y-8" dir="rtl">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">דשבורד</h1>
        <p className="text-[#64748B] text-sm mt-1">סקירה מהירה של מה שקורה עכשיו.</p>
      </header>

      {/* What's running right now — the first thing you should see. */}
      {data.activeTimers.length > 0 && (
        <div className="space-y-2">
          {data.activeTimers.map((t) => (
            <Link
              key={`${t.domain}-${t.id}`}
              href={
                t.taskId
                  ? routes(t.domain).taskDetail(t.taskId)
                  : routes(t.domain).projectDetail(t.projectId)
              }
              className={`flex items-center gap-3 rounded-xl border px-5 py-3 transition hover:brightness-[0.98] ${
                t.domain === "personal"
                  ? "bg-[#F5F3FF] border-[#DDD6FE]"
                  : "bg-[#EFF6FF] border-[#BFDBFE]"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse shrink-0"
                style={{ background: DOMAIN_ACCENT[t.domain] }}
              />
              <span className="text-[13px] font-semibold text-[#0F172A]">עובד עכשיו</span>
              <span className="text-[13px] text-[#475569] truncate flex-1 min-w-0">
                {[t.clientName, t.projectName].filter(Boolean).join(" · ")}
              </span>
              <span className="text-[12px] text-[#64748B] tabular-nums shrink-0">
                מ-{fmtTimeHe(t.startedAt)}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* KPIs — the "doing" numbers lead, business numbers follow. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi
          label="שעות בשבוע"
          value={fmtHours(data.weekHoursSeconds)}
          sub={
            data.weekHoursPersonalSeconds > 0
              ? `${fmtHours(data.weekHoursPersonalSeconds)} אישי`
              : undefined
          }
        />
        <Kpi
          label="משימות פתוחות"
          value={data.openTaskCount.toString()}
          sub={data.overdueCount > 0 ? `${data.overdueCount} באיחור` : "בזמן"}
          accent={data.overdueCount > 0 ? "red" : "default"}
        />
        <Kpi
          label="חשבוניות פתוחות"
          value={data.outstandingInvoices.length.toString()}
          sub={fmtIls(data.outstandingInvoices.reduce((a, b) => a + Number(b.totalIls), 0))}
        />
        <Kpi label="לקוחות פעילים" value={data.activeClients.length.toString()} />
      </div>

      {/* ═══ Zone A — my work ═══ */}
      <section className="space-y-4">
        <ZoneLabel>העבודה שלי</ZoneLabel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Open tasks — one prioritized list, date-less work included. */}
          <Panel
            title="משימות פתוחות"
            link={{ href: "/admin/tasks", label: "כל המשימות" }}
            className="lg:col-span-2"
          >
            {data.openTasks.length === 0 ? (
              <Empty>אין משימות פתוחות. הכול נקי 🎉</Empty>
            ) : (
              <ul className="divide-y divide-[#F1F5F9]">
                {data.openTasks.map((t) => {
                  const d = actionableDate(t);
                  const overdue = d && d < todayStr;
                  const dateLabel = d
                    ? relativeDayHe(d)
                    : TASK_STATUS_HE[t.status];
                  return (
                    <li key={`${t.domain}-${t.id}`} className="py-3 flex items-center gap-3">
                      <span
                        className={`shrink-0 w-2 h-2 rounded-full ${
                          overdue
                            ? "bg-red-500"
                            : t.status === "in_progress"
                              ? "bg-[#7C3AED]"
                              : t.priority === "high"
                                ? "bg-orange-500"
                                : "bg-[#2B7FFF]"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={routes(t.domain).taskDetail(t.id)}
                          className="block text-[14px] font-medium text-[#0F172A] truncate hover:text-[#2B7FFF]"
                        >
                          {t.title}
                        </Link>
                        <div className="text-[12px] text-[#94A3B8] truncate flex items-center gap-1.5">
                          <DomainBadge domain={t.domain} />
                          {t.stepsTotal > 0 && (
                            <span className="tabular-nums text-[#64748B]">
                              ✔ {t.stepsDone}/{t.stepsTotal}
                            </span>
                          )}
                          <span className="truncate">
                            {[t.clientName, t.projectName].filter(Boolean).join(" · ")}
                          </span>
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
          </Panel>

          {/* Personal projects — the side products, front and centre. */}
          {data.personalProjects.length > 0 && (
            <Panel
              title="פרויקטים אישיים"
              link={{ href: "/admin/personal", label: "כל הפרויקטים" }}
            >
              <ul className="divide-y divide-[#F1F5F9]">
                {data.personalProjects.slice(0, 6).map((p) => (
                  <li key={p.id} className="py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        href={routes("personal").projectDetail(p.id)}
                        className="text-[14px] font-medium text-[#0F172A] hover:text-[#2B7FFF] truncate flex-1 min-w-0"
                      >
                        {p.name}
                      </Link>
                      <span className="shrink-0 text-[12px] text-[#64748B] tabular-nums">
                        {p.openTasks > 0 ? `${p.openTasks} משימות` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 rounded ${DOMAIN_TONE.personal}`}
                      >
                        {PERSONAL_PROJECT_STATUS_HE[p.status]}
                      </span>
                      {p.targetDate && (
                        <span className="text-[11px] text-[#94A3B8]">
                          יעד {relativeDayHe(p.targetDate) ?? fmtDateHe(p.targetDate)}
                        </span>
                      )}
                    </div>
                    {p.nextAction && (
                      <p className="text-[12px] text-[#475569] mt-1 leading-snug truncate">
                        → {p.nextAction}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {/* Stale — tasks that haven't moved in 14+ days */}
          {data.staleTasks.length > 0 && (
            <Panel title="לא זז" link={{ href: "/admin/tasks", label: "כל המשימות" }}>
              <ul className="divide-y divide-[#F1F5F9]">
                {data.staleTasks.slice(0, 8).map((t) => {
                  const days = daysSince(t.lastUpdateAt ?? t.createdAt);
                  return (
                    <li key={`${t.domain}-${t.id}`} className="py-3 flex items-center gap-3">
                      <span className="shrink-0">💤</span>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={routes(t.domain).taskDetail(t.id)}
                          className="block text-[14px] font-medium text-[#0F172A] truncate hover:text-[#2B7FFF]"
                        >
                          {t.title}
                        </Link>
                        <div className="text-[12px] text-[#94A3B8] truncate flex items-center gap-1.5">
                          <DomainBadge domain={t.domain} />
                          {[t.clientName, t.projectName].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <span className="shrink-0 text-[12px] tabular-nums text-amber-700 font-semibold">
                        {days} ימ׳
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}
        </div>
      </section>

      {/* ═══ Zone B — business ═══ */}
      <section className="space-y-4">
        <ZoneLabel>עסק</ZoneLabel>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel
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
          </Panel>

          <Panel title="מעקבים השבוע" link={{ href: "/admin/tasks", label: "כל המשימות" }}>
            {data.followUpsThisWeek.length === 0 ? (
              <Empty>אין מעקבים פתוחים לשבוע הקרוב.</Empty>
            ) : (
              <ul className="divide-y divide-[#F1F5F9]">
                {data.followUpsThisWeek.slice(0, 8).map((t) => {
                  const overdue = t.followUpAt && t.followUpAt < todayStr;
                  return (
                    <li key={`${t.domain}-${t.id}`} className="py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <Link
                          href={routes(t.domain).taskDetail(t.id)}
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
                        {[t.clientName, t.projectName].filter(Boolean).join(" · ")}
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
          </Panel>

          <Panel title="לידים ומו״מ" link={{ href: "/admin/clients", label: "כל הלקוחות" }}>
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
          </Panel>
        </div>
      </section>
    </div>
  );
}

/** Tiny "client / personal" tag, so merged lists stay readable at a glance. */
function DomainBadge({ domain }: { domain: Domain }) {
  return (
    <span
      className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 rounded ${DOMAIN_TONE[domain]}`}
    >
      {DOMAIN_LABEL[domain]}
    </span>
  );
}

function ZoneLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
      {children}
    </h2>
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
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">{label}</div>
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

function Panel({
  title,
  link,
  className = "",
  children,
}: {
  title: string;
  link?: { href: string; label: string };
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`bg-white border border-[#E2E8F0] rounded-xl p-5 ${className}`}>
      <header className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-[#0F172A]">{title}</h3>
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
  return <p className="text-[13px] text-[#94A3B8] py-6 text-center">{children}</p>;
}
