"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Invoice } from "@/lib/db/schema";
import { confirm } from "./ConfirmDialog";

export default function InvoiceActions({
  invoice,
  clientHasEmail,
}: {
  invoice: Invoice;
  clientHasEmail: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function send() {
    const ok = await confirm({
      title: "לשלוח את הסיכום במייל?",
      description: "הלקוח יקבל את הסיכום מיד עם הפירוט המלא.",
      confirmLabel: "שלח",
    });
    if (!ok) return;
    setBusy("send");
    const res = await fetch(`/api/admin/invoices/${invoice.id}/send`, { method: "POST" });
    const json = await res.json();
    setBusy(null);
    if (res.ok) {
      toast.success("הסיכום נשלח", { description: "הסטטוס עודכן." });
      router.refresh();
    } else {
      toast.error("שליחה נכשלה", { description: json.error });
    }
  }

  async function setStatus(status: "paid" | "void" | "draft") {
    setBusy(status);
    const res = await fetch(`/api/admin/invoices/${invoice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    if (res.ok) {
      if (status === "paid") toast.success("סומן כשולם");
      else if (status === "void") toast.success("בוטל");
      router.refresh();
    } else {
      toast.error("עדכון נכשל");
    }
  }

  async function deleteInvoice() {
    const isImportant = invoice.status === "sent" || invoice.status === "paid";
    const ok = await confirm({
      title: isImportant ? "למחוק חשבונית שכבר נשלחה?" : "למחוק את הסיכום?",
      description: isImportant
        ? "החשבונית כבר נשלחה ללקוח, מחיקה רק תסיר אותה מהמערכת שלך — לא תשלח ביטול. השעות שנכללו יחזרו למצב 'פתוחות' (לא חויבו). פעולה לא הפיכה."
        : "השורות יימחקו, והשעות שנכללו יחזרו למצב 'פתוחות' (זמינות לחשבונית עתידית). פעולה לא הפיכה.",
      confirmLabel: "מחק",
      destructive: true,
    });
    if (!ok) return;
    setBusy("delete");
    const res = await fetch(`/api/admin/invoices/${invoice.id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) {
      toast.success("נמחק");
      router.push("/admin/invoices");
      router.refresh();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-3 flex-wrap">
      {invoice.status !== "paid" && (
        <button
          onClick={send}
          disabled={busy !== null || !clientHasEmail}
          title={!clientHasEmail ? "ללקוח אין כתובת מייל" : ""}
          className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-5 py-2"
        >
          {busy === "send" ? "שולח..." : invoice.status === "sent" ? "↻ שלח שוב" : "✉ שלח ללקוח"}
        </button>
      )}
      {invoice.status === "sent" && (
        <button
          onClick={() => setStatus("paid")}
          disabled={busy !== null}
          className="rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-2"
        >
          ✓ סמן כשולם
        </button>
      )}
      {invoice.status === "draft" && (
        <button
          onClick={() => setStatus("void")}
          disabled={busy !== null}
          className="text-[12px] text-[#94A3B8] hover:text-amber-600"
        >
          בטל
        </button>
      )}
      <button
        onClick={deleteInvoice}
        disabled={busy !== null}
        className="text-[12px] text-[#94A3B8] hover:text-red-600 ms-auto"
      >
        {busy === "delete" ? "מוחק..." : "מחק"}
      </button>
      {!clientHasEmail && (
        <span className="text-[12px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
          הוסף מייל ללקוח כדי לשלוח
        </span>
      )}
    </div>
  );
}
