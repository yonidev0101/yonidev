"use client";

import { motion, Variants } from "framer-motion";

export type FloatingIconKind = "code" | "db" | "cloud";

/**
 * Mirror of ProcessIcon's drawing effect, but for the hero (which is visible
 * on first paint — no scroll needed). Each shape strokes itself in starting
 * at `delay` seconds, with internal paths staggered after that.
 */
const drawVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.8, delay, ease: "easeInOut" },
      opacity: { duration: 0.2, delay },
    },
  }),
};

const STROKE = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function HeroFloatingIcon({
  kind,
  delay = 0,
}: {
  kind: FloatingIconKind;
  delay?: number;
}) {
  return (
    <motion.svg
      width="28"
      height="28"
      viewBox="0 0 48 48"
      className="text-brand-500"
      initial="hidden"
      animate="visible"
      aria-hidden
    >
      {kind === "code" && (
        <>
          {/* Left bracket  <  */}
          <motion.path
            d="M 18 14 L 8 24 L 18 34"
            {...STROKE}
            variants={drawVariants}
            custom={delay}
          />
          {/* Right bracket  >  */}
          <motion.path
            d="M 30 14 L 40 24 L 30 34"
            {...STROKE}
            variants={drawVariants}
            custom={delay + 0.25}
          />
          {/* Middle slash  /  */}
          <motion.line
            x1="28"
            y1="10"
            x2="20"
            y2="38"
            {...STROKE}
            variants={drawVariants}
            custom={delay + 0.5}
          />
        </>
      )}

      {kind === "db" && (
        <>
          {/* Top ellipse — the disc */}
          <motion.ellipse
            cx="24"
            cy="12"
            rx="12"
            ry="4"
            {...STROKE}
            variants={drawVariants}
            custom={delay}
          />
          {/* Left side */}
          <motion.path
            d="M 12 12 L 12 36"
            {...STROKE}
            variants={drawVariants}
            custom={delay + 0.2}
          />
          {/* Right side */}
          <motion.path
            d="M 36 12 L 36 36"
            {...STROKE}
            variants={drawVariants}
            custom={delay + 0.2}
          />
          {/* Bottom curve closing the cylinder */}
          <motion.path
            d="M 12 36 A 12 4 0 0 0 36 36"
            {...STROKE}
            variants={drawVariants}
            custom={delay + 0.4}
          />
          {/* Inner divider — suggests a data layer */}
          <motion.path
            d="M 12 24 A 12 4 0 0 0 36 24"
            {...STROKE}
            variants={drawVariants}
            custom={delay + 0.55}
          />
        </>
      )}

      {kind === "cloud" && (
        <motion.path
          d="M 14 34 Q 6 34 6 27 Q 6 19 15 19 Q 16 12 24 12 Q 33 12 34 20 Q 42 20 42 27 Q 42 34 34 34 Z"
          {...STROKE}
          variants={drawVariants}
          custom={delay}
        />
      )}
    </motion.svg>
  );
}
