export const runtime = "nodejs";

import { z } from "zod";
import { db, personalTimeEntries, personalProjects } from "@/lib/db/client";
import { eq, isNull, and } from "drizzle-orm";
import { json, parseJson, serverError } from "@/lib/admin/http";

// Independent of the client-work timer (separate table). Both can run at once.

const startSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  taskId: z.coerce.number().int().positive().optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
});

async function getActiveJoined() {
  const rows = await db
    .select({
      id: personalTimeEntries.id,
      projectId: personalTimeEntries.projectId,
      startedAt: personalTimeEntries.startedAt,
      note: personalTimeEntries.note,
      projectName: personalProjects.name,
    })
    .from(personalTimeEntries)
    .leftJoin(personalProjects, eq(personalProjects.id, personalTimeEntries.projectId))
    .where(isNull(personalTimeEntries.endedAt))
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
    // Close any currently-active personal entry before starting a new one.
    const existing = await db
      .select()
      .from(personalTimeEntries)
      .where(isNull(personalTimeEntries.endedAt));
    for (const row of existing) {
      const duration = Math.max(0, Math.floor((now.getTime() - row.startedAt.getTime()) / 1000));
      await db
        .update(personalTimeEntries)
        .set({ endedAt: now, durationSeconds: duration })
        .where(and(eq(personalTimeEntries.id, row.id), isNull(personalTimeEntries.endedAt)));
    }
    const [created] = await db
      .insert(personalTimeEntries)
      .values({
        projectId: parsed.data.projectId,
        taskId: parsed.data.taskId ?? null,
        startedAt: now,
        note: parsed.data.note ?? null,
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
    const existing = await db
      .select()
      .from(personalTimeEntries)
      .where(isNull(personalTimeEntries.endedAt));
    if (existing.length === 0) {
      return json({ ok: true, stopped: 0 });
    }
    for (const row of existing) {
      const duration = Math.max(0, Math.floor((now.getTime() - row.startedAt.getTime()) / 1000));
      await db
        .update(personalTimeEntries)
        .set({ endedAt: now, durationSeconds: duration })
        .where(eq(personalTimeEntries.id, row.id));
    }
    return json({ ok: true, stopped: existing.length });
  } catch (e) {
    return serverError(e);
  }
}
