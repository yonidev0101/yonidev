export const runtime = "nodejs";

import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db, personalTaskSteps, personalTasks } from "@/lib/db/client";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";

const createSchema = z.object({
  taskId: z.coerce.number().int().positive(),
  title: z.string().min(1).max(300),
});

export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  const { taskId, title } = parsed.data;
  try {
    const [task] = await db
      .select({ id: personalTasks.id })
      .from(personalTasks)
      .where(eq(personalTasks.id, taskId));
    if (!task) return notFound();

    // New steps go to the bottom of the list.
    const [{ nextOrder }] = await db
      .select({
        nextOrder: sql<number>`COALESCE(MAX(${personalTaskSteps.sortOrder}), -1) + 1`,
      })
      .from(personalTaskSteps)
      .where(eq(personalTaskSteps.taskId, taskId));

    const [step] = await db
      .insert(personalTaskSteps)
      .values({ taskId, title: title.trim(), sortOrder: nextOrder })
      .returning();

    return json({ ok: true, step }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
