export const runtime = "nodejs";

import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import {
  db,
  personalLinks,
  personalProjects,
  personalTaskSteps,
  personalTaskUpdates,
  personalTasks,
  projectLinks,
  projects,
  clients,
  taskUpdates,
  tasks,
} from "@/lib/db/client";
import { json, serverError } from "@/lib/admin/http";
import { listProjectTags, tagsByTask } from "@/lib/admin/tags";
import { requireAgent } from "@/lib/auth/agent";
import {
  AGENT_UPDATE_KINDS,
  PERSONAL_TASK_TYPES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type ProjectKind,
} from "@/lib/agent/core";

/** Tasks in these states are history — an agent only cares about live work. */
const CLOSED = ["done", "canceled"] as const;

/**
 * One-call discovery for a coding agent.
 *
 * Without params it lists the projects it may write to. With
 * `?projectKind=personal&projectId=3` it returns everything needed to work and
 * report: the open tasks (with their agent keys), the recent journal, and the
 * exact enum values the write endpoints accept — so the agent never has to
 * guess a field value or re-read documentation.
 */
export async function GET(req: Request) {
  const unauthorized = requireAgent(req);
  if (unauthorized) return unauthorized;

  const url = new URL(req.url);
  const projectKind = url.searchParams.get("projectKind") as ProjectKind | null;
  const projectId = Number(url.searchParams.get("projectId"));

  try {
    if (!projectKind || !Number.isFinite(projectId) || projectId <= 0) {
      return json({ ok: true, ...(await listProjects()) });
    }
    const context =
      projectKind === "personal"
        ? await personalContext(projectId)
        : await clientContext(projectId);
    if (!context) {
      return json(
        { ok: false, error: "Project not found", ...(await listProjects()) },
        { status: 404 },
      );
    }
    return json({ ok: true, ...context, vocabulary: VOCABULARY });
  } catch (e) {
    return serverError(e);
  }
}

const VOCABULARY = {
  taskStatus: TASK_STATUSES,
  taskPriority: TASK_PRIORITIES,
  personalTaskType: PERSONAL_TASK_TYPES,
  updateKind: AGENT_UPDATE_KINDS,
  note: "Write Hebrew in summary / details / nextAction. Statuses change through POST /api/agent/log so the move is journalled.",
  tagsNote:
    "Personal projects only. Send tag slugs from project.tags on every task — they say which area of the project the work touches. A slug that doesn't exist is created and reported in warnings, so prefer the listed ones.",
};

async function listProjects() {
  const [personal, client] = await Promise.all([
    db
      .select({
        id: personalProjects.id,
        name: personalProjects.name,
        status: personalProjects.status,
        openTasks: sql<number>`(
          SELECT COUNT(*)::int FROM ${personalTasks}
          WHERE ${personalTasks.projectId} = ${personalProjects.id}
            AND ${personalTasks.status} NOT IN ('done','canceled')
        )`,
      })
      .from(personalProjects)
      .orderBy(desc(personalProjects.createdAt)),
    db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        client: clients.name,
        openTasks: sql<number>`(
          SELECT COUNT(*)::int FROM ${tasks}
          WHERE ${tasks.projectId} = ${projects.id}
            AND ${tasks.status} NOT IN ('done','canceled')
        )`,
      })
      .from(projects)
      .leftJoin(clients, eq(clients.id, projects.clientId))
      .orderBy(desc(projects.createdAt)),
  ]);

  return {
    projects: [
      ...personal.map((p) => ({ projectKind: "personal" as const, ...p })),
      ...client.map((p) => ({ projectKind: "client" as const, ...p })),
    ],
    hint: "Call again with ?projectKind=<personal|client>&projectId=<id> for the working context.",
  };
}

