import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientWithRelations } from "@/lib/admin/queries";
import {
  CLIENT_STATUS_HE,
  PROJECT_STATUS_HE,
  INVOICE_STATUS_HE,
  fmtDateHe,
  fmtIls,
  fmtHours,
} from "@/lib/admin/format";
import ClientEditCard from "@/components/admin/ClientEditCard";
import ProjectCreateForm from "@/components/admin/ProjectCreateForm";
import CommunicationForm from "@/components/admin/CommunicationForm";
import TaskQuickAdd, { type QuickAddProject } from "@/components/admin/TaskQuickAdd";
import ClientHoursChart from "@/components/admin/ClientHoursChart";
import ClientTasksByProject from "@/components/admin/ClientTasksByProject";
import ClientActivityFeed from "@/components/admin/ClientActivityFeed";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const data = await getClientWithRelations(id);
  if (!data) notFound();
  const {
    client,
    projects,
    communications,
    invoices,
    tasks,
    taskUpdates,
    totalSeconds,
    billableUninvoicedSeconds,
    outstandingTotalIls,
    openTaskCount,
    weeklyHours,
  } = data;

  const openProjects: QuickAddProject[] = projects
    .filter((p) => p.status !== "done")
    .map((p) => ({ id: p.id, name: p.name }));
  const projectsForFeed = projects.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div dir="rtl" className="space-y-6 max-w-5xl">
      <header>
        <Link
          href="/admin/clients"
          className="text-[12px] text-[#94A3B8] hover:text-[#2B7FFF]"
        >
          ← לקוחות
        </Link>
        <div className="flex items-baseline gap-3 mt-2">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
            {client.name}
          </h1>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2B7FFF]">
            {CLIENT_STATUS_HE[client.status]}
          </span>
        </div>
        {client.company && <p className="text-[#64748B] mt-1">{client.company}</p>}
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="סהכ שעות" value={fmtHours(totalSeconds)} />
        <Kpi label="לחשבונית" value={fmtHours(billableUninvoicedSeconds)} />
        <Kpi
          label="חשבוניות פתוחות"
          value={fmtIls(outstandingTotalIls)}
          tone={outstandingTotalIls > 0 ? "amber" : undefined}
        />
        <Kpi
          label="משימות פתוחות"
          value={openTaskCount.toString()}
          tone={openTaskCount > 0 ? "blue" : undefined}
        />
      </div>

      <ClientHoursChart data={weeklyHours} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Open tasks */}
          <section>
            <h2 className="text-[15px] font-bold text-[#0F172A] mb-3">משימות פתוחות</h2>
            <ClientTasksByProject tasks={tasks} />
          </section>

          {/* Quick add task */}
          {openProjects.length > 0 && (
            <section>
              <h2 className="text-[15px] font-bold text-[#0F172A] mb-3">משימה חדשה</h2>
              <TaskQuickAdd projects={openProjects} pickerLabel="פרויקט" />
            </section>
          )}

          {/* Unified activity feed */}
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-[15px] font-bold text-[#0F172A]">פעילות</h2>
              <span className="text-[11px] text-[#94A3B8]">עדכוני משימות + תקשורת</span>
            </div>
            <CommunicationForm clientId={client.id} projects={projects} />
            <div className="mt-4">
              <ClientActivityFeed
                taskUpdates={taskUpdates}
                communications={communications}
                projects={projectsForFeed}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <ClientEditCard client={client} />

          {/* Projects (compact) */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-5">
            <h2 className="text-[13px] font-bold text-[#0F172A] mb-3">פרויקטים</h2>
            <ProjectCreateForm clientId={client.id} defaultRate={client.defaultHourlyRateIls} />
            {projects.length === 0 ? (
              <p className="text-[12px] text-[#94A3B8] mt-3">אין פרויקטים עדיין.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="flex items-center gap-2 text-[13px] text-[#0F172A] hover:text-[#2B7FFF]"
                    >
                      <span className="flex-1 truncate font-medium">{p.name}</span>
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
                        {PROJECT_STATUS_HE[p.status]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Invoices summary */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-5">
            <h2 className="text-[13px] font-bold text-[#0F172A] mb-3">חשבוניות</h2>
            {invoices.length === 0 ? (
              <p className="text-[12px] text-[#94A3B8]">אין חשבוניות עדיין.</p>
            ) : (
              <ul className="space-y-2">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between text-[13px]">
                    <Link
                      href={`/admin/invoices/${inv.id}`}
                      className="text-[#2B7FFF] hover:underline"
                      dir="ltr"
                    >
                      {inv.number}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          inv.status === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : inv.status === "sent"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {INVOICE_STATUS_HE[inv.status]}
                      </span>
                      <span className="tabular-nums text-[#0F172A]">
                        {fmtIls(inv.totalIls)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/admin/invoices/new?clientId=${client.id}`}
              className="mt-4 block text-center text-[13px] font-semibold text-[#2B7FFF] hover:underline"
            >
              + חשבונית חדשה
            </Link>
          </section>

          {client.notes && (
            <section className="bg-white border border-[#E2E8F0] rounded-xl p-5">
              <h2 className="text-[13px] font-bold text-[#0F172A] mb-2">הערות</h2>
              <p className="text-[13px] text-[#475569] whitespace-pre-wrap leading-relaxed">
                {client.notes}
              </p>
            </section>
          )}

          <div className="text-[11px] text-[#94A3B8] px-1">
            נוצר {fmtDateHe(client.createdAt)}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "blue" | "amber";
}) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
        {label}
      </div>
      <div
        className={`mt-1 text-xl md:text-2xl font-bold tabular-nums ${
          tone === "amber"
            ? "text-amber-700"
            : tone === "blue"
              ? "text-[#2B7FFF]"
              : "text-[#0F172A]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
