"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { currentProjects, type ProjectStatus } from "@/data/about";
import { useT } from "@/lib/i18n/LocaleProvider";

const statusColors: Record<ProjectStatus, { dot: string; text: string; line: string }> = {
  live: { dot: "bg-success",   text: "text-success",   line: "border-success/40" },
  dev:  { dot: "bg-brand-500", text: "text-brand-500", line: "border-brand-500/40" },
  mvp:  { dot: "bg-amber-400", text: "text-amber-500", line: "border-amber-400/40" },
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
          className="mb-14"
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

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              >
                {i > 0 && <div className="border-t border-border-soft my-10" />}

                <div className={`ps-5 border-s-2 ${cfg.line}`}>
                  {/* Status */}
                  <div className={`flex items-center gap-1.5 mb-3 text-xs font-semibold ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {label}
                  </div>

                  {/* Title row */}
                  <div className="flex items-baseline gap-3 flex-wrap mb-2">
                    <h3 className="text-xl font-bold text-heading">{item.title}</h3>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:underline underline-offset-2"
                      >
                        View live <ExternalLink size={11} />
                      </a>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-body text-sm leading-relaxed mb-4 max-w-2xl">{item.description}</p>

                  {/* Stack */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex px-2.5 py-1 rounded-md bg-bg-soft text-muted-text text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
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
