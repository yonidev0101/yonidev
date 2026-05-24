import type { ContactFormData } from "./schema";
import { BRAND, SITE_URL, buildWhatsAppUrl } from "./channels";

const COLORS = {
  brand: "#2B7FFF",
  brandDark: "#1E5FCC",
  heading: "#0F172A",
  body: "#475569",
  muted: "#94A3B8",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  divider: "#EEF2F7",
} as const;

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Heebo", "Arial", sans-serif';

type Dir = "ltr" | "rtl";

interface ShellOpts {
  dir: Dir;
  preview: string;
  bodyHtml: string;
  /** Optional eyebrow above the logo in the header (e.g. "פנייה חדשה") */
  headerEyebrow?: string;
}

function shell({ dir, preview, bodyHtml, headerEyebrow }: ShellOpts): string {
  const align = dir === "rtl" ? "right" : "left";
  return `<!DOCTYPE html>
<html dir="${dir}" lang="${dir === "rtl" ? "he" : "en"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>YoniDev</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:${FONT_STACK};color:${COLORS.body};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preview)}</div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLORS.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,${COLORS.brand} 0%,${COLORS.brandDark} 100%);text-align:${align};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="text-align:${align};vertical-align:middle;">
                    <img src="${BRAND.logoUrl}" width="40" height="40" alt="YoniDev" style="display:inline-block;vertical-align:middle;border:0;outline:none;background:#ffffff;border-radius:10px;padding:6px;">
                    <span style="display:inline-block;vertical-align:middle;margin:0 12px;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">YoniDev</span>
                  </td>
                  ${
                    headerEyebrow
                      ? `<td style="text-align:${align === "right" ? "left" : "right"};vertical-align:middle;">
                        <span style="display:inline-block;padding:6px 12px;background:rgba(255,255,255,0.18);color:#ffffff;font-size:12px;font-weight:600;border-radius:999px;letter-spacing:0.02em;">${escapeHtml(headerEyebrow)}</span>
                      </td>`
                      : ""
                  }
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;text-align:${align};">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:0 32px 32px 32px;">
              ${signatureHtml(dir)}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:${COLORS.bg};border-top:1px solid ${COLORS.divider};text-align:center;">
              <p style="margin:0;font-size:12px;color:${COLORS.muted};line-height:1.6;">
                <a href="${SITE_URL}" style="color:${COLORS.muted};text-decoration:none;">${BRAND.site}</a>
                &nbsp;·&nbsp;
                <a href="mailto:${BRAND.email}" style="color:${COLORS.muted};text-decoration:none;">${BRAND.email}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function signatureHtml(dir: Dir): string {
  const align = dir === "rtl" ? "right" : "left";
  const name = dir === "rtl" ? BRAND.name : BRAND.nameEn;
  const title = dir === "rtl" ? BRAND.titleHe : BRAND.title;

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${COLORS.divider};padding-top:24px;">
      <tr>
        <td style="vertical-align:middle;text-align:${align};width:64px;">
          <img src="${BRAND.logoUrl}" width="56" height="56" alt="" style="display:block;border:0;outline:none;background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:12px;padding:6px;">
        </td>
        <td style="vertical-align:middle;padding:0 16px;text-align:${align};">
          <div style="font-size:15px;font-weight:700;color:${COLORS.heading};line-height:1.3;">${name}</div>
          <div style="font-size:13px;color:${COLORS.brand};font-weight:600;margin-top:2px;">${title}</div>
          <div style="font-size:12px;color:${COLORS.muted};margin-top:8px;line-height:1.6;">
            <a href="mailto:${BRAND.email}" style="color:${COLORS.body};text-decoration:none;">${BRAND.email}</a>
            <br>
            <a href="tel:+${BRAND.whatsapp}" style="color:${COLORS.body};text-decoration:none;direction:ltr;display:inline-block;">${BRAND.phoneDisplay}</a>
          </div>
        </td>
      </tr>
    </table>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(s: string): string {
  return escapeHtml(s).replace(/\n/g, "<br>");
}

// ─────────────────────────────────────────────
// Label maps for the inquiry email
// ─────────────────────────────────────────────

const PROJECT_TYPE_LABEL: Record<string, string> = {
  web: "Web App",
  ai: "AI / LLM",
  bot: "Bot",
  api: "API / Integration",
  other: "Other",
};
const BUDGET_LABEL: Record<string, string> = {
  lt5: "< ₪20K",
  mid: "₪20K – ₪50K",
  high: "₪50K – ₪200K",
  top: "₪200K+",
  unsure: "Not sure",
};
const TIMELINE_LABEL: Record<string, string> = {
  asap: "ASAP",
  short: "1–3 months",
  medium: "3–6 months",
  flexible: "Flexible",
};

// ─────────────────────────────────────────────
// 1) Inquiry email (LTR, sent to Yoni)
// ─────────────────────────────────────────────

export function buildInquiryEmail(data: ContactFormData): {
  subject: string;
  html: string;
  text: string;
} {
  const projectType = data.projectType ? PROJECT_TYPE_LABEL[data.projectType] : "—";
  const budget = data.budget ? BUDGET_LABEL[data.budget] : "—";
  const timeline = data.timeline ? TIMELINE_LABEL[data.timeline] : "—";

  const detailsRows: [string, string][] = [
    ["Name", data.name],
    ["Email", data.email],
    ["Phone", data.phone || "—"],
    ["Project", projectType],
    ["Budget", budget],
    ["Timeline", timeline],
  ];

  const rowsHtml = detailsRows
    .map(
      ([label, value], i) => `
        <tr>
          <td style="padding:12px 16px;font-size:12px;font-weight:600;color:${COLORS.muted};text-transform:uppercase;letter-spacing:0.04em;width:110px;${i > 0 ? `border-top:1px solid ${COLORS.divider};` : ""}">${escapeHtml(label)}</td>
          <td style="padding:12px 16px;font-size:14px;color:${COLORS.heading};${i > 0 ? `border-top:1px solid ${COLORS.divider};` : ""}">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  const replyHref = `mailto:${data.email}?subject=${encodeURIComponent(`Re: your inquiry — YoniDev`)}`;

  const bodyHtml = `
    <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:${COLORS.brand};letter-spacing:0.04em;text-transform:uppercase;">New Lead</p>
    <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:${COLORS.heading};line-height:1.3;">${escapeHtml(data.name)} just reached out</h1>
    <p style="margin:0 0 28px 0;font-size:14px;color:${COLORS.body};line-height:1.6;">A new inquiry came in through your contact form on <a href="${SITE_URL}" style="color:${COLORS.brand};text-decoration:none;font-weight:600;">${BRAND.site}</a>.</p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLORS.bg};border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden;margin-bottom:24px;">
      ${rowsHtml}
    </table>

    <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:${COLORS.muted};text-transform:uppercase;letter-spacing:0.04em;">Message</p>
    <div style="padding:16px 18px;background:${COLORS.bg};border-${"left"}:3px solid ${COLORS.brand};border-radius:8px;font-size:14px;color:${COLORS.heading};line-height:1.7;margin-bottom:28px;">
      ${nl2br(data.message)}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="border-radius:10px;background:${COLORS.brand};">
          <a href="${replyHref}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Reply to ${escapeHtml(data.name)} →</a>
        </td>
      </tr>
    </table>
  `;

  const html = shell({
    dir: "ltr",
    preview: `New inquiry from ${data.name} — ${projectType}`,
    headerEyebrow: "New inquiry",
    bodyHtml,
  });

  const text = [
    `New inquiry from ${data.name}`,
    ``,
    `Name:     ${data.name}`,
    `Email:    ${data.email}`,
    `Phone:    ${data.phone || "—"}`,
    `Project:  ${projectType}`,
    `Budget:   ${budget}`,
    `Timeline: ${timeline}`,
    ``,
    `Message:`,
    data.message,
    ``,
    `—`,
    `${BRAND.nameEn} · ${BRAND.title}`,
    `${BRAND.email} · ${BRAND.phoneDisplay}`,
    `${SITE_URL}`,
  ].join("\n");

  return {
    subject: `פנייה חדשה — ${data.name}${data.projectType ? ` · ${projectType}` : ""}`,
    html,
    text,
  };
}

