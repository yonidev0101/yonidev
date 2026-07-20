export const runtime = "nodejs";

import { z } from "zod";
import {
  db,
  personalTaskUpdates,
  personalTasks,
  personalTimeEntries,
  personalLinks,
} from "@/lib/db/client";
import { and, eq } from "drizzle-orm";
import { json, parseJson, notFound, serverError } from "@/lib/admin/http";
import { commitUrlFromRepo } from "@/lib/admin/format";

const TASK_STATUSES = ["todo", "in_progress", "waiting", "blocked", "done", "canceled"] as const;

const createSchema = z.object({
  taskId: z.coerce.number().int().positive(),
  kind: z
    .enum(["progress", "decision", "blocker", "commit", "research", "bug", "note"])
    .default("progress"),
  summary: z.string().min(1).max(500),
  details: z.string().max(10_000).optional().nullable(),
  /** Optional status transition applied to the task alongside the journal entry. */
  newStatus: z.enum(TASK_STATUSES).optional().nullable(),
  nextAction: z.string().max(500).optional().nullable(),
  commitSha: z.string().max(80).optional().nullable(),
  commitUrl: z.string().url().max(500).optional().nullable(),
  /** Minutes to log against this task as a manual time entry. */
  timeMinutes: z.coerce.number().int().min(0).max(24 * 60).optional().nullable(),
});

export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  const d = parsed.data;

  try {
    const [task] = await db.select().from(personalTasks).where(eq(personalTasks.id, d.taskId));
    if (!task) return notFound();

    const now = new Date();

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

    // Optional manual time entry, linked back from the journal entry.
    let timeEntryId: number | null = null;
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
        .returning();
      timeEntryId = entry.id;
    }

    const statusChanged = d.newStatus && d.newStatus !== task.status;

    const [created] = await db
      .insert(personalTaskUpdates)
      .values({
        taskId: task.id,
        happenedAt: now,
        kind: d.kind,
        summary: d.summary.trim(),
        details: d.details?.trim() || null,
        statusBefore: statusChanged ? task.status : null,
        statusAfter: statusChanged ? d.newStatus : null,
        nextAction: d.nextAction?.trim() || null,
        commitSha: d.commitSha?.trim() || null,
        commitUrl,
        timeEntryId,
      })
      .returning();

    // Keep the task row in sync so board/list views stay truthful without a join.
    await db
      .update(personalTasks)
      .set({
        lastUpdateAt: now,
        ...(statusChanged ? { status: d.newStatus! } : {}),
        ...(statusChanged && d.newStatus === "done" ? { completedAt: now } : {}),
        ...(statusChanged && d.newStatus !== "done" ? { completedAt: null } : {}),
        // First move into in_progress stamps when work actually began.
        ...(statusChanged && d.newStatus === "in_progress" && !task.startedAt
          ? { startedAt: now }
          : {}),
        ...(d.nextAction !== undefined ? { nextAction: d.nextAction?.trim() || null } : {}),
      })
      .where(eq(personalTasks.id, task.id));

    return json({ ok: true, update: created }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
