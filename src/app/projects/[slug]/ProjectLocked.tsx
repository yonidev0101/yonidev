"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";

interface Props {
  slug: string;
  stack: string[];
}

export default function ProjectLocked({ slug, stack }: Props) {
  return (
    <section className="min-h-[70vh] flex items-center justify-center py-24 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="max-w-lg mx-auto px-6 text-center"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 mb-8">
          <Lock size={22} className="text-slate-400" />
        </div>

        <h1 className="text-2xl font-bold text-heading mb-3">Pre-launch</h1>
        <p className="text-body leading-relaxed mb-8">
          This project is currently in active development and isn&apos;t public yet.
          Details will be available once it launches.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {stack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-500"
            >
              {tech}
            </span>
          ))}
        </div>

        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-500/70 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to projects
        </Link>
      </motion.div>
    </section>
  );
}
