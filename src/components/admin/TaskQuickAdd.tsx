"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TASK_PRIORITY_HE } from "@/lib/admin/format";

export interface QuickAddProject {
  id: number;
  name: string;
  clientName?: string | null;
}

type Priority = keyof typeof TASK_PRIORITY_HE;

export default function TaskQuickAdd({
  projects,
  fixedProjectId,
  /** Pre-selects this project (and hides the picker when there's only one option). */
  defaultProjectId,
  /** Wording used when the picker is shown — defaults to "פרויקט". */
  pickerLabel = "פרויקט",
  /** Button label when the form is collapsed. */
  triggerLabel = "➕ משימה חדשה",
}: {
  projects: QuickAddProject[];
  fixedProjectId?: number;
  defaultProjectId?: number;
  pickerLabel?: string;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialProjectId =
    fixedProjectId?.toString() ??
    defaultProjectId?.toString() ??
    (projects.length === 1 ? projects[0].id.toString() : "");

  const [projectId, setProjectId] = useState(initialProjectId);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  function reset() {
    setTitle("");
    setPriority("medium");
    setDueDate("");
    setShowOptional(false);
    setProjectId(initialProjectId);
    setOpen(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId) return;
    setSubmitting(true);
    const res = await fetch("/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: Number(projectId),
        title: title.trim(),
        priority,
        dueDate: dueDate || null,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("המשימה נוצרה");
      reset();
      router.refresh();
    } else {
      toast.error("יצירה נכשלה");
    }
  }

  if (projects.length === 0 && !fixedProjectId) {
    return (
      <div className="text-[12px] text-[#94A3B8] italic">
        אין פרויקטים פעילים — צרי פרויקט קודם.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-[#CBD5E1] hover:border-[#2B7FFF] hover:bg-[#EFF6FF] text-[14px] font-semibold text-[#2B7FFF] py-3 transition-colors"
      >
        {triggerLabel}
      </button>
    );
  }

  const showPicker = !fixedProjectId && projects.length > 1;

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3"
    >
      {showPicker && (
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          required
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        >
          <option value="">— בחרי {pickerLabel} —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.clientName ? `${p.clientName} · ${p.name}` : p.name}
            </option>
          ))}
        </select>
      )}

      <input
        autoFocus
        required
        placeholder="תיאור המשימה (למשל: לשלוח mockup מתוקן לדנה)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
      />

      {showOptional && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-[11px] text-[#94A3B8] mb-1">עדיפות</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]"
            >
              {Object.entries(TASK_PRIORITY_HE).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-[11px] text-[#94A3B8] mb-1">דד-ליין</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]"
            />
          </label>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting || !title.trim() || !projectId}
          className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-1.5"
        >
          {submitting ? "שומר..." : "צרי משימה"}
        </button>
        <button
          type="button"
          onClick={() => setShowOptional((v) => !v)}
          className="text-[12px] text-[#64748B] hover:text-[#2B7FFF]"
        >
          {showOptional ? "פחות אפשרויות" : "עדיפות / דד-ליין"}
        </button>
        <button type="button" onClick={reset} className="ms-auto text-[13px] text-[#64748B]">
          ביטול
        </button>
      </div>
    </form>
  );
}
