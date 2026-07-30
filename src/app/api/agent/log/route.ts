export const runtime = "nodejs";

import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import {
  db,
  personalLinks,
  personalTaskSteps,
  personalTaskUpdates,
  personalTasks,
  personalTimeEntries,
  taskUpdates,
  tasks,
  timeEntries,
} from "@/lib/db/client";
import { json, parseJson, serverError } from "@/lib/admin/http";
import { requireAgent } from "@/lib/auth/agent";
import { commitUrlFromRepo } from "@/lib/admin/format";
import {
  AGENT_UPDATE_KINDS,
  TASK_STATUSES,
  findTask,
  mapUpdateKind,
  projectRefSchema,
  taskRefSchema,
  taskUrl,
} from "@/lib/agent/core";

/**
 * The one endpoint an agent calls while it works: writes a journal entry, moves
 * the status, ticks checklist items and logs time — in a single request, so a
 * mid-task report can never end up half-written.
 */
const bodySchema = projectRefSchema.merge(taskRefSchema).extend({
  kind: z.enum(AGENT_UPDATE_KINDS).default("progress"),
  summary: z.string().min(1).max(500),
  details: z.string().max(10_000).nullable().optional(),
  /** New task status. This is the only way an agent may move a task. */
  status: z.enum(TASK_STATUSES).nullable().optional(),
  nextAction: z.string().max(500).nullable().optional(),
  waitingOn: z.string().max(300).nullable().optional(),
  commitSha: z.string().max(80).nullable().optional(),
  commitUrl: z.string().url().max(500).nullable().optional(),
  timeMinutes: z.coerce.number().int().min(0).max(24 * 60).nullable().optional(),
  /** Checklist titles to mark done (personal projects). Unknown titles are reported back. */
  completedSteps: z.array(z.string().min(1).max(300)).max(30).optional(),
  /** Name of the writing agent, for the "🤖" marker in the dashboard. */
  agent: z.string().max(80).optional(),
  /** Idempotency key — resend the same one and you get the original entry back. */
  externalKey: z.string().min(6).max(120).optional(),
});

export async function POST(req: Request) {
  const unauthorized = requireAgent(req);
  if (unauthorized) return unauthorized;

  const parsed = await parseJson(req, bodySchema);
  if (!parsed.ok) return parsed.res;
  const d = parsed.data;

  if (!d.taskKey && !d.taskId) {
    return json(
      { ok: false, error: "Provide taskKey (preferred) or taskId." },
      { status: 422 },
    );
  }

  try {
    const task = await findTask(d.projectKind, d.projectId, {
      taskKey: d.taskKey,
      taskId: d.taskId,
    });
    if (!task) {
      return json(
        {
          ok: false,
          error: "Task not found in this project",
          hint: "Create it first with POST /api/agent/task.",
        },
        { status: 404 },
      );
    }

    const agentName = d.agent ?? "claude-code";
    const now = new Date();
    const statusChanged = !!d.status && d.status !== task.status;
    const warnings: string[] = [];

    // Idempotency: a retried request must not double-write the journal.
    if (d.externalKey) {
      const existing =
        d.projectKind === "personal"
          ? await db
              .select({ id: personalTaskUpdates.id })
              .from(personalTaskUpdates)
              .where(eq(personalTaskUpdates.externalKey, d.externalKey))
          : await db
              .select({ id: taskUpdates.id })
              .from(taskUpdates)
              .where(eq(taskUpdates.externalKey, d.externalKey));
      if (existing.length) {
        return json({
          ok: true,
          duplicate: true,
          updateId: existing[0].id,
          task: { id: task.id, taskKey: task.agentKey, status: task.status },
          url: taskUrl(req, d.projectKind, task.id),
        });
      }
    }

    const result =
      d.projectKind === "personal"
        ? await logPersonal(d, task, agentName, now, statusChanged, warnings)
        : await logClient(d, task, agentName, now, statusChanged, warnings);

    return json(
      {
        ok: true,
        updateId: result.updateId,
        task: {
          id: task.id,
          taskKey: task.agentKey,
          status: d.status ?? task.status,
        },
        loggedMinutes: result.loggedMinutes,
        url: taskUrl(req, d.projectKind, task.id),
        warnings,
      },
      { status: 201 },
    );
  } catch (e) {
    return serverError(e);
  }
}

type Body = z.infer<typeof bodySchema>;
type Task = NonNullable<Awaited<ReturnType<typeof findTask>>>;

