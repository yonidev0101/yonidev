export const runtime = "nodejs";

import { z } from "zod";
import { db, tasks } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";
import { json, parseJson, serverError } from "@/lib/admin/http";

const createSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(["todo", "in_progress", "blocked", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  try {
    const q = db.select().from(tasks).orderBy(desc(tasks.createdAt));
    const rows = projectId ? await q.where(eq(tasks.projectId, Number(projectId))) : await q;
    return json({ ok: true, tasks: rows });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const [created] = await db
      .insert(tasks)
      .values({
        projectId: parsed.data.projectId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        status: parsed.data.status ?? "todo",
        priority: parsed.data.priority ?? "medium",
        dueDate: parsed.data.dueDate || null,
      })
      .returning();
    return json({ ok: true, task: created }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
