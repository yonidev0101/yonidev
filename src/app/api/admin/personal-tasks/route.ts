export const runtime = "nodejs";

import { z } from "zod";
import { db, personalTasks } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";
import { json, parseJson, serverError } from "@/lib/admin/http";

const createSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(["todo", "in_progress", "waiting", "blocked", "done", "canceled"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  try {
    const q = db.select().from(personalTasks).orderBy(desc(personalTasks.createdAt));
    const rows = projectId ? await q.where(eq(personalTasks.projectId, Number(projectId))) : await q;
    return json({ ok: true, tasks: rows });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const status = parsed.data.status ?? "todo";
    const [created] = await db
      .insert(personalTasks)
      .values({
        projectId: parsed.data.projectId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        status,
        priority: parsed.data.priority ?? "medium",
        dueDate: parsed.data.dueDate || null,
        completedAt: status === "done" ? new Date() : null,
      })
      .returning();
    return json({ ok: true, task: created }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
