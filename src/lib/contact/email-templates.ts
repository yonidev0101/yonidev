import type { ContactFormData } from "./schema";
import { BRAND, SITE_URL, buildWhatsAppUrl } from "./channels";

// ─────────────────────────────────────────────
// Design tokens (mirrors src/app/globals.css)
// ─────────────────────────────────────────────

export const C = {
  brand:     "#2B7FFF",
  brand600:  "#1d6fea",
  brand400:  "#60a5fa",
  brand50:   "#EFF6FF",
  heading:   "#0F172A",
  body:      "#475569",
  bodySoft:  "#64748B",
  muted:     "#94A3B8",
  border:    "#E2E8F0",
  borderSoft:"#F1F5F9",
  divider:   "#EEF2F7",
  bg:        "#F8FAFC",
  card:      "#FFFFFF",
  success:   "#22C55E",
} as const;

export const FONT =
  '"Heebo", -apple-system, BlinkMacSystemFont, "Segoe UI", "Plus Jakarta Sans", Arial, sans-serif';

// ─────────────────────────────────────────────
// Shared shell — page bg, white card with side accent + vertical YONIDEV
// ─────────────────────────────────────────────

interface ShellOpts {
  preview: string;
  eyebrow: string;
  bodyHtml: string;
}

export function shell({ preview, eyebrow, bodyHtml }: ShellOpts): string {
  // Outer table is LTR for layout stability across mail clients.
  // Inner content cell uses dir="rtl" for Hebrew text alignment.
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>YoniDev</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT};color:${C.body};-webkit-font-smoothing:antialiased;text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:0;mso-hide:all;">${esc(preview)}</div>

  <!-- Page background -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="680" style="max-width:680px;width:100%;background:${C.card};border:1px solid ${C.border};border-radius:20px;overflow:hidden;box-shadow:0 8px 32px -12px rgba(15,23,42,0.08);">

          <!-- Top accent strip (gradient) -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${C.brand} 0%,${C.brand400} 50%,${C.brand50} 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header: logo on the right (RTL aesthetic) -->
          <tr>
            <td dir="rtl" style="padding:28px 36px 8px 36px;text-align:right;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" dir="rtl">
                <tr>
                  <td style="vertical-align:middle;text-align:right;">
                    <img src="${BRAND.logoUrl}" width="36" height="36" alt="" style="display:inline-block;vertical-align:middle;border:0;outline:none;border-radius:8px;">
                    <span style="display:inline-block;vertical-align:middle;margin-right:10px;">
                      <span style="display:block;font-size:15px;font-weight:700;color:${C.heading};letter-spacing:-0.01em;line-height:1.2;">YoniDev</span>
                      <span style="display:block;font-size:10px;font-weight:600;color:${C.muted};letter-spacing:0.14em;text-transform:uppercase;margin-top:2px;">by ${esc(BRAND.parent)}</span>
                    </span>
                  </td>
                  <td style="vertical-align:middle;text-align:left;">
                    <span style="display:inline-block;font-size:11px;font-weight:600;color:${C.muted};letter-spacing:0.18em;text-transform:uppercase;">${esc(BRAND.site)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td dir="rtl" valign="top" style="padding:24px 36px 8px 36px;text-align:right;vertical-align:top;">

              <!-- Eyebrow (dot + label) -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" dir="rtl">
                <tr>
                  <td style="vertical-align:middle;padding-left:8px;">
                    <span style="display:inline-block;width:8px;height:8px;background:${C.brand};border-radius:999px;"></span>
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:11px;font-weight:700;color:${C.brand};letter-spacing:0.18em;text-transform:uppercase;">${esc(eyebrow)}</span>
                  </td>
                </tr>
              </table>

              <div style="height:18px;font-size:0;line-height:0;">&nbsp;</div>

              ${bodyHtml}
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td dir="rtl" style="padding:8px 36px 32px 36px;">
              ${signatureHtml()}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 36px;background:${C.bg};border-top:1px solid ${C.divider};text-align:center;">
              <p style="margin:0;font-size:11px;color:${C.muted};line-height:1.7;letter-spacing:0.02em;">
                <a href="${SITE_URL}" style="color:${C.muted};text-decoration:none;">${esc(BRAND.site)}</a>
                <span style="margin:0 8px;color:${C.border};">·</span>
                <a href="mailto:${BRAND.email}" style="color:${C.muted};text-decoration:none;">${BRAND.email}</a>
              </p>
              <p style="margin:6px 0 0 0;font-size:10px;color:${C.muted};letter-spacing:0.18em;text-transform:uppercase;font-weight:600;">
                ${esc(BRAND.byline)}
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

function signatureHtml(): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" dir="rtl" style="border-top:1px solid ${C.divider};padding-top:22px;margin-top:8px;">
      <tr>
        <td width="60" valign="middle" style="width:60px;vertical-align:middle;padding-left:16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background:${C.card};border:1px solid ${C.border};border-radius:14px;padding:6px;">
                <img src="${BRAND.logoUrl}" width="44" height="44" alt="" style="display:block;border:0;outline:none;">
              </td>
            </tr>
          </table>
        </td>
        <td valign="middle" dir="rtl" style="vertical-align:middle;text-align:right;">
          <div style="font-size:15px;font-weight:700;color:${C.heading};line-height:1.3;">${BRAND.name}</div>
          <div style="font-size:13px;color:${C.brand};font-weight:600;margin-top:3px;">${BRAND.titleHe}</div>
          <div style="font-size:12px;color:${C.bodySoft};margin-top:8px;line-height:1.7;">
            <a href="mailto:${BRAND.email}" style="color:${C.body};text-decoration:none;">${BRAND.email}</a>
            <span style="color:${C.border};margin:0 6px;">·</span>
            <a href="tel:+${BRAND.whatsapp}" style="color:${C.body};text-decoration:none;direction:ltr;display:inline-block;unicode-bidi:isolate;">${BRAND.phoneDisplay}</a>
          </div>
        </td>
      </tr>
    </table>
  `;
}

// ─────────────────────────────────────────────
// Reusable bits
// ─────────────────────────────────────────────

export function heading(text: string, highlight?: string): string {
  return `
    <h1 style="margin:0;font-size:30px;font-weight:800;color:${C.heading};line-height:1.2;letter-spacing:-0.02em;font-family:${FONT};">
      ${esc(text)}${
    highlight
      ? `<br><span style="background:linear-gradient(90deg,${C.brand} 0%,${C.brand400} 100%);-webkit-background-clip:text;background-clip:text;color:${C.brand};font-weight:800;">${esc(highlight)}</span>`
      : ""
  }
    </h1>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 14px 0;font-size:15px;color:${C.body};line-height:1.8;">${text}</p>`;
}

