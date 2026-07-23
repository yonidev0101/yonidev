"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface ChecklistStep {
  id: number;
  title: string;
  done: boolean;
  sortOrder: number;
}

/**
 * A flat checklist inside a task — break a feature into concrete moves and tick
 * them off. Steps carry no status/timer of their own, and finishing them all does
 * NOT close the task; that stays a deliberate status change.
 */
export default function PersonalTaskChecklist({
  taskId,
  steps: initial,
}: {
  taskId: number;
  steps: ChecklistStep[];
}) {
  const router = useRouter();
  const [steps, setSteps] = useState<ChecklistStep[]>(initial);
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const done = steps.filter((s) => s.done).length;
  const total = steps.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  async function toggle(step: ChecklistStep) {
    const next = !step.done;
    // Optimistic — the checkbox must feel instant.
    setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, done: next } : s)));
    const res = await fetch(`/api/admin/personal-task-steps/${step.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: next }),
    });
    if (!res.ok) {
      setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, done: !next } : s)));
      toast.error("עדכון נכשל");
      return;
    }
    // Keep the project list's "✔ 3/7" badge in sync.
    router.refresh();
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setAdding(true);
    const res = await fetch("/api/admin/personal-task-steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, title: t }),
    });
    setAdding(false);
    if (res.ok) {
      const { step } = await res.json();
      setSteps((prev) => [...prev, step]);
      setTitle("");
      router.refresh();
    } else {
      toast.error("הוספת צעד נכשלה");
    }
  }

  async function del(id: number) {
    const prev = steps;
    setSteps((s) => s.filter((x) => x.id !== id));
    const res = await fetch(`/api/admin/personal-task-steps/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setSteps(prev);
      toast.error("מחיקה נכשלה");
      return;
    }
    router.refresh();
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
          צ׳קליסט
        </div>
        {total > 0 && (
          <span className="text-[12px] font-semibold tabular-nums text-[#0F172A]">
            {done}/{total}
          </span>
        )}
      </div>

      {total > 0 && (
        <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-[#2B7FFF] transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <ul className="space-y-1">
        {steps.map((s) => (
          <li key={s.id} className="group flex items-center gap-2.5 py-1">
            <button
              type="button"
              onClick={() => toggle(s)}
              aria-pressed={s.done}
              aria-label={s.done ? "בטל סימון" : "סמן כבוצע"}
              className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition ${
                s.done
                  ? "bg-[#2B7FFF] border-[#2B7FFF] text-white"
                  : "bg-white border-[#CBD5E1] hover:border-[#2B7FFF]"
              }`}
            >
              {s.done && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
            <span
              className={`flex-1 text-[14px] leading-snug ${
                s.done ? "text-[#94A3B8] line-through" : "text-[#0F172A]"
              }`}
            >
              {s.title}
            </span>
            <button
              type="button"
              onClick={() => del(s.id)}
              className="shrink-0 text-[12px] text-[#CBD5E1] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="מחק צעד"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="flex items-center gap-2 mt-2">
        <span className="shrink-0 w-4 h-4 rounded border border-dashed border-[#CBD5E1]" />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="הוסף צעד…"
          className="flex-1 bg-transparent text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none py-1"
        />
        {title.trim() && (
          <button
            type="submit"
            disabled={adding}
            className="shrink-0 text-[12px] font-semibold text-[#2B7FFF] hover:text-[#1d6fea] disabled:opacity-50"
          >
            הוסף
          </button>
        )}
      </form>
    </div>
  );
}
