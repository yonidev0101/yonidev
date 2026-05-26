"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fmtDateTimeHe, fmtHours } from "@/lib/admin/format";
import { useInlineEdit } from "@/lib/admin/useInlineEdit";
import TimeEntryEditRow from "./TimeEntryEditRow";
import { confirm } from "./ConfirmDialog";

export interface TimeRow {
  id: number;
  projectId: number;
  projectName: string | null;
  clientName: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  note: string | null;
  invoicedInvoiceId: number | null;
  billable: boolean;
}

export default function TimeEntriesList({ entries }: { entries: TimeRow[] }) {
  const router = useRouter();
  const { editingId, startEdit, cancel } = useInlineEdit<number>();

  async function del(id: number) {
    const ok = await confirm({
      title: "למחוק את רשומת השעות?",
      confirmLabel: "מחק",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/time/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("נמחק");
      router.refresh();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  if (entries.length === 0) {
    return (
      <p className="text-center text-[#94A3B8] py-12 text-[13px]">
        אין רשומות שעות עדיין. התחל טיימר או הוסף שעות ידנית.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[#F1F5F9]">
      {entries.map((r) => {
        if (editingId === r.id) {
          return (
            <li key={r.id} className="px-3 py-2">
              <TimeEntryEditRow
                entry={{
                  id: r.id,
                  startedAt: r.startedAt,
                  durationSeconds: r.durationSeconds,
                  note: r.note,
                  billable: r.billable,
                }}
                onCancel={cancel}
                onSaved={cancel}
              />
            </li>
          );
        }
        return (
          <li
            key={r.id}
            className="hover:bg-[#F8FAFC] text-[13px] flex items-center gap-3 px-5 py-2.5"
          >
            <div className="text-[#64748B] whitespace-nowrap w-[140px] shrink-0">
              {fmtDateTimeHe(r.startedAt)}
            </div>
            <Link
              href={`/admin/projects/${r.projectId}`}
              className="text-[#0F172A] hover:text-[#2B7FFF] flex-1 min-w-0 truncate"
            >
              <span className="text-[#94A3B8]">{r.clientName} · </span>
              {r.projectName}
            </Link>
            <div className="text-[#475569] hidden md:block max-w-[260px] truncate">
              {r.note || <span className="text-[#CBD5E1]">—</span>}
            </div>
            <div className="tabular-nums font-semibold text-[#0F172A] w-[70px] text-left">
              {r.endedAt ? fmtHours(r.durationSeconds) : <span className="text-[#2B7FFF]">פעיל</span>}
            </div>
            <div className="text-[11px] text-center w-[80px]">
              {r.invoicedInvoiceId ? (
                <Link
                  href={`/admin/invoices/${r.invoicedInvoiceId}`}
                  className="text-[#2B7FFF] hover:underline"
                >
                  הוכלל ✓
                </Link>
              ) : r.endedAt ? (
                <span className="text-[#94A3B8]">פתוחה</span>
              ) : (
                <span className="text-[#CBD5E1]">—</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 w-[60px] justify-end">
              {r.endedAt && (
                <>
                  <button
                    onClick={() => startEdit(r.id)}
                    className="text-[12px] text-[#94A3B8] hover:text-[#2B7FFF]"
                    aria-label="ערוך"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => del(r.id)}
                    className="text-[12px] text-[#94A3B8] hover:text-red-600"
                    aria-label="מחק"
                  >
                    🗑
                  </button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
