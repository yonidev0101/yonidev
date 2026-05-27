"use client";

import { motion } from "framer-motion";
import { Code2, Sparkles, Bot, Plug, Lightbulb } from "lucide-react";
import { services } from "@/data/services";
import { useT } from "@/lib/i18n/LocaleProvider";

const iconMap: Record<string, React.ElementType> = {
  Code2, Sparkles, Bot, Plug,
};

export default function ServicesDetail() {
  const t = useT();
  const sp = t.servicesPage;

  return (
    <section className="py-24 bg-white">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] ?? Code2;
            const item = sp.items[service.id];
            const num = String(i + 1).padStart(2, "0");

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.08 }}
                className="group grid grid-cols-[48px_1fr] md:grid-cols-[64px_1fr_280px] gap-6 md:gap-10 py-10 border-t border-slate-100 hover:border-brand-500/30 transition-colors duration-300"
              >
                {/* Number */}
                <span className="font-mono text-[11px] text-slate-300 pt-1.5 tabular-nums group-hover:text-brand-500/50 transition-colors duration-300">
                  {num}
                </span>

                {/* Title + description */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-brand-500 flex-shrink-0" />
                    <h2 className="text-xl font-bold text-heading">{item.title}</h2>
                  </div>
                  <p className="text-sm font-medium text-brand-500/80">{item.tagline}</p>
                  <p className="text-sm text-body leading-relaxed max-w-lg">{item.description}</p>

                  {/* Use case — mobile only */}
                  <div className="flex items-start gap-2 text-xs text-body/70 pt-1 md:hidden">
                    <Lightbulb size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <span className="font-medium text-heading/60">{sp.useCaseLabel}: </span>
                      {item.useCase}
                    </span>
                  </div>
                </div>

                {/* Bullets + use case — desktop */}
                <div className="hidden md:flex flex-col gap-4 pt-0.5">
                  <ul className="flex flex-col gap-2">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm text-body">
                        <span className="w-1 h-1 rounded-full bg-brand-500/50 mt-2 flex-shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-start gap-2 text-xs text-body/70 pt-2 border-t border-slate-100">
                    <Lightbulb size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <span className="font-medium text-heading/60">{sp.useCaseLabel}: </span>
                      {item.useCase}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Bottom border */}
          <div className="border-t border-slate-100" />
        </div>
      </div>
    </section>
  );
}
