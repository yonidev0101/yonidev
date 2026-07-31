export const runtime = "nodejs";

import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { db, personalTags, personalTasks } from "@/lib/db/client";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";
import { setTaskTags, tagsByTask } from "@/lib/admin/tags";

/** Replaces a task's tags with exactly this set — the tag picker sends the whole list. */
const putSchema = z.object({
  tagIds: z.array(z.coerce.number().int().positive()).max(20),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const taskId = Number(idStr);
  if (!Number.isFinite(taskId)) return notFound();
  const parsed = await parseJson(req, putSchema);
  if (!parsed.ok) return parsed.res;

  try {
    const [task] = await db
      .select({ id: personalTasks.id, projectId: personalTasks.projectId })
      .from(personalTasks)
      .where(eq(personalTasks.id, taskId));
    if (!task) return notFound();

    // A task may only carry tags from its own project's catalogue.
    const wanted = [...new Set(parsed.data.tagIds)];
    const allowed = wanted.length
      ? await db
          .select({ id: personalTags.id })
          .from(personalTags)
          .where(
            and(eq(personalTags.projectId, task.projectId), inArray(personalTags.id, wanted)),
          )
          .then((rows) => rows.map((r) => r.id))
      : [];

    await setTaskTags(taskId, allowed);
    const tags = (await tagsByTask([taskId])).get(taskId) ?? [];
    return json({ ok: true, tags });
  } catch (e) {
    return serverError(e);
  }
}
