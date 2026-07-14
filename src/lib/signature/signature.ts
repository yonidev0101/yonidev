/**
 * Email signature HTML builder — final design "1a" (horizontal):
 * Y-logo | divider | name, title, slogan, contact rows with line-icon PNGs.
 *
 * Email-client constraints: table layout, inline styles only, absolute image
 * URLs (assets served from the production site), and `dir="ltr"` locked on
 * every table/cell so the layout survives RTL (Hebrew) compose windows.
 */

import { SITE_URL } from "@/lib/seo/site";

export const SIGNATURE = {
  name: "YoniDev",
  title: "Full-Stack Developer",
  slogan: "Code Your Dream",
  phoneDisplay: "058-322-3090",
  whatsappUrl: "https://wa.me/972583223090",
  email: "yonidev0101@gmail.com",
  websiteDisplay: "yonidev.vercel.app",
  websiteUrl: SITE_URL,
  logoUrl: `${SITE_URL}/logo/y-logo.png`,
} as const;

const FONT = "'Segoe UI', Arial, Helvetica, sans-serif";
const HEADING = "#0F172A";
const BODY = "#64748B";
const BLUE = "#2B7FFF";

function contactRow(icon: string, alt: string, content: string): string {
  return `<tr dir="ltr">
<td dir="ltr" style="padding:2px 0;vertical-align:middle;width:24px;"><img src="${SITE_URL}/signature/${icon}.png" alt="${alt}" width="15" height="15" style="display:block;border:0;" /></td>
<td dir="ltr" align="left" style="padding:2px 0;vertical-align:middle;font-family:${FONT};font-size:13px;line-height:19px;color:${BODY};text-align:left;">${content}</td>
</tr>`;
}

/**
 * Build the full signature HTML. Pass `trackingPixelUrl` to embed a
 * per-recipient 1x1 open-tracking pixel; omit it for the untracked version.
 */
export function buildSignatureHtml(trackingPixelUrl?: string): string {
  const pixel = trackingPixelUrl
    ? `<img src="${trackingPixelUrl}" alt="" width="1" height="1" style="display:block;border:0;width:1px;height:1px;overflow:hidden;" />`
    : "";

  return `<table dir="ltr" align="left" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;direction:ltr;margin:0;">
<tr dir="ltr">
<td dir="ltr" style="vertical-align:middle;padding:0 16px 0 0;">
<a href="${SIGNATURE.websiteUrl}" target="_blank" style="text-decoration:none;"><img src="${SIGNATURE.logoUrl}" alt="${SIGNATURE.name}" width="72" height="72" style="display:block;border:0;border-radius:12px;" /></a>
</td>
<td dir="ltr" style="vertical-align:middle;border-left:2px solid ${BLUE};padding:0 0 0 16px;">
<table dir="ltr" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;direction:ltr;">
<tr dir="ltr"><td dir="ltr" align="left" style="font-family:${FONT};font-size:18px;line-height:24px;font-weight:bold;color:${HEADING};text-align:left;">${SIGNATURE.name}</td></tr>
<tr dir="ltr"><td dir="ltr" align="left" style="font-family:${FONT};font-size:13px;line-height:18px;font-weight:600;color:${BLUE};text-align:left;">${SIGNATURE.title}</td></tr>
<tr dir="ltr"><td dir="ltr" align="left" style="font-family:${FONT};font-size:12px;line-height:17px;font-style:italic;color:${BODY};padding-bottom:8px;text-align:left;">${SIGNATURE.slogan}</td></tr>
<tr dir="ltr"><td dir="ltr" align="left" style="text-align:left;">
<table dir="ltr" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;direction:ltr;">
${contactRow("phone", "Phone", `<a href="${SIGNATURE.whatsappUrl}" target="_blank" style="color:${BODY};text-decoration:none;">${SIGNATURE.phoneDisplay}</a>`)}
${contactRow("mail", "Email", `<a href="mailto:${SIGNATURE.email}" style="color:${BODY};text-decoration:none;">${SIGNATURE.email}</a>`)}
${contactRow("globe", "Website", `<a href="${SIGNATURE.websiteUrl}" target="_blank" style="color:${BLUE};text-decoration:none;font-weight:600;">${SIGNATURE.websiteDisplay}</a>`)}
</table>
</td></tr>
</table>
</td>
</tr>
</table>
${pixel}`;
}

/** Plain-text fallback used for the clipboard's text/plain flavor. */
export function buildSignatureText(): string {
  return [
    SIGNATURE.name,
    SIGNATURE.title,
    SIGNATURE.slogan,
    "",
    `Phone/WhatsApp: ${SIGNATURE.phoneDisplay}`,
    `Email: ${SIGNATURE.email}`,
    `Web: ${SIGNATURE.websiteDisplay}`,
  ].join("\n");
}

/** The public pixel URL for a recipient token. */
export function trackingPixelUrl(token: string): string {
  return `${SITE_URL}/api/track/open/${token}`;
}
