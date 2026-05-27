"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  TASK_UPDATE_KIND_HE,
  TASK_UPDATE_KIND_ICON,
  TASK_STATUS_HE,
  fmtDateTimeHe,
  fmtHours,
  taskUpdateKindTone,
} from "@/lib/admin/format";
import { confirm } from "./ConfirmDialog";

export interface TimelineUpdate {
  id: number;
  kind: string;
  happenedAt: string | Date;
  summary: string;
  details: string | null;
  statusBefore: string | null;
  statusAfter: string | null;
  nextAction: string | null;
  followUpAt: string | null;
  communicationId: number | null;
  timeEntry: { durationSeconds: number | null } | null;
}

const TONE_CLASS: Record<ReturnType<typeof taskUpdateKindTone>, string> = {
  blue: "bg-[#EFF6FF] text-[#2B7FFF]",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700",
  slate: "bg-[#F1F5F9] text-[#64748B]",
};

export default function TaskTimeline({
  updates,
  taskCreatedAt,
}: {
  updates: TimelineUpdate[];
  taskCreatedAt: string | Date;
}) {
  const router = useRouter();

  async function del(id: number) {
    const ok = await confirm({
      title: "למחוק את העדכון?",
      description: "אם נרשם זמן או נשלח גם ליומן התקשורת — גם הם יימחקו.",
      confirmLabel: "מחק",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/task-updates/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("נמחק");
      router.refresh();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  return (
    <ol className="relative space-y-4">
      <span
        aria-hidden
        className="absolute top-2 bottom-2 right-[11px] w-px bg-[#E2E8F0]"
      />
      {updates.map((u) => {
        const tone = taskUpdateKindTone(u.kind);
        return (
          <li key={u.id} className="relative ps-8 group">
            <span
              className={`absolute right-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[12px] ring-4 ring-[#F8FAFC] ${TONE_CLASS[tone]}`}
            >
              {TASK_UPDATE_KIND_ICON[u.kind]}
            </span>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
              <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${TONE_CLASS[tone]}`}>
                  {TASK_UPDATE_KIND_HE[u.kind]}
                </span>
                <span className="text-[12px] text-[#94A3B8]">{fmtDateTimeHe(u.happenedAt)}</span>
                {u.timeEntry?.durationSeconds != null && u.timeEntry.durationSeconds > 0 && (
                  <span className="text-[12px] text-[#64748B] tabular-nums">
                    · {fmtHours(u.timeEntry.durationSeconds)}
                  </span>
                )}
                {u.communicationId && (
                  <span
                    title="נרשם גם ביומן התקשורת של הלקוח"
                    className="text-[11px] text-[#94A3B8]"
                  >
                    🔗 ביומן הלקוח
                  </span>
                )}
                <button
                  onClick={() => del(u.id)}
                  className="ms-auto text-[12px] text-[#94A3B8] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="מחק עדכון"
                >
                  🗑
                </button>
              </div>

              <p className="text-[14px] text-[#0F172A] font-medium">{u.summary}</p>
              {u.details && (
                <p className="text-[13px] text-[#64748B] mt-1 whitespace-pre-wrap leading-relaxed">
                  {u.details}
                </p>
              )}

              {(u.statusAfter || u.nextAction || u.followUpAt) && (
                <div className="mt-3 pt-3 border-t border-[#F1F5F9] space-y-1 text-[12px]">
                  {u.statusAfter && u.statusBefore && u.statusAfter !== u.statusBefore && (
                    <div className="text-[#64748B]">
                      סטטוס:{" "}
                      <span className="text-[#94A3B8]">{TASK_STATUS_HE[u.statusBefore]}</span>
                      {" → "}
                      <span className="text-[#0F172A] font-semibold">
                        {TASK_STATUS_HE[u.statusAfter]}
                      </span>
                    </div>
                  )}
                  {u.nextAction && (
                    <div className="text-[#475569]">
                      <span className="text-[#94A3B8]">Next:</span> {u.nextAction}
                    </div>
                  )}
                  {u.followUpAt && (
                    <div className="text-[#475569]">
                      <span className="text-[#94A3B8]">Follow-up:</span> {u.followUpAt}
                    </div>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}

      {/* Created marker — always at the bottom */}
      <li className="relative ps-8">
        <span className="absolute right-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[12px] bg-[#F1F5F9] text-[#94A3B8] ring-4 ring-[#F8FAFC]">
          ✨
        </span>
        <div className="text-[12px] text-[#94A3B8] py-1">
          המשימה נוצרה · {fmtDateTimeHe(taskCreatedAt)}
        </div>
      </li>
    </ol>
  );
}
