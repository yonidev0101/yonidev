"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { featuredProjects } from "@/data/projects";

const categoryColors: Record<string, string> = {
  web:        "bg-blue-50 text-blue-600",
  ai:         "bg-purple-50 text-purple-600",
  automation: "bg-orange-50 text-orange-600",
  bot:        "bg-green-50 text-green-600",
};

export default function FeaturedProjects() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + featuredProjects.length) % featuredProjects.length);
  const next = () => setCurrent((c) => (c + 1) % featuredProjects.length);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="section-eyebrow">Featured Work</p>
            <h2 className="section-heading">
              Projects That<br />Make an Impact
            </h2>
            <p className="section-body">
              A selection of recent work where ideas turned into powerful digital solutions.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:gap-3 transition-all"
            >
              See All Projects <ArrowRight size={14} />
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-brand-500 hover:text-brand-500 transition-colors"
                aria-label="Previous project"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors"
                aria-label="Next project"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-sm text-muted-text ml-1">
                {current + 1} / {featuredProjects.length}
              </span>
            </div>
          </motion.div>

          {/* Right — stacked cards */}
          <div className="relative h-[420px] sm:h-[460px]">
            <AnimatePresence mode="popLayout">
              {featuredProjects.map((project, i) => {
                const offset = i - current;
                const normalizedOffset =
                  ((offset % featuredProjects.length) + featuredProjects.length) %
                  featuredProjects.length;
                const isCurrent = normalizedOffset === 0;
                const isNext    = normalizedOffset === 1;
                const isAfter   = normalizedOffset === 2;

                if (!isCurrent && !isNext && !isAfter) return null;

                return (
                  <motion.div
                    key={project.slug}
                    layout
                    initial={{ opacity: 0, x: 60 }}
                    animate={{
                      opacity: isCurrent ? 1 : isNext ? 0.6 : 0.3,
                      x:       isCurrent ? 0  : isNext ? 28  : 48,
                      y:       isCurrent ? 0  : isNext ? 16  : 28,
                      scale:   isCurrent ? 1  : isNext ? 0.94 : 0.88,
                      zIndex:  isCurrent ? 30 : isNext ? 20  : 10,
                      rotate:  isCurrent ? 0  : isNext ? 2   : 3.5,
                    }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                    className="absolute inset-0 card-base overflow-hidden cursor-pointer"
                    onClick={() => isCurrent ? undefined : next()}
                  >
                    {/* Project image */}
                    <div className="relative h-[55%] bg-gradient-to-br from-brand-50 to-brand-100 overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        onError={() => {}} // gracefully handle missing images
                      />
                      {/* Category badge */}
                      <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryColors[project.category]}`}>
                        {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-heading text-lg mb-1">{project.title}</h3>
                      <p className="text-sm text-body line-clamp-2 mb-3">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5 flex-wrap">
                          {project.stack.slice(0, 3).map((s) => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                              {s}
                            </span>
                          ))}
                        </div>
                        <Link
                          href={`/projects/${project.slug}`}
                          className="p-1.5 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
