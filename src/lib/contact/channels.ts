export const WHATSAPP_NUMBER = "972583223090"; // set before deploy, e.g. "972501234567"
export const EMAIL_TO = process.env.CONTACT_TO_EMAIL ?? "yonidev0101@gmail.com";
export const GMAIL_USER = process.env.GMAIL_USER ?? "yonidev0101@gmail.com";
export const EMAIL_FROM =
  process.env.CONTACT_FROM_EMAIL ?? `YoniDev <${GMAIL_USER}>`;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yonidev.vercel.app";

export const BRAND = {
  name: "יהונתן יגלניק",
  nameEn: "Yonatan Yaglenik",
  title: "Full Stack Developer",
  titleHe: "מפתח Full Stack",
  email: "yonidev0101@gmail.com",
  phoneDisplay: "+972 58 322 3090",
  whatsapp: WHATSAPP_NUMBER,
  site: "yonidev.vercel.app",
  logoUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://yonidev.vercel.app"}/logo/y-logo.png`,
} as const;

export function buildWhatsAppUrl(prefillText: string): string {
  if (!WHATSAPP_NUMBER) return "";
  const encoded = encodeURIComponent(prefillText);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}
