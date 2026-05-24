"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

export default function RevealText({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className={`block${className ? ` ${className}` : ""}`}
        initial={{ y: "110%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}
