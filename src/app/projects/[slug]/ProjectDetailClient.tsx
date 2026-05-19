"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Terminal,
  Copy,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { type Project } from "@/data/projects";
import { projectDetails } from "@/data/projectDetails";
import { RadialBlob } from "@/components/shared/BackgroundDeco";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const CATEGORY_STYLE: Record<string, { bg: string; text: string }> = {
  web:        { bg: "bg-blue-50",    text: "text-blue-600" },
  ai:         { bg: "bg-violet-50",  text: "text-violet-600" },
  bot:        { bg: "bg-emerald-50", text: "text-emerald-600" },
  automation: { bg: "bg-amber-50",   text: "text-amber-600" },
};

/* ─── Copy button ────────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-colors"
      aria-label="Copy command"
    >
      {copied
        ? <Check size={13} className="text-emerald-400" />
        : <Copy size={13} />}
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
interface Props {
  project:     Project;
  prevProject: Project;
  nextProject: Project;
}

export default function ProjectDetailClient({ project, prevProject, nextProject }: Props) {
  const { t, locale, dir } = useLocale();
  const isRTL = dir === "rtl";
  const td    = t.projectDetail;

  const detail = projectDetails[locale][project.slug];
  const cat    = CATEGORY_STYLE[project.category] ?? { bg: "bg-bg-soft", text: "text-body" };

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft  : ChevronRight;

  const fadeUp = (delay = 0) => ({
    initial:     { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport:    { once: true },
    transition:  { duration: 0.5, ease: "easeOut", delay },
  });

  return (
    <div className="bg-bg-soft">

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-0 overflow-hidden bg-bg-soft">
        <RadialBlob className="-top-40 -end-16" size={520} opacity={0.04} />
        <RadialBlob className="top-1/2 start-0"  size={360} opacity={0.03} />

        <div className="container relative">

          {/* Back link */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-body hover:text-heading transition-colors mb-10 group"
          >
            <ArrowLeft
              size={14}
              className="rtl:-scale-x-100 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform"
            />
            {td.backToProjects}
          </Link>

          {/* Title block */}
          <div className="max-w-2xl mb-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className={`inline-block text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full mb-5 ${cat.bg} ${cat.text}`}>
                {project.category}
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-heading leading-tight mb-4">
                {t.projects.items[project.slug].title}
              </h1>
              <p className="text-lg text-body leading-relaxed mb-8">
                {detail.tagline}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
              className="flex flex-wrap gap-3"
            >
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-600 transition-colors shadow-[0_8px_20px_rgba(43,127,255,0.28)]"
                >
                  {td.liveSite} <ExternalLink size={13} />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-border text-heading px-5 py-2.5 rounded-full text-sm font-semibold hover:border-brand-500 hover:text-brand-500 transition-colors"
                >
                  {td.sourceCode}
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
              )}
            </motion.div>
          </div>

          {/* Screenshot — browser window */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
            className="rounded-t-3xl overflow-hidden shadow-[0_-12px_60px_-10px_rgba(15,23,42,0.12)] border border-border border-b-0"
          >
            <div className="flex items-center gap-2 px-5 py-3.5 bg-[#F8FAFC] border-b border-border-soft">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56]/60" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E]/60" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F]/60" />
              <span className="ms-auto text-xs text-muted-text font-mono tracking-tight">
                yonidev.io/{project.slug}
              </span>
            </div>
            <div className="relative aspect-video bg-gradient-to-br from-brand-50 to-brand-100 overflow-hidden">
              <Image
                src={project.image}
                alt={t.projects.items[project.slug].title}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(135deg, rgba(43,127,255,0.08) 0%, rgba(15,23,42,0.06) 100%)" }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTENT ────────────────────────────────────────────── */}
      <div className="bg-white">

        {/* Overview + Tech Stack */}
        <section className="container py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-16">
            <motion.div {...fadeUp()}>
              <p className="section-eyebrow mb-3">{td.overview}</p>
              <p className="text-lg text-body leading-relaxed">{detail.overview}</p>
            </motion.div>

            <motion.div {...fadeUp(0.1)}>
              <p className="section-eyebrow mb-4">{td.techStack}</p>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-sm font-medium bg-bg-soft border border-border px-3 py-1.5 rounded-full text-body"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container"><div className="border-t border-border-soft" /></div>

        {/* Problem / Solution */}
        <section className="container py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              {...fadeUp()}
              className="p-8 rounded-2xl bg-bg-soft border border-border"
            >
              <p className="section-eyebrow mb-4">{td.problem}</p>
              <p className="text-body leading-relaxed">{detail.problem}</p>
            </motion.div>

            <motion.div
              {...fadeUp(0.1)}
              className="p-8 rounded-2xl bg-brand-50 border border-brand-100"
            >
              <p className="section-eyebrow mb-4">{td.solution}</p>
              <p className="text-body leading-relaxed">{detail.solution}</p>
            </motion.div>
          </div>
        </section>

        <div className="container"><div className="border-t border-border-soft" /></div>

        {/* Key Features */}
        <section className="container py-20">
          <motion.p {...fadeUp()} className="section-eyebrow mb-8">{td.features}</motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {detail.features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp(i * 0.07)}
                className="p-6 rounded-2xl bg-white border border-border hover:border-brand-200 hover:shadow-[0_8px_30px_-10px_rgba(43,127,255,0.1)] transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                </div>
                <h3 className="font-bold text-heading mb-2">{f.title}</h3>
                <p className="text-sm text-body leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Technical Highlights */}
        {detail.highlights.length > 0 && (
          <>
            <div className="container"><div className="border-t border-border-soft" /></div>
            <section className="container py-16">
              <motion.div {...fadeUp()} className="max-w-2xl">
                <p className="section-eyebrow mb-6">Technical Highlights</p>
                <ul className="space-y-3">
                  {detail.highlights.map((h, i) => (
                    <motion.li
                      key={h}
                      {...fadeUp(i * 0.06)}
                      className="flex items-start gap-3 text-body"
                    >
                      <span className="mt-1 w-4 h-4 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                        <Check size={10} className="text-brand-500" />
                      </span>
                      {h}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </section>
          </>
        )}

        <div className="container"><div className="border-t border-border-soft" /></div>

        {/* How to Run */}
        <section className="container py-20">
          <motion.div {...fadeUp()} className="max-w-2xl">
            <div className="flex items-center gap-2.5 mb-8">
              <Terminal size={16} className="text-brand-500" />
              <p className="section-eyebrow">{td.howToRun}</p>
            </div>

            {/* Prerequisites */}
            {detail.setup.prerequisites.length > 0 && (
              <div className="mb-8 p-5 rounded-2xl bg-bg-soft border border-border">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-text mb-3">
                  {td.prerequisites}
                </p>
                <ul className="space-y-1.5">
                  {detail.setup.prerequisites.map((req) => (
                    <li key={req} className="flex items-center gap-2 text-sm text-body">
                      <span className="w-1 h-1 rounded-full bg-brand-500 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps */}
            <div className="space-y-5">
              {detail.setup.steps.map((step, i) => (
                <motion.div key={step.label} {...fadeUp(i * 0.07)}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-6 h-6 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-xs font-black text-brand-500 shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-heading">{step.label}</span>
                  </div>

                  {step.command && (
                    <div className="ms-9 flex items-center gap-2 bg-slate-900 rounded-xl px-4 py-3 font-mono text-sm text-emerald-400 border border-slate-800">
                      <span className="text-slate-600 select-none me-1">$</span>
                      <span className="flex-1 break-all">{step.command}</span>
                      <CopyButton text={step.command} />
                    </div>
                  )}

                  {step.note && (
                    <p className="ms-9 mt-2 text-xs text-muted-text leading-relaxed">
                      {step.note}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

      </div>

      {/* ── PREV / NEXT ─────────────────────────────────────────── */}
      <section className="bg-white border-t border-border">
        <div className="container">
          <div className="grid grid-cols-2 divide-x divide-border rtl:divide-x-reverse">

            <Link
              href={`/projects/${prevProject.slug}`}
              className="group flex items-center gap-4 py-8 pe-8 hover:bg-bg-soft transition-colors"
            >
              <PrevIcon size={20} className="text-muted-text group-hover:text-brand-500 transition-colors shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-text mb-1">{td.prevProject}</p>
                <p className="font-bold text-heading truncate group-hover:text-brand-500 transition-colors">
                  {t.projects.items[prevProject.slug].title}
                </p>
              </div>
            </Link>

            <Link
              href={`/projects/${nextProject.slug}`}
              className="group flex items-center justify-end gap-4 py-8 ps-8 hover:bg-bg-soft transition-colors text-end"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-text mb-1">{td.nextProject}</p>
                <p className="font-bold text-heading truncate group-hover:text-brand-500 transition-colors">
                  {t.projects.items[nextProject.slug].title}
                </p>
              </div>
              <NextIcon size={20} className="text-muted-text group-hover:text-brand-500 transition-colors shrink-0" />
            </Link>

          </div>
        </div>
      </section>

    </div>
  );
}
