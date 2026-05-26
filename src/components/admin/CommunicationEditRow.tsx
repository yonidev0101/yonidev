"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { COMM_KIND_HE } from "@/lib/admin/format";
import type { Project } from "@/lib/db/schema";

interface CommShape {
  id: number;
  kind: string;
  happenedAt: string | Date;
  summary: string;
  details: string | null;
  projectId: number | null;
}

function toDateTimeLocal(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function CommunicationEditRow({
  communication,
  projects,
  onCancel,
  onSaved,
}: {
  communication: CommShape;
  projects: Project[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    kind: communication.kind,
    happenedAt: toDateTimeLocal(communication.happenedAt),
    summary: communication.summary,
    details: communication.details ?? "",
    projectId: communication.projectId ? String(communication.projectId) : "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.summary.trim()) {
      toast.error("חובה סיכום");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/communications/${communication.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: form.kind,
        happenedAt: new Date(form.happenedAt).toISOString(),
        summary: form.summary,
        details: form.details || null,
        projectId: form.projectId ? Number(form.projectId) : null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("עודכן");
      router.refresh();
      onSaved();
    } else {
      toast.error("שמירה נכשלה");
    }
  }

  return (
    <div className="bg-[#F8FAFC] border border-[#2B7FFF]/30 rounded-md p-3 space-y-2.5" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <label className="block">
          <span className="block text-[11px] text-[#94A3B8] mb-1">סוג</span>
          <select
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value })}
            className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px]"
          >
            {Object.entries(COMM_KIND_HE).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-[11px] text-[#94A3B8] mb-1">מתי</span>
          <input
            type="datetime-local"
            value={form.happenedAt}
            onChange={(e) => setForm({ ...form, happenedAt: e.target.value })}
            className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px]"
          />
        </label>
        <label className="block">
          <span className="block text-[11px] text-[#94A3B8] mb-1">פרויקט</span>
          <select
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px]"
          >
            <option value="">— ללא פרויקט —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <input
        value={form.summary}
        onChange={(e) => setForm({ ...form, summary: e.target.value })}
        placeholder="סיכום"
        className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[14px] font-medium"
      />
      <textarea
        value={form.details}
        onChange={(e) => setForm({ ...form, details: e.target.value })}
        placeholder="פרטים נוספים"
        rows={3}
        className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px] resize-y"
      />
      <div className="flex items-center gap-2">
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
