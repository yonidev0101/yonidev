"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/LocaleProvider";

const charVariant = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

function TypeLine({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.p
      className="text-body leading-relaxed text-[1.0625rem]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.012, delayChildren: delay } },
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

  return (
    <section className="py-24 bg-bg-soft">
      <div className="container">
        <div className="max-w-3xl mx-auto">

          {/* Header — fade in first, before the typing starts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-14"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
              <span className="section-eyebrow">{s.eyebrow}</span>
            </div>
            <h2 className="section-heading">{s.heading}</h2>
          </motion.div>

          {/* Paragraphs — character-by-character, each independent on scroll */}
          {/* First paragraph waits for header to finish (delay 0.55s) */}
          <div className="space-y-7">
            <TypeLine text={s.p1} delay={0.55} />
            <TypeLine text={s.p2} />

            <motion.blockquote
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="my-2 border-s-4 border-brand-500 ps-6 py-2"
            >
              <p className="text-xl font-semibold text-heading italic leading-relaxed">
                &ldquo;{s.pullQuote}&rdquo;
              </p>
            </motion.blockquote>

            <TypeLine text={s.p3} />
            <TypeLine text={s.p4} />
          </div>

        </div>
      </div>
    </section>
  );
}
