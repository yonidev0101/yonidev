"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Database, Cloud } from "lucide-react";
import { RadialBlob, OrganicShape } from "@/components/shared/BackgroundDeco";

const floatingCards = [
  {
    icon: Code2,
    label: "</>",
    className: "top-[18%] -left-6",
    animClass: "float-card-1",
  },
  {
    icon: Database,
    label: "DB",
    className: "top-[28%] -right-4",
    animClass: "float-card-2",
  },
  {
    icon: Cloud,
    label: "Cloud",
    className: "bottom-[32%] right-2",
    animClass: "float-card-3",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
      {/* Background halo */}
      <div className="absolute inset-0 halo-blue pointer-events-none" />
      {/* Subtle grid dots */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #0F172A 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Soft blue blobs that bleed into next section */}
      <RadialBlob className="-bottom-32 -right-24" size={520} opacity={0.07} />
      <RadialBlob className="top-1/4 -left-32" size={380} opacity={0.05} />
      <OrganicShape className="-bottom-40 -right-32 w-[600px] h-[600px]" opacity={0.4} />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-6 items-center py-16 lg:py-24">
          {/* Left — Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-w-lg"
          >
            {/* Eyebrow */}
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
              <span className="section-eyebrow">Full Stack Developer</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-heading leading-[1.05] tracking-tight"
            >
              I Code.
              <br />
              <span className="bg-gradient-to-r from-brand-500 to-brand-400 bg-clip-text text-transparent">
                You Grow.
              </span>
            </motion.h1>

            {/* Body */}
            <motion.p variants={itemVariants} className="text-lg text-body leading-relaxed">
              Building modern, fast and scalable web applications,
              automations and AI-powered tools — from idea to production.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/projects"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-[0_8px_24px_rgba(43,127,255,0.3)] hover:shadow-[0_12px_32px_rgba(43,127,255,0.4)]"
              >
                View My Work <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-border text-heading font-semibold text-sm hover:border-brand-500 hover:text-brand-500 transition-colors"
              >
                Let&apos;s Work Together
              </Link>
            </motion.div>

            {/* Available */}
            <motion.div variants={itemVariants} className="flex items-center gap-2 pt-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
              <span className="text-sm text-body">Available for new projects</span>
            </motion.div>
          </motion.div>

          {/* Right — Y Logo + Floating Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-[340px] h-[400px] sm:w-[400px] sm:h-[460px]">
              {/* Soft glow behind logo */}
              <div className="absolute inset-[15%] rounded-full bg-brand-500/10 blur-3xl" />

              {/* Y Logo */}
              <div className="absolute inset-0 flex items-center justify-center pb-6 float-slow">
                <Image
                  src="/logo/y-logo.png"
                  alt="YoniDev Y logo"
                  width={260}
                  height={300}
                  className="object-contain drop-shadow-[0_24px_48px_rgba(43,127,255,0.25)]"
                  priority
                />
              </div>

              {/* Floating icon cards */}
              {floatingCards.map(({ icon: Icon, label, className, animClass }) => (
                <div
                  key={label}
                  className={`absolute ${className} ${animClass} card-base w-14 h-14 flex items-center justify-center`}
                >
                  <Icon size={24} className="text-brand-500" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
        <div className="w-0.5 h-10 bg-gradient-to-b from-brand-500 to-transparent rounded-full animate-pulse" />
      </div>
    </section>
  );
}
