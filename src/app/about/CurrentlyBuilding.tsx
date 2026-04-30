"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { currentProjects, type ProjectStatus } from "@/data/about";
import { useT } from "@/lib/i18n/LocaleProvider";

const statusColors: Record<ProjectStatus, { dot: string; text: string }> = {
  live: { dot: "bg-success",   text: "text-success" },
  dev:  { dot: "bg-brand-500", text: "text-brand-500" },
  mvp:  { dot: "bg-amber-400", text: "text-amber-500" },
};

export default function CurrentlyBuilding() {
  const t = useT();
  const b = t.about.building;

  const statusLabel: Record<ProjectStatus, string> = {
    live: b.statusLive,
    dev:  b.statusDev,
    mvp:  b.statusMvp,
  };

  return (
    <section className="py-24 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-16 max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
            <span className="section-eyebrow">{b.eyebrow}</span>
          </div>
          <h2 className="section-heading">{b.heading}</h2>
        </motion.div>

        <div>
          {currentProjects.map((project, i) => {
            const item = b.items[project.id as keyof typeof b.items];
            const cfg = statusColors[project.status];
            const label = statusLabel[project.status];
            const isLast = i === currentProjects.length - 1;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
                className={`group ${isLast ? "" : "border-b border-border-soft"}`}
              >
                <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[96px_1fr] gap-x-6 sm:gap-x-10 py-10 sm:py-12 transition-colors">
                  {/* Big number */}
                  <span className="text-5xl sm:text-7xl font-light text-slate-200 tabular-nums leading-none select-none transition-colors group-hover:text-brand-500/30">
                    0{i + 1}
                  </span>

                  {/* Content */}
                  <div className="min-w-0">
                    {/* Title row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                      <h3 className="text-2xl sm:text-3xl font-bold text-heading tracking-tight">
                        {item.title}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-body leading-relaxed mb-5 max-w-2xl">
                      {item.description}
                    </p>

                    {/* Stack + link */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                      <p className="text-xs font-medium text-muted-text tracking-wide">
                        {project.stack.join(" · ")}
                      </p>

                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ms-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:gap-2 transition-all"
                        >
                          View live
                          <ArrowUpRight size={14} className="rtl:-scale-x-100" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
