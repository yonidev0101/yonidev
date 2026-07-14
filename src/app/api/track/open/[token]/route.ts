export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db, signatureRecipients, signatureOpens } from "@/lib/db/client";
import { eq } from "drizzle-orm";

// 1x1 transparent GIF
const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

function pixelResponse(): Response {
  return new Response(new Uint8Array(PIXEL), {
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(PIXEL.length),
      // Every open must hit the server — never let clients/proxies cache the pixel.
      "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function GET(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;

  // Log the open, but always serve the pixel — a broken image in the
  // recipient's mail client would give the tracking away.
  try {
    if (token && token.length <= 64) {
      const [recipient] = await db
        .select({ id: signatureRecipients.id })
        .from(signatureRecipients)
        .where(eq(signatureRecipients.token, token))
        .limit(1);
      if (recipient) {
        await db.insert(signatureOpens).values({
          recipientId: recipient.id,
          userAgent: req.headers.get("user-agent"),
          ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        });
      }
    }
  } catch (e) {
    console.error("[track pixel]", e);
  }

  return pixelResponse();
}
