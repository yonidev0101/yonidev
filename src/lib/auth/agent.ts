import { safeEqual } from "./session";

/**
 * Coding agents (Claude Code sessions running on other projects) authenticate
 * with a static bearer token instead of the admin password + session cookie.
 *
 * Why a separate credential:
 * - the admin password would give a third-party session full dashboard access,
 *   including invoices and client data;
 * - the token only opens `/api/agent/*`, which can only read project context and
 *   write tasks / progress entries;
 * - it can be rotated by changing one env var, without logging me out anywhere.
 */
export const AGENT_TOKEN_HEADER = "x-agent-token";

/** Reads the token from the dedicated header or a standard Bearer header. */
export function readAgentToken(req: Request): string | null {
  const direct = req.headers.get(AGENT_TOKEN_HEADER);
  if (direct) return direct.trim();
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return null;
}

export function verifyAgentToken(req: Request): boolean {
  const expected = process.env.AGENT_API_TOKEN;
  // No token configured → the agent API is closed, not open.
  if (!expected || expected.length < 16) return false;
  const got = readAgentToken(req);
  if (!got) return false;
  return safeEqual(got, expected);
}

/** Route-handler guard. Returns a 401 response, or null when authorized. */
export function requireAgent(req: Request): Response | null {
  if (verifyAgentToken(req)) return null;
  return Response.json(
    {
      ok: false,
      error: "Unauthorized",
      hint: `Send the agent token in the ${AGENT_TOKEN_HEADER} header.`,
    },
    { status: 401 },
  );
}
