"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { COMM_KIND_HE } from "@/lib/admin/format";
import type { Project } from "@/lib/db/schema";

export default function CommunicationForm({
  clientId,
  projects,
}: {
  clientId: number;
  projects: Project[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    kind: "note" as keyof typeof COMM_KIND_HE,
    projectId: "",
    summary: "",
    details: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/admin/communications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        projectId: form.projectId ? Number(form.projectId) : null,
        kind: form.kind,
        summary: form.summary,
        details: form.details || null,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setOpen(false);
      setForm({ kind: "note", projectId: "", summary: "", details: "" });
      toast.success("נשמר ביומן");
      router.refresh();
    } else {
      toast.error("שמירה נכשלה");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[13px] font-semibold text-[#2B7FFF] hover:underline"
      >
        + רשומת תקשורת
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <select
          value={form.kind}
          onChange={(e) => setForm({ ...form, kind: e.target.value as keyof typeof COMM_KIND_HE })}
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        >
          {Object.entries(COMM_KIND_HE).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={form.projectId}
          onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        >
          <option value="">— ללא פרויקט —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <input
        autoFocus
        required
        placeholder="סיכום בשורה (למשל: דיברנו על העיצוב החדש)"
        value={form.summary}
        onChange={(e) => setForm({ ...form, summary: e.target.value })}
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
      />
      <textarea
        placeholder="פרטים נוספים (לא חובה)"
        value={form.details}
        onChange={(e) => setForm({ ...form, details: e.target.value })}
        rows={3}
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting || !form.summary}
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
