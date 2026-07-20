import {
  db,
  clients,
  projects,
  projectLinks,
  tasks,
  taskUpdates,
  timeEntries,
  invoices,
  communications,
  personalProjects,
  personalTasks,
  personalLinks,
  personalTimeEntries,
  personalTaskUpdates,
} from "@/lib/db/client";
import { and, desc, eq, gte, isNull, lte, sql, inArray } from "drizzle-orm";
import { isTaskClosed } from "@/lib/admin/format";

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
      followUpAt: tasks.followUpAt,
      nextAction: tasks.nextAction,
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
        inArray(tasks.status, ["todo", "in_progress", "waiting", "blocked"]),
        sql`COALESCE(${tasks.followUpAt}, ${tasks.dueDate}) <= ${weekEndStr}`,
      ),
    )
    .orderBy(sql`COALESCE(${tasks.followUpAt}, ${tasks.dueDate})`);

  // Follow-ups within the next 7 days (or overdue) — surfaces "what's coming back to me"
  const followUpsThisWeek = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      nextAction: tasks.nextAction,
      followUpAt: tasks.followUpAt,
      projectId: tasks.projectId,
      projectName: projects.name,
      clientName: clients.name,
    })
    .from(tasks)
    .leftJoin(projects, eq(projects.id, tasks.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(
      and(
        inArray(tasks.status, ["todo", "in_progress", "waiting", "blocked"]),
        lte(tasks.followUpAt, weekEndStr),
      ),
    )
    .orderBy(tasks.followUpAt);

  // Stale: open tasks that haven't moved in 14+ days. Parked "waiting" tasks whose
  // follow-up is still in the future are intentionally idle, so they're excluded.
  const staleCutoff = new Date(now);
  staleCutoff.setDate(now.getDate() - 14);
  const staleTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      lastUpdateAt: tasks.lastUpdateAt,
      createdAt: tasks.createdAt,
      projectId: tasks.projectId,
      projectName: projects.name,
      clientName: clients.name,
    })
    .from(tasks)
    .leftJoin(projects, eq(projects.id, tasks.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(
      and(
        inArray(tasks.status, ["todo", "in_progress", "waiting", "blocked"]),
        sql`COALESCE(${tasks.lastUpdateAt}, ${tasks.createdAt}) < ${staleCutoff}`,
        sql`NOT (${tasks.status} = 'waiting' AND ${tasks.followUpAt} IS NOT NULL AND ${tasks.followUpAt} > ${todayStr})`,
      ),
    )
    .orderBy(sql`COALESCE(${tasks.lastUpdateAt}, ${tasks.createdAt})`);

  // Active timer
  const activeTimerRows = await db
    .select({
      id: timeEntries.id,
      startedAt: timeEntries.startedAt,
      projectId: timeEntries.projectId,
      taskId: timeEntries.taskId,
      projectName: projects.name,
      clientName: clients.name,
    })
    .from(timeEntries)
    .leftJoin(projects, eq(projects.id, timeEntries.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(isNull(timeEntries.endedAt))
    .limit(1);

  // ── personal side ───────────────────────────────────────────────────
  // The dashboard answers "what's going on", and personal projects are part of
  // that answer. Everything below mirrors the client queries above.

  const [
    personalWeekHours,
    personalUpcoming,
    personalStale,
    personalActiveTimerRows,
    activePersonalProjects,
  ] = await Promise.all([
    db
      .select({
        totalSec: sql<number>`COALESCE(SUM(${personalTimeEntries.durationSeconds}), 0)::int`,
      })
      .from(personalTimeEntries)
      .where(gte(personalTimeEntries.startedAt, weekStart)),
    db
      .select({
        id: personalTasks.id,
        title: personalTasks.title,
        dueDate: personalTasks.dueDate,
        nextAction: personalTasks.nextAction,
        status: personalTasks.status,
        priority: personalTasks.priority,
        projectId: personalTasks.projectId,
        projectName: personalProjects.name,
      })
      .from(personalTasks)
      .leftJoin(personalProjects, eq(personalProjects.id, personalTasks.projectId))
      .where(
        and(
          inArray(personalTasks.status, ["todo", "in_progress", "waiting", "blocked"]),
          lte(personalTasks.dueDate, weekEndStr),
        ),
      )
      .orderBy(personalTasks.dueDate),
    db
      .select({
        id: personalTasks.id,
        title: personalTasks.title,
        status: personalTasks.status,
        lastUpdateAt: personalTasks.lastUpdateAt,
        createdAt: personalTasks.createdAt,
        projectId: personalTasks.projectId,
        projectName: personalProjects.name,
      })
      .from(personalTasks)
      .leftJoin(personalProjects, eq(personalProjects.id, personalTasks.projectId))
      .where(
        and(
          inArray(personalTasks.status, ["todo", "in_progress", "waiting", "blocked"]),
          sql`COALESCE(${personalTasks.lastUpdateAt}, ${personalTasks.createdAt}) < ${staleCutoff}`,
        ),
      )
      .orderBy(sql`COALESCE(${personalTasks.lastUpdateAt}, ${personalTasks.createdAt})`),
    db
      .select({
        id: personalTimeEntries.id,
        startedAt: personalTimeEntries.startedAt,
        projectId: personalTimeEntries.projectId,
        taskId: personalTimeEntries.taskId,
        projectName: personalProjects.name,
      })
      .from(personalTimeEntries)
      .leftJoin(personalProjects, eq(personalProjects.id, personalTimeEntries.projectId))
      .where(isNull(personalTimeEntries.endedAt))
      .limit(1),
    db
      .select({
        id: personalProjects.id,
        name: personalProjects.name,
        status: personalProjects.status,
        priority: personalProjects.priority,
        nextAction: personalProjects.nextAction,
        targetDate: personalProjects.targetDate,
      })
      .from(personalProjects)
      .where(inArray(personalProjects.status, ["active", "idea", "paused"]))
      .orderBy(desc(personalProjects.createdAt)),
  ]);

  // Open-task counts per personal project, for the dashboard cards.
  const personalIds = activePersonalProjects.map((p) => p.id);
  const personalOpenCounts = personalIds.length
    ? await db
        .select({
          projectId: personalTasks.projectId,
          open: sql<number>`COUNT(*) FILTER (WHERE ${personalTasks.status} NOT IN ('done','canceled'))::int`,
        })
        .from(personalTasks)
        .where(inArray(personalTasks.projectId, personalIds))
        .groupBy(personalTasks.projectId)
    : [];
  const openByProject = new Map(personalOpenCounts.map((r) => [r.projectId, r.open]));

  const clientWeekSeconds = weekHours[0]?.totalSec ?? 0;
  const personalWeekSeconds = personalWeekHours[0]?.totalSec ?? 0;

  return {
    activeClients,
    weekHoursSeconds: clientWeekSeconds + personalWeekSeconds,
    weekHoursClientSeconds: clientWeekSeconds,
    weekHoursPersonalSeconds: personalWeekSeconds,
    outstandingInvoices,
    // Tasks are merged across domains — the dashboard shows one to-do reality.
    upcomingTasks: [
      ...upcomingTasks.map((t) => ({ ...t, domain: "client" as const })),
      ...personalUpcoming.map((t) => ({
        ...t,
        domain: "personal" as const,
        clientName: null,
        followUpAt: null,
      })),
    ],
    // Follow-ups stay client-only: personal tasks have no follow-up model yet.
    followUpsThisWeek: followUpsThisWeek.map((t) => ({ ...t, domain: "client" as const })),
    staleTasks: [
      ...staleTasks.map((t) => ({ ...t, domain: "client" as const })),
      ...personalStale.map((t) => ({ ...t, domain: "personal" as const, clientName: null })),
    ],
    activeTimers: [
      ...activeTimerRows.map((t) => ({ ...t, domain: "client" as const })),
      ...personalActiveTimerRows.map((t) => ({
        ...t,
        domain: "personal" as const,
        clientName: null,
      })),
    ],
    personalProjects: activePersonalProjects.map((p) => ({
      ...p,
      openTasks: openByProject.get(p.id) ?? 0,
    })),
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

  const [
    clientComms,
    clientInvoices,
    clientTimeAgg,
    billableAgg,
    clientTasks,
    recentUpdates,
    weeklyHoursRows,
  ] = await Promise.all([
    db
      .select()
      .from(communications)
      .where(eq(communications.clientId, clientId))
      .orderBy(desc(communications.happenedAt))
      .limit(50),
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
    projectIds.length
      ? db
          .select({ totalSec: sql<number>`COALESCE(SUM(${timeEntries.durationSeconds}), 0)::int` })
          .from(timeEntries)
          .where(
            and(
              inArray(timeEntries.projectId, projectIds),
              eq(timeEntries.billable, true),
              isNull(timeEntries.invoicedInvoiceId),
            ),
          )
      : Promise.resolve([{ totalSec: 0 }]),
    projectIds.length
      ? db
          .select({
            id: tasks.id,
            title: tasks.title,
            status: tasks.status,
            priority: tasks.priority,
            dueDate: tasks.dueDate,
            nextAction: tasks.nextAction,
            followUpAt: tasks.followUpAt,
            projectId: tasks.projectId,
            projectName: projects.name,
          })
          .from(tasks)
          .leftJoin(projects, eq(projects.id, tasks.projectId))
          .where(inArray(tasks.projectId, projectIds))
          .orderBy(desc(tasks.createdAt))
      : Promise.resolve(
          [] as {
            id: number;
            title: string;
            status: "todo" | "in_progress" | "waiting" | "blocked" | "done" | "canceled";
            priority: "low" | "medium" | "high";
            dueDate: string | null;
            nextAction: string | null;
            followUpAt: string | null;
            projectId: number;
            projectName: string | null;
          }[],
        ),
    projectIds.length
      ? db
          .select({
            id: taskUpdates.id,
            taskId: taskUpdates.taskId,
            kind: taskUpdates.kind,
            happenedAt: taskUpdates.happenedAt,
            summary: taskUpdates.summary,
            details: taskUpdates.details,
            communicationId: taskUpdates.communicationId,
            taskTitle: tasks.title,
            projectId: tasks.projectId,
            projectName: projects.name,
          })
          .from(taskUpdates)
          .leftJoin(tasks, eq(tasks.id, taskUpdates.taskId))
          .leftJoin(projects, eq(projects.id, tasks.projectId))
          .where(inArray(tasks.projectId, projectIds))
          .orderBy(desc(taskUpdates.happenedAt))
          .limit(50)
      : Promise.resolve(
          [] as {
            id: number;
            taskId: number;
            kind: string;
            happenedAt: Date;
            summary: string;
            details: string | null;
            communicationId: number | null;
            taskTitle: string | null;
            projectId: number | null;
            projectName: string | null;
          }[],
        ),
    projectIds.length
      ? db
          .select({
            weekStart: sql<string>`to_char(date_trunc('week', ${timeEntries.startedAt}), 'YYYY-MM-DD')`,
            totalSec: sql<number>`COALESCE(SUM(${timeEntries.durationSeconds}), 0)::int`,
          })
          .from(timeEntries)
          .where(
            and(
              inArray(timeEntries.projectId, projectIds),
              gte(timeEntries.startedAt, weeksAgo(12)),
            ),
          )
          .groupBy(sql`date_trunc('week', ${timeEntries.startedAt})`)
      : Promise.resolve([] as { weekStart: string; totalSec: number }[]),
  ]);

  const outstandingTotalIls = clientInvoices
    .filter((inv) => inv.status === "sent")
    .reduce((sum, inv) => sum + Number(inv.totalIls), 0);
  const openTaskCount = clientTasks.filter((t) => !isTaskClosed(t.status)).length;

  return {
    client,
    projects: clientProjects,
    communications: clientComms,
    invoices: clientInvoices,
    tasks: clientTasks,
    taskUpdates: recentUpdates,
    totalSeconds: clientTimeAgg[0]?.totalSec ?? 0,
    billableUninvoicedSeconds: billableAgg[0]?.totalSec ?? 0,
    outstandingTotalIls,
    openTaskCount,
    weeklyHours: fillWeeks(weeklyHoursRows, 12),
  };
}

function weeksAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n * 7);
  return d;
}

/** Pads weekly hours array so every week in the window has an entry, even if 0. */
function fillWeeks(
  rows: { weekStart: string; totalSec: number }[],
  count: number,
): { weekStart: string; totalSec: number }[] {
  const byWeek = new Map(rows.map((r) => [r.weekStart, r.totalSec]));
  const out: { weekStart: string; totalSec: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Postgres date_trunc('week', ...) uses Monday as the start of the week.
  const dow = (today.getDay() + 6) % 7; // 0 = Monday
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - dow);
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(thisMonday);
    d.setDate(thisMonday.getDate() - i * 7);
    const key = d.toISOString().slice(0, 10);
    out.push({ weekStart: key, totalSec: byWeek.get(key) ?? 0 });
  }
  return out;
}

export async function getTaskWithUpdates(taskId: number) {
  const [row] = await db
    .select({
      task: tasks,
      project: projects,
      client: clients,
    })
    .from(tasks)
    .leftJoin(projects, eq(projects.id, tasks.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(eq(tasks.id, taskId));
  if (!row) return null;

  const [updates, timeAgg] = await Promise.all([
    db
      .select()
      .from(taskUpdates)
      .where(eq(taskUpdates.taskId, taskId))
      .orderBy(desc(taskUpdates.happenedAt)),
    db
      .select({
        totalSec: sql<number>`COALESCE(SUM(${timeEntries.durationSeconds}), 0)::int`,
      })
      .from(timeEntries)
      .where(eq(timeEntries.taskId, taskId)),
  ]);

  // Fetch linked time entries to show duration in the timeline
  const entryIds = updates
    .map((u) => u.timeEntryId)
    .filter((id): id is number => id != null);
  const linkedEntries = entryIds.length
    ? await db
        .select({
          id: timeEntries.id,
          durationSeconds: timeEntries.durationSeconds,
          startedAt: timeEntries.startedAt,
        })
        .from(timeEntries)
        .where(inArray(timeEntries.id, entryIds))
    : [];
  const entryById = new Map(linkedEntries.map((e) => [e.id, e]));

  return {
    task: row.task,
    project: row.project,
    client: row.client,
    updates: updates.map((u) => ({
      ...u,
      timeEntry: u.timeEntryId ? entryById.get(u.timeEntryId) ?? null : null,
    })),
    totalSeconds: timeAgg[0]?.totalSec ?? 0,
  };
}

// ── personal projects (no client, no billing) ─────────────────────────

/**
 * Everything the personal-task work desk needs: the task, its project, the repo
 * link (so a bare SHA can be turned into a commit URL), the journal, and time.
 */
export async function getPersonalTaskWithUpdates(taskId: number) {
  const [row] = await db
    .select({ task: personalTasks, project: personalProjects })
    .from(personalTasks)
    .leftJoin(personalProjects, eq(personalProjects.id, personalTasks.projectId))
    .where(eq(personalTasks.id, taskId));
  if (!row) return null;

  const [updates, sessions, repoLinks] = await Promise.all([
    db
      .select()
      .from(personalTaskUpdates)
      .where(eq(personalTaskUpdates.taskId, taskId))
      .orderBy(desc(personalTaskUpdates.happenedAt)),
    db
      .select()
      .from(personalTimeEntries)
      .where(eq(personalTimeEntries.taskId, taskId))
      .orderBy(desc(personalTimeEntries.startedAt)),
    db
      .select({ url: personalLinks.url })
      .from(personalLinks)
      .where(
        and(
          eq(personalLinks.projectId, row.task.projectId),
          eq(personalLinks.kind, "github"),
        ),
      )
      .limit(1),
  ]);

  const totalSeconds = sessions.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0);
  const activeSession = sessions.find((s) => !s.endedAt) ?? null;

  return {
    task: row.task,
    project: row.project,
    repoUrl: repoLinks[0]?.url ?? null,
    updates,
    sessions,
    activeSession,
    totalSeconds,
  };
}

export async function getPersonalProjects() {
  const rows = await db
    .select()
    .from(personalProjects)
    .orderBy(desc(personalProjects.createdAt));

  const ids = rows.map((p) => p.id);
  if (ids.length === 0) {
    return rows.map((p) => ({ ...p, openTaskCount: 0, totalSeconds: 0 }));
  }

  const [taskCounts, timeAgg] = await Promise.all([
    db
      .select({
        projectId: personalTasks.projectId,
        open: sql<number>`COUNT(*) FILTER (WHERE ${personalTasks.status} NOT IN ('done', 'canceled'))::int`,
      })
      .from(personalTasks)
      .where(inArray(personalTasks.projectId, ids))
      .groupBy(personalTasks.projectId),
    db
      .select({
        projectId: personalTimeEntries.projectId,
        totalSec: sql<number>`COALESCE(SUM(${personalTimeEntries.durationSeconds}), 0)::int`,
      })
      .from(personalTimeEntries)
      .where(inArray(personalTimeEntries.projectId, ids))
      .groupBy(personalTimeEntries.projectId),
  ]);

  const openByProject = new Map(taskCounts.map((r) => [r.projectId, r.open]));
  const secByProject = new Map(timeAgg.map((r) => [r.projectId, r.totalSec]));

  return rows.map((p) => ({
    ...p,
    openTaskCount: openByProject.get(p.id) ?? 0,
    totalSeconds: secByProject.get(p.id) ?? 0,
  }));
}

export async function getPersonalProjectWithRelations(projectId: number) {
  const [project] = await db
    .select()
    .from(personalProjects)
    .where(eq(personalProjects.id, projectId));
  if (!project) return null;

  const [projectTasks, links, time] = await Promise.all([
    db
      .select()
      .from(personalTasks)
      .where(eq(personalTasks.projectId, projectId))
      .orderBy(desc(personalTasks.createdAt)),
    db.select().from(personalLinks).where(eq(personalLinks.projectId, projectId)),
    db
      .select()
      .from(personalTimeEntries)
      .where(eq(personalTimeEntries.projectId, projectId))
      .orderBy(desc(personalTimeEntries.startedAt))
      .limit(100),
  ]);

  return { project, tasks: projectTasks, links, timeEntries: time };
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