export function pillButton(href: string, label: string): string {
  // RTL-aware pill: arrow lives in its own LTR span so bidi doesn't reorder it.
  // Color + text-decoration must be repeated on every nested span — Gmail/Outlook
  // re-apply default link styling otherwise (visible underline + blue text).
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="margin:0;">
      <tr>
        <td align="center" valign="middle" bgcolor="${C.brand}" style="border-radius:999px;background-color:${C.brand};mso-padding-alt:0;">
          <a href="${href}" style="display:inline-block;padding:16px 34px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;font-family:${FONT};line-height:1;white-space:nowrap;letter-spacing:0.01em;mso-padding-alt:16px 34px;">
            <span style="color:#ffffff;text-decoration:none;vertical-align:middle;">${esc(label)}</span>
            <span style="color:#ffffff;text-decoration:none;display:inline-block;vertical-align:middle;margin-right:10px;direction:ltr;unicode-bidi:isolate;font-family:Arial,sans-serif;font-weight:400;font-size:17px;line-height:1;">&#8592;</span>
          </a>
        </td>
      </tr>
    </table>`;
}

export function quoteCard(text: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" dir="rtl">
      <tr>
        <td style="padding:18px 20px;background:${C.bg};border-right:3px solid ${C.brand};border-radius:10px;font-size:15px;color:${C.heading};line-height:1.8;text-align:right;">
          ${nl2br(text)}
        </td>
      </tr>
    </table>`;
}

export function sectionLabel(text: string): string {
  return `<div style="font-size:11px;font-weight:700;color:${C.muted};letter-spacing:0.14em;text-transform:uppercase;margin-bottom:10px;">${esc(text)}</div>`;
}

export function spacer(h: number): string {
  return `<div style="height:${h}px;font-size:0;line-height:0;">&nbsp;</div>`;
}

export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function nl2br(s: string): string {
  return esc(s).replace(/\n/g, "<br>");
}

// ─────────────────────────────────────────────
// Label maps (Hebrew)
// ─────────────────────────────────────────────

const PROJECT_TYPE_HE: Record<string, string> = {
  web: "אפליקציית Web",
  ai: "AI / LLM",
  bot: "בוט",
  api: "API / אינטגרציה",
  other: "אחר",
};
const BUDGET_HE: Record<string, string> = {
  lt5: "פחות מ-₪20K",
  mid: "₪20K – ₪50K",
  high: "₪50K – ₪200K",
  top: "₪200K+",
  unsure: "לא בטוח",
};
const TIMELINE_HE: Record<string, string> = {
  asap: "בהקדם",
  short: "1–3 חודשים",
  medium: "3–6 חודשים",
  flexible: "גמיש",
};

// ─────────────────────────────────────────────
// 1) Inquiry email — sent to Yoni (Hebrew, RTL)
// ─────────────────────────────────────────────

