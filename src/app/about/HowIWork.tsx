"use client";

import { motion } from "framer-motion";
import { principles } from "@/data/about";
import { useT } from "@/lib/i18n/LocaleProvider";

export default function HowIWork() {
  const t = useT();
  const p = t.about.principles;

  return (
    <section className="py-24 bg-bg-soft">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
            <span className="section-eyebrow">{p.eyebrow}</span>
          </div>
          <h2 className="section-heading">{p.heading}</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-12">
          {principles.map((principle, i) => {
            const Icon = principle.icon;
            const item = p.items[principle.id];
            return (
              <motion.div
                key={principle.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
                className="flex gap-4"
              >
                <div className="shrink-0 mt-0.5">
                  <Icon size={20} className="text-brand-500" />
                </div>
                <div>
                  <h3 className="font-bold text-heading text-base mb-1.5">{item.title}</h3>
                  <p className="text-body text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
