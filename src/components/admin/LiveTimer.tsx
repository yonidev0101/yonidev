"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatElapsed } from "@/lib/admin/format";
import { DOMAIN_LABEL, DOMAIN_TONE, type Domain } from "@/lib/admin/domain";
import { useLiveTimer, useElapsed, type ActiveTimer } from "@/lib/admin/useLiveTimer";

interface ProjectOption {
  id: number;
  name: string;
  clientName?: string | null;
}

interface TaskOption {
  id: number;
  title: string;
  status: string;
}

export default function LiveTimer() {
  const router = useRouter();
  const { active, start, stop } = useLiveTimer();

  const [clientProjects, setClientProjects] = useState<ProjectOption[]>([]);
  const [personalProjects, setPersonalProjects] = useState<ProjectOption[]>([]);
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [selected, setSelected] = useState(""); // "client:12" | "personal:3"
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [note, setNote] = useState("");
  const [starting, setStarting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const selDomain = selected ? (selected.split(":")[0] as Domain) : null;
  const selProjectId = selected ? Number(selected.split(":")[1]) : 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [c, p] = await Promise.allSettled([
        fetch("/api/admin/projects?status=active", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/personal-projects", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (cancelled) return;
      if (c.status === "fulfilled") setClientProjects(c.value.projects ?? []);
      if (p.status === "fulfilled") {
        // Personal projects default to "idea" — anything unfinished is trackable.
        setPersonalProjects(
          (p.value.projects ?? []).filter(
            (x: { status: string }) => x.status !== "done" && x.status !== "archived",
          ),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Both domains support attaching the session to a task.
  useEffect(() => {
    if (!selDomain || !selProjectId) return;
    let cancelled = false;
    (async () => {
      const url =
        selDomain === "personal"
          ? `/api/admin/personal-tasks?projectId=${selProjectId}`
          : `/api/admin/tasks?projectId=${selProjectId}`;
      try {
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        if (!cancelled) {
          setTasks(
            (json.tasks ?? []).filter(
              (t: TaskOption) => t.status !== "done" && t.status !== "canceled",
            ),
          );
        }
      } catch {
        // dropdown just stays empty
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selDomain, selProjectId]);

  function pickProject(value: string) {
    setSelected(value);
    setSelectedTaskId("");
    setTasks([]);
  }

  async function onStart() {
    if (!selDomain || !selProjectId) return;
    setStarting(true);
    const ok = await start(selDomain, {
      projectId: selProjectId,
      taskId: selectedTaskId ? Number(selectedTaskId) : null,
      note: note || null,
    });
    setStarting(false);
    if (ok) {
      setNote("");
      setSelected("");
      setSelectedTaskId("");
      setPickerOpen(false);
      toast.success("הטיימר התחיל");
      router.refresh();
    } else {
      toast.error("נכשל להתחיל טיימר");
    }
  }

  async function onStop(domain: Domain) {
    if (await stop(domain)) {
      toast.success("הטיימר נעצר");
      router.refresh();
    } else {
      toast.error("עצירת טיימר נכשלה");
    }
  }

  const showPicker = active.length === 0 || pickerOpen;

  return (
    <div className="space-y-2" dir="rtl">
      {active.map((t) => (
        <ActiveCard key={`${t.domain}-${t.id}`} timer={t} onStop={() => onStop(t.domain)} />
      ))}

      {showPicker ? (
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-1">
            טיימר
          </div>
          <select
            value={selected}
            onChange={(e) => pickProject(e.target.value)}
            className="w-full text-[12px] border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-2 py-1.5"
          >
            <option value="">— בחר פרויקט —</option>
            {personalProjects.length > 0 && (
              <optgroup label="פרויקטים אישיים">
                {personalProjects.map((p) => (
                  <option key={`personal-${p.id}`} value={`personal:${p.id}`}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            )}
            {clientProjects.length > 0 && (
              <optgroup label="עבודת לקוחות">
                {clientProjects.map((p) => (
                  <option key={`client-${p.id}`} value={`client:${p.id}`}>
                    {p.clientName ? `${p.clientName} · ${p.name}` : p.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          {tasks.length > 0 && (
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full text-[12px] border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-2 py-1.5"
            >
              <option value="">— ללא משימה —</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          )}

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="על מה אני עובד? (אופציונלי)"
            className="w-full text-[12px] border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-2 py-1.5"
          />
          <button
            onClick={onStart}
            disabled={!selected || starting}
            className="w-full rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold py-1.5 transition"
          >
            {starting ? "מתחיל..." : "▶ התחל טיימר"}
          </button>
          {active.length > 0 && (
            <button
              onClick={() => setPickerOpen(false)}
              className="w-full text-[11px] text-[#94A3B8] hover:text-[#0F172A]"
            >
              ביטול
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => setPickerOpen(true)}
          className="w-full text-[11px] font-semibold text-[#2B7FFF] hover:underline py-1"
        >
          + טיימר נוסף
        </button>
      )}
    </div>
  );
}

function ActiveCard({ timer, onStop }: { timer: ActiveTimer; onStop: () => void }) {
  const elapsed = useElapsed(timer.startedAt);
  const personal = timer.domain === "personal";

  return (
    <div
      className={`rounded-lg border p-3 ${
        personal ? "bg-[#F5F3FF] border-[#DDD6FE]" : "bg-[#EFF6FF] border-[#BFDBFE]"
      }`}
      dir="rtl"
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${DOMAIN_TONE[timer.domain]}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              personal ? "bg-[#7C3AED]" : "bg-[#2B7FFF]"
            }`}
          />
          {DOMAIN_LABEL[timer.domain]}
        </span>
        <button onClick={onStop} className="text-[11px] font-semibold text-[#dc2626] hover:underline">
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
      <div className="text-[12px] text-[#475569] truncate mt-0.5">{timer.projectName}</div>
      {timer.subtitle && (
        <div className="text-[10px] text-[#94A3B8] truncate">{timer.subtitle}</div>
      )}
    </div>
  );
}
