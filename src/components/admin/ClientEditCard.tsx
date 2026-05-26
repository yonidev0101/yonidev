"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Client } from "@/lib/db/schema";
import { CLIENT_STATUS_HE, fmtIls } from "@/lib/admin/format";
import { confirm } from "./ConfirmDialog";

export default function ClientEditCard({ client }: { client: Client }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: client.name,
    company: client.company ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    status: client.status,
    defaultHourlyRateIls: client.defaultHourlyRateIls ?? "",
    notes: client.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        defaultHourlyRateIls: form.defaultHourlyRateIls
          ? Number(form.defaultHourlyRateIls)
          : null,
        company: form.company || null,
        email: form.email || null,
        phone: form.phone || null,
        notes: form.notes || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      toast.success("הפרטים נשמרו");
      router.refresh();
    } else {
      toast.error("שמירה נכשלה");
    }
  }

  async function deleteClient() {
    const ok = await confirm({
      title: "למחוק את הלקוח?",
      description: "כל הפרויקטים, השעות והתקשורת יימחקו לצמיתות.",
      confirmLabel: "מחק",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/clients/${client.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("הלקוח נמחק");
      router.push("/admin/clients");
      router.refresh();
    } else {
      toast.error("מחיקה נכשלה", {
        description:
          "ללקוח יש חשבונית בהיסטוריה. מחק/בטל את החשבוניות (גם טיוטות ו-void) דרך עמוד החשבונית, ואז נסה שוב.",
        duration: 6000,
      });
    }
  }

  if (!editing) {
    return (
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-5">
        <h2 className="text-[13px] font-bold text-[#0F172A] mb-3">פרטי קשר</h2>
        <dl className="space-y-2 text-[13px]">
          {client.email && (
            <Row
              label="אימייל"
              value={
                <a
                  href={`mailto:${client.email}`}
                  className="text-[#2B7FFF] hover:underline"
                  dir="ltr"
                >
                  {client.email}
                </a>
              }
            />
          )}
          {client.phone && (
            <Row
              label="טלפון"
              value={
                <a href={`tel:${client.phone}`} className="text-[#0F172A]" dir="ltr">
                  {client.phone}
                </a>
              }
            />
          )}
          <Row label="סטטוס" value={CLIENT_STATUS_HE[client.status]} />
          {client.defaultHourlyRateIls && (
            <Row label="תעריף ברירת מחדל" value={`${fmtIls(client.defaultHourlyRateIls)}/שעה`} />
          )}
        </dl>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#F1F5F9]">
          <button
            onClick={() => setEditing(true)}
            className="text-[12px] font-semibold text-[#2B7FFF] hover:underline"
          >
            ערוך
          </button>
          <button
            onClick={deleteClient}
            className="text-[12px] text-[#94A3B8] hover:text-red-600"
          >
            מחק לקוח
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
      <h2 className="text-[13px] font-bold text-[#0F172A]">עריכת לקוח</h2>
      <Inp label="שם" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <Inp label="חברה" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
      <Inp label="אימייל" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
      <Inp label="טלפון" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
      <label className="block">
        <span className="block text-[11px] font-semibold text-[#64748B] mb-1">סטטוס</span>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as Client["status"] })}
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]"
        >
          {Object.entries(CLIENT_STATUS_HE).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <Inp
        label="תעריף (₪/שעה)"
        value={String(form.defaultHourlyRateIls ?? "")}
        onChange={(v) => setForm({ ...form, defaultHourlyRateIls: v })}
        type="number"
      />
      <label className="block">
        <span className="block text-[11px] font-semibold text-[#64748B] mb-1">הערות</span>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]"
        />
      </label>
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[12px] font-semibold px-4 py-2"
        >
          {saving ? "שומר..." : "שמור"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-[12px] text-[#64748B] hover:text-[#0F172A]"
        >
          ביטול
        </button>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-baseline gap-3">
      <dt className="text-[#94A3B8] text-[12px]">{label}</dt>
      <dd className="text-[#0F172A] font-medium">{value}</dd>
    </div>
  );
}

function Inp({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-[#64748B] mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]"
        dir={type === "tel" || type === "email" ? "ltr" : undefined}
      />
    </label>
  );
}
