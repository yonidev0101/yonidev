export const runtime = "nodejs";

import { z } from "zod";
import { db, personalProjects } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";
import { json, parseJson, serverError } from "@/lib/admin/http";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  status: z.enum(["idea", "active", "paused", "done", "archived"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  description: z.string().max(5000).optional().nullable(),
  nextAction: z.string().max(500).optional().nullable(),
  startDate: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  try {
    const q = db.select().from(personalProjects).orderBy(desc(personalProjects.createdAt));
    const rows =
      status === "idea" ||
      status === "active" ||
      status === "paused" ||
      status === "done" ||
      status === "archived"
        ? await q.where(eq(personalProjects.status, status))
        : await q;
    return json({ ok: true, projects: rows });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const [created] = await db
      .insert(personalProjects)
      .values({
        name: parsed.data.name,
        status: parsed.data.status ?? "idea",
        priority: parsed.data.priority ?? "medium",
        description: parsed.data.description ?? null,
        nextAction: parsed.data.nextAction ?? null,
        startDate: parsed.data.startDate || null,
        targetDate: parsed.data.targetDate || null,
      })
      .returning();
    return json({ ok: true, project: created }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
