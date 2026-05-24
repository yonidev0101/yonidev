export const runtime = "nodejs";

import { Resend } from "resend";
import { contactSchema } from "@/lib/contact/schema";
import { EMAIL_TO, EMAIL_FROM } from "@/lib/contact/channels";
import { buildInquiryEmail, buildAutoReplyEmail } from "@/lib/contact/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory rate limit: max 3 requests per IP per 5 minutes
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 3;
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
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ ok: false, error: "Email service not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Validation failed" }, { status: 422 });
  }

  const data = parsed.data;

  // Honeypot — return 200 silently so bots don't learn
  if (data._hp) {
    return Response.json({ ok: true });
  }

  const ip = getIp(req);
  if (!checkRateLimit(ip)) {
    return Response.json(
      { ok: false, error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "300" } }
    );
  }

  const inquiry = buildInquiryEmail(data);
  const autoReply = buildAutoReplyEmail(data);

  try {
    // Inquiry to Yoni — must succeed (this is the actual lead)
    await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      replyTo: data.email,
      subject: inquiry.subject,
      html: inquiry.html,
      text: inquiry.text,
    });

    // Auto-reply to customer — best-effort; don't fail the request if it bounces
    resend.emails
      .send({
        from: EMAIL_FROM,
        to: data.email,
        replyTo: EMAIL_TO,
        subject: autoReply.subject,
        html: autoReply.html,
        text: autoReply.text,
      })
      .catch((err) => {
        console.error("[contact] auto-reply failed:", err);
      });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[contact] Resend error:", err);
    return Response.json({ ok: false, error: "Failed to send email" }, { status: 500 });
  }
}
