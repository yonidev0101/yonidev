export const runtime = "nodejs";

import { z } from "zod";
import { db, personalTimeEntries } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";
import { json, parseJson, serverError } from "@/lib/admin/http";

const createSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  taskId: z.coerce.number().int().positive().optional().nullable(),
  startedAt: z.string(),
  endedAt: z.string().optional().nullable(),
  durationSeconds: z.coerce.number().int().min(0).optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  try {
    const q = db
      .select()
      .from(personalTimeEntries)
      .orderBy(desc(personalTimeEntries.startedAt));
    const rows = projectId
      ? await q.where(eq(personalTimeEntries.projectId, Number(projectId)))
      : await q;
    return json({ ok: true, entries: rows });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const startedAt = new Date(parsed.data.startedAt);
    const endedAt = parsed.data.endedAt ? new Date(parsed.data.endedAt) : null;
    const duration =
      parsed.data.durationSeconds != null
        ? parsed.data.durationSeconds
        : endedAt
        ? Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000))
        : null;
    const [created] = await db
      .insert(personalTimeEntries)
      .values({
        projectId: parsed.data.projectId,
        taskId: parsed.data.taskId ?? null,
        startedAt,
        endedAt,
        durationSeconds: duration,
        note: parsed.data.note ?? null,
      })
      .returning();
    return json({ ok: true, entry: created }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
