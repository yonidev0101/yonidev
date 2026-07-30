export const runtime = "nodejs";

import { z } from "zod";
import { db, timeEntries, projects, clients, tasks } from "@/lib/db/client";
import { eq, isNull, and } from "drizzle-orm";
import { json, parseJson, serverError } from "@/lib/admin/http";

/**
 * A live timer has neither an end nor a duration. Hours entered by hand may
 * arrive as a duration alone, and stopping those would overwrite what was typed.
 */
const running = () => and(isNull(timeEntries.endedAt), isNull(timeEntries.durationSeconds));

const startSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  taskId: z.coerce.number().int().positive().optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
});

async function getActiveJoined() {
  const rows = await db
    .select({
      id: timeEntries.id,
      projectId: timeEntries.projectId,
      taskId: timeEntries.taskId,
      taskTitle: tasks.title,
      startedAt: timeEntries.startedAt,
      projectName: projects.name,
      clientName: clients.name,
    })
    .from(timeEntries)
    .leftJoin(projects, eq(projects.id, timeEntries.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .leftJoin(tasks, eq(tasks.id, timeEntries.taskId))
    .where(running())
    .limit(1);
  return rows[0] ?? null;
}

export async function GET() {
  try {
    const active = await getActiveJoined();
    return json({ ok: true, active });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  const parsed = await parseJson(req, startSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const now = new Date();
    // Close any currently-active entry
    const existing = await db
      .select()
      .from(timeEntries)
      .where(running());
    for (const row of existing) {
      const duration = Math.max(0, Math.floor((now.getTime() - row.startedAt.getTime()) / 1000));
      await db
        .update(timeEntries)
        .set({ endedAt: now, durationSeconds: duration })
        .where(and(eq(timeEntries.id, row.id), running()));
    }
    const [created] = await db
      .insert(timeEntries)
      .values({
        projectId: parsed.data.projectId,
        taskId: parsed.data.taskId ?? null,
        startedAt: now,
        note: parsed.data.note ?? null,
        billable: true,
      })
      .returning();
    return json({ ok: true, entry: created }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH() {
  try {
    const now = new Date();
    const existing = await db.select().from(timeEntries).where(running());
    if (existing.length === 0) {
      return json({ ok: true, stopped: 0 });
    }
    for (const row of existing) {
      const duration = Math.max(0, Math.floor((now.getTime() - row.startedAt.getTime()) / 1000));
      await db
        .update(timeEntries)
        .set({ endedAt: now, durationSeconds: duration })
        .where(eq(timeEntries.id, row.id));
    }
    return json({ ok: true, stopped: existing.length });
  } catch (e) {
    return serverError(e);
  }
}
