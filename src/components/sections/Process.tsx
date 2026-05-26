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
          <div className="absolute start-[60px] md:start-[88px] top-0 bottom-0 w-px bg-slate-200" />
          <motion.div
            className="absolute start-[60px] md:start-[88px] top-0 w-px bg-gradient-to-b from-brand-500 via-brand-500 to-brand-500/0"
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
                className="relative grid grid-cols-[120px_1fr] md:grid-cols-[176px_1fr] gap-6 md:gap-12 py-12 md:py-16 border-t border-slate-100 first:border-t-0 group"
              >
                {/* Dot — direct child of the article so it sits at the row's vertical
                    center (top-1/2). Both content columns also use self-center, so the
                    digit and the title end up on the same horizontal line as the dot. */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: 0.2, ease: "backOut" }}
                  className="absolute top-1/2 -translate-y-1/2 start-[60px] md:start-[88px] -translate-x-1/2 rtl:translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-brand-500 z-10"
                />

                <div className="self-center">
                  {/* leading-[0.78] shrinks the line box around the cap-height of the
                      digit, so the digit's visual center lines up with the box's 50%
                      and therefore with the dot's row-center position. */}
                  <span
                    className="block font-bold text-[72px] md:text-[112px] leading-[0.78] tracking-tighter text-slate-100 group-hover:text-brand-500/15 transition-colors duration-500 select-none"
                    aria-hidden
                  >
                    {step.number}
                  </span>
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
