"use client";

import { motion, Variants } from "framer-motion";
import { type ProcessId } from "@/data/services";

/**
 * Scroll-triggered drawing animation. Each path/shape in an icon animates
 * its stroke from pathLength 0 → 1 in sequence, so the icon appears to be
 * drawn by an invisible pen as the user reaches the step.
 */
const drawVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.9, delay: 0.15 + i * 0.35, ease: "easeInOut" },
      opacity: { duration: 0.2, delay: 0.15 + i * 0.35 },
    },
  }),
};

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function ProcessIcon({ kind }: { kind: ProcessId }) {
  return (
    <motion.svg
      width="56"
      height="56"
      viewBox="0 0 48 48"
      className="text-brand-500 w-12 h-12 md:w-16 md:h-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      aria-hidden
    >
      {kind === "discover" && (
        <>
          {/* Magnifying glass — circle, then handle */}
          <motion.circle cx="20" cy="20" r="10" {...STROKE} variants={drawVariants} custom={0} />
          <motion.line
            x1="27.5" y1="27.5" x2="38" y2="38"
            {...STROKE} strokeWidth={2.5}
            variants={drawVariants} custom={1}
          />
        </>
      )}

      {kind === "design" && (
        <>
          {/* 4-point creative spark — single continuous path */}
          <motion.path
            d="M 24 6 L 26 22 L 42 24 L 26 26 L 24 42 L 22 26 L 6 24 L 22 22 Z"
            {...STROKE}
            variants={drawVariants}
            custom={0}
          />
          {/* Small secondary sparkle */}
          <motion.path
            d="M 38 10 L 39 13 L 42 14 L 39 15 L 38 18 L 37 15 L 34 14 L 37 13 Z"
            {...STROKE}
            strokeWidth={1.5}
            variants={drawVariants}
            custom={1}
          />
        </>
      )}

      {kind === "develop" && (
        <>
          {/* Left bracket  <  */}
          <motion.path d="M 17 14 L 8 24 L 17 34" {...STROKE} variants={drawVariants} custom={0} />
          {/* Right bracket  >  */}
          <motion.path d="M 31 14 L 40 24 L 31 34" {...STROKE} variants={drawVariants} custom={1} />
          {/* Middle slash  /  */}
          <motion.line x1="28" y1="10" x2="20" y2="38" {...STROKE} variants={drawVariants} custom={2} />
        </>
      )}

      {kind === "deliver" && (
        <>
          {/* Paper plane outline */}
          <motion.path
            d="M 6 22 L 42 10 L 30 38 L 22 28 Z"
            {...STROKE}
            variants={drawVariants}
            custom={0}
          />
          {/* Inner fold line */}
          <motion.line x1="22" y1="28" x2="42" y2="10" {...STROKE} variants={drawVariants} custom={1} />
        </>
      )}
    </motion.svg>
  );
}
