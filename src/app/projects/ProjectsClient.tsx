"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ArrowRight, ChevronRight } from "lucide-react";
import { projects, type Project } from "@/data/projects";
import { RadialBlob } from "@/components/shared/BackgroundDeco";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ScrambleText from "@/components/shared/ScrambleText";
import type { TranslationDict } from "@/lib/i18n/translations";

type Filter = "all" | Project["category"];
const ALL_FILTERS: Filter[] = ["all", "web", "ai", "bot", "automation"];

const CATEGORY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  web:        { bg: "bg-blue-50",   text: "text-blue-600",   label: "Web" },
  ai:         { bg: "bg-violet-50", text: "text-violet-600", label: "AI" },
  bot:        { bg: "bg-emerald-50",text: "text-emerald-600",label: "Bot" },
  automation: { bg: "bg-amber-50",  text: "text-amber-600",  label: "Automation" },
};

/* ─── BrowserWindowCard ──────────────────────────────────────────── */
function BrowserWindowCard({
  project,
  t,
  tp,
}: {
  project: Project;
  t: TranslationDict;
  tp: TranslationDict["projectsPage"];
}) {
  const item = t.projects.items[project.slug];
  const cat  = CATEGORY_STYLE[project.category] ?? { bg: "bg-bg-soft", text: "text-body", label: project.category };

  return (
    <div className="rounded-3xl bg-white border border-border shadow-[0_24px_60px_-15px_rgba(15,23,42,0.12)] overflow-hidden">
      {/* Traffic-light bar */}
      <div className="flex items-center gap-2 px-5 py-3.5 bg-[#F8FAFC] border-b border-border-soft shrink-0">
        <span className="w-3 h-3 rounded-full bg-[#FF5F56]/60" />
        <span className="w-3 h-3 rounded-full bg-[#FFBD2E]/60" />
        <span className="w-3 h-3 rounded-full bg-[#27C93F]/60" />
        <span className="ms-auto text-xs text-muted-text font-mono tracking-tight opacity-70">
          yonidev.io/{project.slug}
        </span>
      </div>

      {/* Screenshot */}
      <div className="relative aspect-video bg-gradient-to-br from-brand-50 to-brand-100 overflow-hidden">
        <Image
          src={project.image}
          alt={item.title}
          fill
          className="object-cover object-top"
          sizes="(max-width: 1024px) 100vw, 860px"
        />
        {/* Overlay — מייצר אחידות בין סקרינשוטים בגוון האתר */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(43,127,255,0.08) 0%, rgba(15,23,42,0.06) 100%)" }}
        />
      </div>

      {/* Info */}
      <div className="p-7 lg:p-9">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <span className={`inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 ${cat.bg} ${cat.text}`}>
              {cat.label}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-heading leading-tight">
              {item.title}
            </h2>
          </div>
        </div>

        <p className="text-body leading-relaxed mb-6 max-w-xl">{item.description}</p>

        {/* Stack pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="text-xs font-medium bg-bg-soft border border-border px-3 py-1.5 rounded-full text-body"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center flex-wrap gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-600 transition-colors shadow-[0_8px_20px_rgba(43,127,255,0.28)]"
            >
              {tp.viewLive}
              <ExternalLink size={13} />
            </a>
          )}
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-heading border border-border px-5 py-2.5 rounded-full hover:border-brand-500 hover:text-brand-500 transition-colors"
          >
            {tp.caseStudy}
            <ArrowRight size={13} className="rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page component ────────────────────────────────────────── */
export default function ProjectsClient() {
  const { t, dir } = useLocale();
  const isRTL = dir === "rtl";
  const tp = t.projectsPage;

  const [filter, setFilter]           = useState<Filter>("all");
  const [activeIndex, setActiveIndex] = useState(0);

  const handleFilterChange = (f: Filter) => {
    setFilter(f);
    setActiveIndex(0);
  };

  const counts: Record<Filter, number> = {
    all:        projects.length,
    web:        projects.filter((p) => p.category === "web").length,
    ai:         projects.filter((p) => p.category === "ai").length,
    bot:        projects.filter((p) => p.category === "bot").length,
    automation: projects.filter((p) => p.category === "automation").length,
  };

  const visibleFilters = ALL_FILTERS.filter(
    (f) => f === "all" || counts[f] > 0
  );

  const filteredProjects =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  const activeProject = filteredProjects[activeIndex] ?? filteredProjects[0];

  return (
    <div className="bg-bg-soft">

      {/* ── Hero strip ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <RadialBlob className="-top-40 -end-16" size={520} opacity={0.04} />

        <div className="container relative">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="section-eyebrow mb-3"
            >
              {tp.eyebrow}
            </motion.p>
            <h1 className="section-heading mb-4">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.78, ease: [0.33, 1, 0.68, 1], delay: 0.18 }}
                >
                  <ScrambleText text={tp.headingLine1} delay={0.2} duration={1.2} />
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.78, ease: [0.33, 1, 0.68, 1], delay: 0.3 }}
                >
                  <ScrambleText text={tp.headingLine2} delay={0.32} duration={1.2} className="text-brand-500" />
                </motion.span>
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.48 }}
              className="section-body mb-8 max-w-md"
            >
              {tp.body}
            </motion.p>

            {/* Filter chips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
              className="flex flex-wrap gap-2"
            >
              {visibleFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    filter === f
                      ? "bg-brand-500 text-white shadow-[0_4px_14px_rgba(43,127,255,0.32)]"
                      : "bg-white border border-border text-body hover:border-brand-500 hover:text-brand-500"
                  }`}
                >
                  {tp.filters[f]}
                  {counts[f] > 0 && (
                    <span
                      className={`ms-1.5 text-xs font-medium ${
                        filter === f ? "opacity-70" : "opacity-50"
                      }`}
                    >
                      {counts[f]}
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Main content ───────────────────────────────────────── */}
      <section className="container pb-28 relative">

        {/* Big background number — section-level watermark */}
        {activeProject && (
          <AnimatePresence mode="wait">
            <motion.span
              key={`bg-num-${activeIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute -top-6 end-0 text-[22rem] font-black leading-none select-none pointer-events-none text-heading/[0.028] z-0 hidden lg:block"
              aria-hidden
            >
              {String(activeIndex + 1).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        )}

        {/* Desktop: Index ↔ Canvas split */}
        <div className="hidden lg:grid lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] lg:gap-14 xl:gap-20 lg:items-start relative z-10">

          {/* ── Left: sticky index ────────────────────────── */}
          <nav
            className="sticky top-24 self-start"
            aria-label="Project index"
          >
            <p className="text-xs text-muted-text mb-5 font-medium">
              {filteredProjects.length}{" "}
              {filter !== "all" ? tp.filters[filter] + " " : ""}
              {filteredProjects.length === 1 ? "project" : "projects"}
            </p>

            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((p, i) => {
                  const item     = t.projects.items[p.slug];
                  const isActive = i === activeIndex;

                  return (
                    <motion.button
                      key={p.slug}
                      layout
                      initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isRTL ? -12 : 12 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      onClick={() => setActiveIndex(i)}
                      className={`group relative w-full flex items-start gap-4 px-4 py-4 rounded-2xl text-start transition-colors duration-200 ${
                        isActive
                          ? "bg-white shadow-[0_4px_20px_-6px_rgba(15,23,42,0.10)]"
                          : "hover:bg-white/70"
                      }`}
                    >
                      {/* Sliding active bar */}
                      {isActive && (
                        <motion.span
                          layoutId="activeBar"
                          className="absolute start-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-brand-500 rounded-full"
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      )}

                      {/* Index number */}
                      <span
                        className={`text-2xl font-black tracking-tighter leading-none shrink-0 select-none transition-colors duration-200 ${
                          isActive
                            ? "text-brand-500"
                            : "text-heading/[0.12] group-hover:text-heading/25"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold leading-snug transition-colors duration-200 ${
                            isActive
                              ? "text-heading"
                              : "text-body group-hover:text-heading"
                          }`}
                        >
                          {item.title}
                        </p>

                        {/* Animated tech tags */}
                        <motion.div
                          initial={false}
                          animate={{
                            height: isActive ? "auto" : 0,
                            opacity: isActive ? 1 : 0,
                          }}
                          transition={{ duration: 0.28, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {p.stack.slice(0, 3).map((tech) => (
                              <span
                                key={tech}
                                className="text-xs text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      </div>

                      <ChevronRight
                        size={15}
                        className={`mt-0.5 shrink-0 transition-all duration-200 rtl:rotate-180 ${
                          isActive
                            ? "text-brand-500 translate-x-0.5 rtl:-translate-x-0.5"
                            : "text-muted-text"
                        }`}
                      />
                    </motion.button>
                  );
                })}
              </AnimatePresence>

              {filteredProjects.length === 0 && (
                <p className="text-body text-sm py-10 text-center">{tp.noProjects}</p>
              )}
            </div>
          </nav>

          {/* ── Right: canvas ─────────────────────────────── */}
          <div className="relative min-h-[600px]">
            <RadialBlob className="top-1/4 -end-24" size={460} opacity={0.05} />

            {activeProject && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProject.slug}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.38, ease: "easeOut" }}
                >
                  <BrowserWindowCard project={activeProject} t={t} tp={tp} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Mobile: stacked cards */}
        <div className="lg:hidden space-y-10">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((p, i) => (
              <motion.div
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, delay: i * 0.07, ease: "easeOut" }}
                className="relative"
              >
                <span
                  className="absolute -top-5 end-1 text-8xl font-black leading-none select-none pointer-events-none text-heading/[0.04] z-0"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative z-10">
                  <BrowserWindowCard project={p} t={t} tp={tp} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredProjects.length === 0 && (
            <p className="text-body text-sm py-10 text-center">{tp.noProjects}</p>
          )}
        </div>
      </section>

      {/* ── Workshop section ───────────────────────────────────── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <RadialBlob className="-bottom-20 start-1/3" size={380} opacity={0.04} />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="section-eyebrow mb-3">{tp.workshopEyebrow}</p>
            <h2 className="section-heading mb-2">{tp.workshopHeading}</h2>
            <p className="section-body mb-10">{tp.workshopBody}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg">
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{ duration: 0.45, delay: i * 0.1, ease: "easeOut" }}
                className="rounded-2xl border-2 border-dashed border-border p-5 bg-bg-soft"
              >
                <div className="aspect-video rounded-xl bg-gradient-to-br from-border-soft to-brand-50 mb-4 flex items-center justify-center">
                  <span className="text-xs text-muted-text font-semibold tracking-widest uppercase">
                    Soon
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 w-24 bg-border rounded-full" />
                  <div className="h-2 w-36 bg-border-soft rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
