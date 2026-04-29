"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Copy, Check } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useT, useLocale } from "@/lib/i18n/LocaleProvider";
import { buildWhatsAppUrl } from "@/lib/contact/channels";

const EMAIL = "yonidev0101@gmail.com";

export default function ContactChannels() {
  const t = useT();
  const { locale } = useLocale();
  const c = t.contact.channels;
  const [copied, setCopied] = useState(false);

  const whatsappText = locale === "he" ? c.whatsapp.prefill : c.whatsapp.prefill;
  const whatsappUrl = buildWhatsAppUrl(whatsappText);

  function handleCopy() {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* WhatsApp */}
      {whatsappUrl && (
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-border shadow-sm hover:shadow-[0_8px_24px_rgba(37,211,102,0.15)] hover:border-[#25D366]/40 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center shrink-0 group-hover:bg-[#25D366]/15 transition-colors">
            <SiWhatsapp size={22} color="#25D366" />
          </div>
          <div>
            <p className="font-semibold text-heading text-sm">{c.whatsapp.label}</p>
            <p className="text-body text-xs mt-0.5">{c.whatsapp.subLabel}</p>
          </div>
        </motion.a>
      )}

      {/* Email */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-border shadow-sm hover:shadow-[0_8px_24px_rgba(43,127,255,0.1)] hover:border-brand-500/30 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0 group-hover:bg-brand-500/15 transition-colors">
          <Mail size={20} className="text-brand-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-heading text-sm">{c.email.label}</p>
          <p className="text-body text-xs mt-0.5 font-mono truncate">{EMAIL}</p>
        </div>
        <button
          onClick={handleCopy}
          aria-label={copied ? c.email.copied : c.email.copy}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-brand-500/10 text-body hover:text-brand-500"
        >
          {copied ? (
            <>
              <Check size={14} className="text-success" />
              <span className="text-success">{c.email.copied}</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              {c.email.copy}
            </>
          )}
        </button>
      </motion.div>

      {/* Response time */}
      <div className="flex items-center gap-2 px-1">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <span className="text-xs text-muted-text">{c.responseTime}</span>
      </div>
    </div>
  );
}
