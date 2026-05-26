"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ActiveTimer {
  id: number;
  projectId: number;
  projectName: string;
  clientName: string;
  startedAt: string;
}

interface ProjectOption {
  id: number;
  name: string;
  clientName: string | null;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function LiveTimer() {
  const router = useRouter();
  const [active, setActive] = useState<ActiveTimer | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [note, setNote] = useState("");
  const [starting, setStarting] = useState(false);

  // ── Poll active timer every 30s + tick once per second when one runs ──
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
        // network blip — keep last state
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

  // ── Fetch project list once, but only when no timer is active (the picker is hidden otherwise) ──
  useEffect(() => {
    if (active) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/projects?status=active", { cache: "no-store" });
        if (cancelled) return;
        const json = await res.json();
        if (!cancelled) setProjects(json.projects ?? []);
      } catch {
        // ignore; the dropdown will just be empty
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active]);

  async function start() {
    const projectId = Number(selectedProjectId);
    if (!projectId) return;
    setStarting(true);
    const res = await fetch("/api/admin/time/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, note: note || null }),
    });
    setStarting(false);
    if (res.ok) {
      const json = await res.json();
      const project = projects.find((p) => p.id === projectId);
      setActive({
        id: json.entry.id,
        projectId,
        projectName: project?.name ?? "",
        clientName: project?.clientName ?? "",
        startedAt: json.entry.startedAt,
      });
      setNote("");
      setSelectedProjectId("");
      toast.success("הטיימר התחיל");
      router.refresh();
    } else {
      toast.error("נכשל להתחיל טיימר");
    }
  }

  async function stop() {
    const res = await fetch("/api/admin/time/timer", { method: "PATCH" });
    if (res.ok) {
      setActive(null);
      setElapsed(0);
      toast.success("הטיימר נעצר");
      router.refresh();
    } else {
      toast.error("עצירת טיימר נכשלה");
    }
  }

  if (!active) {
    return (
      <div className="space-y-2" dir="rtl">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-1">
          טיימר
        </div>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full text-[12px] border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-2 py-1.5"
        >
          <option value="">— בחר פרויקט —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.clientName ? `${p.clientName} · ${p.name}` : p.name}
            </option>
          ))}
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="הערה (אופציונלי)"
          className="w-full text-[12px] border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-2 py-1.5"
        />
        <button
          onClick={start}
          disabled={!selectedProjectId || starting}
          className="w-full rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold py-1.5 transition"
        >
          {starting ? "מתחיל..." : "▶ התחל טיימר"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] p-3" dir="rtl">
      <div className="flex items-center justify-between mb-1">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#2B7FFF] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2B7FFF] animate-pulse" />
          פעיל
        </span>
        <button onClick={stop} className="text-[11px] font-semibold text-[#dc2626] hover:underline">
          עצור
        </button>
      </div>
      <div
        className="font-mono text-[20px] font-bold text-[#0F172A] tabular-nums tracking-tight"
        dir="ltr"
        style={{ textAlign: "right" }}
      >
        {formatElapsed(elapsed)}
      </div>
      <div className="text-[12px] text-[#475569] truncate mt-0.5">{active.projectName}</div>
      <div className="text-[10px] text-[#94A3B8] truncate">{active.clientName}</div>
    </div>
  );
}
