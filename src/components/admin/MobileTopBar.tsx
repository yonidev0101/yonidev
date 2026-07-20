"use client";

import Link from "next/link";
import Image from "next/image";
import { formatElapsed } from "@/lib/admin/format";
import { DOMAIN_ACCENT, routes } from "@/lib/admin/domain";
import { useLiveTimer, useElapsed } from "@/lib/admin/useLiveTimer";

export default function MobileTopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  // Same hook the sidebar uses, so mobile can never show a different picture —
  // including personal timers, which this bar used to be blind to.
  const { active } = useLiveTimer();
  const running = active[0] ?? null;
  const elapsed = useElapsed(running?.startedAt ?? null);

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
        {running ? (
          <Link
            href={
              running.taskId
                ? routes(running.domain).taskDetail(running.taskId)
                : routes(running.domain).projectDetail(running.projectId)
            }
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 border ${
              running.domain === "personal"
                ? "bg-[#F5F3FF] border-[#DDD6FE]"
                : "bg-[#EFF6FF] border-[#BFDBFE]"
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: DOMAIN_ACCENT[running.domain] }}
            />
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
