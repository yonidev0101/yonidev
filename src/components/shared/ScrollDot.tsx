"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Anchor =
  | "center"
  | "top" | "bottom" | "left" | "right"
  | "top-left" | "top-right"
  | "bottom-left" | "bottom-right";

type Waypoint = {
  selector: string;
  anchor?: Anchor;
  offsetX?: number;
  offsetY?: number;
};

// The path: real DOM anchors in scroll order.
// Each entry lives next to a meaningful piece of the UI.
const WAYPOINTS: Waypoint[] = [
  // Hero — emerge from the eyebrow dot
  { selector: '[data-scrolldot="hero-eyebrow"]', anchor: "center" },
  // Hero — swing across to the floating cards / character
  { selector: '[data-scrolldot="hero-image"]', anchor: "top-left", offsetX: 20, offsetY: 40 },
  // Stats — hover above the counters
  { selector: '[data-scrolldot="stats"]', anchor: "top", offsetY: -18 },
  // Services — pin next to the heading
  { selector: '[data-scrolldot="services-heading"]', anchor: "right", offsetX: 18 },
  // Services — drop onto the cards row
  { selector: '[data-scrolldot="services-cards"]', anchor: "left", offsetX: -18 },
  // Featured projects — top-right corner of the project card
  { selector: '[data-scrolldot="projects-cards"]', anchor: "top-right", offsetX: -12, offsetY: 16 },
  // Process — beside each step icon (we'll match all of them dynamically)
  { selector: '[data-scrolldot="process-0"]', anchor: "right", offsetX: 24 },
  { selector: '[data-scrolldot="process-2"]', anchor: "left", offsetX: -24 },
  // CTA — settle next to the button
  { selector: '[data-scrolldot="cta-button"]', anchor: "left", offsetX: -22 },
];

function anchorPoint(rect: DOMRect, anchor: Anchor = "center") {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  switch (anchor) {
    case "center":       return { x: cx, y: cy };
    case "top":          return { x: cx, y: rect.top };
    case "bottom":       return { x: cx, y: rect.bottom };
    case "left":         return { x: rect.left, y: cy };
    case "right":        return { x: rect.right, y: cy };
    case "top-left":     return { x: rect.left,  y: rect.top };
    case "top-right":    return { x: rect.right, y: rect.top };
    case "bottom-left":  return { x: rect.left,  y: rect.bottom };
    case "bottom-right": return { x: rect.right, y: rect.bottom };
  }
}

// Smooth ease for the inter-waypoint interpolation
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export default function ScrollDot() {
  // Target position (centered on anchor, in viewport coords).
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Three springs of decreasing stiffness — main dot, trail-1, trail-2.
  const sxFast = useSpring(x, { stiffness: 130, damping: 22, mass: 0.7 });
  const syFast = useSpring(y, { stiffness: 130, damping: 22, mass: 0.7 });
  const sxMid  = useSpring(x, { stiffness: 55,  damping: 17, mass: 0.9 });
  const syMid  = useSpring(y, { stiffness: 55,  damping: 17, mass: 0.9 });
  const sxSlow = useSpring(x, { stiffness: 26,  damping: 12, mass: 1.1 });
  const sySlow = useSpring(y, { stiffness: 26,  damping: 12, mass: 1.1 });

  useEffect(() => {
    type Resolved = { el: HTMLElement; wp: Waypoint; triggerY: number };
    let resolved: Resolved[] = [];

    const computeTrigger = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      // Scroll position at which this element's center crosses viewport center.
      return rect.top + window.scrollY + rect.height / 2 - window.innerHeight / 2;
    };

    const refresh = () => {
      resolved = WAYPOINTS
        .map((wp): Resolved | null => {
          const el = document.querySelector<HTMLElement>(wp.selector);
          if (!el) return null;
          return { el, wp, triggerY: computeTrigger(el) };
        })
        .filter((v): v is Resolved => v !== null)
        .sort((a, b) => a.triggerY - b.triggerY);
    };

    const targetFor = (r: Resolved) => {
      const pt = anchorPoint(r.el.getBoundingClientRect(), r.wp.anchor);
      return { x: pt.x + (r.wp.offsetX ?? 0), y: pt.y + (r.wp.offsetY ?? 0) };
    };

    const update = () => {
      if (resolved.length === 0) return;
      const scrollY = window.scrollY;

      // Find the latest waypoint whose trigger is past.
      let idx = 0;
      for (let i = 0; i < resolved.length; i++) {
        if (resolved[i].triggerY <= scrollY) idx = i;
        else break;
      }
      const cur = resolved[idx];
      const nxt = resolved[Math.min(idx + 1, resolved.length - 1)];

      const a = targetFor(cur);
      if (cur === nxt) {
        x.set(a.x);
        y.set(a.y);
        return;
      }
      const b = targetFor(nxt);
      const range = nxt.triggerY - cur.triggerY;
      const raw = range > 0 ? (scrollY - cur.triggerY) / range : 0;
      const t = ease(Math.min(1, Math.max(0, raw)));

      x.set(a.x + (b.x - a.x) * t);
      y.set(a.y + (b.y - a.y) * t);
    };

    refresh();
    update();

    // Refresh triggers after layout settles (fonts, images, lazy content).
    const settleTimers = [120, 400, 1200].map(d => window.setTimeout(() => { refresh(); update(); }, d));

    let raf = 0;
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(() => { queued = false; update(); });
    };
    const onResize = () => { refresh(); update(); };

    // Catch any layout shifts (e.g., section heights change as images load).
    const ro = new ResizeObserver(() => { refresh(); update(); });
    ro.observe(document.body);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      settleTimers.forEach(t => clearTimeout(t));
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [x, y]);

  // Tailwind translate classes get overwritten by Framer's transform, so we
  // center each dot via the wrapper that holds the visible circle.
  const wrap = "fixed top-0 left-0 z-40 pointer-events-none";
  const wrapMain = "fixed top-0 left-0 z-50 pointer-events-none";

  return (
    <div className="hidden lg:block" aria-hidden="true">
      {/* Trail 2 — slowest */}
      <motion.div className={wrap} style={{ x: sxSlow, y: sySlow }}>
        <div className="w-1.5 h-1.5 rounded-full bg-brand-500/25" style={{ marginLeft: -3, marginTop: -3 }} />
      </motion.div>

      {/* Trail 1 */}
      <motion.div className={wrap} style={{ x: sxMid, y: syMid }}>
        <div className="w-2 h-2 rounded-full bg-brand-500/45" style={{ marginLeft: -4, marginTop: -4 }} />
      </motion.div>

      {/* Main dot */}
      <motion.div className={wrapMain} style={{ x: sxFast, y: syFast }}>
        <div className="relative" style={{ marginLeft: -6, marginTop: -6 }}>
          <motion.div
            className="absolute -inset-3 rounded-full bg-brand-500/25"
            animate={{ scale: [1, 1.9, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="w-3 h-3 rounded-full bg-brand-500"
            style={{
              boxShadow:
                "0 0 0 2px rgba(255,255,255,0.85), 0 0 14px 4px rgba(43,127,255,0.6)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
