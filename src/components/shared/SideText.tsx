"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function SideText({
  text,
  side = "right",
}: {
  text: string;
  side?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-28, 28]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={`absolute top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none select-none ${
        side === "right" ? "right-0" : "left-0"
      }`}
      aria-hidden
    >
      <span
        style={{
          writingMode: "vertical-rl",
          transform: side === "right" ? "rotate(180deg)" : "none",
          fontSize: "clamp(60px, 6.5vw, 84px)",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--color-heading)",
          opacity: 0.05,
          display: "block",
          lineHeight: 1,
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}
