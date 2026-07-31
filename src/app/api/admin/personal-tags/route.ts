export const runtime = "nodejs";

import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db, personalProjects, personalTags } from "@/lib/db/client";
import { json, notFound, parseJson, serverError } from "@/lib/admin/http";
import { TAG_COLOR_ORDER, autoTagColor } from "@/lib/admin/format";
import { listProjectTags, tagSlugify } from "@/lib/admin/tags";

/** The tag catalogue of one personal project. */
export async function GET(req: Request) {
  const projectId = Number(new URL(req.url).searchParams.get("projectId"));
  if (!Number.isFinite(projectId) || projectId <= 0) return notFound();
  try {
    return json({ ok: true, tags: await listProjectTags(projectId) });
  } catch (e) {
    return serverError(e);
  }
}

const createSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  label: z.string().min(1).max(60),
  /** English handle agents address the tag by. Derived from the label when omitted. */
  slug: z.string().max(40).optional(),
  color: z.enum(TAG_COLOR_ORDER).optional(),
});

export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  const { projectId, color } = parsed.data;
  const label = parsed.data.label.trim();

  try {
    const [project] = await db
      .select({ id: personalProjects.id })
      .from(personalProjects)
      .where(eq(personalProjects.id, projectId));
    if (!project) return notFound();

    // Hebrew labels slugify to nothing — fall back to a stable random handle.
    const slug =
      tagSlugify(parsed.data.slug ?? "") ||
      tagSlugify(label) ||
      `tag-${Math.random().toString(36).slice(2, 8)}`;

    const [dupe] = await db
      .select({ id: personalTags.id })
      .from(personalTags)
      .where(and(eq(personalTags.projectId, projectId), eq(personalTags.slug, slug)));
    if (dupe) {
      return json({ ok: false, error: "כבר קיימת תגית עם המזהה הזה" }, { status: 409 });
    }

    const [{ nextOrder }] = await db
      .select({ nextOrder: sql<number>`COALESCE(MAX(${personalTags.sortOrder}), -1) + 1` })
      .from(personalTags)
      .where(eq(personalTags.projectId, projectId));

    const [tag] = await db
      .insert(personalTags)
      .values({
        projectId,
        slug,
        label,
        color: color ?? autoTagColor(slug),
        sortOrder: nextOrder,
        source: "human",
      })
      .returning();

    return json({ ok: true, tag }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
