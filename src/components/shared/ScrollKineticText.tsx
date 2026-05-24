"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const DEFAULT_LINE =
  "BUILD · DESIGN · SHIP · CODE · CREATE · INNOVATE · BUILD · DESIGN · SHIP · CODE · CREATE · INNOVATE · BUILD · DESIGN · SHIP ·";

export default function ScrollKineticText({
  line = DEFAULT_LINE,
  opacity = 0.045,
  className = "",
}: {
  line?: string;
  opacity?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const x1 = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <div
      ref={ref}
      className={`select-none pointer-events-none overflow-hidden ${className}`}
      aria-hidden
    >
      <motion.p
        style={{ x: x1, opacity }}
        className="whitespace-nowrap text-[clamp(52px,7.5vw,116px)] font-bold leading-none tracking-tighter uppercase text-heading"
      >
        {line}
      </motion.p>
      <motion.p
        style={{ x: x2, opacity }}
        className="whitespace-nowrap text-[clamp(52px,7.5vw,116px)] font-bold leading-none tracking-tighter uppercase text-heading"
      >
        {line}
      </motion.p>
    </div>
  );
}
