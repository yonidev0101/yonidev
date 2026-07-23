"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { confirm } from "./ConfirmDialog";
import {
  PERSONAL_TASK_TYPE_ORDER,
  PERSONAL_TASK_TYPE_HE,
  PERSONAL_TASK_TYPE_ICON,
} from "@/lib/admin/format";

interface TaskMeta {
  id: number;
  title: string;
  description: string | null;
  type: string;
  status: string;
  priority: string;
  dueDate: string | null;
  estimateMinutes: number | null;
  acceptance: string | null;
  nextAction: string | null;
}

/** Edits the task's own fields — the journal handles "what happened", this is "what it is". */
export default function PersonalTaskMetaPanel({
  task,
  projectId,
}: {
  task: TaskMeta;
  projectId: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? "",
    type: task.type,
    priority: task.priority,
    dueDate: task.dueDate ?? "",
    estimateHours: task.estimateMinutes != null ? String(task.estimateMinutes / 60) : "",
    acceptance: task.acceptance ?? "",
    nextAction: task.nextAction ?? "",
  });

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/personal-tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        type: form.type,
        priority: form.priority,
        dueDate: form.dueDate || null,
        estimateMinutes: form.estimateHours
          ? Math.round(parseFloat(form.estimateHours) * 60)
          : null,
        acceptance: form.acceptance || null,
        nextAction: form.nextAction || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      toast.success("המשימה עודכנה");
      router.refresh();
    } else {
      toast.error("עדכון נכשל");
    }
  }

  async function del() {
    const ok = await confirm({
      title: "למחוק את המשימה?",
      description: "כל היומן והעדכונים שלה יימחקו. אי אפשר להחזיר אחורה.",
      confirmLabel: "מחק משימה",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/personal-tasks/${task.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("המשימה נמחקה");
      router.push(`/admin/personal/${projectId}?tab=tasks`);
      router.refresh();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[12px] text-[#94A3B8] hover:text-[#2B7FFF] shrink-0 mt-1"
      >
        ✎ ערוך
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 overflow-y-auto">
      <div
        dir="rtl"
        className="bg-white rounded-xl border border-[#E2E8F0] w-full max-w-lg p-5 space-y-3 mt-12"
      >
        <h2 className="text-[15px] font-bold text-[#0F172A]">עריכת משימה</h2>

        <Field label="כותרת">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="ipt-task"
          />
        </Field>

        <Field label="סוג">
          <div className="flex flex-wrap gap-1.5">
            {PERSONAL_TASK_TYPE_ORDER.map((t) => {
              const active = form.type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold border transition ${
                    active
                      ? "bg-[#0F172A] text-white border-transparent"
                      : "bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A] hover:border-[#CBD5E1]"
                  }`}
                >
                  <span aria-hidden>{PERSONAL_TASK_TYPE_ICON[t]}</span>
                  {PERSONAL_TASK_TYPE_HE[t]}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="תיאור — מה צריך לעשות ולמה">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="ipt-task resize-y"
          />
        </Field>

        <Field label="הגדרת סיום — מתי זה נחשב גמור">
          <textarea
            value={form.acceptance}
            onChange={(e) => setForm({ ...form, acceptance: e.target.value })}
            rows={2}
            placeholder="למשל: הטופס נשמר ל-DB, יש ולידציה, ועובר בבילד"
            className="ipt-task resize-y"
          />
        </Field>

        <Field label="הצעד הבא">
          <input
            value={form.nextAction}
            onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
            className="ipt-task"
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="עדיפות">
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="ipt-task"
            >
              <option value="low">נמוכה</option>
              <option value="medium">רגילה</option>
              <option value="high">גבוהה</option>
            </select>
          </Field>
          <Field label="אומדן (שעות)">
            <input
              type="number"
              min="0"
              step="0.25"
              placeholder="2"
              value={form.estimateHours}
              onChange={(e) => setForm({ ...form, estimateHours: e.target.value })}
              className="ipt-task tabular-nums"
            />
          </Field>
          <Field label="דד-ליין">
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="ipt-task"
            />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-2"
            >
              {saving ? "שומר..." : "שמור"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-[13px] text-[#64748B] hover:text-[#0F172A] px-2"
            >
              ביטול
            </button>
          </div>
          <button onClick={del} className="text-[12px] text-[#94A3B8] hover:text-red-600">
            מחק משימה
          </button>
        </div>

        <style jsx>{`
          :global(.ipt-task) {
            width: 100%;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 14px;
            color: #0f172a;
            outline: none;
          }
          :global(.ipt-task:focus) {
            border-color: #2b7fff;
            background: white;
          }
        `}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
