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
}

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
  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.title.trim()) {
      toast.error("חובה תיאור");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
      }),
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
    <div className="bg-[#F8FAFC] border border-[#2B7FFF]/30 rounded-md p-3 my-1.5 space-y-2.5" dir="rtl">
      <input
        autoFocus
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="תיאור המשימה"
        className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[14px] font-medium"
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="פרטים נוספים (אופציונלי)"
        rows={2}
        className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px] resize-y"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <label className="block">
          <span className="block text-[11px] text-[#94A3B8] mb-1">סטטוס</span>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px]"
          >
            {Object.entries(TASK_STATUS_HE).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-[11px] text-[#94A3B8] mb-1">עדיפות</span>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px]"
          >
            {Object.entries(TASK_PRIORITY_HE).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-[11px] text-[#94A3B8] mb-1">תאריך יעד</span>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px]"
          />
        </label>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[12px] font-semibold px-4 py-1.5"
        >
          {saving ? "שומר..." : "שמור"}
        </button>
        <button onClick={onCancel} className="text-[12px] text-[#64748B]">
          ביטול
        </button>
      </div>
    </div>
  );
}
