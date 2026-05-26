"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CLIENT_STATUS_HE } from "@/lib/admin/format";

export default function ClientCreateForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "active",
    defaultHourlyRateIls: "",
    notes: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      defaultHourlyRateIls: form.defaultHourlyRateIls
        ? Number(form.defaultHourlyRateIls)
        : null,
      company: form.company || null,
      email: form.email || null,
      phone: form.phone || null,
      notes: form.notes || null,
    };
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (res.ok) {
      setOpen(false);
      setForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        status: "active",
        defaultHourlyRateIls: "",
        notes: "",
      });
      toast.success("הלקוח נוסף");
      router.refresh();
    } else {
      toast.error("שמירה נכשלה", { description: "נסה שוב או בדוק את החיבור." });
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] text-white text-[14px] font-semibold px-5 py-2.5 transition"
      >
        + לקוח חדש
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4"
      dir="rtl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="שם *">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="ipt"
            autoFocus
          />
        </Field>
        <Field label="חברה / ארגון">
          <input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="ipt"
          />
        </Field>
        <Field label="אימייל">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="ipt"
          />
        </Field>
        <Field label="טלפון">
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="ipt"
            dir="ltr"
          />
        </Field>
        <Field label="סטטוס">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="ipt"
          >
            {Object.entries(CLIENT_STATUS_HE).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="תעריף ברירת מחדל (₪ לשעה)">
          <input
            type="number"
            min="0"
            step="1"
            value={form.defaultHourlyRateIls}
            onChange={(e) => setForm({ ...form, defaultHourlyRateIls: e.target.value })}
            className="ipt"
          />
        </Field>
      </div>
      <Field label="הערות">
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          className="ipt"
        />
      </Field>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || !form.name}
          className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[14px] font-semibold px-5 py-2.5 transition"
        >
          {submitting ? "שומר..." : "שמור"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[13px] text-[#64748B] hover:text-[#0F172A]"
        >
          ביטול
        </button>
      </div>

      <style jsx>{`
        :global(.ipt) {
          width: 100%;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 10px 14px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        :global(.ipt:focus) {
          border-color: #2b7fff;
          background: white;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold text-[#64748B] mb-1.5">{label}</span>
      {children}
    </label>
  );
}
