"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { featuredProjects } from "@/data/projects";
import { RadialBlob, FlowingCurves } from "@/components/shared/BackgroundDeco";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function FeaturedProjects() {
  const { t, dir } = useLocale();
  const isRTL = dir === "rtl";
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + featuredProjects.length) % featuredProjects.length);
  const next = () => setCurrent((c) => (c + 1) % featuredProjects.length);

  const stackOffsetSign = isRTL ? -1 : 1;

  // In RTL the visual "previous" arrow is the right-pointing chevron and vice versa.
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <FlowingCurves className="start-0 bottom-10 w-[55%] h-[280px]" opacity={0.5} />
      <RadialBlob className="-top-32 -end-20" size={460} opacity={0.05} />
      <RadialBlob className="bottom-10 start-1/3" size={320} opacity={0.04} />

      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-10 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 24 : -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="section-eyebrow">{t.projects.eyebrow}</p>
            <h2 className="section-heading">
              {t.projects.headingLine1}
              <br />
              {t.projects.headingLine2}
            </h2>
            <p className="section-body max-w-sm">{t.projects.body}</p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:gap-3 transition-all"
            >
              {t.projects.seeAll} <ArrowRight size={14} className="rtl:-scale-x-100" />
            </Link>

            <div className="flex items-center gap-3 pt-6">
              <button
                onClick={prev}
                className="w-11 h-11 rounded-full border border-border bg-white flex items-center justify-center hover:border-brand-500 hover:text-brand-500 transition-colors"
                aria-label={t.projects.prevAria}
              >
                <PrevIcon size={18} />
              </button>
              <button
                onClick={next}
                className="w-11 h-11 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors shadow-[0_8px_20px_rgba(43,127,255,0.35)]"
                aria-label={t.projects.nextAria}
              >
                <NextIcon size={18} />
              </button>
              <span className="text-sm text-muted-text ms-1 font-medium">
                {String(current + 1).padStart(2, "0")} / {String(featuredProjects.length).padStart(2, "0")}
              </span>
            </div>
          </motion.div>

          {/* Fanned cards */}
          <div className="relative h-[480px] sm:h-[520px]">
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

                const stackProps = isCurrent
                  ? { x: 0,                       y: 0,  scale: 1,    rotate: -2 * stackOffsetSign, zIndex: 30, opacity: 1   }
                  : isNext
                  ? { x: 95 * stackOffsetSign,    y: 14, scale: 0.96, rotate:  1 * stackOffsetSign, zIndex: 20, opacity: 0.85 }
                  : { x: 190 * stackOffsetSign,   y: 28, scale: 0.92, rotate:  3 * stackOffsetSign, zIndex: 10, opacity: 0.6  };

                const item = t.projects.items[project.slug];

                return (
                  <motion.div
                    key={project.slug}
                    layout
                    initial={{ opacity: 0, x: 80 * stackOffsetSign }}
                    animate={stackProps}
                    exit={{ opacity: 0, x: -80 * stackOffsetSign }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 max-w-[320px] sm:max-w-[340px] cursor-pointer"
                    onClick={() => (isCurrent ? undefined : next())}
                  >
                    <div className="relative h-full rounded-3xl bg-white border border-border shadow-[0_20px_50px_-15px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col">
                      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F8FAFC] border-b border-border-soft shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/60" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/60" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/60" />
                      </div>

                      <div className="relative bg-gradient-to-br from-brand-50 to-brand-100 aspect-[4/3] overflow-hidden">
                        <Image
                          src={project.image}
                          alt={item.title}
                          fill
                          className="object-cover object-top"
                          sizes="(max-width: 768px) 100vw, 340px"
                        />
                      </div>

                      <div className="p-5 sm:p-6 flex-1 flex flex-col">
                        <h3 className="font-bold text-heading text-lg leading-tight mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-body leading-relaxed line-clamp-3 flex-1">
                          {item.description}
                        </p>

                        <div className="flex justify-end mt-4">
                          <Link
                            href={`/projects/${project.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors shadow-[0_6px_16px_rgba(43,127,255,0.35)]"
                            aria-label={`${t.projects.viewAria} ${item.title}`}
                          >
                            <ArrowRight size={14} className="rtl:-scale-x-100" />
                          </Link>
                        </div>
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
