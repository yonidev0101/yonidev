"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const FIELD =
  "w-full border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] px-3 py-2.5 text-[14px] text-[#0F172A] outline-none focus:border-[#2B7FFF] focus:bg-white focus:ring-2 focus:ring-[#2B7FFF]/15 transition";
const LABEL = "block text-[12px] font-semibold text-[#475569] mb-1.5";

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

  function reset() {
    setForm({ name: "", status: "idea", priority: "medium", description: "", targetDate: "" });
  }

  function close() {
    setOpen(false);
    reset();
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
      close();
      toast.success("הפרויקט נוצר");
      router.refresh();
    } else {
      toast.error("יצירה נכשלה");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] text-white text-[13px] font-semibold px-5 py-2 transition"
      >
        + פרויקט אישי חדש
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label="פרויקט אישי חדש"
          dir="rtl"
        >
          <button
            aria-label="סגור"
            onClick={close}
            className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
          />
          <form
            onSubmit={onSubmit}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)]"
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#F1F5F9]">
              <h3 className="text-[16px] font-bold text-[#0F172A]">פרויקט אישי חדש</h3>
              <button
                type="button"
                onClick={close}
                aria-label="סגור"
                className="text-[#94A3B8] hover:text-[#0F172A] text-[20px] leading-none -my-1 px-1 transition"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={LABEL} htmlFor="pp-name">
                  שם הפרויקט
                </label>
                <input
                  id="pp-name"
                  autoFocus
                  required
                  placeholder="לדוגמה: אפליקציית מתכונים"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={FIELD}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL} htmlFor="pp-status">
                    סטטוס
                  </label>
                  <select
                    id="pp-status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                    className={FIELD}
                  >
                    <option value="idea">רעיון</option>
                    <option value="active">פעיל</option>
                    <option value="paused">מושהה</option>
                    <option value="done">הושלם</option>
                    <option value="archived">בארכיון</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL} htmlFor="pp-priority">
                    עדיפות
                  </label>
                  <select
                    id="pp-priority"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as typeof form.priority })}
                    className={FIELD}
                  >
                    <option value="low">נמוכה</option>
                    <option value="medium">רגילה</option>
                    <option value="high">גבוהה</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={LABEL} htmlFor="pp-target">
                  תאריך יעד (לא חובה)
                </label>
                <input
                  id="pp-target"
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                  className={FIELD}
                />
              </div>

              <div>
                <label className={LABEL} htmlFor="pp-desc">
                  תיאור קצר (לא חובה)
                </label>
                <textarea
                  id="pp-desc"
                  rows={3}
                  placeholder="על מה הפרויקט?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${FIELD} resize-none`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 px-6 py-4 border-t border-[#F1F5F9] bg-[#F8FAFC]/60 rounded-b-2xl">
              <button
                type="submit"
                disabled={submitting || !form.name}
                className="flex-1 rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-2.5 transition"
              >
                {submitting ? "שומר..." : "צור פרויקט"}
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-full text-[#64748B] hover:text-[#0F172A] text-[13px] font-semibold px-4 py-2.5 transition"
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
