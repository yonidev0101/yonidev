"use client";

import { motion } from "framer-motion";
import { RadialBlob, DotGrid } from "@/components/shared/BackgroundDeco";
import { useT } from "@/lib/i18n/LocaleProvider";

export default function ServicesHero() {
  const t = useT();
  const h = t.servicesPage.hero;

  return (
    <section className="relative pt-32 pb-20 bg-bg-soft overflow-hidden">
      <DotGrid opacity={0.025} size={28} />
      <RadialBlob className="-top-32 -end-32" size={480} opacity={0.07} />
      <RadialBlob className="top-24 -start-24" size={360} opacity={0.05} />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="section-eyebrow mb-4">{h.eyebrow}</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-heading tracking-tight leading-[1.1] mb-6">
            {h.headingLine1}
            <br />
            <span className="text-brand-500">{h.headingLine2}</span>
          </h1>
          <p className="section-body text-lg max-w-lg">{h.body}</p>
        </motion.div>
      </div>
    </section>
  );
}
