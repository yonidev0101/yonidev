"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  TASK_STATUS_HE,
  TASK_STATUS_TONE,
  TASK_PRIORITY_HE,
  TASK_PRIORITY_DOT,
  actionableDate,
  fmtDateHe,
  relativeDayHe,
  waitingSinceDaysHe,
  isTaskClosed,
  isStaleTask,
  daysSince,
} from "@/lib/admin/format";
import { DOMAIN_LABEL, DOMAIN_TONE, routes, type Domain } from "@/lib/admin/domain";
import { useInlineEdit } from "@/lib/admin/useInlineEdit";
import TaskEditRow from "./TaskEditRow";
import { confirm } from "./ConfirmDialog";

export interface TaskRow {
  id: number;
  domain: Domain;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  nextAction: string | null;
  acceptance?: string | null;
  followUpAt: string | null;
  waitingOn: string | null;
  waitingSince: string | null;
  estimateMinutes: number | null;
  lastUpdateAt: string | null;
  createdAt: string | null;
  projectId: number;
  projectName: string | null;
  clientName: string | null;
  stepsDone?: number;
  stepsTotal?: number;
}

const FILTERS: { key: Domain | "all"; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "personal", label: "אישי" },
  { key: "client", label: "לקוחות" },
];

export default function TasksList({
  tasks,
  kind = "all",
}: {
  tasks: TaskRow[];
  kind?: Domain | "all";
}) {
  const router = useRouter();
  // Keyed by domain+id: a client task and a personal task can share a numeric id,
  // so editing must not match both rows at once.
  const { editingId, startEdit, cancel } = useInlineEdit<string>();
  const [parkedOpen, setParkedOpen] = useState(false);
  const [view, setView] = useState<"list" | "board">("list");

  async function setStatus(t: TaskRow, status: string) {
    const res = await fetch(`${routes(t.domain).tasksApi}/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) router.refresh();
    else toast.error("עדכון נכשל");
  }

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

  async function del(t: TaskRow) {
    const ok = await confirm({
      title: "למחוק את המשימה?",
      confirmLabel: "מחק",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`${routes(t.domain).tasksApi}/${t.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("נמחק");
      router.refresh();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  function renderRow(t: TaskRow, accent?: "red" | "amber" | "blue") {
    const rowKey = `${t.domain}-${t.id}`;
    if (editingId === rowKey) {
      return (
        <li key={rowKey} className="px-4 py-2.5">
          <TaskEditRow task={t} onCancel={cancel} onSaved={cancel} />
        </li>
      );
    }
    const dateForRow = actionableDate(t);
    const dateLabel = t.followUpAt
      ? relativeDayHe(t.followUpAt)
      : dateForRow
        ? relativeDayHe(dateForRow) ?? fmtDateHe(dateForRow)
        : null;
    const stale = isStaleTask(t);
    const staleDays = stale ? daysSince(t.lastUpdateAt ?? t.createdAt) : null;
    const context = [t.clientName, t.projectName].filter(Boolean).join(" · ");
    const waitingLine =
      t.status === "waiting" && (t.waitingOn || t.waitingSince)
        ? [t.waitingOn ? `ממתין ל${t.waitingOn}` : "ממתין", waitingSinceDaysHe(t.waitingSince)]
            .filter(Boolean)
            .join(" · ")
        : null;
    return (
      <li
        key={rowKey}
        className="group flex items-start gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors"
      >
        <span
          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TASK_PRIORITY_DOT[t.priority]}`}
          title={`עדיפות ${TASK_PRIORITY_HE[t.priority]}`}
        />

        <div className="flex-1 min-w-0 space-y-0.5">
          <Link
            href={routes(t.domain).taskDetail(t.id)}
            className="block text-[14px] font-medium text-[#0F172A] hover:text-[#2B7FFF] truncate"
          >
            {t.title}
          </Link>
          <div className="text-[11px] text-[#94A3B8] truncate flex items-center gap-1.5">
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 rounded ${DOMAIN_TONE[t.domain]}`}
            >
              {DOMAIN_LABEL[t.domain]}
            </span>
            {t.stepsTotal ? (
              <span className="tabular-nums text-[#64748B]">
                ✔ {t.stepsDone ?? 0}/{t.stepsTotal}
              </span>
            ) : null}
            {stale && (
              <span className="text-amber-700 whitespace-nowrap" title={`לא זז ${staleDays} ימים`}>
                💤 {staleDays} ימ׳
              </span>
            )}
            {context && <span className="truncate">{context}</span>}
          </div>
          {waitingLine && (
            <div className="text-[12px] text-[#2B7FFF] truncate">⏳ {waitingLine}</div>
          )}
          {t.nextAction && (
            <div className="text-[12px] text-[#475569] truncate">→ {t.nextAction}</div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-2 pt-0.5">
          {dateLabel && (
            <span
              className={`text-[12px] tabular-nums whitespace-nowrap ${
                accent === "red"
                  ? "text-red-600 font-semibold"
                  : accent === "amber"
                    ? "text-amber-700 font-semibold"
                    : "text-[#64748B]"
              }`}
              title={t.followUpAt ? `מעקב: ${fmtDateHe(t.followUpAt)}` : `דד-ליין: ${fmtDateHe(t.dueDate!)}`}
            >
              {dateLabel}
            </span>
          )}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${TASK_STATUS_TONE[t.status]}`}
          >
            {TASK_STATUS_HE[t.status]}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              onClick={() => startEdit(rowKey)}
              className="p-1 rounded text-[#94A3B8] hover:text-[#2B7FFF] hover:bg-[#EFF6FF]"
              aria-label="ערוך"
            >
              <PencilIcon />
            </button>
            <button
              onClick={() => del(t)}
              className="p-1 rounded text-[#94A3B8] hover:text-red-600 hover:bg-red-50"
              aria-label="מחק"
            >
              <TrashIcon />
            </button>
          </div>
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

  const toolbar = (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="inline-flex items-center gap-1 bg-[#F1F5F9] rounded-full p-1">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/tasks" : `/admin/tasks?kind=${f.key}`}
            className={`text-[12px] font-semibold px-3 py-1 rounded-full transition ${
              kind === f.key ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* View toggle: date-triage list ↔ status board. */}
      <div className="inline-flex items-center gap-1 bg-[#F1F5F9] rounded-full p-1">
        <ViewButton active={view === "list"} onClick={() => setView("list")} label="רשימה" />
        <ViewButton active={view === "board"} onClick={() => setView("board")} label="לוח" />
      </div>
    </div>
  );

  if (tasks.length === 0) {
    return (
      <div className="space-y-6">
        {toolbar}
        <p className="text-center text-[#94A3B8] py-12">כל המשימות סגורות. כל הכבוד.</p>
      </div>
    );
  }

  if (view === "board") {
    return (
      <div className="space-y-6">
        {toolbar}
        <TaskBoard tasks={tasks} onStatus={setStatus} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {toolbar}
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

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function ViewButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[12px] font-semibold px-3 py-1 rounded-full transition ${
        active ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
      }`}
    >
      {label}
    </button>
  );
}

// ── Kanban board view: columns by status, cards carry the same info as the list ──

const BOARD_COLS: { key: string; core: boolean }[] = [
  { key: "todo", core: true },
  { key: "in_progress", core: true },
  { key: "waiting", core: false },
  { key: "blocked", core: false },
  { key: "done", core: true },
];

function TaskBoard({
  tasks,
  onStatus,
}: {
  tasks: TaskRow[];
  onStatus: (t: TaskRow, status: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  // Canceled tasks stay out of the board — they live in the list view.
  const cols = BOARD_COLS.map((c) => ({
    ...c,
    list: tasks.filter((t) => t.status === c.key),
  })).filter((c) => c.core || c.list.length > 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {cols.map((col) => (
        <div key={col.key} className="bg-[#F1F5F9] rounded-xl p-3">
          <h3 className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2 px-1">
            <span>{TASK_STATUS_HE[col.key]}</span>
            <span className="tabular-nums text-[#94A3B8]">{col.list.length}</span>
          </h3>
          <ul className="space-y-2">
            {col.list.map((t) => {
              const d = actionableDate(t);
              const overdue = d && d < today;
              return (
                <li
                  key={`${t.domain}-${t.id}`}
                  className="bg-white border border-[#E2E8F0] rounded-lg p-3 hover:border-[#2B7FFF]/40 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${TASK_PRIORITY_DOT[t.priority]}`}
                    />
                    <Link
                      href={routes(t.domain).taskDetail(t.id)}
                      className="flex-1 min-w-0 text-[13px] font-medium text-[#0F172A] hover:text-[#2B7FFF] leading-snug"
                    >
                      {t.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#94A3B8]">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 rounded ${DOMAIN_TONE[t.domain]}`}
                    >
                      {DOMAIN_LABEL[t.domain]}
                    </span>
                    {t.stepsTotal ? (
                      <span className="tabular-nums text-[#64748B]">
                        ✔ {t.stepsDone ?? 0}/{t.stepsTotal}
                      </span>
                    ) : null}
                    <span className="truncate">
                      {[t.clientName, t.projectName].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                  {t.nextAction && (
                    <div className="text-[11px] text-[#475569] mt-1 truncate">→ {t.nextAction}</div>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <select
                      value={t.status}
                      onChange={(e) => onStatus(t, e.target.value)}
                      aria-label="שנה סטטוס"
                      className="text-[11px] border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-1.5 py-1 text-[#64748B]"
                    >
                      {BOARD_COLS.map((c) => (
                        <option key={c.key} value={c.key}>
                          {TASK_STATUS_HE[c.key]}
                        </option>
                      ))}
                      <option value="canceled">{TASK_STATUS_HE.canceled}</option>
                    </select>
                    {d && (
                      <span
                        className={`text-[11px] tabular-nums ${
                          overdue ? "text-red-600 font-semibold" : "text-[#94A3B8]"
                        }`}
                      >
                        {relativeDayHe(d) ?? fmtDateHe(d)}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
            {col.list.length === 0 && (
              <li className="text-[11px] text-[#94A3B8] text-center py-3">—</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
