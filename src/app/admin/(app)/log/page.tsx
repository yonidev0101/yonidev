import {
  db,
  timeEntries,
  projects,
  clients,
  tasks,
  personalTimeEntries,
  personalProjects,
  personalTasks,
} from "@/lib/db/client";
import { desc, eq, gte } from "drizzle-orm";
import WorkLog, { type LogEntry } from "@/components/admin/WorkLog";

export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90, 0] as const; // 0 = הכל

export default async function WorkLogPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; kind?: string }>;
}) {
  const sp = await searchParams;
  const days = RANGES.includes(Number(sp.days) as (typeof RANGES)[number])
    ? Number(sp.days)
    : 30;
  const kind = sp.kind === "personal" || sp.kind === "client" ? sp.kind : "all";

  const now = new Date();
  const since = days > 0 ? new Date(now.getTime() - days * 86_400_000) : null;

  const [personalRows, clientRows] = await Promise.all([
    kind === "client"
      ? Promise.resolve([])
      : db
          .select({
            id: personalTimeEntries.id,
            projectId: personalTimeEntries.projectId,
            projectName: personalProjects.name,
            taskId: personalTimeEntries.taskId,
            taskTitle: personalTasks.title,
            startedAt: personalTimeEntries.startedAt,
            endedAt: personalTimeEntries.endedAt,
            durationSeconds: personalTimeEntries.durationSeconds,
            note: personalTimeEntries.note,
          })
          .from(personalTimeEntries)
          .leftJoin(personalProjects, eq(personalProjects.id, personalTimeEntries.projectId))
          .leftJoin(personalTasks, eq(personalTasks.id, personalTimeEntries.taskId))
          .where(since ? gte(personalTimeEntries.startedAt, since) : undefined)
          .orderBy(desc(personalTimeEntries.startedAt))
          .limit(500),
    kind === "personal"
      ? Promise.resolve([])
      : db
          .select({
            id: timeEntries.id,
            projectId: timeEntries.projectId,
            projectName: projects.name,
            clientName: clients.name,
            taskTitle: tasks.title,
            startedAt: timeEntries.startedAt,
            endedAt: timeEntries.endedAt,
            durationSeconds: timeEntries.durationSeconds,
            note: timeEntries.note,
          })
          .from(timeEntries)
          .leftJoin(projects, eq(projects.id, timeEntries.projectId))
          .leftJoin(clients, eq(clients.id, projects.clientId))
          .leftJoin(tasks, eq(tasks.id, timeEntries.taskId))
          .where(since ? gte(timeEntries.startedAt, since) : undefined)
          .orderBy(desc(timeEntries.startedAt))
          .limit(500),
  ]);

  const entries: LogEntry[] = [
    ...personalRows.map((r) => ({
      key: `personal-${r.id}`,
      kind: "personal" as const,
      href: `/admin/personal/${r.projectId}?tab=time`,
      projectName: r.projectName ?? "—",
      subtitle: null,
      taskTitle: r.taskTitle,
      taskHref: r.taskId ? `/admin/personal/tasks/${r.taskId}` : null,
      startedAt: r.startedAt.toISOString(),
      endedAt: r.endedAt ? r.endedAt.toISOString() : null,
      durationSeconds: r.durationSeconds,
      note: r.note,
    })),
    ...clientRows.map((r) => ({
      key: `client-${r.id}`,
      kind: "client" as const,
      href: `/admin/projects/${r.projectId}`,
      projectName: r.projectName ?? "—",
      subtitle: r.clientName,
      taskTitle: r.taskTitle,
      taskHref: null,
      startedAt: r.startedAt.toISOString(),
      endedAt: r.endedAt ? r.endedAt.toISOString() : null,
      durationSeconds: r.durationSeconds,
      note: r.note,
    })),
  ].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return <WorkLog entries={entries} days={days} kind={kind} />;
}
