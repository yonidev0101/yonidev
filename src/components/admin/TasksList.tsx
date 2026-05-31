"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  TASK_STATUS_HE,
  TASK_PRIORITY_HE,
  actionableDate,
  fmtDateHe,
  relativeDayHe,
  waitingSinceDaysHe,
  isTaskClosed,
  isStaleTask,
  daysSince,
} from "@/lib/admin/format";
import { useInlineEdit } from "@/lib/admin/useInlineEdit";
import TaskEditRow from "./TaskEditRow";
import { confirm } from "./ConfirmDialog";

export interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  nextAction: string | null;
  followUpAt: string | null;
  waitingOn: string | null;
  waitingSince: string | null;
  estimateMinutes: number | null;
  lastUpdateAt: string | null;
  createdAt: string | null;
  projectId: number;
  projectName: string | null;
  clientName: string | null;
}

export default function TasksList({ tasks }: { tasks: TaskRow[] }) {
  const router = useRouter();
  const { editingId, startEdit, cancel } = useInlineEdit<number>();
  const [parkedOpen, setParkedOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const open = tasks.filter((t) => !isTaskClosed(t.status));
  const completed = tasks.filter((t) => t.status === "done");
  const canceled = tasks.filter((t) => t.status === "canceled");

  const isWaitingDue = (t: TaskRow) =>
    t.status === "waiting" && !!t.followUpAt && t.followUpAt <= today;

  // Waiting tasks whose follow-up has arrived act as nudges and float to the top;
  // the rest are "parked" and tucked into a quiet, collapsible section.
  const parked = open.filter((t) => t.status === "waiting" && !isWaitingDue(t));
  const blocked = open.filter((t) => t.status === "blocked");
  // "regular" = anything that isn't parked or blocked (incl. waiting-due nudges).
  const regular = open.filter((t) => {
    if (t.status === "blocked") return false;
    if (t.status === "waiting") return isWaitingDue(t);
    return true;
  });

  const grouped = {
    overdue: regular.filter((t) => {
      const d = actionableDate(t);
      return d && d < today;
    }),
    today: regular.filter((t) => actionableDate(t) === today),
    upcoming: regular.filter((t) => {
      const d = actionableDate(t);
      return d && d > today;
    }),
    unscheduled: regular.filter((t) => !actionableDate(t)),
  };

  async function del(id: number) {
    const ok = await confirm({
      title: "למחוק את המשימה?",
      confirmLabel: "מחק",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("נמחק");
      router.refresh();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  function renderRow(t: TaskRow, accent?: "red" | "amber" | "blue") {
    if (editingId === t.id) {
      return (
        <li key={t.id} className="px-3 py-2">
          <TaskEditRow task={t} onCancel={cancel} onSaved={cancel} />
        </li>
      );
    }
    const dateForRow = actionableDate(t);
    const dateLabel = t.followUpAt ? relativeDayHe(t.followUpAt) : null;
    const stale = isStaleTask(t);
    const staleDays = stale ? daysSince(t.lastUpdateAt ?? t.createdAt) : null;
    const waitingLine =
      t.status === "waiting" && (t.waitingOn || t.waitingSince)
        ? [t.waitingOn ? `ממתין ל${t.waitingOn}` : "ממתין", waitingSinceDaysHe(t.waitingSince)]
            .filter(Boolean)
            .join(" · ")
        : null;
    return (
      <li key={t.id} className="px-5 py-3 flex items-start gap-3">
        <span
          className={`mt-2 w-2 h-2 rounded-full shrink-0 ${
            t.priority === "high"
              ? "bg-red-500"
              : t.priority === "medium"
                ? "bg-amber-500"
                : "bg-[#94A3B8]"
          }`}
        />
        <div className="flex-1 min-w-0">
          <Link
            href={`/admin/tasks/${t.id}`}
            className="block text-[14px] font-medium text-[#0F172A] hover:text-[#2B7FFF] truncate"
          >
            {t.title}
          </Link>
          <div className="text-[11px] text-[#94A3B8] truncate">
            {t.clientName} · {t.projectName}
          </div>
          {waitingLine && (
            <div className="text-[12px] text-[#2B7FFF] mt-1 truncate">⏳ {waitingLine}</div>
          )}
          {t.nextAction && (
            <div className="text-[12px] text-[#475569] mt-1 truncate">
              → {t.nextAction}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {stale && (
            <span
              className="text-[11px] text-amber-700 bg-amber-50 rounded-full px-2 py-0.5 whitespace-nowrap"
              title={`לא זז ${staleDays} ימים`}
            >
              💤 {staleDays} ימ׳
            </span>
          )}
          <span className="text-[11px] text-[#64748B] hidden sm:inline">
            {TASK_PRIORITY_HE[t.priority]}
          </span>
          <span className="text-[11px] text-[#94A3B8]">{TASK_STATUS_HE[t.status]}</span>
          {dateForRow && (
            <span
              className={`text-[12px] tabular-nums ${
                accent === "red"
                  ? "text-red-600 font-semibold"
                  : accent === "amber"
                    ? "text-amber-700 font-semibold"
                    : "text-[#64748B]"
              }`}
              title={t.followUpAt ? `מעקב: ${fmtDateHe(t.followUpAt)}` : `דד-ליין: ${fmtDateHe(t.dueDate!)}`}
            >
              {dateLabel ?? fmtDateHe(dateForRow)}
            </span>
          )}
          <button
            onClick={() => startEdit(t.id)}
            className="text-[12px] text-[#94A3B8] hover:text-[#2B7FFF]"
            aria-label="ערוך"
          >
            ✎
          </button>
          <button
            onClick={() => del(t.id)}
            className="text-[12px] text-[#94A3B8] hover:text-red-600"
            aria-label="מחק"
          >
            🗑
          </button>
        </div>
      </li>
    );
  }

  function renderGroup(
    title: string,
    list: TaskRow[],
    accent?: "red" | "amber" | "blue",
  ) {
    if (list.length === 0) return null;
    return (
      <section>
        <h2
          className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${
            accent === "red"
              ? "text-red-600"
              : accent === "amber"
                ? "text-amber-700"
                : accent === "blue"
                  ? "text-[#2B7FFF]"
                  : "text-[#94A3B8]"
          }`}
        >
          {title} · {list.length}
        </h2>
        <ul className="bg-white border border-[#E2E8F0] rounded-xl divide-y divide-[#F1F5F9] overflow-hidden">
          {list.map((t) => renderRow(t, accent))}
        </ul>
      </section>
    );
  }

  if (tasks.length === 0) {
    return <p className="text-center text-[#94A3B8] py-12">כל המשימות סגורות. כל הכבוד.</p>;
  }

  return (
    <div className="space-y-8">
      {renderGroup("באיחור", grouped.overdue, "red")}
      {renderGroup("היום", grouped.today, "amber")}
      {renderGroup("חסום", blocked, "amber")}
      {renderGroup("בקרוב", grouped.upcoming)}
      {renderGroup("ללא תאריך", grouped.unscheduled)}

      {/* Parked / waiting — quiet, collapsible. Surfaces on its own when follow-up arrives. */}
      {parked.length > 0 && (
        <section>
          <button
            onClick={() => setParkedOpen((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2B7FFF] mb-2 hover:opacity-80"
          >
            <span className={`transition-transform ${parkedOpen ? "rotate-90" : ""}`}>▸</span>
            ממתין · {parked.length}
          </button>
          {parkedOpen && (
            <ul className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl divide-y divide-[#F1F5F9] overflow-hidden">
              {parked.map((t) => renderRow(t, "blue"))}
            </ul>
          )}
        </section>
      )}

      {renderGroup("הושלמו", completed)}
      {renderGroup("בוטלו", canceled)}
    </div>
  );
}