async function personalContext(projectId: number) {
  const [project] = await db
    .select()
    .from(personalProjects)
    .where(eq(personalProjects.id, projectId));
  if (!project) return null;

  const [openTasks, links, recent, tagCatalog] = await Promise.all([
    db
      .select()
      .from(personalTasks)
      .where(
        and(
          eq(personalTasks.projectId, projectId),
          notInArray(personalTasks.status, [...CLOSED]),
        ),
      )
      .orderBy(desc(personalTasks.lastUpdateAt)),
    db.select().from(personalLinks).where(eq(personalLinks.projectId, projectId)),
    db
      .select({
        taskId: personalTaskUpdates.taskId,
        happenedAt: personalTaskUpdates.happenedAt,
        kind: personalTaskUpdates.kind,
        summary: personalTaskUpdates.summary,
        source: personalTaskUpdates.source,
      })
      .from(personalTaskUpdates)
      .leftJoin(personalTasks, eq(personalTasks.id, personalTaskUpdates.taskId))
      .where(eq(personalTasks.projectId, projectId))
      .orderBy(desc(personalTaskUpdates.happenedAt))
      .limit(10),
    listProjectTags(projectId),
  ]);

  const taskTags = await tagsByTask(openTasks.map((t) => t.id));

  const stepRows = openTasks.length
    ? await db
        .select()
        .from(personalTaskSteps)
        .where(
          inArray(
            personalTaskSteps.taskId,
            openTasks.map((t) => t.id),
          ),
        )
        .orderBy(personalTaskSteps.sortOrder)
    : [];

  return {
    project: {
      projectKind: "personal" as const,
      id: project.id,
      name: project.name,
      status: project.status,
      description: project.description,
      nextAction: project.nextAction,
      links: links.map((l) => ({ kind: l.kind, label: l.label, url: l.url })),
      // The project's own tag vocabulary — pick from these, don't invent.
      tags: tagCatalog.map((t) => ({ slug: t.slug, label: t.label })),
    },
    openTasks: openTasks.map((t) => ({
      id: t.id,
      taskKey: t.agentKey,
      title: t.title,
      status: t.status,
      type: t.type,
      tags: (taskTags.get(t.id) ?? []).map((tag) => tag.slug),
      priority: t.priority,
      nextAction: t.nextAction,
      acceptance: t.acceptance,
      branchName: t.branchName,
      estimateMinutes: t.estimateMinutes,
      lastUpdateAt: t.lastUpdateAt,
      steps: stepRows
        .filter((s) => s.taskId === t.id)
        .map((s) => ({ id: s.id, title: s.title, done: s.done })),
    })),
    recentUpdates: recent,
  };
}

async function clientContext(projectId: number) {
  const [row] = await db
    .select({ project: projects, client: clients })
    .from(projects)
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(eq(projects.id, projectId));
  if (!row) return null;

  const [openTasks, links, recent] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(and(eq(tasks.projectId, projectId), notInArray(tasks.status, [...CLOSED])))
      .orderBy(desc(tasks.lastUpdateAt)),
    db.select().from(projectLinks).where(eq(projectLinks.projectId, projectId)),
    db
      .select({
        taskId: taskUpdates.taskId,
        happenedAt: taskUpdates.happenedAt,
        kind: taskUpdates.kind,
        summary: taskUpdates.summary,
        source: taskUpdates.source,
      })
      .from(taskUpdates)
      .leftJoin(tasks, eq(tasks.id, taskUpdates.taskId))
      .where(eq(tasks.projectId, projectId))
      .orderBy(desc(taskUpdates.happenedAt))
      .limit(10),
  ]);

  return {
    project: {
      projectKind: "client" as const,
      id: row.project.id,
      name: row.project.name,
      status: row.project.status,
      description: row.project.description,
      nextAction: row.project.nextAction,
      client: row.client?.name ?? null,
      links: links.map((l) => ({ kind: l.kind, label: l.label, url: l.url })),
    },
    openTasks: openTasks.map((t) => ({
      id: t.id,
      taskKey: t.agentKey,
      title: t.title,
      status: t.status,
      priority: t.priority,
      nextAction: t.nextAction,
      dueDate: t.dueDate,
      waitingOn: t.waitingOn,
      estimateMinutes: t.estimateMinutes,
      lastUpdateAt: t.lastUpdateAt,
    })),
    recentUpdates: recent,
    // Client journals can also feed the client-facing communication log, but an
    // agent should never do that on its own.
    note: "Never set alsoLogAsCommunication — client-visible entries are written by a human.",
  };
}
