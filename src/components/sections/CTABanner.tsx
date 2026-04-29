"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/LocaleProvider";

export default function CTABanner() {
  const t = useT();

  return (
    <section className="py-16 bg-bg-soft">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-10 sm:p-14 md:p-16"
          style={{
            background: "linear-gradient(135deg, #2B7FFF 0%, #1d4ed8 100%)",
          }}
        >
          <div className="absolute -top-16 -end-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-20 -start-10 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-8 end-[30%] w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                {t.cta.headingLine1}
                <br />
                {t.cta.headingLine2}
              </h2>
              <p className="text-white/75 mt-2 text-sm">{t.cta.body}</p>
            </div>

            <Link
              href="/contact"
              className="flex items-center gap-2.5 px-7 py-4 rounded-full bg-white text-brand-600 font-semibold text-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-200 shrink-0"
            >
              {t.cta.button} <ArrowRight size={16} className="rtl:-scale-x-100" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
