"use client";

import { motion } from "framer-motion";
import { RadialBlob, DotGrid } from "@/components/shared/BackgroundDeco";
import { useT } from "@/lib/i18n/LocaleProvider";
import ScrambleText from "@/components/shared/ScrambleText";

export default function ServicesHero() {
  const t = useT();
  const h = t.servicesPage.hero;

  return (
    <section className="relative pt-32 pb-20 bg-bg-soft overflow-hidden">
      <DotGrid opacity={0.025} size={28} />
      <RadialBlob className="-top-32 -end-32" size={480} opacity={0.07} />
      <RadialBlob className="top-24 -start-24" size={360} opacity={0.05} />

      <div className="container relative">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="section-eyebrow mb-4"
          >
            {h.eyebrow}
          </motion.p>
          <h1 className="text-5xl sm:text-6xl font-bold text-heading tracking-tight leading-[1.1] mb-6">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.78, ease: [0.33, 1, 0.68, 1], delay: 0.18 }}
              >
                <ScrambleText text={h.headingLine1} delay={0.2} duration={1.3} />
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.78, ease: [0.33, 1, 0.68, 1], delay: 0.3 }}
              >
                <ScrambleText text={h.headingLine2} delay={0.32} duration={1.3} className="text-brand-500" />
              </motion.span>
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="section-body text-lg max-w-lg"
          >
            {h.body}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
