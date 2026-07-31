export const runtime = "nodejs";

import { z } from "zod";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, personalTaskSteps, personalTasks, tasks } from "@/lib/db/client";
import { json, parseJson, serverError } from "@/lib/admin/http";
import { requireAgent } from "@/lib/auth/agent";
import {
  PERSONAL_TASK_TYPES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  findTask,
  projectRefSchema,
  slugify,
  tagInputSchema,
  taskUrl,
} from "@/lib/agent/core";
import { resolveTags, setTaskTags, tagsByTask } from "@/lib/admin/tags";

/**
 * Upsert the task an agent is about to work on.
 *
 * Idempotent by `(projectId, taskKey)`: calling it at the start of every session
 * either creates the task or returns the existing one, so an agent can open with
 * this call unconditionally and never create duplicates.
 */
const bodySchema = projectRefSchema.extend({
  taskKey: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "taskKey must be a lowercase slug, e.g. dark-mode")
    .optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).nullable().optional(),
  type: z.enum(PERSONAL_TASK_TYPES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  dueDate: z.string().max(10).nullable().optional(),
  estimateMinutes: z.coerce.number().int().min(0).max(60 * 1000).nullable().optional(),
  acceptance: z.string().max(5000).nullable().optional(),
  branchName: z.string().max(300).nullable().optional(),
  /** Checklist for the planned work. Personal projects only. */
  steps: z.array(z.string().min(1).max(300)).max(30).optional(),
  /**
   * Area tags. Personal projects only. Either a slug from the project's
   * catalogue, or `{slug, label}` to define one that doesn't exist yet.
   */
  tags: z.array(tagInputSchema).max(20).optional(),
});

