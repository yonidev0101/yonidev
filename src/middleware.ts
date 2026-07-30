import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { verifyAgentToken } from "@/lib/auth/agent";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/agent/:path*"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public endpoints inside the protected tree
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  // Agent API: token-only. Deliberately does NOT accept the admin cookie, so a
  // browser session can never be tricked into calling it cross-site.
  if (pathname.startsWith("/api/agent/")) {
    if (verifyAgentToken(req)) return NextResponse.next();
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifySessionToken(token);
  if (ok) return NextResponse.next();

  // API routes return 401; pages redirect to login
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}
