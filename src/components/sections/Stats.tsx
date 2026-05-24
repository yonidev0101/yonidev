"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { stats } from "@/data/technologies";
import { useT } from "@/lib/i18n/LocaleProvider";

function parseStat(value: string): { number: number | null; prefix: string; suffix: string } {
  const match = value.match(/^(\D*)(\d+)(\D*)$/);
  if (!match) return { number: null, prefix: "", suffix: "" };
  return { number: parseInt(match[2], 10), prefix: match[1], suffix: match[3] };
}

function CountUp({ value, inView }: { value: string; inView: boolean }) {
  const { number, prefix, suffix } = parseStat(value);
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(number === null ? value : `${prefix}0${suffix}`);

  useEffect(() => {
    if (!inView || number === null) return;
    const controls = animate(motionValue, number, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplay(`${prefix}${Math.round(latest)}${suffix}`);
      },
    });
    return () => controls.stop();
  }, [inView, number, prefix, suffix, motionValue]);

  if (number === null) return <>{value}</>;
  return <>{display}</>;
}

export default function Stats() {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-12 bg-white">
      <div className="container">
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-heading tracking-tight">
                <CountUp value={stat.value} inView={inView} />
              </div>
              <div className="text-sm text-body mt-1">{t.stats[stat.key]}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
