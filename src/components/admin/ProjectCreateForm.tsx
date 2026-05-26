"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProjectCreateForm({
  clientId,
  defaultRate,
}: {
  clientId: number;
  defaultRate: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    hourlyRateIls: defaultRate ?? "",
    description: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        name: form.name,
        hourlyRateIls: form.hourlyRateIls ? Number(form.hourlyRateIls) : null,
        description: form.description || null,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setOpen(false);
      setForm({ name: "", hourlyRateIls: defaultRate ?? "", description: "" });
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
        className="text-[13px] font-semibold text-[#2B7FFF] hover:underline"
      >
        + פרויקט חדש
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3">
      <input
        autoFocus
        required
        placeholder="שם פרויקט"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="number"
          min="0"
          placeholder={defaultRate ? `תעריף (ברירת מחדל: ₪${defaultRate})` : "תעריף לשעה (₪)"}
          value={form.hourlyRateIls}
          onChange={(e) => setForm({ ...form, hourlyRateIls: e.target.value })}
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        />
        <input
          placeholder="תיאור קצר"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting || !form.name}
          className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-1.5"
        >
          {submitting ? "שומר..." : "שמור"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[13px] text-[#64748B]"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
