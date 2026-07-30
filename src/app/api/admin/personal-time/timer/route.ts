export const runtime = "nodejs";

import { z } from "zod";
import { db, personalTimeEntries, personalProjects, personalTasks } from "@/lib/db/client";
import { eq, isNull, and, desc } from "drizzle-orm";
import { json, parseJson, serverError } from "@/lib/admin/http";

// Independent of the client-work timer (separate table). Client work stays
// single-timer — you can't bill one hour twice — but personal work runs several
// at once, because that's how tasks actually progress in parallel here. Each
// entry keeps its true start/end; see lib/admin/time.ts for how totals avoid
// double-counting the overlap.

const startSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  taskId: z.coerce.number().int().positive().optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
});

/**
 * A row is a live timer only when it has neither an end nor a duration.
 * Hours backfilled by hand can predate the fix that stamps their `endedAt`,
 * and those must never be picked up as "running" and re-stopped.
 */
const running = () =>
  and(isNull(personalTimeEntries.endedAt), isNull(personalTimeEntries.durationSeconds));

const stopSchema = z.object({
  /** Stop one specific entry. Omit both to stop every running personal timer. */
  id: z.coerce.number().int().positive().optional(),
  /** Or stop whichever entry is running on this task. */
  taskId: z.coerce.number().int().positive().optional(),
});

async function getActiveJoined() {
  return db
    .select({
      id: personalTimeEntries.id,
      projectId: personalTimeEntries.projectId,
      taskId: personalTimeEntries.taskId,
      taskTitle: personalTasks.title,
      startedAt: personalTimeEntries.startedAt,
      note: personalTimeEntries.note,
      projectName: personalProjects.name,
    })
    .from(personalTimeEntries)
    .leftJoin(personalProjects, eq(personalProjects.id, personalTimeEntries.projectId))
    .leftJoin(personalTasks, eq(personalTasks.id, personalTimeEntries.taskId))
    .where(running())
    .orderBy(desc(personalTimeEntries.startedAt));
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
  const { projectId, taskId, note } = parsed.data;
  try {
    // Timers already running are left alone — but never two on the same task,
    // which would only inflate that task's own number.
    if (taskId) {
      const [dupe] = await db
        .select({ id: personalTimeEntries.id })
        .from(personalTimeEntries)
        .where(and(eq(personalTimeEntries.taskId, taskId), running()))
        .limit(1);
      if (dupe) {
        return json(
          { ok: false, error: "כבר רץ טיימר על המשימה הזו", entryId: dupe.id },
          { status: 409 },
        );
      }
    }
    const [created] = await db
      .insert(personalTimeEntries)
      .values({
        projectId,
        taskId: taskId ?? null,
        startedAt: new Date(),
        note: note ?? null,
      })
      .returning();
    return json({ ok: true, entry: created }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    // Body is optional: no body means "stop everything", which is what the
    // plain PATCH callers have always meant.
    let target: z.infer<typeof stopSchema> = {};
    const raw = await req.text();
    if (raw.trim()) {
      let body: unknown;
      try {
        body = JSON.parse(raw);
      } catch {
        return json({ ok: false, error: "bad json" }, { status: 400 });
      }
      const parsed = stopSchema.safeParse(body);
      if (!parsed.success) return json({ ok: false, error: "bad request" }, { status: 400 });
      target = parsed.data;
    }

    const scope = target.id
      ? and(eq(personalTimeEntries.id, target.id), running())
      : target.taskId
        ? and(eq(personalTimeEntries.taskId, target.taskId), running())
        : running();

    const now = new Date();
    const existing = await db.select().from(personalTimeEntries).where(scope);
    for (const row of existing) {
      const duration = Math.max(0, Math.floor((now.getTime() - row.startedAt.getTime()) / 1000));
      await db
        .update(personalTimeEntries)
        .set({ endedAt: now, durationSeconds: duration })
        .where(and(eq(personalTimeEntries.id, row.id), running()));
    }
    return json({ ok: true, stopped: existing.length });
  } catch (e) {
    return serverError(e);
  }
}
