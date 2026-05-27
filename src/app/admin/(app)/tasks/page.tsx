import { db, tasks, projects, clients } from "@/lib/db/client";
import { eq, desc, inArray } from "drizzle-orm";
import TasksList, { type TaskRow } from "@/components/admin/TasksList";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      nextAction: tasks.nextAction,
      followUpAt: tasks.followUpAt,
      projectId: tasks.projectId,
      projectName: projects.name,
      clientName: clients.name,
    })
    .from(tasks)
    .leftJoin(projects, eq(projects.id, tasks.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(inArray(tasks.status, ["todo", "in_progress", "blocked"]))
    .orderBy(desc(tasks.createdAt));

  const list: TaskRow[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    status: r.status,
    priority: r.priority,
    dueDate: r.dueDate,
    nextAction: r.nextAction,
    followUpAt: r.followUpAt,
    projectId: r.projectId,
    projectName: r.projectName,
    clientName: r.clientName,
  }));

  return (
    <div dir="rtl" className="space-y-8 max-w-5xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">משימות</h1>
        <p className="text-[#64748B] text-sm mt-1">{rows.length} משימות פתוחות בכל הפרויקטים.</p>
      </header>

      <TasksList tasks={list} />
    </div>
  );
}
