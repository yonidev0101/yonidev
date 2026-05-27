"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProjectOption {
  id: number;
  name: string;
  clientName?: string | null;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function ManualTimeEntryForm({
  fixedProjectId,
  onDone,
}: {
  /** When provided, the project picker is hidden — used inside ProjectShell. */
  fixedProjectId?: number;
  /** Optional callback after a successful save. The form already calls router.refresh(). */
  onDone?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [form, setForm] = useState({
    projectId: fixedProjectId ? String(fixedProjectId) : "",
    date: todayStr(),
    hours: "1",
    minutes: "0",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Load projects when the form opens (only if user needs to pick)
  useEffect(() => {
    if (!open || fixedProjectId) return;
    let cancelled = false;
    (async () => {
      setLoadingProjects(true);
      try {
        const res = await fetch("/api/admin/projects?status=active", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        setProjects(json.projects ?? []);
      } finally {
        if (!cancelled) setLoadingProjects(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, fixedProjectId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const projectId = fixedProjectId ?? Number(form.projectId);
    const hours = Number(form.hours) || 0;
    const minutes = Number(form.minutes) || 0;
    if (!projectId || !Number.isFinite(hours) || !Number.isFinite(minutes) || (hours === 0 && minutes === 0)) return;

    setSubmitting(true);
    // Place the entry at 09:00 of the chosen date so it sits at a reasonable moment;
    // the actual minute doesn't matter for backfilled time, only the date + duration.
    const startedAt = new Date(`${form.date}T09:00:00`);
    const durationSeconds = hours * 3600 + minutes * 60;
    const endedAt = new Date(startedAt.getTime() + durationSeconds * 1000);

    const res = await fetch("/api/admin/time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        durationSeconds,
        note: form.note || null,
        billable: true,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("השעות נוספו");
      setOpen(false);
      setForm({
        projectId: fixedProjectId ? String(fixedProjectId) : "",
        date: todayStr(),
        hours: "1",
        minutes: "0",
        note: "",
      });
      router.refresh();
      onDone?.();
    } else {
      toast.error("הוספה נכשלה");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[13px] font-semibold text-[#2B7FFF] hover:underline"
      >
        + הוסף שעות ידנית
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-[#E2E8F0] rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3"
      dir="rtl"
    >
      {!fixedProjectId && (
        <select
          required
          value={form.projectId}
          onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          disabled={loadingProjects}
          className="md:col-span-4 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        >
          <option value="">— פרויקט —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.clientName ? `${p.clientName} · ${p.name}` : p.name}
            </option>
          ))}
        </select>
      )}
      <input
        type="date"
        required
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        className={`${fixedProjectId ? "md:col-span-3" : "md:col-span-2"} border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]`}
      />
      <div className={`${fixedProjectId ? "md:col-span-2" : "md:col-span-2"} flex gap-1.5`}>
        <input
          type="number"
          min="0"
          step="1"
          value={form.hours}
          onChange={(e) => setForm({ ...form, hours: e.target.value })}
          placeholder="שע׳"
          title="שעות"
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-2 py-2 text-[14px] tabular-nums min-w-0"
        />
        <input
          type="number"
          min="0"
          max="59"
          step="1"
          value={form.minutes}
          onChange={(e) => setForm({ ...form, minutes: e.target.value })}
          placeholder="דק׳"
          title="דקות"
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-2 py-2 text-[14px] tabular-nums min-w-0"
        />
      </div>
      <input
        value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
        placeholder="על מה עבדת? (לא חובה)"
        className={`${fixedProjectId ? "md:col-span-5" : "md:col-span-3"} border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]`}
      />
      <div className={`${fixedProjectId ? "md:col-span-2" : "md:col-span-1"} flex items-center gap-2`}>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-3 py-2"
        >
          {submitting ? "שומר..." : "הוסף"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[13px] text-[#64748B] px-1"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
