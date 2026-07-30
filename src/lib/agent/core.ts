import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db, personalTasks, tasks } from "@/lib/db/client";

/**
 * Shared vocabulary for `/api/agent/*`.
 *
 * The agent API is deliberately narrower and flatter than the admin API: a
 * coding agent gets one read endpoint (context), one upsert (task) and one
 * write (log). Everything is addressed by (projectKind, projectId, taskKey) —
 * strings the agent can keep in its CLAUDE.md — never by a numeric id it would
 * have to remember between sessions.
 */

export const PROJECT_KINDS = ["personal", "client"] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "waiting",
  "blocked",
  "done",
  "canceled",
] as const;

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export const PERSONAL_TASK_TYPES = [
  "feature",
  "bug",
  "idea",
  "chore",
  "research",
  "design",
] as const;

/** Superset of both journals — mapped down per project kind on write. */
export const AGENT_UPDATE_KINDS = [
  "progress",
  "decision",
  "blocker",
  "commit",
  "research",
  "bug",
  "note",
  "handoff",
] as const;
export type AgentUpdateKind = (typeof AGENT_UPDATE_KINDS)[number];

/** Client-work journals speak calls/meetings; personal ones speak commits. */
export function mapUpdateKind(projectKind: ProjectKind, kind: AgentUpdateKind): string {
  if (projectKind === "personal") {
    return kind === "handoff" ? "note" : kind;
  }
  switch (kind) {
    case "decision":
    case "blocker":
    case "handoff":
    case "progress":
      return kind;
    default:
      // commit / research / bug / note have no client-side equivalent.
      return "progress";
  }
}

export const projectRefSchema = z.object({
  projectKind: z.enum(PROJECT_KINDS),
  projectId: z.coerce.number().int().positive(),
});

/** A task is addressed by its agent key (preferred) or its numeric id. */
export const taskRefSchema = z.object({
  taskKey: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "taskKey must be a lowercase slug, e.g. dark-mode")
    .optional(),
  taskId: z.coerce.number().int().positive().optional(),
});

export type ResolvedTask = {
  id: number;
  projectId: number;
  title: string;
  status: string;
  agentKey: string | null;
  startedAt?: Date | null;
};

/** Finds a task inside a project by key or id. Returns null when absent. */
export async function findTask(
  projectKind: ProjectKind,
  projectId: number,
  ref: { taskKey?: string; taskId?: number },
): Promise<ResolvedTask | null> {
  if (projectKind === "personal") {
    const where = ref.taskId
      ? and(eq(personalTasks.projectId, projectId), eq(personalTasks.id, ref.taskId))
      : and(eq(personalTasks.projectId, projectId), eq(personalTasks.agentKey, ref.taskKey!));
    const [row] = await db.select().from(personalTasks).where(where);
    return row
      ? {
          id: row.id,
          projectId: row.projectId,
          title: row.title,
          status: row.status,
          agentKey: row.agentKey,
          startedAt: row.startedAt,
        }
      : null;
  }
  const where = ref.taskId
    ? and(eq(tasks.projectId, projectId), eq(tasks.id, ref.taskId))
    : and(eq(tasks.projectId, projectId), eq(tasks.agentKey, ref.taskKey!));
  const [row] = await db.select().from(tasks).where(where);
  return row
    ? {
        id: row.id,
        projectId: row.projectId,
        title: row.title,
        status: row.status,
        agentKey: row.agentKey,
      }
    : null;
}

/** Deep link back into the dashboard, so the agent can show me where it wrote. */
export function taskUrl(req: Request, projectKind: ProjectKind, taskId: number): string {
  const origin = new URL(req.url).origin;
  return projectKind === "personal"
    ? `${origin}/admin/personal/tasks/${taskId}`
    : `${origin}/admin/tasks/${taskId}`;
}

/** Turns a title into a usable agent key when the agent didn't supply one. */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9֐-׿]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  // Hebrew titles slugify to nothing useful — fall back to a timestamped key.
  return /^[a-z0-9][a-z0-9-]*$/.test(slug) ? slug : `task-${Date.now().toString(36)}`;
}
