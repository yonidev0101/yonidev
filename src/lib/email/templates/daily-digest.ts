import {
  shell,
  heading,
  paragraph,
  sectionLabel,
  spacer,
  esc,
  C,
  FONT,
} from "@/lib/contact/email-templates";
import { SITE_URL } from "@/lib/contact/channels";
import { DOMAIN_LABEL, routes, type Domain } from "@/lib/admin/domain";

export interface DigestTask {
  id: number;
  /** Which stack the task lives in — decides the link target and the tag. */
  domain: Domain;
  title: string;
  clientName: string | null;
  projectName: string | null;
  /** Right-aligned chip, e.g. "באיחור 3 ימים" / "היום" / "לא זז 18 ימ׳". */
  meta: string;
  /** When true, the chip is rendered in red (overdue / needs attention). */
  alert?: boolean;
}

export interface DailyDigestInput {
  dateLabel: string; // e.g. "יום ראשון · 31.5"
  followUps: DigestTask[]; // follow-ups whose date has arrived (nudge time)
  overdueTasks: DigestTask[]; // tasks past their actionable date
  staleTasks: DigestTask[]; // open tasks that haven't moved in 14+ days
  outstandingInvoicesCount: number;
  outstandingTotalIls: number;
}

function moneyIls(n: number): string {
  return `₪${n.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function taskRowsHtml(items: DigestTask[]): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" dir="rtl" style="background:${C.card};border:1px solid ${C.border};border-radius:14px;overflow:hidden;">
      ${items
        .map(
          (t, i) => `
        <tr>
          <td style="padding:13px 18px;text-align:right;${i > 0 ? `border-top:1px solid ${C.divider};` : ""}">
            <a href="${SITE_URL}${routes(t.domain).taskDetail(t.id)}" style="font-size:14px;font-weight:600;color:${C.heading};text-decoration:none;line-height:1.5;">${esc(t.title)}</a>
            <div style="font-size:12px;color:${C.muted};margin-top:3px;">${esc(
              [
                t.domain === "personal" ? DOMAIN_LABEL.personal : null,
                t.clientName,
                t.projectName,
              ]
                .filter(Boolean)
                .join(" · "),
            )}</div>
          </td>
          <td style="padding:13px 18px;text-align:left;white-space:nowrap;vertical-align:middle;${i > 0 ? `border-top:1px solid ${C.divider};` : ""}">
            <span style="font-size:12px;font-weight:600;color:${t.alert ? "#DC2626" : C.bodySoft};">${esc(t.meta)}</span>
          </td>
        </tr>`,
        )
        .join("")}
    </table>`;
}

function section(label: string, items: DigestTask[]): string {
  if (items.length === 0) return "";
  return `${sectionLabel(`${label} · ${items.length}`)}${taskRowsHtml(items)}${spacer(24)}`;
}

/**
 * Morning "what's on me today" digest — emailed to Yoni himself. Pull → push:
 * surfaces follow-ups whose time has come, overdue tasks, and stale tasks that
 * haven't moved, so nothing falls through the cracks.
 */
export function buildDailyDigestEmail(input: DailyDigestInput): {
  subject: string;
  html: string;
  text: string;
} {
  const totalOpen =
    input.followUps.length + input.overdueTasks.length + input.staleTasks.length;

  const invoicesHtml =
    input.outstandingInvoicesCount > 0
      ? `${sectionLabel("חשבוניות פתוחות")}
         <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" dir="rtl" style="background:${C.bg};border-radius:12px;">
           <tr>
             <td style="padding:14px 18px;font-size:14px;color:${C.body};text-align:right;">
               <a href="${SITE_URL}/admin/invoices" style="color:${C.heading};text-decoration:none;font-weight:600;">${input.outstandingInvoicesCount} חשבוניות ממתינות לתשלום</a>
             </td>
             <td style="padding:14px 18px;font-size:15px;font-weight:700;color:${C.brand};text-align:left;white-space:nowrap;">${esc(moneyIls(input.outstandingTotalIls))}</td>
           </tr>
         </table>
         ${spacer(8)}`
      : "";

  const bodyHtml = `
    ${heading("בוקר טוב,", "מה על הפרק היום")}
    ${spacer(12)}
    ${paragraph(
      totalOpen > 0
        ? `ריכזתי לך פה את מה שדורש תשומת לב — מעקבים שהגיע זמנם, משימות באיחור, ודברים שתקועים בלי תנועה.`
        : `אין מעקבים באיחור ולא משימות תקועות. יום נקי. ✨`,
    )}
    ${spacer(20)}

    ${section("מעקבים שהגיע זמנם", input.followUps)}
    ${section("משימות באיחור", input.overdueTasks)}
    ${section("לא זז", input.staleTasks)}
    ${invoicesHtml}

    <p style="margin:0;font-size:14px;color:${C.body};line-height:1.8;font-family:${FONT};">
      <a href="${SITE_URL}/admin" style="color:${C.brand};font-weight:700;text-decoration:none;">לדשבורד המלא ←</a>
    </p>
  `;

  const html = shell({
    preview: `${input.dateLabel} · ${totalOpen} פריטים על הפרק`,
    eyebrow: input.dateLabel,
    bodyHtml,
  });

  const textSection = (label: string, items: DigestTask[]): string[] =>
    items.length === 0
      ? []
      : [
          `${label} (${items.length}):`,
          ...items.map(
            (t) =>
              `· ${t.title} — ${[
                t.domain === "personal" ? DOMAIN_LABEL.personal : null,
                t.clientName,
                t.projectName,
              ]
                .filter(Boolean)
                .join(" · ")} [${t.meta}]`,
          ),
          ``,
        ];

  const text = [
    `מה על הפרק היום · ${input.dateLabel}`,
    ``,
    ...textSection("מעקבים שהגיע זמנם", input.followUps),
    ...textSection("משימות באיחור", input.overdueTasks),
    ...textSection("לא זז", input.staleTasks),
    ...(input.outstandingInvoicesCount > 0
      ? [
          `חשבוניות פתוחות: ${input.outstandingInvoicesCount} · ${moneyIls(input.outstandingTotalIls)}`,
          ``,
        ]
      : []),
    `${SITE_URL}/admin`,
  ].join("\n");

  return {
    subject: `מה על הפרק · ${input.dateLabel}${totalOpen > 0 ? ` · ${totalOpen} פריטים` : ""}`,
    html,
    text,
  };
}
