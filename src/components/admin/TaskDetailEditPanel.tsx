"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TASK_STATUS_HE, TASK_PRIORITY_HE } from "@/lib/admin/format";

interface TaskShape {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  nextAction: string | null;
  followUpAt: string | null;
}

export default function TaskDetailEditPanel({ task }: { task: TaskShape }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ?? "",
    nextAction: task.nextAction ?? "",
    followUpAt: task.followUpAt ?? "",
  });

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save() {
    if (!form.title.trim()) {
      toast.error("חובה כותרת");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
        nextAction: form.nextAction.trim() || null,
        followUpAt: form.followUpAt || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("המשימה עודכנה");
      setOpen(false);
      router.refresh();
    } else {
      toast.error("שמירה נכשלה");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[12px] text-[#94A3B8] hover:text-[#2B7FFF] shrink-0"
        aria-label="ערוך משימה"
      >
        ✎ ערוך
      </button>
    );
  }

  return (
    <div className="bg-white border border-[#2B7FFF]/30 rounded-xl p-5 space-y-4" dir="rtl">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] font-bold text-[#0F172A]">עריכת משימה</span>
        <button onClick={() => setOpen(false)} className="text-[13px] text-[#94A3B8] hover:text-[#0F172A]">✕</button>
      </div>

      <input
        autoFocus
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        placeholder="כותרת המשימה"
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px] font-medium"
      />

      <textarea
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="תיאור (אופציונלי)"
        rows={3}
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px] resize-y"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="block">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">סטטוס</span>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px]"
          >
            {Object.entries(TASK_STATUS_HE).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">עדיפות</span>
          <select
            value={form.priority}
            onChange={(e) => set("priority", e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px]"
          >
            {Object.entries(TASK_PRIORITY_HE).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">דד-ליין</span>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px]"
          />
        </label>

        <label className="block">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">תאריך מעקב</span>
          <input
            type="date"
            value={form.followUpAt}
            onChange={(e) => set("followUpAt", e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px]"
          />
        </label>
      </div>

      <label className="block">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">הצעד הבא</span>
        <input
          value={form.nextAction}
          onChange={(e) => set("nextAction", e.target.value)}
          placeholder="לחזור ל... ביום..."
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]"
        />
      </label>

      <div className="flex items-center gap-2 pt-1 border-t border-[#F1F5F9]">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-1.5"
        >
          {saving ? "שומר..." : "שמור"}
        </button>
        <button onClick={() => setOpen(false)} className="text-[13px] text-[#64748B]">
          ביטול
        </button>
      </div>
    </div>
  );
}
