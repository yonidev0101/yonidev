"use client";

import { motion } from "framer-motion";
import { processSteps } from "@/data/services";
import { RadialBlob } from "@/components/shared/BackgroundDeco";
import { useT } from "@/lib/i18n/LocaleProvider";
import RevealText from "@/components/shared/RevealText";
import SideText from "@/components/shared/SideText";
import ProcessIcon from "./ProcessIcon";

export default function Process() {
  const t = useT();

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

        <div className="max-w-5xl mx-auto">
          {processSteps.map((step, i) => {
            const item = t.process.items[step.id];
            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="grid grid-cols-[64px_1fr] md:grid-cols-[120px_1fr] gap-4 md:gap-12 py-12 md:py-16 border-t border-slate-100 first:border-t-0"
              >
                {/* Scroll-drawn SVG icon — each shape strokes itself in as the step
                    enters the viewport. The Hebrew step indicator under the description
                    carries the number context, so the icon stands alone here. */}
                <div data-scrolldot={`process-${i}`} className="self-center">
                  <ProcessIcon kind={step.id} />
                </div>

                <div className="self-center">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: 48 }}
                    viewport={{ once: true, amount: 0.08 }}
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
