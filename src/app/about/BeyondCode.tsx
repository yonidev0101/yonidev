"use client";

import { motion } from "framer-motion";
import { passions } from "@/data/about";
import { useT } from "@/lib/i18n/LocaleProvider";

export default function BeyondCode() {
  const t = useT();
  const b = t.about.passions;

  return (
    <section className="py-24 bg-white">
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
            <span className="section-eyebrow">{b.eyebrow}</span>
          </div>
          <h2 className="section-heading">{b.heading}</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-12 max-w-3xl">
          {passions.map((passion, i) => {
            const Icon = passion.icon;
            const item = b.items[passion.id];
            return (
              <motion.div
                key={passion.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-5">
                  <Icon size={20} className="text-brand-500" />
                </div>
                <h3 className="font-bold text-heading text-base mb-2">{item.title}</h3>
                <p className="text-body text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
