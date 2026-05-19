"use client";

import { motion } from "framer-motion";
import { Code2, Sparkles, Bot, Plug, Check, Lightbulb } from "lucide-react";
import { services } from "@/data/services";
import { useT } from "@/lib/i18n/LocaleProvider";

const iconMap: Record<string, React.ElementType> = {
  Code2, Sparkles, Bot, Plug,
};

const CYCLE = 4;

export default function ServicesDetail() {
  const t = useT();
  const sp = t.servicesPage;

  return (
    <section className="py-24 bg-white">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] ?? Code2;
            const item = sp.items[service.id];
            const delay = i * (CYCLE / services.length);

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                className="group card-base p-8 flex flex-col gap-6"
              >
                {/* Icon */}
                <div className="relative w-[64px] h-[64px] flex items-center justify-center flex-shrink-0">
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full border border-brand-500/40"
                    animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
                    transition={{ duration: CYCLE, repeat: Infinity, ease: "easeOut", delay, times: [0, 1] }}
                  />
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full border border-brand-500/25"
                    animate={{ scale: [1, 1.9], opacity: [0.35, 0] }}
                    transition={{ duration: CYCLE, repeat: Infinity, ease: "easeOut", delay: delay + CYCLE / 2, times: [0, 1] }}
                  />
                  <div className="relative w-[64px] h-[64px] rounded-full bg-brand-500/8 border border-brand-500/20 flex items-center justify-center transition-colors duration-300 group-hover:bg-brand-500/12">
                    <Icon size={26} className="text-brand-500" />
                  </div>
                </div>

                {/* Title + tagline */}
                <div>
                  <h2 className="text-xl font-bold text-heading mb-1">{item.title}</h2>
                  <p className="text-sm font-medium text-brand-500">{item.tagline}</p>
                </div>

                {/* Description */}
                <p className="text-sm text-body leading-relaxed">{item.description}</p>

                {/* Bullets */}
                <ul className="flex flex-col gap-2">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-body">
                      <Check size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>

                {/* Use case */}
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-2 text-sm text-body/80">
                    <Lightbulb size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <span className="font-medium text-heading/70">{sp.useCaseLabel}: </span>
                      {item.useCase}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
