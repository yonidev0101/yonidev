"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TimeEntryShape {
  id: number;
  startedAt: string | Date;
  durationSeconds: number | null;
  note: string | null;
  billable: boolean;
}

function toDateTimeLocal(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  // datetime-local expects "YYYY-MM-DDTHH:MM" in the user's local time
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function TimeEntryEditRow({
  entry,
  onCancel,
  onSaved,
}: {
  entry: TimeEntryShape;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const totalSeconds = entry.durationSeconds ?? 0;
  const [form, setForm] = useState({
    startedAt: toDateTimeLocal(entry.startedAt),
    hours: String(Math.floor(totalSeconds / 3600)),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)),
    note: entry.note ?? "",
    billable: entry.billable,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    const hours = Number(form.hours) || 0;
    const minutes = Number(form.minutes) || 0;
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours < 0 || minutes < 0) {
      toast.error("משך זמן לא תקין");
      return;
    }
    setSaving(true);
    const startedAt = new Date(form.startedAt);
    const durationSeconds = hours * 3600 + minutes * 60;
    const endedAt = new Date(startedAt.getTime() + durationSeconds * 1000);

    const res = await fetch(`/api/admin/time/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        durationSeconds,
        note: form.note || null,
        billable: form.billable,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("השעות עודכנו");
      router.refresh();
      onSaved();
    } else {
      toast.error("שמירה נכשלה");
    }
  }

  return (
    <div className="bg-[#F8FAFC] border border-[#2B7FFF]/30 rounded-md p-3 my-1.5" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
        <label className="md:col-span-4 block">
          <span className="block text-[11px] text-[#94A3B8] mb-1">תאריך ושעה</span>
          <input
            type="datetime-local"
            value={form.startedAt}
            onChange={(e) => setForm({ ...form, startedAt: e.target.value })}
            className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px]"
          />
        </label>
        <div className="md:col-span-2 flex gap-1.5">
          <label className="flex-1 block">
            <span className="block text-[11px] text-[#94A3B8] mb-1">שעות</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: e.target.value })}
              className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px] tabular-nums"
            />
          </label>
          <label className="flex-1 block">
            <span className="block text-[11px] text-[#94A3B8] mb-1">דקות</span>
            <input
              type="number"
              min="0"
              max="59"
              step="1"
              value={form.minutes}
              onChange={(e) => setForm({ ...form, minutes: e.target.value })}
              className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px] tabular-nums"
            />
          </label>
        </div>
        <label className="md:col-span-6 block">
          <span className="block text-[11px] text-[#94A3B8] mb-1">הערה</span>
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="w-full border border-[#E2E8F0] rounded-md bg-white px-2 py-1.5 text-[13px]"
          />
        </label>
      </div>
      <div className="flex items-center justify-between mt-3">
        <label className="flex items-center gap-2 text-[12px] text-[#475569] cursor-pointer">
          <input
            type="checkbox"
            checked={form.billable}
            onChange={(e) => setForm({ ...form, billable: e.target.checked })}
          />
          לחיוב
        </label>
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
    </div>
  );
}
