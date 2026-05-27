"use client";

import { motion } from "framer-motion";
import { Code2, Sparkles, Bot, Plug } from "lucide-react";
import { services } from "@/data/services";
import { RadialBlob, DotGrid } from "@/components/shared/BackgroundDeco";
import { useT } from "@/lib/i18n/LocaleProvider";
import RevealText from "@/components/shared/RevealText";
import SideText from "@/components/shared/SideText";

const iconMap: Record<string, React.ElementType> = {
  Code2, Sparkles, Bot, Plug,
};

const CYCLE = 4;
const STAGGER = CYCLE / services.length;

export default function Services() {
  const t = useT();

  return (
    <section className="relative py-24 bg-bg-soft overflow-hidden">
      {/* blend from previous white section */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
      <DotGrid opacity={0.025} size={28} />
      <RadialBlob className="-top-40 -start-40" size={500} opacity={0.06} />
      <RadialBlob className="-bottom-32 -end-20" size={420} opacity={0.05} />
      <SideText text="SERVICES" side="left" />

      <div className="container relative">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.5 }}
            className="section-eyebrow mb-3"
          >
            {t.services.eyebrow}
          </motion.p>
          <h2 data-scrolldot="services-heading" className="section-heading mb-4">
            <RevealText delay={0.05}>{t.services.heading}</RevealText>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="section-body max-w-xl mx-auto"
          >
            {t.services.body}
          </motion.p>
        </div>

        <div data-scrolldot="services-cards" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] ?? Code2;
            const delay = i * STAGGER;
            const item = t.services.items[service.id];

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col items-center text-center p-6"
              >
                <div className="relative mb-6 w-[72px] h-[72px] flex items-center justify-center">
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full border border-brand-500/40"
                    animate={{ scale: [1, 1.9], opacity: [0.55, 0] }}
                    transition={{ duration: CYCLE, repeat: Infinity, ease: "easeOut", delay, times: [0, 1] }}
                  />
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full border border-brand-500/30"
                    animate={{ scale: [1, 1.9], opacity: [0.4, 0] }}
                    transition={{ duration: CYCLE, repeat: Infinity, ease: "easeOut", delay: delay + CYCLE / 2, times: [0, 1] }}
                  />
                  <motion.span
                    aria-hidden
                    className="absolute inset-1 rounded-full bg-brand-500/10 blur-md"
                    animate={{ opacity: [0.15, 0.55, 0.15] }}
                    transition={{ duration: CYCLE, repeat: Infinity, ease: "easeInOut", delay }}
                  />
                  <div className="relative w-[72px] h-[72px] rounded-full bg-white border border-border shadow-[0_4px_20px_-6px_rgba(43,127,255,0.18)] flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5">
                    <Icon size={28} className="text-brand-500" />
                  </div>
                </div>

                <h3 className="font-semibold text-heading mb-2 text-[15px]">{item.title}</h3>
                <p className="text-sm text-body leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
