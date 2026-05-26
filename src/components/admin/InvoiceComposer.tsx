"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Client } from "@/lib/db/schema";
import { fmtDateHe, fmtHours, fmtIls } from "@/lib/admin/format";

interface UninvoicedEntry {
  id: number;
  projectId: number;
  projectName: string;
  clientHourlyRate: string | null;
  projectHourlyRate: string | null;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  note: string | null;
}

interface ComposedLine {
  description: string;
  quantityHours: number;
  rateIls: number;
  sourceTimeEntryIds: number[];
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function InvoiceComposer({
  clients,
  initialClientId,
}: {
  clients: Client[];
  initialClientId: number | null;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState<number | null>(initialClientId);
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(todayStr());
  const [entries, setEntries] = useState<UninvoicedEntry[]>([]);
  const [lines, setLines] = useState<ComposedLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [vatPercent, setVatPercent] = useState(0);
  const [issuedAt, setIssuedAt] = useState(todayStr());
  const [dueAt, setDueAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const client = clients.find((c) => c.id === clientId) ?? null;

  async function loadEntries() {
    if (!clientId) return;
    setLoading(true);
    const url = `/api/admin/invoices/uninvoiced-time?clientId=${clientId}&from=${from}&to=${to}`;
    const res = await fetch(url);
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error("טעינת שעות נכשלה", { description: json.error });
      return;
    }
    setEntries(json.entries);

    // Auto-group by project + rate
    const groups = new Map<string, ComposedLine>();
    for (const e of json.entries as UninvoicedEntry[]) {
      const rate = Number(e.projectHourlyRate ?? e.clientHourlyRate ?? 0);
      const key = `${e.projectId}::${rate}`;
      const existing = groups.get(key);
      const hours = e.durationSeconds / 3600;
      if (existing) {
        existing.quantityHours += hours;
        existing.sourceTimeEntryIds.push(e.id);
      } else {
        groups.set(key, {
          description: `${e.projectName} · פיתוח`,
          quantityHours: hours,
          rateIls: rate,
          sourceTimeEntryIds: [e.id],
        });
      }
    }
    setLines(Array.from(groups.values()).map((l) => ({ ...l, quantityHours: Number(l.quantityHours.toFixed(2)) })));
  }

  useEffect(() => {
    if (!initialClientId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const url = `/api/admin/invoices/uninvoiced-time?clientId=${initialClientId}&from=${from}&to=${to}`;
      const res = await fetch(url);
      const json = await res.json();
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) return;
      setEntries(json.entries);
      const groups = new Map<string, ComposedLine>();
      for (const e of json.entries as UninvoicedEntry[]) {
        const rate = Number(e.projectHourlyRate ?? e.clientHourlyRate ?? 0);
        const key = `${e.projectId}::${rate}`;
        const existing = groups.get(key);
        const hours = e.durationSeconds / 3600;
        if (existing) {
          existing.quantityHours += hours;
          existing.sourceTimeEntryIds.push(e.id);
        } else {
          groups.set(key, {
            description: `${e.projectName} · פיתוח`,
            quantityHours: hours,
            rateIls: rate,
            sourceTimeEntryIds: [e.id],
          });
        }
      }
      setLines(
        Array.from(groups.values()).map((l) => ({
          ...l,
          quantityHours: Number(l.quantityHours.toFixed(2)),
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantityHours * l.rateIls, 0),
    [lines],
  );
  const vat = (vatPercent / 100) * subtotal;
  const total = subtotal + vat;

  function updateLine(i: number, patch: Partial<ComposedLine>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function removeLine(i: number) {
    setLines((ls) => ls.filter((_, idx) => idx !== i));
  }

  function addBlankLine() {
    setLines((ls) => [
      ...ls,
      { description: "", quantityHours: 0, rateIls: 0, sourceTimeEntryIds: [] },
    ]);
  }

  async function create() {
    if (!clientId || lines.length === 0) return;
    setSubmitting(true);
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        issuedAt,
        dueAt: dueAt || null,
        periodFrom: from || null,
        periodTo: to || null,
        vatRate: vatPercent / 100,
        notes: notes || null,
        lines: lines.filter((l) => l.description && l.quantityHours > 0 && l.rateIls > 0),
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (res.ok && json.invoice) {
      toast.success("הסיכום נוצר", { description: "כעת אפשר לשלוח ללקוח." });
      router.push(`/admin/invoices/${json.invoice.id}`);
    } else {
      toast.error("יצירה נכשלה", { description: json.error });
    }
  }

  return (
    <div className="space-y-6">
      {/* Step 1: filter */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
        <h2 className="text-[13px] font-bold text-[#0F172A]">1. בחר לקוח וטווח</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={clientId ?? ""}
            onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : null)}
            className="border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
          >
            <option value="">— בחר לקוח —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
          />
          <button
            onClick={loadEntries}
            disabled={!clientId || loading}
            className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-2"
          >
            {loading ? "טוען..." : "טען שעות"}
          </button>
        </div>
        {client && entries.length > 0 && (
          <p className="text-[12px] text-[#64748B]">
            נמצאו {entries.length} רשומות זמן · סה&quot;כ{" "}
            {fmtHours(entries.reduce((s, e) => s + e.durationSeconds, 0))}
          </p>
        )}
      </section>

      {lines.length > 0 && (
        <>
          {/* Step 2: edit lines */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
            <h2 className="text-[13px] font-bold text-[#0F172A]">2. שורות החשבונית</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="text-[11px] uppercase tracking-wider text-[#94A3B8]">
                  <tr>
                    <th className="text-right py-2 font-bold">תיאור</th>
                    <th className="text-center py-2 font-bold">שעות</th>
                    <th className="text-center py-2 font-bold">תעריף</th>
                    <th className="text-left py-2 font-bold">סכום</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {lines.map((l, i) => (
                    <tr key={i}>
                      <td className="py-2 pl-2">
                        <input
                          value={l.description}
                          onChange={(e) => updateLine(i, { description: e.target.value })}
                          className="w-full border border-transparent hover:border-[#E2E8F0] focus:border-[#2B7FFF] rounded-md px-2 py-1.5 text-[14px] bg-transparent focus:bg-white"
                        />
                      </td>
                      <td className="py-2 px-1 w-24">
                        <input
                          type="number"
                          step="0.25"
                          value={l.quantityHours}
                          onChange={(e) =>
                            updateLine(i, { quantityHours: Number(e.target.value) })
                          }
                          className="w-full text-center border border-transparent hover:border-[#E2E8F0] focus:border-[#2B7FFF] rounded-md px-2 py-1.5 text-[14px] tabular-nums bg-transparent focus:bg-white"
                        />
                      </td>
                      <td className="py-2 px-1 w-24">
                        <input
                          type="number"
                          value={l.rateIls}
                          onChange={(e) => updateLine(i, { rateIls: Number(e.target.value) })}
                          className="w-full text-center border border-transparent hover:border-[#E2E8F0] focus:border-[#2B7FFF] rounded-md px-2 py-1.5 text-[14px] tabular-nums bg-transparent focus:bg-white"
                        />
                      </td>
                      <td className="py-2 px-1 text-left font-semibold tabular-nums text-[#0F172A] whitespace-nowrap">
                        {fmtIls(l.quantityHours * l.rateIls)}
                      </td>
                      <td className="py-2 pr-1">
                        <button
                          onClick={() => removeLine(i)}
                          className="text-[#94A3B8] hover:text-red-600 text-[12px]"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addBlankLine} className="text-[12px] font-semibold text-[#2B7FFF] hover:underline">
              + הוסף שורה ידנית
            </button>
          </section>

          {/* Step 3: details + totals */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
            <h2 className="text-[13px] font-bold text-[#0F172A]">3. פרטים אחרונים</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="block">
                <span className="block text-[11px] font-semibold text-[#64748B] mb-1">תאריך הפקה</span>
                <input
                  type="date"
                  value={issuedAt}
                  onChange={(e) => setIssuedAt(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
                />
              </label>
              <label className="block">
                <span className="block text-[11px] font-semibold text-[#64748B] mb-1">לתשלום עד</span>
                <input
                  type="date"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
                />
              </label>
              <label className="block">
                <span className="block text-[11px] font-semibold text-[#64748B] mb-1">מע&quot;מ (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={vatPercent}
                  onChange={(e) => setVatPercent(Number(e.target.value))}
                  className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px] tabular-nums"
                />
              </label>
            </div>
            <label className="block">
              <span className="block text-[11px] font-semibold text-[#64748B] mb-1">הערה ללקוח (אופציונלי)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
                placeholder="למשל: תודה על שיתוף הפעולה החודש."
              />
            </label>

            <div className="border-t border-[#F1F5F9] pt-4 space-y-1.5 text-[14px]">
              <div className="flex justify-between text-[#64748B]">
                <span>סכום ביניים</span>
                <span className="tabular-nums">{fmtIls(subtotal)}</span>
              </div>
              {vatPercent > 0 && (
                <div className="flex justify-between text-[#64748B]">
                  <span>מע&quot;מ ({vatPercent}%)</span>
                  <span className="tabular-nums">{fmtIls(vat)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#0F172A] font-bold text-[16px] pt-2 border-t border-[#F1F5F9]">
                <span>סה&quot;כ לתשלום</span>
                <span className="tabular-nums text-[#2B7FFF]">{fmtIls(total)}</span>
              </div>
            </div>

            <button
              onClick={create}
              disabled={submitting || lines.length === 0}
              className="w-full rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[14px] font-semibold py-3"
            >
              {submitting ? "יוצר..." : "צור חשבונית (טיוטה)"}
            </button>
            <p className="text-[11px] text-[#94A3B8] text-center">
              החשבונית תיווצר כטיוטה — בעמוד הבא תוכל לשלוח אותה במייל.
            </p>
          </section>
        </>
      )}

      {clientId && !loading && entries.length === 0 && lines.length === 0 && (
        <p className="text-center text-[#94A3B8] py-8 text-[13px]">
          אין שעות שטרם חויבו ללקוח הזה בטווח הנבחר.
          <br />
          <button onClick={addBlankLine} className="text-[#2B7FFF] hover:underline mt-2">
            הוסף שורה ידנית
          </button>
        </p>
      )}

      <div className="text-[11px] text-[#94A3B8] flex gap-2">
        <span>תאריך נוכחי: {fmtDateHe(new Date())}</span>
      </div>
    </div>
  );
}
