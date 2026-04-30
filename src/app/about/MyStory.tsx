"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useT } from "@/lib/i18n/LocaleProvider";

// Real human-typing feel
const BASE_SPEED      = 26;   // ms per char — fast typist
const SPEED_VARIATION = 0.40; // ±40% randomness
const PAUSE_PERIOD    = 240;  // ms after .  !  ?
const PAUSE_COMMA     = 110;  // ms after ,  ;  :
const PAUSE_DASH      = 150;  // ms after — -
const PAUSE_EMOJI     = 180;  // ms after an emoji — like pausing to react
const HEADER_DURATION = 600;  // ms — wait for header to fade in before typing
const QUOTE_DURATION  = 550;  // ms — pull quote slide-in
const POST_QUOTE_GAP  = 280;  // ms — small pause after quote before resuming

function nextDelay(prevChar: string): number {
  const variation = 1 + (Math.random() - 0.5) * SPEED_VARIATION;
  const base = BASE_SPEED * variation;
  if (".!?".includes(prevChar))      return base + PAUSE_PERIOD;
  if (",;:".includes(prevChar))      return base + PAUSE_COMMA;
  if ("—-".includes(prevChar))       return base + PAUSE_DASH;
  // Emoji or any multi-codepoint grapheme — small pause to feel like reacting
  if (prevChar.length > 1)           return base + PAUSE_EMOJI;
  return base;
}

// Split text into grapheme clusters so emojis don't break mid-typing
function toGraphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

// 0-width inline marker — bar is rendered via absolutely-positioned child
// so the cursor never affects line wrapping or layout width.
function Cursor() {
  return (
    <span
      aria-hidden
      className="relative inline-block align-text-bottom"
      style={{ width: 0, height: "1em" }}
    >
      <span
        className="absolute start-0 top-0 h-full bg-brand-500 rounded-[1px]"
        style={{ width: 2, animation: "cursor-blink 0.55s step-end infinite" }}
      />
    </span>
  );
}

function TypedText({
  text,
  active,
  onDone,
}: {
  text: string;
  active: boolean;
  onDone: () => void;
}) {
  const chars = useMemo(() => toGraphemes(text), [text]);
  const [shown, setShown] = useState(0);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!active) return;

    let i = 0;
    let timer: number | undefined;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      i++;
      setShown(i);
      if (i >= chars.length) {
        onDoneRef.current();
        return;
      }
      timer = window.setTimeout(tick, nextDelay(chars[i - 1]));
    };

    // Tiny initial pause so the cursor blinks once before typing starts
    timer = window.setTimeout(tick, 120);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [active, chars]);

  const isTyping = active && shown < chars.length;
  const typed = chars.slice(0, shown).join("");
  const remaining = chars.slice(shown).join("");

  return (
    <p className="text-body leading-relaxed text-[1.0625rem]">
      {typed}
      {isTyping && <Cursor />}
      {/* Reserve full final layout so the paragraph doesn't grow as it types */}
      <span aria-hidden style={{ visibility: "hidden" }}>
        {remaining}
      </span>
    </p>
  );
}

type Phase = "idle" | "p1" | "p2" | "quote" | "p3" | "p4" | "done";

export default function MyStory() {
  const t = useT();
  const s = t.about.story;

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [phase, setPhase] = useState<Phase>("idle");

  // Start the chain after the header has finished fading in
  useEffect(() => {
    if (!inView) return;
    const id = setTimeout(() => setPhase("p1"), HEADER_DURATION);
    return () => clearTimeout(id);
  }, [inView]);

  // After p2 finishes, show the pull quote, then move to p3
  useEffect(() => {
    if (phase !== "quote") return;
    const id = setTimeout(() => setPhase("p3"), QUOTE_DURATION + POST_QUOTE_GAP);
    return () => clearTimeout(id);
  }, [phase]);

  const showQuote = phase === "quote" || phase === "p3" || phase === "p4" || phase === "done";

  return (
    <section className="py-24 bg-bg-soft">
      <div ref={ref} className="container">
        <div className="max-w-3xl mx-auto">

          {/* Heading — fades in first */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-14"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
              <span className="section-eyebrow">{s.eyebrow}</span>
            </div>
            <h2 className="section-heading">{s.heading}</h2>
          </motion.div>

          {/* Story — live typed, one paragraph after another */}
          <div className="space-y-7">
            <TypedText
              text={s.p1}
              active={phase === "p1"}
              onDone={() => setPhase("p2")}
            />
            <TypedText
              text={s.p2}
              active={phase === "p2"}
              onDone={() => setPhase("quote")}
            />

            {showQuote && (
              <motion.blockquote
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: QUOTE_DURATION / 1000, ease: "easeOut" }}
                className="my-2 border-s-4 border-brand-500 ps-6 py-2"
              >
                <p className="text-xl font-semibold text-heading italic leading-relaxed">
                  &ldquo;{s.pullQuote}&rdquo;
                </p>
              </motion.blockquote>
            )}

            <TypedText
              text={s.p3}
              active={phase === "p3"}
              onDone={() => setPhase("p4")}
            />
            <TypedText
              text={s.p4}
              active={phase === "p4"}
              onDone={() => setPhase("done")}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
