"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  TASK_UPDATE_KIND_HE,
  TASK_UPDATE_KIND_ICON,
  TASK_STATUS_HE,
} from "@/lib/admin/format";

type UpdateKind = keyof typeof TASK_UPDATE_KIND_HE;
type TaskStatus = keyof typeof TASK_STATUS_HE;

const KIND_ORDER: UpdateKind[] = [
  "progress",
  "call",
  "meeting",
  "email",
  "decision",
  "blocker",
  "handoff",
];

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "waiting", "blocked", "done"];

export default function TaskUpdateForm({
  taskId,
  currentStatus,
  clientHasProject,
}: {
  taskId: number;
  currentStatus: TaskStatus;
  /** True when the task's project belongs to a client — controls visibility of "log to client" toggle. */
  clientHasProject: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [kind, setKind] = useState<UpdateKind>("progress");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");

  const [setStatus, setSetStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<TaskStatus>(currentStatus);
  const [waitingOn, setWaitingOn] = useState("");

  const [setNext, setSetNext] = useState(false);
  const [nextAction, setNextAction] = useState("");

  const [setFollow, setSetFollow] = useState(false);
  const [followUpAt, setFollowUpAt] = useState("");

  const [logTime, setLogTime] = useState(false);
  const [timeMinutes, setTimeMinutes] = useState("");

  const [alsoComm, setAlsoComm] = useState(false);

  function reset() {
    setKind("progress");
    setSummary("");
    setDetails("");
    setSetStatus(false);
    setNewStatus(currentStatus);
    setWaitingOn("");
    setSetNext(false);
    setNextAction("");
    setSetFollow(false);
    setFollowUpAt("");
    setLogTime(false);
    setTimeMinutes("");
    setAlsoComm(false);
    setOpen(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/admin/task-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId,
        kind,
        summary: summary.trim(),
        details: details.trim() || null,
        newStatus: setStatus ? newStatus : null,
        waitingOn:
          setStatus && newStatus === "waiting" ? waitingOn.trim() || null : undefined,
        nextAction: setNext ? nextAction.trim() || null : undefined,
        followUpAt: setFollow ? followUpAt || null : undefined,
        timeMinutes: logTime && timeMinutes ? Number(timeMinutes) : null,
        alsoLogAsCommunication: alsoComm,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("נשמר");
      reset();
      router.refresh();
    } else {
      toast.error("שמירה נכשלה");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-[#CBD5E1] hover:border-[#2B7FFF] hover:bg-[#EFF6FF] text-[14px] font-semibold text-[#2B7FFF] py-3 transition-colors"
      >
        ➕ הוסף עדכון
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
      {/* Kind picker — chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {KIND_ORDER.map((k) => (
          <button
            type="button"
            key={k}
            onClick={() => setKind(k)}
            className={`text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors ${
              kind === k
                ? "bg-[#0F172A] text-white"
                : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
            }`}
          >
            <span className="me-1">{TASK_UPDATE_KIND_ICON[k]}</span>
            {TASK_UPDATE_KIND_HE[k]}
          </button>
        ))}
      </div>

      <input
        autoFocus
        required
        placeholder="מה קרה? (חובה — שורה אחת)"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
      />

      <textarea
        placeholder="פירוט (אופציונלי)"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={3}
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px] resize-y"
      />

      {/* Optional fields — each gated by a checkbox to keep the form quiet */}
      <div className="space-y-2.5 text-[13px]">
        <OptionalRow
          checked={setStatus}
          onToggle={() => setSetStatus((v) => !v)}
          label="שנה סטטוס"
        >
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
            className="border border-[#E2E8F0] rounded-md bg-white px-2 py-1 text-[13px]"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_HE[s]}
              </option>
            ))}
          </select>
        </OptionalRow>

        {setStatus && newStatus === "waiting" && (
          <div className="flex items-center gap-3 ps-7">
            <span className="text-[#0F172A] font-medium min-w-[170px]">ממתין ל…</span>
            <input
              value={waitingOn}
              onChange={(e) => setWaitingOn(e.target.value)}
              placeholder="דנה — תשובה על האפיון"
              className="flex-1 border border-[#E2E8F0] rounded-md bg-white px-2 py-1 text-[13px]"
            />
          </div>
        )}

        <OptionalRow
          checked={setNext}
          onToggle={() => setSetNext((v) => !v)}
          label="הצעד הבא"
        >
          <input
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="לחזור לדנה ביום ראשון"
            className="flex-1 border border-[#E2E8F0] rounded-md bg-white px-2 py-1 text-[13px]"
          />
        </OptionalRow>

        <OptionalRow
          checked={setFollow}
          onToggle={() => setSetFollow((v) => !v)}
          label="תאריך מעקב"
        >
          <input
            type="date"
            value={followUpAt}
            onChange={(e) => setFollowUpAt(e.target.value)}
            className="border border-[#E2E8F0] rounded-md bg-white px-2 py-1 text-[13px]"
          />
        </OptionalRow>

        <OptionalRow
          checked={logTime}
          onToggle={() => setLogTime((v) => !v)}
          label="רשום זמן"
        >
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={1440}
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(e.target.value)}
              placeholder="30"
              className="w-20 border border-[#E2E8F0] rounded-md bg-white px-2 py-1 text-[13px] tabular-nums"
            />
            <span className="text-[12px] text-[#64748B]">דקות</span>
          </div>
        </OptionalRow>

        {clientHasProject && (kind === "call" || kind === "meeting" || kind === "email" || kind === "decision") && (
          <OptionalRow
            checked={alsoComm}
            onToggle={() => setAlsoComm((v) => !v)}
            label="רשום גם ביומן התקשורת של הלקוח"
          />
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-[#F1F5F9]">
        <button
          type="submit"
          disabled={submitting || !summary.trim()}
          className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-1.5"
        >
          {submitting ? "שומר..." : "שמור עדכון"}
        </button>
        <button type="button" onClick={reset} className="text-[13px] text-[#64748B]">
          ביטול
        </button>
      </div>
    </form>
  );
}

function OptionalRow({
  checked,
  onToggle,
  label,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 cursor-pointer select-none min-w-[200px]">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="w-4 h-4 accent-[#2B7FFF]"
        />
        <span className={checked ? "text-[#0F172A] font-medium" : "text-[#64748B]"}>{label}</span>
      </label>
      {checked && children}
    </div>
  );
}
