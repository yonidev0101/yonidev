import { z } from "zod";

export async function parseJson<T>(
  req: Request,
  schema: z.ZodType<T>,
): Promise<{ ok: true; data: T } | { ok: false; res: Response }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { ok: false, res: Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 }) };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      res: Response.json(
        { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
        { status: 422 },
      ),
    };
  }
  return { ok: true, data: parsed.data };
}

export function json<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, init);
}

export function notFound(): Response {
  return Response.json({ ok: false, error: "Not found" }, { status: 404 });
}

export function serverError(err: unknown): Response {
  console.error("[admin api]", err);
  return Response.json({ ok: false, error: "Server error" }, { status: 500 });
}
