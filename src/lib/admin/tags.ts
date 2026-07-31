import { and, asc, eq, inArray } from "drizzle-orm";
import { db, personalTags, personalTaskTags } from "@/lib/db/client";
import type { PersonalTag } from "@/lib/db/schema";
import { TAG_COLOR_ORDER, autoTagColor } from "@/lib/admin/format";

/**
 * Everything that reads or writes personal-project tags goes through here, so
 * the admin UI and the agent API can never drift apart on how a tag is matched,
 * created, or attached.
 */

/** What a caller may send instead of a tag id: a slug, or a slug + display label. */
export type TagInput = string | { slug?: string; label?: string; color?: string };

/** English kebab handle. Returns "" when the input has no latin content (Hebrew labels). */
export function tagSlugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Hebrew-only labels can't produce a slug — give them a stable random handle. */
function fallbackSlug(): string {
  return `tag-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listProjectTags(projectId: number): Promise<PersonalTag[]> {
  return db
    .select()
    .from(personalTags)
    .where(eq(personalTags.projectId, projectId))
    .orderBy(asc(personalTags.sortOrder), asc(personalTags.id));
}

/** Tags per task, for list views that would otherwise do one query per row. */
export async function tagsByTask(taskIds: number[]): Promise<Map<number, PersonalTag[]>> {
  const map = new Map<number, PersonalTag[]>();
  if (!taskIds.length) return map;
  const rows = await db
    .select({ taskId: personalTaskTags.taskId, tag: personalTags })
    .from(personalTaskTags)
    .innerJoin(personalTags, eq(personalTags.id, personalTaskTags.tagId))
    .where(inArray(personalTaskTags.taskId, taskIds))
    .orderBy(asc(personalTags.sortOrder), asc(personalTags.id));
  for (const r of rows) {
    const list = map.get(r.taskId);
    if (list) list.push(r.tag);
    else map.set(r.taskId, [r.tag]);
  }
  return map;
}

export type ResolveResult = {
  tagIds: number[];
  /** Tags this call brought into existence — surfaced so the agent can report them. */
  created: PersonalTag[];
  warnings: string[];
};

/**
 * Turns loose tag references into ids inside one project, creating what's
 * missing. Matching is by slug first, then by label (case-insensitive) — so an
 * agent sending "pwa" and me having typed a "PWA" tag land on the same row
 * instead of forking the vocabulary.
 */
export async function resolveTags(
  projectId: number,
  inputs: TagInput[],
  source: "human" | "agent",
): Promise<ResolveResult> {
  const warnings: string[] = [];
  const created: PersonalTag[] = [];
  if (!inputs.length) return { tagIds: [], created, warnings };

  const existing = await listProjectTags(projectId);
  const bySlug = new Map(existing.map((t) => [t.slug.toLowerCase(), t]));
  const byLabel = new Map(existing.map((t) => [t.label.trim().toLowerCase(), t]));

  const tagIds: number[] = [];
  let nextOrder = existing.reduce((max, t) => Math.max(max, t.sortOrder), -1) + 1;

  for (const raw of inputs) {
    const input = typeof raw === "string" ? { slug: raw } : raw;
    const wantedSlug = (input.slug ?? "").trim();
    const wantedLabel = (input.label ?? "").trim();
    if (!wantedSlug && !wantedLabel) {
      warnings.push("Empty tag ignored.");
      continue;
    }

    const hit =
      (wantedSlug && bySlug.get(tagSlugify(wantedSlug) || wantedSlug.toLowerCase())) ||
      (wantedSlug && byLabel.get(wantedSlug.toLowerCase())) ||
      (wantedLabel && byLabel.get(wantedLabel.toLowerCase())) ||
      null;
    if (hit) {
      if (!tagIds.includes(hit.id)) tagIds.push(hit.id);
      continue;
    }

    const slug = tagSlugify(wantedSlug) || tagSlugify(wantedLabel) || fallbackSlug();
    // A second reference to the same new tag inside one call must not insert twice.
    const already = bySlug.get(slug);
    if (already) {
      if (!tagIds.includes(already.id)) tagIds.push(already.id);
      continue;
    }

    const color =
      input.color && TAG_COLOR_ORDER.includes(input.color as never)
        ? input.color
        : autoTagColor(slug);
    const [row] = await db
      .insert(personalTags)
      .values({
        projectId,
        slug,
        label: wantedLabel || wantedSlug,
        color,
        sortOrder: nextOrder++,
        source,
      })
      .returning();
    bySlug.set(slug, row);
    byLabel.set(row.label.trim().toLowerCase(), row);
    created.push(row);
    tagIds.push(row.id);
    if (source === "agent") {
      warnings.push(
        `Created a new tag "${row.slug}" (${row.label}). Prefer the tags listed in GET /api/agent/context.`,
      );
    }
  }

  return { tagIds, created, warnings };
}

/** Replaces a task's tags with exactly this set. */
export async function setTaskTags(taskId: number, tagIds: number[]): Promise<void> {
  const unique = [...new Set(tagIds)];
  await db.delete(personalTaskTags).where(eq(personalTaskTags.taskId, taskId));
  if (unique.length) {
    await db.insert(personalTaskTags).values(unique.map((tagId) => ({ taskId, tagId })));
  }
}

/** Adds tags without removing what's already there. */
export async function addTaskTags(taskId: number, tagIds: number[]): Promise<void> {
  const unique = [...new Set(tagIds)];
  if (!unique.length) return;
  const have = await db
    .select({ tagId: personalTaskTags.tagId })
    .from(personalTaskTags)
    .where(and(eq(personalTaskTags.taskId, taskId), inArray(personalTaskTags.tagId, unique)));
  const known = new Set(have.map((r) => r.tagId));
  const missing = unique.filter((id) => !known.has(id));
  if (missing.length) {
    await db.insert(personalTaskTags).values(missing.map((tagId) => ({ taskId, tagId })));
  }
}