export async function POST(req: Request) {
  const unauthorized = requireAgent(req);
  if (unauthorized) return unauthorized;

  const parsed = await parseJson(req, bodySchema);
  if (!parsed.ok) return parsed.res;
  const d = parsed.data;
  const taskKey = d.taskKey ?? slugify(d.title);

  try {
    const existing = await findTask(d.projectKind, d.projectId, { taskKey });
    const warnings: string[] = [];

    if (d.projectKind === "client" && (d.steps?.length || d.type || d.acceptance || d.tags?.length)) {
      warnings.push(
        "steps / type / acceptance / tags are personal-project fields and were ignored.",
      );
    }

    if (existing) {
      // Existing task: only fill in what the agent explicitly sent, and never
      // silently move status — that belongs in POST /api/agent/log.
      const patch: Record<string, unknown> = {};
      if (d.description !== undefined) patch.description = d.description;
      if (d.priority) patch.priority = d.priority;
      if (d.dueDate !== undefined) patch.dueDate = d.dueDate || null;
      if (d.estimateMinutes !== undefined) patch.estimateMinutes = d.estimateMinutes;
      if (d.projectKind === "personal") {
        if (d.type) patch.type = d.type;
        if (d.acceptance !== undefined) patch.acceptance = d.acceptance;
        if (d.branchName !== undefined) patch.branchName = d.branchName;
      }
      if (Object.keys(patch).length) {
        if (d.projectKind === "personal") {
          await db.update(personalTasks).set(patch).where(eq(personalTasks.id, existing.id));
        } else {
          await db.update(tasks).set(patch).where(eq(tasks.id, existing.id));
        }
      }
      if (d.projectKind === "personal" && d.steps?.length) {
        await addMissingSteps(existing.id, d.steps);
      }
      // Sending tags on an existing task replaces the set — the agent is
      // restating what this task is about, not appending to history.
      if (d.projectKind === "personal" && d.tags) {
        const resolved = await resolveTags(d.projectId, d.tags, "agent");
        warnings.push(...resolved.warnings);
        await setTaskTags(existing.id, resolved.tagIds);
      }
      if (d.status && d.status !== existing.status) {
        warnings.push(
          `Task is "${existing.status}". Change status through POST /api/agent/log with "status": "${d.status}" so it is journalled.`,
        );
      }
      return json({
        ok: true,
        created: false,
        task: {
          id: existing.id,
          taskKey,
          title: existing.title,
          status: existing.status,
          tags: await taskTagSlugs(d.projectKind, existing.id),
        },
        url: taskUrl(req, d.projectKind, existing.id),
        warnings,
      });
    }

    if (d.projectKind === "personal") {
      const status = d.status ?? "todo";
      const [created] = await db
        .insert(personalTasks)
        .values({
          projectId: d.projectId,
          title: d.title,
          description: d.description ?? null,
          type: d.type ?? "feature",
          status,
          priority: d.priority ?? "medium",
          dueDate: d.dueDate || null,
          estimateMinutes: d.estimateMinutes ?? null,
          acceptance: d.acceptance ?? null,
          branchName: d.branchName ?? null,
          startedAt: status === "in_progress" ? new Date() : null,
          completedAt: status === "done" ? new Date() : null,
          source: "agent",
          agentKey: taskKey,
        })
        .returning();
      if (d.steps?.length) await addMissingSteps(created.id, d.steps);
      let tagSlugs: string[] = [];
      if (d.tags?.length) {
        const resolved = await resolveTags(d.projectId, d.tags, "agent");
        warnings.push(...resolved.warnings);
        await setTaskTags(created.id, resolved.tagIds);
        tagSlugs = await taskTagSlugs("personal", created.id);
      }
      return json(
        {
          ok: true,
          created: true,
          task: {
            id: created.id,
            taskKey,
            title: created.title,
            status: created.status,
            tags: tagSlugs,
          },
          url: taskUrl(req, "personal", created.id),
          warnings,
        },
        { status: 201 },
      );
    }

    const status = d.status ?? "todo";
    const [created] = await db
      .insert(tasks)
      .values({
        projectId: d.projectId,
        title: d.title,
        description: d.description ?? null,
        status,
        priority: d.priority ?? "medium",
        dueDate: d.dueDate || null,
        estimateMinutes: d.estimateMinutes ?? null,
        completedAt: status === "done" ? new Date() : null,
        source: "agent",
        agentKey: taskKey,
      })
      .returning();
    return json(
      {
        ok: true,
        created: true,
        task: { id: created.id, taskKey, title: created.title, status: created.status },
        url: taskUrl(req, "client", created.id),
        warnings,
      },
      { status: 201 },
    );
  } catch (e) {
    return serverError(e);
  }
}

/** Tag slugs currently on a task — echoed back so the agent sees what stuck. */
async function taskTagSlugs(projectKind: string, taskId: number): Promise<string[]> {
  if (projectKind !== "personal") return [];
  const map = await tagsByTask([taskId]);
  return (map.get(taskId) ?? []).map((t) => t.slug);
}

/** Adds only the checklist items that aren't on the task yet — re-running a
 *  session's opening call must not duplicate the checklist. */
async function addMissingSteps(taskId: number, titles: string[]) {
  const wanted = titles.map((t) => t.trim()).filter(Boolean);
  if (!wanted.length) return;
  const existing = await db
    .select({ title: personalTaskSteps.title })
    .from(personalTaskSteps)
    .where(and(eq(personalTaskSteps.taskId, taskId), inArray(personalTaskSteps.title, wanted)));
  const have = new Set(existing.map((s) => s.title));
  const missing = wanted.filter((t) => !have.has(t));
  if (!missing.length) return;

  const [{ nextOrder }] = await db
    .select({
      nextOrder: sql<number>`COALESCE(MAX(${personalTaskSteps.sortOrder}), -1) + 1`,
    })
    .from(personalTaskSteps)
    .where(eq(personalTaskSteps.taskId, taskId));

  await db.insert(personalTaskSteps).values(
    missing.map((title, i) => ({ taskId, title, sortOrder: nextOrder + i })),
  );
}
