/**
 * Email signature HTML builder — final design "2a" (three-column horizontal):
 * Y-logo | name/title/slogan | contact column (phone, email, website,
 * WhatsApp) with line-icon PNGs. No divider — the contact block sits in its
 * own spaced column to the right.
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
const BODY = "#334155";
const MUTED = "#94A3B8";
const BLUE = "#2B7FFF";

function contactRow(icon: string, alt: string, content: string): string {
  return `<tr dir="ltr">
<td dir="ltr" style="padding:3px 8px 3px 0;vertical-align:middle;width:23px;"><img src="${SITE_URL}/signature/${icon}.png" alt="${alt}" width="15" height="15" style="display:block;border:0;" /></td>
<td dir="ltr" align="left" style="padding:3px 0;vertical-align:middle;font-family:${FONT};font-size:13px;line-height:18px;color:${BODY};text-align:left;white-space:nowrap;">${content}</td>
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

  const link = (href: string, text: string, external = true) =>
    `<a href="${href}"${external ? ' target="_blank"' : ""} style="color:${BLUE};text-decoration:none;">${text}</a>`;

  return `<table dir="ltr" align="left" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;direction:ltr;margin:0;">
<tr dir="ltr">
<td dir="ltr" style="vertical-align:middle;padding:0 18px 0 0;">
<a href="${SIGNATURE.websiteUrl}" target="_blank" style="text-decoration:none;"><img src="${SIGNATURE.logoUrl}" alt="${SIGNATURE.name}" width="66" height="66" style="display:block;border:0;border-radius:12px;" /></a>
</td>
<td dir="ltr" style="vertical-align:middle;padding:0 36px 0 0;">
<table dir="ltr" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;direction:ltr;">
<tr dir="ltr"><td dir="ltr" align="left" style="font-family:${FONT};font-size:19px;line-height:25px;font-weight:bold;color:${HEADING};text-align:left;white-space:nowrap;">${SIGNATURE.name}</td></tr>
<tr dir="ltr"><td dir="ltr" align="left" style="font-family:${FONT};font-size:13px;line-height:18px;font-weight:600;color:${BLUE};text-align:left;white-space:nowrap;">${SIGNATURE.title}</td></tr>
<tr dir="ltr"><td dir="ltr" align="left" style="font-family:${FONT};font-size:10px;line-height:15px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};text-align:left;white-space:nowrap;padding-top:3px;">${SIGNATURE.slogan}</td></tr>
</table>
</td>
<td dir="ltr" style="vertical-align:middle;">
<table dir="ltr" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;direction:ltr;">
${contactRow("phone", "Phone", `<span style="color:${BODY};">${SIGNATURE.phoneDisplay}</span>`)}
${contactRow("mail", "Email", link(`mailto:${SIGNATURE.email}`, SIGNATURE.email, false))}
${contactRow("globe", "Website", link(SIGNATURE.websiteUrl, SIGNATURE.websiteDisplay))}
${contactRow("whatsapp", "WhatsApp", link(SIGNATURE.whatsappUrl, "WhatsApp"))}
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
    `Phone: ${SIGNATURE.phoneDisplay}`,
    `Email: ${SIGNATURE.email}`,
    `Web: ${SIGNATURE.websiteDisplay}`,
    `WhatsApp: ${SIGNATURE.whatsappUrl}`,
  ].join("\n");
}

/** The public pixel URL for a recipient token. */
export function trackingPixelUrl(token: string): string {
  return `${SITE_URL}/api/track/open/${token}`;
}
