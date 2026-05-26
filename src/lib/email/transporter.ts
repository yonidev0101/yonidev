import nodemailer from "nodemailer";
import { GMAIL_USER } from "@/lib/contact/channels";

let cached: nodemailer.Transporter | null = null;

/**
 * Lazy Gmail SMTP transporter. Returns null when GMAIL_APP_PASSWORD is missing,
 * so callers can degrade gracefully instead of throwing at module load.
 */
export function getTransporter(): nodemailer.Transporter | null {
  if (cached) return cached;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) return null;
  cached = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass },
  });
  return cached;
}