// ─────────────────────────────────────────────
// 2) Auto-reply (RTL Hebrew, sent to customer)
// ─────────────────────────────────────────────

export function buildAutoReplyEmail(data: ContactFormData): {
  subject: string;
  html: string;
  text: string;
} {
  const waUrl = buildWhatsAppUrl(`היי יהונתן, פניתי דרך האתר ורציתי להמשיך כאן את השיחה.`);

  const bodyHtml = `
    <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:${COLORS.brand};letter-spacing:0.04em;">תודה שפנית 👋</p>
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:${COLORS.heading};line-height:1.3;">היי ${escapeHtml(data.name)},</h1>

    <p style="margin:0 0 16px 0;font-size:15px;color:${COLORS.body};line-height:1.75;">
      קיבלתי את הפנייה שלך והיא מחכה לי בתיבה. אני קורא כל הודעה אישית ואחזור אליך בהקדם — בדרך כלל תוך <strong style="color:${COLORS.heading};">24 שעות</strong>.
    </p>

    <p style="margin:0 0 24px 0;font-size:15px;color:${COLORS.body};line-height:1.75;">
      בינתיים, אם זה דחוף או שבא לך לדבר ישירות — אפשר לפנות אליי גם בוואטסאפ:
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="border-radius:10px;background:${COLORS.brand};">
          <a href="${waUrl}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">פתח שיחה ב-WhatsApp ←</a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:${COLORS.muted};letter-spacing:0.02em;">ההודעה שלך</p>
    <div style="padding:16px 18px;background:${COLORS.bg};border-right:3px solid ${COLORS.brand};border-radius:8px;font-size:14px;color:${COLORS.heading};line-height:1.7;margin-bottom:24px;">
      ${nl2br(data.message)}
    </div>

    <p style="margin:0;font-size:15px;color:${COLORS.body};line-height:1.75;">
      נדבר בקרוב,<br>
      <strong style="color:${COLORS.heading};">יהונתן</strong>
    </p>
  `;

  const html = shell({
    dir: "rtl",
    preview: `תודה ${data.name}, קיבלתי את הפנייה ואחזור אליך תוך 24 שעות`,
    headerEyebrow: "פנייה התקבלה",
    bodyHtml,
  });

  const text = [
    `היי ${data.name},`,
    ``,
    `תודה שפנית אליי! קיבלתי את הפנייה שלך ואחזור אליך תוך 24 שעות.`,
    ``,
    `אם זה דחוף, אפשר לפנות אליי גם בוואטסאפ:`,
    waUrl,
    ``,
    `ההודעה שלך:`,
    data.message,
    ``,
    `נדבר בקרוב,`,
    `יהונתן`,
    ``,
    `—`,
    `${BRAND.name} · ${BRAND.titleHe}`,
    `${BRAND.email} · ${BRAND.phoneDisplay}`,
    `${SITE_URL}`,
  ].join("\n");

  return {
    subject: `תודה שפנית — YoniDev`,
    html,
    text,
  };
}
