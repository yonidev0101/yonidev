import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./session";

/** Redundant check for API routes — middleware already gates these,
 *  but defense-in-depth lets server actions and route handlers reject
 *  if middleware was bypassed by a config typo. */
export async function requireAdminApi(): Promise<Response | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
