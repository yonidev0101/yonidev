"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useT } from "@/lib/i18n/LocaleProvider";

const STAGGER   = 0.010; // seconds per character
const HDR_DONE  = 0.65;  // header fade-in finishes at this time
const PARA_GAP  = 0.30;  // pause between paragraphs
const QUOTE_DUR = 0.50;  // pull-quote slide-in duration

const charVariant = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

function TypedParagraph({
  text,
  delay,
  started,
}: {
  text: string;
  delay: number;
  started: boolean;
}) {
  return (
    <motion.p
      className="text-body leading-relaxed text-[1.0625rem]"
      initial="hidden"
      animate={started ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: STAGGER, delayChildren: delay } },
      }}
    >
      {text.split("").map((char, i) => (
        <motion.span key={i} variants={charVariant} style={{ display: "inline" }}>
          {char}
        </motion.span>
      ))}
    </motion.p>
  );
}

export default function MyStory() {
  const t = useT();
  const s = t.about.story;

  const ref = useRef<HTMLDivElement>(null);
  const started = useInView(ref, { once: true, margin: "-80px" });

  // Sequential delays — each paragraph starts exactly when the previous one finishes
  const p1Delay    = HDR_DONE;
  const p2Delay    = p1Delay   + s.p1.length * STAGGER + PARA_GAP;
  const quoteDelay = p2Delay   + s.p2.length * STAGGER + 0.15;
  const p3Delay    = quoteDelay + QUOTE_DUR + 0.20;
  const p4Delay    = p3Delay   + s.p3.length * STAGGER + PARA_GAP;

  return (
    <section className="py-24 bg-bg-soft">
      <div ref={ref} className="container">
        <div className="max-w-3xl mx-auto">

          {/* Heading — fades in first, paragraphs start typing after it finishes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-14"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
              <span className="section-eyebrow">{s.eyebrow}</span>
            </div>
            <h2 className="section-heading">{s.heading}</h2>
          </motion.div>

          {/* Story — one paragraph at a time */}
          <div className="space-y-7">
            <TypedParagraph text={s.p1} delay={p1Delay} started={started} />
            <TypedParagraph text={s.p2} delay={p2Delay} started={started} />

            <motion.blockquote
              initial={{ opacity: 0, x: -16 }}
              animate={started ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: quoteDelay }}
              className="my-2 border-s-4 border-brand-500 ps-6 py-2"
            >
              <p className="text-xl font-semibold text-heading italic leading-relaxed">
                &ldquo;{s.pullQuote}&rdquo;
              </p>
            </motion.blockquote>

            <TypedParagraph text={s.p3} delay={p3Delay} started={started} />
            <TypedParagraph text={s.p4} delay={p4Delay} started={started} />
          </div>

        </div>
      </div>
    </section>
  );
}
