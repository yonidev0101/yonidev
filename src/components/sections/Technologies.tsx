"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { technologies } from "@/data/technologies";

export default function Technologies() {
  return (
    <section className="py-16 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="card-base p-8 sm:p-10"
        >
          <p className="section-eyebrow text-center mb-8">Technologies I Use</p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {technologies.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ y: -3 }}
                className="flex items-center gap-2.5 group cursor-default"
              >
                <div className="w-7 h-7 relative">
                  <Image
                    src={tech.logo}
                    alt={tech.name}
                    fill
                    className="object-contain"
                    sizes="28px"
                  />
                </div>
                <span className="text-sm font-medium text-body group-hover:text-heading transition-colors">
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
