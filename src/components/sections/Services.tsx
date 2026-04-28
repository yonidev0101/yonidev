"use client";

import { motion } from "framer-motion";
import { Code2, Sparkles, Bot, Plug } from "lucide-react";
import { services } from "@/data/services";
import { RadialBlob, DotGrid } from "@/components/shared/BackgroundDeco";

const iconMap: Record<string, React.ElementType> = {
  Code2, Sparkles, Bot, Plug,
};

export default function Services() {
  return (
    <section className="relative py-24 bg-bg-soft overflow-hidden">
      <DotGrid opacity={0.025} size={28} />
      <RadialBlob className="-top-40 -left-40" size={500} opacity={0.06} />
      <RadialBlob className="-bottom-32 -right-20" size={420} opacity={0.05} />

      <div className="container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow mb-3">What I Do</p>
          <h2 className="section-heading mb-4">End-to-End Development</h2>
          <p className="section-body max-w-xl mx-auto">
            I build complete digital solutions with clean code, powerful
            functionality and great user experience.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="relative">
          {/* Dashed connector SVG */}
          <svg
            className="absolute top-[52px] inset-x-[8%] w-[84%] hidden md:block pointer-events-none"
            height="4"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="2"
              x2="100%"
              y2="2"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="5 7"
            />
          </svg>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] ?? Code2;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-center text-center p-6"
                >
                  {/* Icon circle */}
                  <div className="relative mb-5">
                    <div className="w-[72px] h-[72px] rounded-full bg-white border border-border shadow-[0_4px_20px_-6px_rgba(43,127,255,0.15)] flex items-center justify-center">
                      <Icon size={28} className="text-brand-500" />
                    </div>
                    {/* Connector dot */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-500/60" />
                  </div>

                  <h3 className="font-semibold text-heading mb-2 text-[15px]">
                    {service.title}
                  </h3>
                  <p className="text-sm text-body leading-relaxed">
                    {service.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
