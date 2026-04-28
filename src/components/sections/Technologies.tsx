"use client";

import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import * as Si from "react-icons/si";
import { technologies } from "@/data/technologies";

type SiIconKey = keyof typeof Si;

function TechPill({ name, icon, color }: { name: string; icon: string; color: string }) {
  const Icon = Si[icon as SiIconKey] as React.ElementType;
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white border border-border shadow-[0_2px_8px_rgba(15,23,42,0.06)] mx-3 select-none">
      {Icon && <Icon size={20} style={{ color }} />}
      <span className="text-sm font-medium text-body whitespace-nowrap">{name}</span>
    </div>
  );
}

function Separator() {
  return <span className="text-border-soft text-lg mx-1 select-none">·</span>;
}

export default function Technologies() {
  return (
    <section className="py-16 bg-white" style={{ overflow: "hidden" }}>
      <div className="container">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="section-eyebrow text-center mb-10"
        >
          Technologies I Use
        </motion.p>
      </div>

      {/* Full-width marquee — intentionally breaks out of container */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <Marquee
          speed={45}
          pauseOnHover
          gradient
          gradientColor="white"
          gradientWidth={80}
          className="py-2"
        >
          {technologies.map((tech) => (
            <span key={tech.name} className="flex items-center">
              <TechPill {...tech} />
              <Separator />
            </span>
          ))}
        </Marquee>
      </motion.div>
    </section>
  );
}
