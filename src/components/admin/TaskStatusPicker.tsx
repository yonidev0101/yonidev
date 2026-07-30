"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TASK_STATUS_HE, TASK_STATUS_TONE } from "@/lib/admin/format";

const STATUS_ORDER = [
  "todo",
  "in_progress",
  "waiting",
  "blocked",
  "done",
  "canceled",
] as const;

type Status = (typeof STATUS_ORDER)[number];

/**
 * The status chip, made clickable. One click on the task screen moves a task
 * between סטטוסים — the edit panel and the update form stay for the cases where
 * the change needs context (ממתין ל…, לוג התקדמות).
 *
 * `kind` picks the API: client tasks vs personal tasks have parallel routes.
 */
export default function TaskStatusPicker({
  taskId,
  status,
  kind,
}: {
  taskId: number;
  status: string;
  kind: "task" | "personal-task";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function pick(next: Status) {
    setOpen(false);
    if (next === status) return;
    setSaving(true);
    const base = kind === "task" ? "tasks" : "personal-tasks";
    const res = await fetch(`/api/admin/${base}/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(`הסטטוס שונה ל"${TASK_STATUS_HE[next]}"`);
      router.refresh();
    } else {
      toast.error("שינוי הסטטוס נכשל");
    }
  }

  return (
    <div ref={wrapRef} className="relative shrink-0" dir="rtl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={saving}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="שנה סטטוס"
        className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-opacity hover:opacity-80 disabled:opacity-50 ${TASK_STATUS_TONE[status]}`}
      >
        {saving ? "שומר…" : TASK_STATUS_HE[status]}
        <span aria-hidden className="text-[9px] opacity-70">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute end-0 top-full mt-1.5 z-30 w-40 rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-lg shadow-black/5"
        >
          {STATUS_ORDER.map((s) => {
            const active = s === status;
            return (
              <button
                key={s}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => pick(s)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-right transition-colors ${
                  active
                    ? "bg-[#F1F5F9] font-semibold text-[#0F172A]"
                    : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${TASK_STATUS_TONE[s].split(" ")[0]} ring-1 ring-inset ring-black/5`}
                  />
                  {TASK_STATUS_HE[s]}
                </span>
                {active && <span aria-hidden className="text-[#2B7FFF]">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
