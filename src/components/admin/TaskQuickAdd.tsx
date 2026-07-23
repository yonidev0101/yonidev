"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  TASK_PRIORITY_HE,
  PERSONAL_TASK_TYPE_ORDER,
  PERSONAL_TASK_TYPE_HE,
  PERSONAL_TASK_TYPE_ICON,
  PERSONAL_TASK_TYPE_TONE,
} from "@/lib/admin/format";
import { DOMAIN_LABEL, routes, type Domain } from "@/lib/admin/domain";

export interface QuickAddProject {
  id: number;
  name: string;
  clientName?: string | null;
  /** Which stack the project lives in; defaults to client work. */
  domain?: Domain;
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
  /** Domain to use when the project is fixed by the caller (project pages). */
  fixedDomain = "client",
  /** Show the personal-task "type" selector (feature/bug/idea/…). Personal only. */
  enableType = false,
  /** Called after a successful create, for callers that refresh their own data. */
  onCreated,
}: {
  projects: QuickAddProject[];
  fixedProjectId?: number;
  defaultProjectId?: number;
  pickerLabel?: string;
  triggerLabel?: string;
  fixedDomain?: Domain;
  enableType?: boolean;
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const key = (p: QuickAddProject) => `${p.domain ?? "client"}:${p.id}`;
  const initialProjectId =
    fixedProjectId?.toString() ??
    (defaultProjectId
      ? `${fixedDomain}:${defaultProjectId}`
      : projects.length === 1
        ? key(projects[0])
        : "");

  const [projectId, setProjectId] = useState(initialProjectId);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>("feature");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  function reset() {
    setTitle("");
    setType("feature");
    setPriority("medium");
    setDueDate("");
    setShowOptional(false);
    setProjectId(initialProjectId);
    setOpen(false);
  }

  // The picker value is "<domain>:<id>" — a client project and a personal one
  // can share the same numeric id, so the id alone is ambiguous.
  const [selDomain, selId] = projectId.includes(":")
    ? (projectId.split(":") as [Domain, string])
    : ([fixedDomain, projectId] as [Domain, string]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId) return;
    setSubmitting(true);
    const res = await fetch(routes(selDomain).tasksApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: Number(selId),
        title: title.trim(),
        priority,
        dueDate: dueDate || null,
        // "type" only exists on personal tasks — don't send it to client tasks.
        ...(enableType && selDomain === "personal" ? { type } : {}),
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("המשימה נוצרה");
      reset();
      router.refresh();
      onCreated?.();
    } else {
      toast.error("יצירה נכשלה");
    }
  }

  if (projects.length === 0 && !fixedProjectId) {
    return (
      <div className="text-[12px] text-[#94A3B8] italic">
        אין פרויקטים פעילים — צור פרויקט קודם.
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
  const showType = enableType && selDomain === "personal";

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3"
    >
      {showType && (
        <div className="flex flex-wrap gap-1.5">
          {PERSONAL_TASK_TYPE_ORDER.map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold border transition ${
                  active
                    ? `${PERSONAL_TASK_TYPE_TONE[t]} border-transparent ring-1 ring-inset ring-[#0F172A]/10`
                    : "bg-white text-[#94A3B8] border-[#E2E8F0] hover:text-[#0F172A] hover:border-[#CBD5E1]"
                }`}
              >
                <span aria-hidden>{PERSONAL_TASK_TYPE_ICON[t]}</span>
                {PERSONAL_TASK_TYPE_HE[t]}
              </button>
            );
          })}
        </div>
      )}

      {showPicker && (
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          required
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        >
          <option value="">— בחר {pickerLabel} —</option>
          {projects.map((p) => (
            <option key={key(p)} value={key(p)}>
              {p.domain === "personal" ? `${DOMAIN_LABEL.personal} · ${p.name}` : null}
              {p.domain !== "personal"
                ? p.clientName
                  ? `${p.clientName} · ${p.name}`
                  : p.name
                : null}
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
          {submitting ? "שומר..." : "צור משימה"}
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
