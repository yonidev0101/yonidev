"use client";

import { motion } from "framer-motion";
import { RadialBlob, DotGrid } from "@/components/shared/BackgroundDeco";
import { useT } from "@/lib/i18n/LocaleProvider";
import ScrambleText from "@/components/shared/ScrambleText";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

export default function ContactHero() {
  const t = useT();
  const h = t.contact.hero;

  return (
    <section className="relative pt-40 pb-20 overflow-hidden bg-white">
      <DotGrid opacity={0.03} />
      <RadialBlob className="-top-20 -end-24" size={500} opacity={0.07} />
      <RadialBlob className="bottom-0 -start-32" size={380} opacity={0.05} />

      <div className="container relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          <motion.div variants={item} className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
            <span className="section-eyebrow">{h.eyebrow}</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-heading leading-[1.08] tracking-tight mb-5">
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

          <motion.p variants={item} className="text-lg text-body leading-relaxed mb-6">
            {h.body}
          </motion.p>

          <motion.div variants={item} className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500" />
            </span>
            <span className="text-sm text-body">{h.available}</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
