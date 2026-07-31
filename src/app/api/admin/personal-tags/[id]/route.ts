export const runtime = "nodejs";

import { z } from "zod";
import { and, eq, ne } from "drizzle-orm";
import { db, personalTags } from "@/lib/db/client";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";
import { TAG_COLOR_ORDER } from "@/lib/admin/format";
import { tagSlugify } from "@/lib/admin/tags";

const patchSchema = z.object({
  label: z.string().min(1).max(60).optional(),
  slug: z.string().min(1).max(40).optional(),
  color: z.enum(TAG_COLOR_ORDER).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  const parsed = await parseJson(req, patchSchema);
  if (!parsed.ok) return parsed.res;

  try {
    const [current] = await db.select().from(personalTags).where(eq(personalTags.id, id));
    if (!current) return notFound();

    const patch: Record<string, unknown> = {};
    if (parsed.data.label !== undefined) patch.label = parsed.data.label.trim();
    if (parsed.data.color !== undefined) patch.color = parsed.data.color;
    if (parsed.data.sortOrder !== undefined) patch.sortOrder = parsed.data.sortOrder;

    if (parsed.data.slug !== undefined) {
      // Renaming the handle breaks whatever an agent has in its CLAUDE.md, so it
      // still has to be a real slug and still has to be unique in the project.
      const slug = tagSlugify(parsed.data.slug);
      if (!slug) {
        return json(
          { ok: false, error: "המזהה חייב להכיל אותיות באנגלית או ספרות" },
          { status: 422 },
        );
      }
      const [dupe] = await db
        .select({ id: personalTags.id })
        .from(personalTags)
        .where(
          and(
            eq(personalTags.projectId, current.projectId),
            eq(personalTags.slug, slug),
            ne(personalTags.id, id),
          ),
        );
      if (dupe) return json({ ok: false, error: "כבר קיימת תגית עם המזהה הזה" }, { status: 409 });
      patch.slug = slug;
    }

    const [row] = await db
      .update(personalTags)
      .set(patch)
      .where(eq(personalTags.id, id))
      .returning();
    return json({ ok: true, tag: row });
  } catch (e) {
    return serverError(e);
  }
}

/** Deleting a tag detaches it from every task (the join rows cascade). */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();
  try {
    await db.delete(personalTags).where(eq(personalTags.id, id));
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
