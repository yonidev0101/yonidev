import {
  db,
  tasks,
  projects,
  clients,
  personalTasks,
  personalProjects,
  personalTaskSteps,
} from "@/lib/db/client";
import { eq, desc, sql } from "drizzle-orm";
import TasksList, { type TaskRow } from "@/components/admin/TasksList";
import TaskQuickAdd, { type QuickAddProject } from "@/components/admin/TaskQuickAdd";
import { isTaskClosed } from "@/lib/admin/format";
import type { Domain } from "@/lib/admin/domain";

export const dynamic = "force-dynamic";

/**
 * The one place that answers "what do I have to do" — across client work and
 * personal projects alike. Domain is a filter here, not a separate page.
 */
export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const sp = await searchParams;
  const kind: Domain | "all" =
    sp.kind === "personal" || sp.kind === "client" ? sp.kind : "all";

  const [clientRows, personalRows, clientProjectRows, personalProjectRows, personalStepRows] =
    await Promise.all([
    kind === "personal"
      ? Promise.resolve([])
      : db
          .select({
            id: tasks.id,
            title: tasks.title,
            description: tasks.description,
            status: tasks.status,
            priority: tasks.priority,
            dueDate: tasks.dueDate,
            nextAction: tasks.nextAction,
            followUpAt: tasks.followUpAt,
            waitingOn: tasks.waitingOn,
            waitingSince: tasks.waitingSince,
            estimateMinutes: tasks.estimateMinutes,
            lastUpdateAt: tasks.lastUpdateAt,
            createdAt: tasks.createdAt,
            projectId: tasks.projectId,
            projectName: projects.name,
            clientName: clients.name,
          })
          .from(tasks)
          .leftJoin(projects, eq(projects.id, tasks.projectId))
          .leftJoin(clients, eq(clients.id, projects.clientId))
          .orderBy(desc(tasks.createdAt)),
    kind === "client"
      ? Promise.resolve([])
      : db
          .select({
            id: personalTasks.id,
            title: personalTasks.title,
            description: personalTasks.description,
            status: personalTasks.status,
            priority: personalTasks.priority,
            dueDate: personalTasks.dueDate,
            nextAction: personalTasks.nextAction,
            acceptance: personalTasks.acceptance,
            estimateMinutes: personalTasks.estimateMinutes,
            lastUpdateAt: personalTasks.lastUpdateAt,
            createdAt: personalTasks.createdAt,
            projectId: personalTasks.projectId,
            projectName: personalProjects.name,
          })
          .from(personalTasks)
          .leftJoin(personalProjects, eq(personalProjects.id, personalTasks.projectId))
          .orderBy(desc(personalTasks.createdAt)),
    db
      .select({ id: projects.id, name: projects.name, clientName: clients.name })
      .from(projects)
      .leftJoin(clients, eq(clients.id, projects.clientId))
      .where(eq(projects.status, "active"))
      .orderBy(clients.name, projects.name),
    db
      .select({ id: personalProjects.id, name: personalProjects.name, status: personalProjects.status })
      .from(personalProjects)
      .orderBy(personalProjects.name),
    // Checklist progress per personal task, for the "✔ 3/7" badge.
    db
      .select({
        taskId: personalTaskSteps.taskId,
        total: sql<number>`COUNT(*)::int`,
        done: sql<number>`COUNT(*) FILTER (WHERE ${personalTaskSteps.done})::int`,
      })
      .from(personalTaskSteps)
      .groupBy(personalTaskSteps.taskId),
  ]);

  const stepsByTask = new Map(personalStepRows.map((r) => [r.taskId, r]));

  const iso = (d: Date | string | null) =>
    d instanceof Date ? d.toISOString() : d;

  const list: TaskRow[] = [
    ...clientRows.map((r) => ({
      ...r,
      domain: "client" as const,
      stepsDone: 0,
      stepsTotal: 0,
      lastUpdateAt: iso(r.lastUpdateAt),
      createdAt: iso(r.createdAt),
    })),
    ...personalRows.map((r) => ({
      ...r,
      domain: "personal" as const,
      // Personal tasks have no client and no follow-up/waiting model yet.
      clientName: null,
      followUpAt: null,
      waitingOn: null,
      waitingSince: null,
      stepsDone: stepsByTask.get(r.id)?.done ?? 0,
      stepsTotal: stepsByTask.get(r.id)?.total ?? 0,
      lastUpdateAt: iso(r.lastUpdateAt),
      createdAt: iso(r.createdAt),
    })),
  ];

  const openCount = list.filter((t) => !isTaskClosed(t.status)).length;
  const doneCount = list.filter((t) => t.status === "done").length;

  const quickAddProjects: QuickAddProject[] = [
    ...personalProjectRows
      .filter((p) => p.status !== "done" && p.status !== "archived")
      .map((p) => ({ id: p.id, name: p.name, clientName: null, domain: "personal" as const })),
    ...clientProjectRows.map((p) => ({
      id: p.id,
      name: p.name,
      clientName: p.clientName,
      domain: "client" as const,
    })),
  ];

  return (
    <div dir="rtl" className="space-y-6 max-w-5xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">משימות</h1>
        <p className="text-[#64748B] text-sm mt-1">
          {openCount} פתוחות{doneCount > 0 ? ` · ${doneCount} הושלמו` : ""} — עבודת לקוחות
          ופרויקטים אישיים יחד.
        </p>
      </header>

      <TaskQuickAdd projects={quickAddProjects} pickerLabel="פרויקט" />

      <TasksList tasks={list} kind={kind} />
    </div>
  );
}
