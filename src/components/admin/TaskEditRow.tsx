"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TASK_STATUS_HE, TASK_PRIORITY_HE } from "@/lib/admin/format";
import { routes, type Domain } from "@/lib/admin/domain";

interface TaskShape {
  id: number;
  /** Defaults to client work for the call sites that only ever hold client tasks. */
  domain?: Domain;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  nextAction?: string | null;
  followUpAt?: string | null;
  waitingOn?: string | null;
  acceptance?: string | null;
  estimateMinutes?: number | null;
}

/**
 * Inline task editor for the list. It mirrors the task's own detail page exactly
 * so editing feels identical everywhere:
 *  - personal → same fields as PersonalTaskMetaPanel (spec + DoD + next step, no status/follow-up)
 *  - client   → same fields as TaskDetailEditPanel (status, follow-up, waiting…)
 */
export default function TaskEditRow({
  task,
  onCancel,
  onSaved,
}: {
  task: TaskShape;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const domain = task.domain ?? "client";
  const isPersonal = domain === "personal";

  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ?? "",
    followUpAt: task.followUpAt ?? "",
    nextAction: task.nextAction ?? "",
    acceptance: task.acceptance ?? "",
    waitingOn: task.waitingOn ?? "",
    // Estimate is in hours across the whole app (stored as minutes in the DB).
    estimate: task.estimateMinutes != null ? String(task.estimateMinutes / 60) : "",
  });
  const [saving, setSaving] = useState(false);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function estimateToMinutes(): number | null {
    if (!form.estimate) return null;
    const n = parseFloat(form.estimate);
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 60);
  }

  async function save() {
    if (!form.title.trim()) {
      toast.error("חובה כותרת");
      return;
    }
    setSaving(true);
    const body = isPersonal
      ? {
          title: form.title.trim(),
          description: form.description.trim() || null,
          priority: form.priority,
          dueDate: form.dueDate || null,
          nextAction: form.nextAction.trim() || null,
          acceptance: form.acceptance.trim() || null,
          estimateMinutes: estimateToMinutes(),
        }
      : {
          title: form.title.trim(),
          description: form.description.trim() || null,
          status: form.status,
          priority: form.priority,
          dueDate: form.dueDate || null,
          followUpAt: form.followUpAt || null,
          nextAction: form.nextAction.trim() || null,
          waitingOn: form.status === "waiting" ? form.waitingOn.trim() || null : null,
          estimateMinutes: estimateToMinutes(),
        };

    const res = await fetch(`${routes(domain).tasksApi}/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("המשימה עודכנה");
      router.refresh();
      onSaved();
    } else {
      toast.error("שמירה נכשלה");
    }
  }

  return (
    <div
      className="bg-[#F8FAFC] border border-[#2B7FFF]/30 ring-1 ring-[#2B7FFF]/10 rounded-lg shadow-sm p-4 space-y-3"
      dir="rtl"
    >
      <input
        autoFocus
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        placeholder="כותרת המשימה"
        className="ipt-edit font-medium"
      />

      <Field label={isPersonal ? "תיאור — מה צריך לעשות ולמה" : "תיאור"}>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="פרטים נוספים (אופציונלי)"
          rows={3}
          className="ipt-edit resize-y"
        />
      </Field>

      {isPersonal ? (
        <>
          <Field label="הגדרת סיום — מתי זה נחשב גמור">
            <textarea
              value={form.acceptance}
              onChange={(e) => set("acceptance", e.target.value)}
              placeholder="למשל: הטופס נשמר ל-DB, יש ולידציה, ועובר בבילד"
              rows={2}
              className="ipt-edit resize-y"
            />
          </Field>

          <Field label="הצעד הבא">
            <input
              value={form.nextAction}
              onChange={(e) => set("nextAction", e.target.value)}
              placeholder="מה הדבר הבא שצריך לקרות?"
              className="ipt-edit"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="עדיפות">
              <PrioritySelect value={form.priority} onChange={(v) => set("priority", v)} />
            </Field>
            <Field label="אומדן (שעות)">
              <input
                type="number"
                min={0}
                step={0.25}
                value={form.estimate}
                onChange={(e) => set("estimate", e.target.value)}
                placeholder="2"
                className="ipt-edit tabular-nums"
              />
            </Field>
            <Field label="דד-ליין">
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                className="ipt-edit"
              />
            </Field>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="סטטוס">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="ipt-edit"
              >
                {Object.entries(TASK_STATUS_HE).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="עדיפות">
              <PrioritySelect value={form.priority} onChange={(v) => set("priority", v)} />
            </Field>
            <Field label="דד-ליין">
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                className="ipt-edit"
              />
            </Field>
            <Field label="תאריך מעקב">
              <input
                type="date"
                value={form.followUpAt}
                onChange={(e) => set("followUpAt", e.target.value)}
                className="ipt-edit"
              />
            </Field>
          </div>

          <Field label="אומדן (שעות)">
            <input
              type="number"
              min={0}
              step={0.25}
              value={form.estimate}
              onChange={(e) => set("estimate", e.target.value)}
              placeholder="2"
              className="ipt-edit tabular-nums sm:w-1/2"
            />
          </Field>

          <Field label="הצעד הבא">
            <input
              value={form.nextAction}
              onChange={(e) => set("nextAction", e.target.value)}
              placeholder="לחזור ל... ביום..."
              className="ipt-edit"
            />
          </Field>

          {form.status === "waiting" && (
            <Field label="ממתין ל…">
              <input
                value={form.waitingOn}
                onChange={(e) => set("waitingOn", e.target.value)}
                placeholder="דנה — תשובה על האפיון"
                className="ipt-edit"
              />
            </Field>
          )}
        </>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-[#E2E8F0]">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-1.5"
        >
          {saving ? "שומר..." : "שמור"}
        </button>
        <button
          onClick={onCancel}
          className="text-[13px] text-[#64748B] hover:text-[#0F172A] px-2 py-1.5"
        >
          ביטול
        </button>
      </div>

      <style jsx>{`
        :global(.ipt-edit) {
          width: 100%;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s;
        }
        :global(.ipt-edit:focus) {
          border-color: #2b7fff;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function PrioritySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="ipt-edit">
      {Object.entries(TASK_PRIORITY_HE).map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </select>
  );
}
