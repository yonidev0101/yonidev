"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

export default function SectionReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.72, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
