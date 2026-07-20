"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * The "am I working right now" control for a single personal task.
 * Starting a session also moves the task to in_progress, so the board never
 * disagrees with the timer.
 */
export default function PersonalTaskSession({
  taskId,
  projectId,
  taskStatus,
  activeSession,
}: {
  taskId: number;
  projectId: number;
  taskStatus: string;
  activeSession: { id: number; startedAt: string } | null;
}) {
  const router = useRouter();
  const [active, setActive] = useState(activeSession);
  const [elapsed, setElapsed] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!active) return;
    const startMs = new Date(active.startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  async function start() {
    setBusy(true);
    const res = await fetch("/api/admin/personal-time/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, taskId, note: note || null }),
    });
    if (res.ok) {
      const data = await res.json();
      setActive({ id: data.entry.id, startedAt: data.entry.startedAt });
      setNote("");
      // Moving to in_progress here keeps status honest without a second click.
      if (taskStatus === "todo" || taskStatus === "waiting" || taskStatus === "blocked") {
        await fetch(`/api/admin/personal-tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "in_progress" }),
        });
      }
      toast.success("התחלת לעבוד");
      router.refresh();
    } else {
      toast.error("נכשל להתחיל טיימר");
    }
    setBusy(false);
  }

  async function stop() {
    setBusy(true);
    const res = await fetch("/api/admin/personal-time/timer", { method: "PATCH" });
    if (res.ok) {
      setActive(null);
      setElapsed(0);
      toast.success("הסשן נסגר — אל תשכח לתעד מה עשית");
      router.refresh();
    } else {
      toast.error("עצירת טיימר נכשלה");
    }
    setBusy(false);
  }

  if (active) {
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    return (
      <div
        className="rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] p-4 flex items-center justify-between gap-4 flex-wrap"
        dir="rtl"
      >
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
            עובד עכשיו
          </span>
          <div className="font-mono text-[24px] font-bold text-[#0F172A] tabular-nums mt-1" dir="ltr">
            {h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`}
          </div>
        </div>
        <button
          onClick={stop}
          disabled={busy}
          className="rounded-full bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-50 text-white text-[13px] font-semibold px-6 py-2.5"
        >
          ⏹ סיים סשן
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl bg-white border border-[#E2E8F0] p-4 flex items-center gap-3 flex-wrap"
      dir="rtl"
    >
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="על מה אתה מתחיל לעבוד עכשיו? (לא חובה)"
        className="flex-1 min-w-[220px] border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
      />
      <button
        onClick={start}
        disabled={busy}
        className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-6 py-2.5"
      >
        ▶ התחל לעבוד
      </button>
    </div>
  );
}
