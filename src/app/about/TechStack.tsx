"use client";

import { motion } from "framer-motion";
import { techCategories } from "@/data/about";
import { useT } from "@/lib/i18n/LocaleProvider";

export default function TechStack() {
  const t = useT();
  const tc = t.about.tech;

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
            <span className="section-eyebrow">{tc.eyebrow}</span>
          </div>
          <h2 className="section-heading">{tc.heading}</h2>
        </motion.div>

        <div className="max-w-4xl">
          {techCategories.map((cat, i) => {
            const label = tc.categories[cat.id].title;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.06 }}
              >
                {i > 0 && <div className="border-t border-border-soft" />}
                <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-4 items-start py-5">
                  {/* Category label */}
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-text pt-1.5">
                    {label}
                  </span>
                  {/* Items */}
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex px-3 py-1.5 rounded-lg bg-white border border-border text-heading text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
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