export function buildInquiryEmail(data: ContactFormData): {
  subject: string;
  html: string;
  text: string;
} {
  const projectType = data.projectType ? PROJECT_TYPE_HE[data.projectType] : "—";
  const budget = data.budget ? BUDGET_HE[data.budget] : "—";
  const timeline = data.timeline ? TIMELINE_HE[data.timeline] : "—";

  const rows: [string, string][] = [
    ["שם",       data.name],
    ["אימייל",   data.email],
    ["טלפון",    data.phone || "—"],
    ["סוג פרויקט", projectType],
    ["תקציב",    budget],
    ["לוח זמנים", timeline],
  ];

  const rowsHtml = rows
    .map(
      ([label, value], i) => `
        <tr>
          <td style="padding:14px 18px;font-size:12px;font-weight:600;color:${C.muted};letter-spacing:0.06em;width:120px;text-align:right;${i > 0 ? `border-top:1px solid ${C.divider};` : ""}">${esc(label)}</td>
          <td style="padding:14px 18px;font-size:14px;color:${C.heading};font-weight:500;text-align:right;${i > 0 ? `border-top:1px solid ${C.divider};` : ""}">${esc(value)}</td>
        </tr>`
    )
    .join("");

  const replyHref = `mailto:${data.email}?subject=${encodeURIComponent("Re: פנייתך — YoniDev")}`;

  const bodyHtml = `
    ${heading("פנייה חדשה הגיעה", `מ-${data.name}`)}
    ${spacer(14)}
    ${paragraph(
      `דרך טופס יצירת הקשר באתר. הפרטים מסודרים למטה — אפשר להשיב ישירות ${esc(data.name)} בלחיצה על הכפתור.`
    )}
    ${spacer(20)}

    ${sectionLabel("פרטי לקוח")}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" dir="rtl" style="background:${C.card};border:1px solid ${C.border};border-radius:14px;overflow:hidden;">
      ${rowsHtml}
    </table>

    ${spacer(28)}

    ${sectionLabel("ההודעה")}
    ${quoteCard(data.message)}

    ${spacer(28)}

    ${pillButton(replyHref, `השב ל-${data.name}`)}

    ${spacer(20)}
  `;

  const html = shell({
    preview: `פנייה חדשה — ${data.name} · ${projectType}`,
    eyebrow: "פנייה חדשה",
    bodyHtml,
  });

  const text = [
    `פנייה חדשה — ${data.name}`,
    ``,
    `שם:        ${data.name}`,
    `אימייל:    ${data.email}`,
    `טלפון:     ${data.phone || "—"}`,
    `סוג פרויקט: ${projectType}`,
    `תקציב:     ${budget}`,
    `לוח זמנים:  ${timeline}`,
    ``,
    `ההודעה:`,
    data.message,
    ``,
    `—`,
    `${BRAND.name} · ${BRAND.titleHe}`,
    `${BRAND.email} · ${BRAND.phoneDisplay}`,
    `${SITE_URL}`,
    `${BRAND.byline}`,
  ].join("\n");

  return {
    subject: `פנייה חדשה — ${data.name}${data.projectType ? ` · ${projectType}` : ""}`,
    html,
    text,
  };
}

// ─────────────────────────────────────────────
// 2) Auto-reply — sent to the customer (Hebrew, RTL)
// ─────────────────────────────────────────────

export function buildAutoReplyEmail(data: ContactFormData): {
  subject: string;
  html: string;
  text: string;
} {
  const waUrl = buildWhatsAppUrl(
    `היי יהונתן, פניתי דרך האתר ורציתי להמשיך כאן את השיחה.`
  );

  const bodyHtml = `
    ${heading(`היי ${data.name},`, "ההודעה שלך הגיעה ✨")}
    ${spacer(14)}

    ${paragraph(
      `קיבלתי את הפנייה שלך והיא מחכה לי בתיבה. אני קורא כל הודעה אישית — לא בוטים, לא תבניות אוטומטיות — ואחזור אליך בהקדם.`
    )}
    ${paragraph(
      `בדרך כלל בתוך <strong style="color:${C.heading};">24 שעות</strong>. אם זה דחוף או שבא לך לדבר ישירות, אפשר גם בוואטסאפ.`
    )}

    ${spacer(20)}

    ${pillButton(waUrl, "פתח שיחה ב-WhatsApp")}

    ${spacer(32)}

    ${sectionLabel("שלחת לי את ההודעה הזו")}
    ${quoteCard(data.message)}

    ${spacer(28)}

    <p style="margin:0;font-size:15px;color:${C.body};line-height:1.8;">
      נדבר בקרוב,<br>
      <strong style="color:${C.heading};font-size:16px;">יהונתן</strong>
    </p>

    ${spacer(8)}
  `;

  const html = shell({
    preview: `תודה ${data.name} — אחזור אליך תוך 24 שעות`,
    eyebrow: "פנייה התקבלה",
    bodyHtml,
  });

  const text = [
    `היי ${data.name},`,
    ``,
    `קיבלתי את הפנייה שלך! אחזור אליך תוך 24 שעות.`,
    ``,
    `אם זה דחוף, אפשר גם בוואטסאפ:`,
    waUrl,
    ``,
    `ההודעה ששלחת:`,
    data.message,
    ``,
    `נדבר בקרוב,`,
    `יהונתן`,
    ``,
    `—`,
    `${BRAND.name} · ${BRAND.titleHe}`,
    `${BRAND.email} · ${BRAND.phoneDisplay}`,
    `${SITE_URL}`,
    `${BRAND.byline}`,
  ].join("\n");

  return {
    subject: `תודה שפנית — YoniDev`,
    html,
    text,
  };
}
