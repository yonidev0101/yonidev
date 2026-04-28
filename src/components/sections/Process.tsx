"use client";

import { motion } from "framer-motion";
import { Search, PenTool, Code2, Rocket } from "lucide-react";
import { processSteps } from "@/data/services";
import { RadialBlob, DotGrid } from "@/components/shared/BackgroundDeco";

const iconMap: Record<string, React.ElementType> = {
  Search, PenTool, Code2, Rocket,
};

export default function Process() {
  return (
    <section className="relative py-24 bg-bg-soft overflow-hidden">
      <DotGrid opacity={0.025} size={28} />
      <RadialBlob className="-top-20 -right-32" size={460} opacity={0.06} />
      <RadialBlob className="-bottom-32 left-10" size={380} opacity={0.04} />

      <div className="container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mb-16"
        >
          <div>
            <p className="section-eyebrow mb-3">How I Work</p>
            <h2 className="section-heading">
              Simple Process,<br />Powerful Results
            </h2>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Dashed connector */}
          <svg
            className="absolute top-[40px] inset-x-[8%] w-[84%] hidden md:block pointer-events-none"
            height="4"
            preserveAspectRatio="none"
          >
            <line
              x1="0" y1="2" x2="100%" y2="2"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="5 7"
            />
            {/* Start dot (filled) */}
            <circle cx="0" cy="2" r="4" fill="#2B7FFF" />
          </svg>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {processSteps.map((step, i) => {
              const Icon = iconMap[step.icon] ?? Code2;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon circle */}
                  <div className="relative mb-5">
                    <div className="w-[72px] h-[72px] rounded-full bg-white border border-border shadow-[0_4px_20px_-6px_rgba(15,23,42,0.08)] flex items-center justify-center">
                      <Icon size={26} className="text-brand-500" />
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-500/50" />
                  </div>

                  <span className="text-xs font-semibold text-muted-text mb-1.5">
                    {step.number}
                  </span>
                  <h3 className="font-semibold text-heading mb-2 text-[15px]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-body leading-relaxed">
                    {step.description}
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
