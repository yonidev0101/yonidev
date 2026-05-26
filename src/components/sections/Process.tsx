"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { processSteps } from "@/data/services";
import { RadialBlob } from "@/components/shared/BackgroundDeco";
import { useT } from "@/lib/i18n/LocaleProvider";
import RevealText from "@/components/shared/RevealText";
import SideText from "@/components/shared/SideText";

export default function Process() {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 75%", "end 60%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="relative py-28 bg-white overflow-hidden">
      <RadialBlob className="top-40 -end-40" size={500} opacity={0.05} />
      <RadialBlob className="bottom-20 -start-32" size={420} opacity={0.04} />
      <SideText text="PROCESS" side="left" />

      <div className="container relative">
        <div className="max-w-2xl mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.5 }}
            className="section-eyebrow mb-3"
          >
            {t.process.eyebrow}
          </motion.p>
          <h2 className="section-heading">
            <RevealText delay={0.05}>{t.process.headingLine1}</RevealText>
            <RevealText delay={0.13}>{t.process.headingLine2}</RevealText>
          </h2>
        </div>

        <div ref={containerRef} className="relative max-w-5xl mx-auto">
          {/* Rail aligns with the horizontal center of the badge column. */}
          <div className="absolute start-[40px] md:start-[60px] top-0 bottom-0 w-px bg-slate-200" />
          <motion.div
            className="absolute start-[40px] md:start-[60px] top-0 w-px bg-gradient-to-b from-brand-500 via-brand-500 to-brand-500/0"
            style={{ height: lineHeight }}
          />

          {processSteps.map((step, i) => {
            const item = t.process.items[step.id];
            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-4 md:gap-10 py-10 md:py-14 border-t border-slate-100 first:border-t-0 group"
              >
                {/* Numbered badge — replaces the giant faint number + empty dot combo.
                    flex justify-center horizontally centers it in its column (= on the
                    rail line); self-center on the column centers it vertically in the
                    row, so it aligns with the title without any font-metrics math. */}
                <div className="self-center flex justify-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "backOut" }}
                    className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white border border-slate-200 shadow-[0_2px_10px_-2px_rgba(15,23,42,0.08)] group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:shadow-[0_8px_24px_-6px_rgba(43,127,255,0.4)] transition-all duration-300 flex items-center justify-center z-10"
                  >
                    <span
                      className="font-bold text-lg md:text-xl text-heading group-hover:text-white transition-colors tabular-nums"
                      dir="ltr"
                    >
                      {step.number}
                    </span>
                  </motion.div>
                </div>

                <div className="self-center">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: 48 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    className="h-px bg-brand-500 mb-5"
                  />
                  <h3 className="text-[22px] md:text-[26px] font-bold text-heading mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-base text-body leading-relaxed max-w-xl">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs text-muted-text">
                    <span className="font-mono tabular-nums">
                      {t.process.stepLabel} {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px w-8 bg-slate-200" />
                    <span>{t.process.stepOf} {String(processSteps.length).padStart(2, "0")}</span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
