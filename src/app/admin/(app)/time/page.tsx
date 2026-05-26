import { db, timeEntries, projects, clients } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";
import { fmtHours } from "@/lib/admin/format";
import ManualTimeEntryForm from "@/components/admin/ManualTimeEntryForm";
import TimeEntriesList, { type TimeRow } from "@/components/admin/TimeEntriesList";

export const dynamic = "force-dynamic";

export default async function TimePage() {
  const rows = await db
    .select({
      id: timeEntries.id,
      projectId: timeEntries.projectId,
      projectName: projects.name,
      clientName: clients.name,
      startedAt: timeEntries.startedAt,
      endedAt: timeEntries.endedAt,
      durationSeconds: timeEntries.durationSeconds,
      note: timeEntries.note,
      invoicedInvoiceId: timeEntries.invoicedInvoiceId,
      billable: timeEntries.billable,
    })
    .from(timeEntries)
    .leftJoin(projects, eq(projects.id, timeEntries.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .orderBy(desc(timeEntries.startedAt))
    .limit(200);

  const totalSec = rows.reduce((sum, r) => sum + (r.durationSeconds ?? 0), 0);
  const uninvoiced = rows
    .filter((r) => !r.invoicedInvoiceId && r.endedAt)
    .reduce((sum, r) => sum + (r.durationSeconds ?? 0), 0);

  const list: TimeRow[] = rows.map((r) => ({
    id: r.id,
    projectId: r.projectId,
    projectName: r.projectName,
    clientName: r.clientName,
    startedAt: r.startedAt.toISOString(),
    endedAt: r.endedAt ? r.endedAt.toISOString() : null,
    durationSeconds: r.durationSeconds,
    note: r.note,
    invoicedInvoiceId: r.invoicedInvoiceId,
    billable: r.billable,
  }));

  return (
    <div dir="rtl" className="space-y-6 max-w-5xl">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">שעות</h1>
          <p className="text-[#64748B] text-sm mt-1">
            סה&quot;כ {fmtHours(totalSec)} · לחשבונית: {fmtHours(uninvoiced)}
          </p>
        </div>
      </header>

      <ManualTimeEntryForm />

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <TimeEntriesList entries={list} />
      </div>
    </div>
  );
}
