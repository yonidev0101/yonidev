import {
  db,
  clients,
  projects,
  projectLinks,
  tasks,
  timeEntries,
  invoices,
  communications,
} from "@/lib/db/client";
import { and, desc, eq, gte, isNull, lte, sql, inArray } from "drizzle-orm";

export async function getDashboardData() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  weekEnd.setHours(23, 59, 59, 999);

  // Active clients (lead/negotiating/active)
  const activeClients = await db
    .select()
    .from(clients)
    .where(inArray(clients.status, ["lead", "negotiating", "active"]))
    .orderBy(desc(clients.createdAt));

  // Hours this week
  const weekHours = await db
    .select({ totalSec: sql<number>`COALESCE(SUM(${timeEntries.durationSeconds}), 0)::int` })
    .from(timeEntries)
    .where(and(gte(timeEntries.startedAt, weekStart)));

  // Outstanding invoices (sent, not paid)
  const outstandingInvoices = await db
    .select({
      id: invoices.id,
      number: invoices.number,
      clientName: clients.name,
      totalIls: invoices.totalIls,
      issuedAt: invoices.issuedAt,
      dueAt: invoices.dueAt,
    })
    .from(invoices)
    .leftJoin(clients, eq(clients.id, invoices.clientId))
    .where(eq(invoices.status, "sent"))
    .orderBy(desc(invoices.issuedAt));

  // Tasks overdue + due this week
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);

  const upcomingTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      dueDate: tasks.dueDate,
      status: tasks.status,
      priority: tasks.priority,
      projectId: tasks.projectId,
      projectName: projects.name,
      clientName: clients.name,
    })
    .from(tasks)
    .leftJoin(projects, eq(projects.id, tasks.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(
      and(
        inArray(tasks.status, ["todo", "in_progress", "blocked"]),
        lte(tasks.dueDate, weekEndStr),
      ),
    )
    .orderBy(tasks.dueDate);

  // Active projects with next_action set
  const nextActions = await db
    .select({
      id: projects.id,
      name: projects.name,
      nextAction: projects.nextAction,
      clientName: clients.name,
    })
    .from(projects)
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(and(eq(projects.status, "active"), sql`${projects.nextAction} IS NOT NULL`))
    .orderBy(desc(projects.createdAt));

  // Active timer
  const activeTimerRows = await db
    .select({
      id: timeEntries.id,
      startedAt: timeEntries.startedAt,
      projectName: projects.name,
      clientName: clients.name,
    })
    .from(timeEntries)
    .leftJoin(projects, eq(projects.id, timeEntries.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(isNull(timeEntries.endedAt))
    .limit(1);

  return {
    activeClients,
    weekHoursSeconds: weekHours[0]?.totalSec ?? 0,
    outstandingInvoices,
    upcomingTasks,
    nextActions,
    activeTimer: activeTimerRows[0] ?? null,
    todayStr,
  };
}

export async function getClientWithRelations(clientId: number) {
  const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
  if (!client) return null;
  const clientProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.clientId, clientId))
    .orderBy(desc(projects.createdAt));
  const projectIds = clientProjects.map((p) => p.id);
  const [clientComms, clientInvoices, clientTimeAgg] = await Promise.all([
    db
      .select()
      .from(communications)
      .where(eq(communications.clientId, clientId))
      .orderBy(desc(communications.happenedAt))
      .limit(20),
    db
      .select()
      .from(invoices)
      .where(eq(invoices.clientId, clientId))
      .orderBy(desc(invoices.createdAt)),
    projectIds.length
      ? db
          .select({ totalSec: sql<number>`COALESCE(SUM(${timeEntries.durationSeconds}), 0)::int` })
          .from(timeEntries)
          .where(inArray(timeEntries.projectId, projectIds))
      : Promise.resolve([{ totalSec: 0 }]),
  ]);
  return {
    client,
    projects: clientProjects,
    communications: clientComms,
    invoices: clientInvoices,
    totalSeconds: clientTimeAgg[0]?.totalSec ?? 0,
  };
}

export async function getProjectWithRelations(projectId: number) {
  const [row] = await db
    .select()
    .from(projects)
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(eq(projects.id, projectId));
  if (!row) return null;
  const [projectTasks, links, projectTime, projectComms] = await Promise.all([
    db.select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(desc(tasks.createdAt)),
    db.select().from(projectLinks).where(eq(projectLinks.projectId, projectId)),
    db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.projectId, projectId))
      .orderBy(desc(timeEntries.startedAt))
      .limit(50),
    db
      .select()
      .from(communications)
      .where(eq(communications.projectId, projectId))
      .orderBy(desc(communications.happenedAt))
      .limit(20),
  ]);
  return {
    project: row.projects,
    client: row.clients,
    tasks: projectTasks,
    links,
    timeEntries: projectTime,
    communications: projectComms,
  };
}
