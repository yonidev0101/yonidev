export const runtime = "nodejs";

import { Resend } from "resend";
import { contactSchema } from "@/lib/contact/schema";
import { EMAIL_TO, EMAIL_FROM } from "@/lib/contact/channels";

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

function buildHtml(data: ReturnType<typeof contactSchema.parse>): string {
  const rows = [
    ["Name", data.name],
    ["Email", data.email],
    ["Phone", data.phone || "—"],
    ["Project Type", data.projectType],
    ["Budget", data.budget],
    ["Timeline", data.timeline],
    ["Message", data.message.replace(/\n/g, "<br>")],
  ];
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:600;color:#0F172A;background:#F8FAFC;white-space:nowrap;border:1px solid #E2E8F0">${label}</td><td style="padding:8px 12px;color:#334155;border:1px solid #E2E8F0">${value}</td></tr>`
    )
    .join("");
  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;color:#0F172A;padding:24px"><h2 style="margin-top:0">New inquiry from ${data.name}</h2><table style="border-collapse:collapse;width:100%">${rowsHtml}</table></body></html>`;
}

function buildText(data: ReturnType<typeof contactSchema.parse>): string {
  return [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || "—"}`,
    `Project Type: ${data.projectType}`,
    `Budget: ${data.budget}`,
    `Timeline: ${data.timeline}`,
    `Message:\n${data.message}`,
  ].join("\n");
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

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      replyTo: data.email,
      subject: `New inquiry — ${data.projectType} from ${data.name}`,
      html: buildHtml(data),
      text: buildText(data),
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[contact] Resend error:", err);
    return Response.json({ ok: false, error: "Failed to send email" }, { status: 500 });
  }
}
