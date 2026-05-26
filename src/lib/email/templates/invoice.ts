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
import { BRAND, SITE_URL } from "@/lib/contact/channels";

export interface InvoiceEmailLine {
  description: string;
  quantityHours: number;
  rateIls: number;
  amountIls: number;
}

export interface InvoiceEmailInput {
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;       // internal ref — shown small at the very bottom only
  issuedAt: string;            // formatted date string, Hebrew (when the email was prepared)
  periodLabel: string;         // dynamic Hebrew label, e.g. "סיכום מאי" / "סיכום של 24.5.2026"
  dueAt?: string | null;       // intentionally unused in the friendly template
  lines: InvoiceEmailLine[];
  subtotalIls: number;
  vatRate: number;             // kept for API compatibility, not shown unless > 0
  totalIls: number;
  notes?: string | null;
  payHref?: string | null;     // intentionally unused
}

function moneyIls(n: number): string {
  return `₪${n.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function hours(n: number): string {
  const formatted = n.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${formatted} ש'`;
}

/**
 * Friendly "monthly summary" email. Deliberately NOT formatted as an official
 * tax invoice: no "invoice number" header, no "due date" framing, no VAT line
 * unless explicitly set, and a small disclaimer at the bottom clarifying that
 * this is a personal summary and not a tax document.
 */
export function buildInvoiceEmail(input: InvoiceEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const vatAmount = input.subtotalIls * input.vatRate;

  const linesHtml = input.lines
    .map(
      (l, i) => `
        <tr>
          <td style="padding:14px 0 14px 12px;font-size:14px;color:${C.heading};text-align:right;line-height:1.5;${i > 0 ? `border-top:1px solid ${C.divider};` : ""}">
            <div style="font-weight:500;">${esc(l.description)}</div>
            <div style="font-size:12px;color:${C.muted};margin-top:3px;">${esc(hours(l.quantityHours))} · ${esc(moneyIls(l.rateIls))} לשעה</div>
          </td>
          <td style="padding:14px 0;font-size:15px;color:${C.heading};font-weight:600;text-align:left;white-space:nowrap;tabular-nums:tabular;${i > 0 ? `border-top:1px solid ${C.divider};` : ""}">${esc(moneyIls(l.amountIls))}</td>
        </tr>`,
    )
    .join("");

  const totalsHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" dir="rtl" style="margin-top:18px;">
      ${
        input.vatRate > 0
          ? `<tr>
        <td style="font-size:13px;color:${C.body};padding:4px 0;text-align:right;">סכום ביניים</td>
        <td style="font-size:13px;color:${C.heading};padding:4px 0;text-align:left;">${esc(moneyIls(input.subtotalIls))}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:${C.body};padding:4px 0;text-align:right;">מע&quot;מ (${(input.vatRate * 100).toFixed(0)}%)</td>
        <td style="font-size:13px;color:${C.heading};padding:4px 0;text-align:left;">${esc(moneyIls(vatAmount))}</td>
      </tr>`
          : ""
      }
      <tr>
        <td style="font-size:14px;font-weight:700;color:${C.heading};padding:${input.vatRate > 0 ? "10px 0 4px" : "4px 0"};text-align:right;${input.vatRate > 0 ? `border-top:1px solid ${C.divider};` : ""}">סה&quot;כ</td>
        <td style="font-size:22px;font-weight:800;color:${C.brand};padding:${input.vatRate > 0 ? "10px 0 4px" : "4px 0"};text-align:left;${input.vatRate > 0 ? `border-top:1px solid ${C.divider};` : ""}">${esc(moneyIls(input.totalIls))}</td>
      </tr>
    </table>`;

  // ── Friendly preamble (replaces the formal "Invoice #..." header) ──
  const headerHtml = `
    <div style="font-size:12px;color:${C.muted};margin-bottom:6px;">
      ${esc(input.issuedAt)}
    </div>`;

  const tableHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" dir="rtl">
      ${linesHtml}
    </table>`;

  // ── Soft payment note + disclaimer (the "not an official invoice" bit) ──
  const paymentNoteHtml = `
    <div style="margin-top:24px;padding:14px 16px;background:${C.bg};border-radius:10px;font-size:13px;color:${C.body};line-height:1.7;">
      תשלום: בהעברה בנקאית או ב-Bit לפי מה שנוח לך. אם צריך פרטי חשבון — תכתוב לי בתשובה למייל.
    </div>`;

  const disclaimerHtml = `
    <div style="margin-top:18px;font-size:11px;color:${C.muted};line-height:1.7;">
      * זה סיכום אישי לתיעוד בלבד — לא חשבונית מס רשמית.
    </div>`;

  const bodyHtml = `
    ${headerHtml}
    ${heading(`היי ${input.clientName},`, input.periodLabel)}
    ${spacer(14)}
    ${paragraph(
      `שמתי לך פה את השעות שעבדנו יחד, פרויקט-פרויקט. אם משהו לא ברור או צריך תיקון — פשוט להשיב למייל.`,
    )}
    ${spacer(20)}

    ${sectionLabel("במה הושקעו השעות")}
    ${tableHtml}

    ${totalsHtml}

    ${
      input.notes
        ? `${spacer(22)}
           ${sectionLabel("הערה")}
           <p style="margin:0 0 14px 0;font-size:14px;color:${C.body};line-height:1.8;font-family:${FONT};">${esc(input.notes)}</p>`
        : ""
    }

    ${paymentNoteHtml}

    ${spacer(18)}

    <p style="margin:0;font-size:15px;color:${C.body};line-height:1.8;">
      תודה על העבודה המשותפת,<br>
      <strong style="color:${C.heading};font-size:16px;">יהונתן</strong>
    </p>

    ${disclaimerHtml}
  `;

  const html = shell({
    preview: `${input.periodLabel} · ${moneyIls(input.totalIls)}`,
    eyebrow: input.periodLabel,
    bodyHtml,
  });

  const textLines = [
    `היי ${input.clientName},`,
    ``,
    `${input.periodLabel}:`,
    ``,
    ...input.lines.map(
      (l) =>
        `· ${l.description} — ${hours(l.quantityHours)} × ${moneyIls(l.rateIls)} = ${moneyIls(l.amountIls)}`,
    ),
    ``,
    ...(input.vatRate > 0
      ? [
          `סכום ביניים: ${moneyIls(input.subtotalIls)}`,
          `מע"מ (${(input.vatRate * 100).toFixed(0)}%): ${moneyIls(vatAmount)}`,
        ]
      : []),
    `סה"כ: ${moneyIls(input.totalIls)}`,
    ``,
    ...(input.notes ? [input.notes, ``] : []),
    `תשלום: בהעברה בנקאית או ב-Bit. צריך פרטים? תכתוב לי בתשובה.`,
    ``,
    `תודה,`,
    `יהונתן`,
    ``,
    `* זה סיכום אישי, לא חשבונית מס רשמית.`,
    ``,
    `—`,
    `${BRAND.name} · ${BRAND.email} · ${BRAND.phoneDisplay}`,
    `${SITE_URL}`,
    ``,
    `ref: ${input.invoiceNumber}`,
  ];

  return {
    subject: `${input.periodLabel} מיהונתן · ${moneyIls(input.totalIls)}`,
    html,
    text: textLines.join("\n"),
  };
}
