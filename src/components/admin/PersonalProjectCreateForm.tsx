"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PersonalProjectCreateForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    status: "idea" as "idea" | "active" | "paused" | "done" | "archived",
    priority: "medium" as "low" | "medium" | "high",
    description: "",
    targetDate: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/admin/personal-projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        status: form.status,
        priority: form.priority,
        description: form.description || null,
        targetDate: form.targetDate || null,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setOpen(false);
      setForm({ name: "", status: "idea", priority: "medium", description: "", targetDate: "" });
      toast.success("הפרויקט נוצר");
      router.refresh();
    } else {
      toast.error("יצירה נכשלה");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] text-white text-[13px] font-semibold px-5 py-2"
      >
        + פרויקט אישי חדש
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3"
    >
      <input
        autoFocus
        required
        placeholder="שם הפרויקט"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        >
          <option value="idea">רעיון</option>
          <option value="active">פעיל</option>
          <option value="paused">מושהה</option>
          <option value="done">הושלם</option>
          <option value="archived">בארכיון</option>
        </select>
        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value as typeof form.priority })}
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        >
          <option value="low">עדיפות נמוכה</option>
          <option value="medium">עדיפות רגילה</option>
          <option value="high">עדיפות גבוהה</option>
        </select>
        <input
          type="date"
          value={form.targetDate}
          onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        />
      </div>
      <input
        placeholder="תיאור קצר (לא חובה)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting || !form.name}
          className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-1.5"
        >
          {submitting ? "שומר..." : "שמור"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[13px] text-[#64748B]">
          ביטול
        </button>
      </div>
    </form>
  );
}
