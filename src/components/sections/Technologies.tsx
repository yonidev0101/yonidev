"use client";

import { motion } from "framer-motion";
import * as Si from "react-icons/si";
import { technologies } from "@/data/technologies";

type SiIconKey = keyof typeof Si;

export default function Technologies() {
  return (
    <section className="py-16 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="card-base p-8 sm:p-12"
        >
          <p className="section-eyebrow text-center mb-10">Technologies I Use</p>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {technologies.map((tech, i) => {
              const Icon = Si[tech.icon as SiIconKey] as React.ElementType;
              return (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  whileHover={{ y: -4, scale: 1.05 }}
                  className="flex flex-col items-center gap-2.5 group cursor-default"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-white group-hover:shadow-[0_4px_16px_rgba(15,23,42,0.1)] transition-all duration-200">
                    {Icon && (
                      <Icon
                        size={26}
                        style={{ color: tech.color }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium text-body group-hover:text-heading transition-colors text-center leading-tight">
                    {tech.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
