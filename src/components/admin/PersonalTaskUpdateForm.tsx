"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PERSONAL_UPDATE_KIND_HE,
  PERSONAL_UPDATE_KIND_ICON,
  TASK_STATUS_HE,
} from "@/lib/admin/format";

type UpdateKind = keyof typeof PERSONAL_UPDATE_KIND_HE;
type TaskStatus = keyof typeof TASK_STATUS_HE;

const KIND_ORDER: UpdateKind[] = [
  "progress",
  "commit",
  "decision",
  "blocker",
  "bug",
  "research",
  "note",
];

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "waiting", "blocked", "done"];

/** Journal composer — one entry answers "what happened, and what changed because of it". */
export default function PersonalTaskUpdateForm({
  taskId,
  currentStatus,
  hasRepo,
}: {
  taskId: number;
  currentStatus: TaskStatus;
  /** The project has a GitHub link, so a bare SHA can be auto-linked. */
  hasRepo: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [kind, setKind] = useState<UpdateKind>("progress");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [commitSha, setCommitSha] = useState("");
  const [setStatus, setSetStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<TaskStatus>(currentStatus);
  const [setNext, setSetNext] = useState(false);
  const [nextAction, setNextAction] = useState("");
  const [logTime, setLogTime] = useState(false);
  const [timeMinutes, setTimeMinutes] = useState("");

  function reset() {
    setKind("progress");
    setSummary("");
    setDetails("");
    setCommitSha("");
    setSetStatus(false);
    setNewStatus(currentStatus);
    setSetNext(false);
    setNextAction("");
    setLogTime(false);
    setTimeMinutes("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/admin/personal-task-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId,
        kind,
        summary: summary.trim(),
        details: details.trim() || null,
        commitSha: commitSha.trim() || null,
        newStatus: setStatus ? newStatus : null,
        nextAction: setNext ? nextAction.trim() || null : undefined,
        timeMinutes: logTime && timeMinutes ? Number(timeMinutes) : null,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      reset();
      toast.success("העדכון נרשם");
      router.refresh();
    } else {
      toast.error("שמירת העדכון נכשלה");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      dir="rtl"
      className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4"
    >
      <div className="flex flex-wrap gap-1.5">
        {KIND_ORDER.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition ${
              kind === k
                ? "bg-[#0F172A] text-white border-[#0F172A]"
                : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#94A3B8]"
            }`}
          >
            {PERSONAL_UPDATE_KIND_ICON[k]} {PERSONAL_UPDATE_KIND_HE[k]}
          </button>
        ))}
      </div>

      <input
        required
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="מה קרה? (שורה אחת — למשל: סיימתי את מסך ההתחברות)"
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2.5 text-[14px]"
      />

      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={3}
        placeholder="פירוט — איך פתרת, מה ניסית, למה בחרת ככה (לא חובה)"
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px] resize-y leading-relaxed"
      />

      <input
        value={commitSha}
        onChange={(e) => setCommitSha(e.target.value)}
        placeholder={hasRepo ? "מספר קומיט (SHA) — יהפוך אוטומטית ללינק" : "מספר קומיט (SHA)"}
        dir="ltr"
        className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px] font-mono"
      />

      <div className="space-y-2 border-t border-[#F1F5F9] pt-3">
        <Toggle checked={setStatus} onChange={setSetStatus} label="שנה סטטוס">
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
        </Toggle>

        <Toggle checked={setNext} onChange={setSetNext} label="הצעד הבא">
          <input
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="מה הדבר הבא שצריך לקרות?"
            className="flex-1 min-w-[200px] border border-[#E2E8F0] rounded-md bg-white px-2 py-1 text-[13px]"
          />
        </Toggle>

        <Toggle checked={logTime} onChange={setLogTime} label="רשום זמן">
          <input
            type="number"
            min="0"
            step="5"
            value={timeMinutes}
            onChange={(e) => setTimeMinutes(e.target.value)}
            placeholder="דקות"
            className="w-24 border border-[#E2E8F0] rounded-md bg-white px-2 py-1 text-[13px] tabular-nums"
          />
        </Toggle>
      </div>

      <button
        disabled={submitting || !summary.trim()}
        className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-6 py-2.5"
      >
        {submitting ? "שומר..." : "רשום עדכון"}
      </button>
    </form>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <label className="flex items-center gap-2 text-[13px] text-[#475569] min-w-[110px] cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="accent-[#2B7FFF]"
        />
        {label}
      </label>
      {checked && children}
    </div>
  );
}
