export const runtime = "nodejs";

import { z } from "zod";
import { eq } from "drizzle-orm";
import {
  db,
  tasks,
  taskUpdates,
  timeEntries,
  communications,
  projects,
} from "@/lib/db/client";
import { json, parseJson, notFound, serverError } from "@/lib/admin/http";

const createSchema = z.object({
  taskId: z.coerce.number().int().positive(),
  kind: z
    .enum(["progress", "call", "meeting", "email", "decision", "blocker", "handoff"])
    .default("progress"),
  happenedAt: z.string().optional(),
  summary: z.string().min(1).max(500),
  details: z.string().max(10000).nullable().optional(),

  // Optional status change
  newStatus: z.enum(["todo", "in_progress", "blocked", "done"]).nullable().optional(),

  // Optional next-action / follow-up updates on the task
  nextAction: z.string().max(500).nullable().optional(),
  followUpAt: z.string().nullable().optional(),

  // Optional time entry (retroactive)
  timeMinutes: z.coerce.number().int().min(0).max(60 * 24).nullable().optional(),
  timeStartedAt: z.string().nullable().optional(),

  // Also log as a communication on the client
  alsoLogAsCommunication: z.boolean().optional().default(false),
});

// Drizzle-neon-http does not support transactions; we do best-effort sequential writes
// and clean up the parent row if a follow-up insert fails.
export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  const d = parsed.data;

  try {
    // Load current task for status snapshot + client/project resolution
    const [taskRow] = await db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        status: tasks.status,
        clientId: projects.clientId,
      })
      .from(tasks)
      .leftJoin(projects, eq(projects.id, tasks.projectId))
      .where(eq(tasks.id, d.taskId));
    if (!taskRow) return notFound();

    const happenedAt = d.happenedAt ? new Date(d.happenedAt) : new Date();
    const statusBefore = taskRow.status;
    const statusAfter = d.newStatus ?? null;

    // 1. Create the task_update row (without time_entry / communication ids yet)
    const [update] = await db
      .insert(taskUpdates)
      .values({
        taskId: d.taskId,
        happenedAt,
        kind: d.kind,
        summary: d.summary,
        details: d.details ?? null,
        statusBefore,
        statusAfter,
        nextAction: d.nextAction ?? null,
        followUpAt: d.followUpAt || null,
      })
      .returning();

    // 2. Optional time entry — link by id back to the update
    let timeEntryId: number | null = null;
    if (d.timeMinutes && d.timeMinutes > 0) {
      const durationSeconds = d.timeMinutes * 60;
      const startedAt = d.timeStartedAt
        ? new Date(d.timeStartedAt)
        : new Date(happenedAt.getTime() - durationSeconds * 1000);
      const endedAt = new Date(startedAt.getTime() + durationSeconds * 1000);
      const [entry] = await db
        .insert(timeEntries)
        .values({
          projectId: taskRow.projectId,
          taskId: d.taskId,
          startedAt,
          endedAt,
          durationSeconds,
          note: d.summary,
          billable: true,
        })
        .returning({ id: timeEntries.id });
      timeEntryId = entry.id;
    }

    // 3. Optional communication — log on the client (and project if available)
    let communicationId: number | null = null;
    if (d.alsoLogAsCommunication && taskRow.clientId) {
      const commKind =
        d.kind === "call" || d.kind === "meeting" || d.kind === "email"
          ? d.kind
          : d.kind === "decision"
            ? "decision"
            : "note";
      const [comm] = await db
        .insert(communications)
        .values({
          clientId: taskRow.clientId,
          projectId: taskRow.projectId,
          kind: commKind,
          happenedAt,
          summary: d.summary,
          details: d.details ?? null,
        })
        .returning({ id: communications.id });
      communicationId = comm.id;
    }

    // 4. Update the task_update with the linked ids (if any)
    if (timeEntryId || communicationId) {
      await db
        .update(taskUpdates)
        .set({ timeEntryId, communicationId })
        .where(eq(taskUpdates.id, update.id));
    }

    // 5. Denormalize onto the task: nextAction, followUpAt, lastUpdateAt, (optional) status
    const taskPatch: Record<string, unknown> = {
      lastUpdateAt: new Date(),
    };
    if (d.nextAction !== undefined) taskPatch.nextAction = d.nextAction || null;
    if (d.followUpAt !== undefined) taskPatch.followUpAt = d.followUpAt || null;
    if (statusAfter) {
      taskPatch.status = statusAfter;
      taskPatch.completedAt = statusAfter === "done" ? new Date() : null;
    }
    await db.update(tasks).set(taskPatch).where(eq(tasks.id, d.taskId));

    return json({ ok: true, update: { ...update, timeEntryId, communicationId } }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
