"use client";

import { motion } from "framer-motion";
import * as Si from "react-icons/si";
import { technologies } from "@/data/technologies";
import { RadialBlob } from "@/components/shared/BackgroundDeco";
import { useT } from "@/lib/i18n/LocaleProvider";

type SiIconKey = keyof typeof Si;

function TechPill({ name, icon, color }: { name: string; icon: string; color: string }) {
  const Icon = Si[icon as SiIconKey] as React.ElementType;
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white border border-border shadow-[0_2px_8px_rgba(15,23,42,0.06)] mx-3 select-none shrink-0">
      {Icon && <Icon size={20} style={{ color }} />}
      <span className="text-sm font-medium text-body whitespace-nowrap">{name}</span>
    </div>
  );
}

export default function Technologies() {
  const t = useT();
  const items = [...technologies, ...technologies];

  return (
    <section className="relative py-16 bg-white overflow-hidden">
      <RadialBlob className="-top-24 start-1/4" size={380} opacity={0.04} />

      <div className="container relative">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.5 }}
          className="section-eyebrow text-center mb-10"
        >
          {t.technologies.eyebrow}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative"
        style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}
      >
        <div className="overflow-hidden" dir="ltr">
          <div className="marquee-track py-2">
            {items.map((tech, i) => (
              <TechPill key={`${tech.name}-${i}`} {...tech} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
