"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ScrambleText from "@/components/shared/ScrambleText";
import { RadialBlob, DotGrid } from "@/components/shared/BackgroundDeco";
import { useT } from "@/lib/i18n/LocaleProvider";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function AboutHero() {
  const t = useT();
  const h = t.about.hero;

  return (
    <section className="relative min-h-[80vh] flex items-center pt-24 pb-16 overflow-hidden bg-white">
      <DotGrid opacity={0.03} />
      <div className="absolute inset-0 halo-blue pointer-events-none" />
      <RadialBlob className="-bottom-24 -end-24" size={480} opacity={0.07} />
      <RadialBlob className="top-1/3 -start-32" size={360} opacity={0.05} />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center py-8 lg:py-16">
          {/* Left — Text */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-w-lg"
          >
            <motion.div variants={item} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
              <span className="section-eyebrow">{h.eyebrow}</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-heading leading-[1.08] tracking-tight">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.78, ease: [0.33, 1, 0.68, 1], delay: 0.2 }}
                >
                  <ScrambleText text={h.headingLine1} delay={0.22} duration={1.3} />
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.78, ease: [0.33, 1, 0.68, 1], delay: 0.32 }}
                >
                  <ScrambleText
                    text={h.headingLine2}
                    delay={0.34}
                    duration={1.3}
                    className="bg-gradient-to-r from-brand-500 to-brand-400 bg-clip-text text-transparent"
                  />
                </motion.span>
              </span>
            </h1>

            <motion.p variants={item} className="text-lg text-body leading-relaxed">
              {h.body}
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/projects"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-[0_8px_24px_rgba(43,127,255,0.3)] hover:shadow-[0_12px_32px_rgba(43,127,255,0.4)]"
              >
                {h.ctaPrimary} <ArrowRight size={16} className="rtl:-scale-x-100" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-border text-heading font-semibold text-sm hover:border-brand-500 hover:text-brand-500 transition-colors"
              >
                {h.ctaSecondary}
              </Link>
            </motion.div>

            <motion.div variants={item} className="flex items-center gap-2 pt-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500" />
              </span>
              <span className="text-sm text-body">{h.available}</span>
            </motion.div>
          </motion.div>

          {/* Right — Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-[300px] h-[360px] sm:w-[360px] sm:h-[440px] lg:w-[400px] lg:h-[500px]">
              {/* Brand glow behind portrait */}
              <div className="absolute inset-[10%] rounded-full bg-brand-500/15 blur-3xl" />

              {/* Portrait — cover-crop from the top so we see head + torso, never the awkward mid-thigh cut */}
              <div className="relative w-full h-full overflow-hidden rounded-3xl float-slow">
                <Image
                  src="/about/yoni-portrait.png"
                  alt={h.portraitAlt}
                  fill
                  className="object-cover object-top drop-shadow-[0_24px_48px_rgba(43,127,255,0.18)]"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