async function logPersonal(
  d: Body,
  task: Task,
  agentName: string,
  now: Date,
  statusChanged: boolean,
  warnings: string[],
) {
  // A bare SHA becomes a link when the project has a GitHub repo link.
  let commitUrl = d.commitUrl ?? null;
  if (!commitUrl && d.commitSha) {
    const [repo] = await db
      .select({ url: personalLinks.url })
      .from(personalLinks)
      .where(and(eq(personalLinks.projectId, task.projectId), eq(personalLinks.kind, "github")))
      .limit(1);
    commitUrl = commitUrlFromRepo(repo?.url, d.commitSha);
  }

  let timeEntryId: number | null = null;
  let loggedMinutes = 0;
  if (d.timeMinutes && d.timeMinutes > 0) {
    const seconds = d.timeMinutes * 60;
    const [entry] = await db
      .insert(personalTimeEntries)
      .values({
        projectId: task.projectId,
        taskId: task.id,
        startedAt: new Date(now.getTime() - seconds * 1000),
        endedAt: now,
        durationSeconds: seconds,
        note: d.summary,
      })
      .returning({ id: personalTimeEntries.id });
    timeEntryId = entry.id;
    loggedMinutes = d.timeMinutes;
  }

  const [created] = await db
    .insert(personalTaskUpdates)
    .values({
      taskId: task.id,
      happenedAt: now,
      kind: mapUpdateKind("personal", d.kind) as "progress",
      summary: d.summary.trim(),
      details: d.details?.trim() || null,
      statusBefore: statusChanged ? (task.status as "todo") : null,
      statusAfter: statusChanged ? (d.status as "todo") : null,
      nextAction: d.nextAction?.trim() || null,
      commitSha: d.commitSha?.trim() || null,
      commitUrl,
      timeEntryId,
      source: "agent",
      agentName,
      externalKey: d.externalKey ?? null,
    })
    .returning({ id: personalTaskUpdates.id });

  await db
    .update(personalTasks)
    .set({
      lastUpdateAt: now,
      ...(statusChanged ? { status: d.status! } : {}),
      ...(statusChanged && d.status === "done" ? { completedAt: now } : {}),
      ...(statusChanged && d.status !== "done" ? { completedAt: null } : {}),
      ...(statusChanged && d.status === "in_progress" && !task.startedAt ? { startedAt: now } : {}),
      ...(d.nextAction !== undefined ? { nextAction: d.nextAction?.trim() || null } : {}),
    })
    .where(eq(personalTasks.id, task.id));

  if (d.completedSteps?.length) {
    const titles = d.completedSteps.map((s) => s.trim());
    const rows = await db
      .select({ id: personalTaskSteps.id, title: personalTaskSteps.title })
      .from(personalTaskSteps)
      .where(and(eq(personalTaskSteps.taskId, task.id), inArray(personalTaskSteps.title, titles)));
    if (rows.length) {
      await db
        .update(personalTaskSteps)
        .set({ done: true })
        .where(
          inArray(
            personalTaskSteps.id,
            rows.map((r) => r.id),
          ),
        );
    }
    const matched = new Set(rows.map((r) => r.title));
    const unmatched = titles.filter((t) => !matched.has(t));
    if (unmatched.length) {
      warnings.push(`No checklist step matched: ${unmatched.join(", ")}`);
    }
  }

  return { updateId: created.id, loggedMinutes };
}

async function logClient(
  d: Body,
  task: Task,
  agentName: string,
  now: Date,
  statusChanged: boolean,
  warnings: string[],
) {
  if (d.completedSteps?.length || d.commitSha) {
    warnings.push("Checklist steps and commit links exist on personal projects only.");
  }

  const [created] = await db
    .insert(taskUpdates)
    .values({
      taskId: task.id,
      happenedAt: now,
      kind: mapUpdateKind("client", d.kind) as "progress",
      summary: d.summary.trim(),
      details: d.details?.trim() || null,
      statusBefore: task.status as "todo",
      statusAfter: statusChanged ? (d.status as "todo") : null,
      nextAction: d.nextAction?.trim() || null,
      source: "agent",
      agentName,
      externalKey: d.externalKey ?? null,
    })
    .returning({ id: taskUpdates.id });

  let loggedMinutes = 0;
  if (d.timeMinutes && d.timeMinutes > 0) {
    const seconds = d.timeMinutes * 60;
    const [entry] = await db
      .insert(timeEntries)
      .values({
        projectId: task.projectId,
        taskId: task.id,
        startedAt: new Date(now.getTime() - seconds * 1000),
        endedAt: now,
        durationSeconds: seconds,
        note: d.summary,
        billable: true,
      })
      .returning({ id: timeEntries.id });
    await db
      .update(taskUpdates)
      .set({ timeEntryId: entry.id })
      .where(eq(taskUpdates.id, created.id));
    loggedMinutes = d.timeMinutes;
  }

  const patch: Record<string, unknown> = { lastUpdateAt: now };
  if (d.nextAction !== undefined) patch.nextAction = d.nextAction?.trim() || null;
  if (statusChanged) {
    patch.status = d.status;
    patch.completedAt = d.status === "done" ? now : null;
    if (d.status === "waiting") {
      patch.waitingSince = now.toISOString().slice(0, 10);
      if (d.waitingOn !== undefined) patch.waitingOn = d.waitingOn?.trim() || null;
    } else {
      patch.waitingSince = null;
      patch.waitingOn = null;
    }
  }
  await db.update(tasks).set(patch).where(eq(tasks.id, task.id));

  return { updateId: created.id, loggedMinutes };
}
