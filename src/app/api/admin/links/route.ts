export const runtime = "nodejs";

import { z } from "zod";
import { db, projectLinks } from "@/lib/db/client";
import { json, parseJson, serverError } from "@/lib/admin/http";

const createSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  label: z.string().min(1).max(120),
  url: z.string().url().max(2000),
  kind: z.enum(["figma", "drive", "github", "notion", "other"]).optional(),
});

export async function POST(req: Request) {
  const parsed = await parseJson(req, createSchema);
  if (!parsed.ok) return parsed.res;
  try {
    const [created] = await db
      .insert(projectLinks)
      .values({
        projectId: parsed.data.projectId,
        label: parsed.data.label,
        url: parsed.data.url,
        kind: parsed.data.kind ?? "other",
      })
      .returning();
    return json({ ok: true, link: created }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
