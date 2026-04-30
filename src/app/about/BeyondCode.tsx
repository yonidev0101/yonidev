"use client";

import { motion } from "framer-motion";
import { passions } from "@/data/about";
import { useT } from "@/lib/i18n/LocaleProvider";

export default function BeyondCode() {
  const t = useT();
  const b = t.about.passions;

  return (
    <section className="py-24 bg-bg-soft">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-16 max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
            <span className="section-eyebrow">{b.eyebrow}</span>
          </div>
          <h2 className="section-heading">{b.heading}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14 max-w-4xl">
          {passions.map((passion, i) => {
            const Icon = passion.icon;
            const item = b.items[passion.id];
            return (
              <motion.div
                key={passion.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.12 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6">
                  <Icon size={26} className="text-brand-500" strokeWidth={1.75} />
                </div>
                <h3 className="text-xl font-bold text-heading mb-3">{item.title}</h3>
                <p className="text-body leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
