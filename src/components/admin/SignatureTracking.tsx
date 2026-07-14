"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildSignatureHtml,
  buildSignatureText,
  trackingPixelUrl,
} from "@/lib/signature/signature";
import { fmtDateTimeHe } from "@/lib/admin/format";
import { confirm } from "./ConfirmDialog";

type Recipient = {
  id: number;
  email: string;
  token: string;
  note: string | null;
  createdAt: Date;
  openCount: number;
  lastOpenAt: string | null;
};

type Open = {
  id: number;
  openedAt: Date;
  userAgent: string | null;
  recipientId: number;
  email: string;
};

// Copies the signature as rich text (text/html) so it pastes formatted into
// Gmail/Outlook settings; falls back to raw-HTML text copy on old browsers.
async function copyRichHtml(html: string, plain: string): Promise<boolean> {
  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ]);
      return true;
    }
    await navigator.clipboard.writeText(html);
    return true;
  } catch {
    return false;
  }
}

function CopyButton({
  label,
  copiedLabel = "הועתק!",
  onCopy,
  primary = false,
}: {
  label: string;
  copiedLabel?: string;
  onCopy: () => Promise<boolean>;
  primary?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        if (await onCopy()) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }}
      className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition ${
        primary
          ? "bg-[#2B7FFF] text-white hover:bg-[#1D6AE5]"
          : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
      } ${copied ? "!bg-emerald-500 !text-white" : ""}`}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}

export default function SignatureTracking({
  recipients,
  recentOpens,
}: {
  recipients: Recipient[];
  recentOpens: Open[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedId, setLastCreatedId] = useState<number | null>(null);

  const baseHtml = useMemo(() => buildSignatureHtml(), []);
  const plainText = useMemo(() => buildSignatureText(), []);

  async function createRecipient(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/signature-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), note: note.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error === "Validation failed" ? "כתובת מייל לא תקינה" : "שגיאה ביצירת נמען");
        return;
      }
      setLastCreatedId(data.recipient.id);
      setEmail("");
      setNote("");
      router.refresh();
    } catch {
      setError("שגיאה ביצירת נמען");
    } finally {
      setBusy(false);
    }
  }

  async function deleteRecipient(r: Recipient) {
    const ok = await confirm({
      title: `למחוק את ${r.email}?`,
      description: "כל היסטוריית הפתיחות תימחק, והפיקסל בעותק שכבר נשלח יפסיק לתעד.",
      confirmLabel: "מחק",
      destructive: true,
    });
    if (!ok) return;
    await fetch(`/api/admin/signature-recipients/${r.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* ── signature preview + base copy ── */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 className="text-[15px] font-bold text-[#0F172A]">תצוגה מקדימה</h2>
          <CopyButton
            label="העתק חתימה (ללא מעקב)"
            onCopy={() => copyRichHtml(baseHtml, plainText)}
            primary
          />
        </div>
        <div
          dir="ltr"
          className="border border-dashed border-[#E2E8F0] rounded-lg p-4 overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: baseHtml }}
        />
      </section>

      {/* ── create tracked copy ── */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-5">
        <h2 className="text-[15px] font-bold text-[#0F172A] mb-1">חתימה עם מעקב פתיחה</h2>
        <p className="text-[12px] text-[#64748B] mb-4">
          הזן כתובת נמען כדי ליצור עותק חתימה עם פיקסל ייחודי. הדבק את העותק במייל שנשלח
          לאותו נמען — כל פתיחה תתועד כאן. שים לב: פתיחה שנרשמת בזמן ההדבקה/כתיבת המייל
          היא כנראה שלך.
        </p>
        <form onSubmit={createRecipient} className="flex flex-wrap items-center gap-2">
          <input
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@example.com"
            className="flex-1 min-w-[220px] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#CBD5E1] focus:outline-none focus:border-[#2B7FFF]"
          />
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="הערה (אופציונלי)"
            className="flex-1 min-w-[160px] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#CBD5E1] focus:outline-none focus:border-[#2B7FFF]"
          />
          <button
            type="submit"
            disabled={busy}
            className="bg-[#2B7FFF] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#1D6AE5] transition disabled:opacity-50"
          >
            {busy ? "יוצר..." : "צור עותק מעקב"}
          </button>
        </form>
        {error && <p className="text-[12px] text-red-600 mt-2">{error}</p>}
      </section>

      {/* ── recipients table ── */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-[15px] font-bold text-[#0F172A]">
            נמענים {recipients.length ? `· ${recipients.length}` : ""}
          </h2>
        </div>
        {recipients.length === 0 ? (
          <div className="px-5 pb-8 pt-2 text-center text-[13px] text-[#94A3B8]">
            עדיין אין נמענים במעקב. צור את הראשון למעלה.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-right text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] border-t border-b border-[#F1F5F9]">
                  <th className="px-5 py-2.5 font-bold">נמען</th>
                  <th className="px-3 py-2.5 font-bold">נוצר</th>
                  <th className="px-3 py-2.5 font-bold">פתיחות</th>
                  <th className="px-3 py-2.5 font-bold">פתיחה אחרונה</th>
                  <th className="px-5 py-2.5 font-bold text-left">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-b border-[#F1F5F9] last:border-b-0 ${
                      r.id === lastCreatedId ? "bg-[#EFF6FF]" : ""
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div dir="ltr" className="text-right font-medium text-[#0F172A]">
                        {r.email}
                      </div>
                      {r.note && <div className="text-[11px] text-[#94A3B8] mt-0.5">{r.note}</div>}
                    </td>
                    <td className="px-3 py-3 text-[#64748B] whitespace-nowrap">
                      {fmtDateTimeHe(r.createdAt)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-block min-w-6 text-center text-[12px] font-bold px-2 py-0.5 rounded-full ${
                          r.openCount > 0
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-[#F1F5F9] text-[#94A3B8]"
                        }`}
                      >
                        {r.openCount}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[#64748B] whitespace-nowrap">
                      {fmtDateTimeHe(r.lastOpenAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <CopyButton
                          label="העתק חתימה"
                          onCopy={() =>
                            copyRichHtml(buildSignatureHtml(trackingPixelUrl(r.token)), plainText)
                          }
                          primary={r.id === lastCreatedId}
                        />
                        <CopyButton
                          label="URL פיקסל"
                          onCopy={async () => {
                            try {
                              await navigator.clipboard.writeText(trackingPixelUrl(r.token));
                              return true;
                            } catch {
                              return false;
                            }
                          }}
                        />
                        <button
                          onClick={() => deleteRecipient(r)}
                          className="text-[12px] font-semibold px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                        >
                          מחק
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── recent opens feed ── */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-5">
        <h2 className="text-[15px] font-bold text-[#0F172A] mb-3">
          פתיחות אחרונות {recentOpens.length ? `· ${recentOpens.length}` : ""}
        </h2>
        {recentOpens.length === 0 ? (
          <p className="text-[13px] text-[#94A3B8]">עדיין לא תועדו פתיחות.</p>
        ) : (
          <ul className="space-y-2">
            {recentOpens.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-3 text-[13px] border-b border-[#F1F5F9] last:border-b-0 pb-2 last:pb-0"
              >
                <div className="min-w-0">
                  <span dir="ltr" className="font-medium text-[#0F172A]">
                    {o.email}
                  </span>
                  {o.userAgent && (
                    <span className="text-[11px] text-[#CBD5E1] mr-2 hidden sm:inline">
                      {o.userAgent.slice(0, 60)}
                    </span>
                  )}
                </div>
                <span className="text-[#64748B] whitespace-nowrap tabular-nums">
                  {fmtDateTimeHe(o.openedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
