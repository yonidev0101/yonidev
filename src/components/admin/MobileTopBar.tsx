"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ActiveTimer {
  id: number;
  projectId: number;
  projectName: string;
  clientName: string;
  startedAt: string;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}h`;
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MobileTopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const [active, setActive] = useState<ActiveTimer | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      try {
        const res = await fetch("/api/admin/time/timer", { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) {
          setActive(null);
          return;
        }
        const json = await res.json();
        if (!cancelled) setActive(json.active ?? null);
      } catch {
        // ignore
      }
    };
    run();
    const id = setInterval(run, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const startMs = new Date(active.startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  return (
    <header
      className="md:hidden sticky top-0 z-30 h-13 flex items-center justify-between gap-3 px-4 bg-white border-b border-[#E2E8F0]"
      dir="rtl"
      style={{ height: 52 }}
    >
      <button
        onClick={onMenuOpen}
        aria-label="פתח תפריט"
        className="w-9 h-9 flex items-center justify-center rounded-md text-[#475569] hover:bg-[#F8FAFC]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <Link href="/admin" className="flex items-center gap-2 flex-1 justify-center">
        <Image src="/logo/y-logo.png" alt="" width={24} height={24} className="rounded-sm" />
        <span className="text-[13px] font-bold text-[#0F172A]">YoniDev</span>
        <span className="text-[10px] font-semibold tracking-[0.12em] text-[#94A3B8] uppercase">
          ניהול
        </span>
      </Link>

      <div className="w-[110px] flex justify-end">
        {active ? (
          <Link
            href={`/admin/projects/${active.projectId}`}
            className="inline-flex items-center gap-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full px-2.5 py-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2B7FFF] animate-pulse" />
            <span
              className="font-mono text-[12px] font-bold text-[#0F172A] tabular-nums"
              dir="ltr"
            >
              {formatElapsed(elapsed)}
            </span>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
