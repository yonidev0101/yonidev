"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function LocaleToggle({ compact = false }: { compact?: boolean }) {
  const { locale, toggleLocale, t } = useLocale();

  return (
    <button
      onClick={toggleLocale}
      aria-label={t.locale.ariaLabel}
      lang={locale === "he" ? "en" : "he"}
      className={
        compact
          ? "inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-full border border-border text-heading text-xs font-semibold hover:border-brand-500 hover:text-brand-500 transition-colors"
          : "inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-full border border-border text-heading text-xs font-semibold hover:border-brand-500 hover:text-brand-500 transition-colors"
      }
    >
      <Languages size={14} />
      <span>{t.locale.switchTo}</span>
    </button>
  );
}
