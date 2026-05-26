"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/LocaleProvider";

export default function CTABanner() {
  const t = useT();

  return (
    <section className="relative py-16 bg-bg-soft overflow-hidden">
      {/* blend from previous white section */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-10 sm:p-14 md:p-16 max-w-5xl mx-auto"
          style={{
            background: "linear-gradient(135deg, #2B7FFF 0%, #1d4ed8 100%)",
          }}
        >
          <div className="absolute -top-16 -end-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-20 -start-10 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-8 end-[30%] w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

          {/* Character — absolute, anchored to bottom-end; flipped in RTL so finger points at the CTA button */}
          <div className="absolute bottom-0 end-4 w-[280px] h-[115%] hidden sm:block pointer-events-none rtl:scale-x-[-1]">
            <Image
              src="/cta-character.png"
              alt="YoniDev character"
              fill
              className="object-contain object-bottom"
            />
          </div>

          <div className="relative z-10 flex flex-col items-start gap-4 sm:pe-[220px]">
            <span
              className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] text-white/80 uppercase"
              dir="ltr"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              Code Your Dream
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              <span className="block">{t.cta.headingLine1}</span>
              <span className="block">{t.cta.headingLine2}</span>
            </h2>
            <p className="text-white/75 text-sm">{t.cta.body}</p>
            <Link
              href="/contact"
              className="mt-2 inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-white text-brand-600 font-semibold text-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-200"
            >
              {t.cta.button} <ArrowRight size={16} className="rtl:-scale-x-100" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
