export const runtime = "nodejs";

import { cookies } from "next/headers";
import { z } from "zod";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  createSessionToken,
  safeEqual,
} from "@/lib/auth/session";

const schema = z.object({ password: z.string().min(1).max(200) });

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 5;
const WINDOW_MS = 5 * 60 * 1000;

function getIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT) return false;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return Response.json({ ok: false, error: "Admin not configured" }, { status: 503 });
  }

  const ip = getIp(req);
  if (!checkRateLimit(ip)) {
    return Response.json(
      { ok: false, error: "Too many attempts" },
      { status: 429, headers: { "Retry-After": "300" } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success || !safeEqual(parsed.data.password, expected)) {
    // Add a small delay to slow brute-force attempts
    await new Promise((r) => setTimeout(r, 400));
    return Response.json({ ok: false, error: "סיסמה שגויה" }, { status: 401 });
  }

  const token = await createSessionToken();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);

  return Response.json({ ok: true });
}
