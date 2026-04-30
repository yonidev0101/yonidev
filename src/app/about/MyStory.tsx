"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/LocaleProvider";

const wordVariants = {
  hidden: { opacity: 0, filter: "blur(6px)", y: 3 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

function WritingParagraph({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  const words = text.split(" ");
  return (
    <motion.p
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.03, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={wordVariants} style={{ display: "inline-block", marginInlineEnd: "0.28em" }}>
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}

export default function MyStory() {
  const t = useT();
  const s = t.about.story;

  return (
    <section className="py-24 bg-bg-soft">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
              <span className="section-eyebrow">{s.eyebrow}</span>
            </div>
            <h2 className="section-heading">{s.heading}</h2>
          </motion.div>

          {/* Story paragraphs */}
          <div className="space-y-6 text-body leading-relaxed text-[1.0625rem]">
            <WritingParagraph text={s.p1} />
            <WritingParagraph text={s.p2} />

            {/* Pull quote */}
            <motion.blockquote
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="my-8 border-s-4 border-brand-500 ps-6 py-2"
            >
              <p className="text-xl font-semibold text-heading italic leading-relaxed">
                &ldquo;{s.pullQuote}&rdquo;
              </p>
            </motion.blockquote>

            <WritingParagraph text={s.p3} />
            <WritingParagraph text={s.p4} />
          </div>
        </div>
      </div>
    </section>
  );
}
