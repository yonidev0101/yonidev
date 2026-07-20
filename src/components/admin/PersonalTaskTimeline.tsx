"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PERSONAL_UPDATE_KIND_HE,
  PERSONAL_UPDATE_KIND_ICON,
  personalUpdateKindTone,
  TASK_STATUS_HE,
  fmtDateTimeHe,
  fmtHours,
  shortSha,
} from "@/lib/admin/format";
import { confirm } from "./ConfirmDialog";

export interface TimelineUpdate {
  id: number;
  kind: string;
  happenedAt: string;
  summary: string;
  details: string | null;
  statusBefore: string | null;
  statusAfter: string | null;
  nextAction: string | null;
  commitSha: string | null;
  commitUrl: string | null;
}

export interface TimelineSession {
  id: number;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  note: string | null;
}

type Item =
  | { type: "update"; at: string; update: TimelineUpdate }
  | { type: "session"; at: string; session: TimelineSession };

const TONE_CLASS: Record<string, string> = {
  blue: "bg-[#EFF6FF] text-[#2B7FFF]",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700",
  slate: "bg-[#F1F5F9] text-[#64748B]",
};

export default function PersonalTaskTimeline({
  updates,
  sessions,
  taskCreatedAt,
}: {
  updates: TimelineUpdate[];
  sessions: TimelineSession[];
  taskCreatedAt: string;
}) {
  const router = useRouter();

  // Sessions and journal entries share one axis — that's the whole point:
  // you can see what was written during which stretch of work.
  const items: Item[] = [
    ...updates.map((u) => ({ type: "update" as const, at: u.happenedAt, update: u })),
    ...sessions.map((s) => ({ type: "session" as const, at: s.startedAt, session: s })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  async function delUpdate(id: number) {
    const ok = await confirm({
      title: "למחוק את העדכון?",
      description: "אם נרשם איתו זמן, גם הוא יימחק.",
      confirmLabel: "מחק",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/personal-task-updates/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("נמחק");
      router.refresh();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-[13px] text-[#94A3B8] bg-white border border-[#E2E8F0] rounded-xl px-5 py-8 text-center">
        עוד לא תיעדת כלום כאן. התחל סשן עבודה או רשום עדכון ראשון.
      </p>
    );
  }

  return (
    <ol className="relative space-y-3" dir="rtl">
      {items.map((item) =>
        item.type === "session" ? (
          <li
            key={`s-${item.session.id}`}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] border-dashed"
          >
            <span className="text-[14px]">⏱</span>
            <div className="flex-1 min-w-0">
              <span className="text-[13px] text-[#475569]">
                {item.session.endedAt ? "סשן עבודה" : "סשן פעיל עכשיו"}
                {item.session.note && (
                  <span className="text-[#94A3B8]"> · {item.session.note}</span>
                )}
              </span>
              <div className="text-[11px] text-[#94A3B8]">
                {fmtDateTimeHe(item.session.startedAt)}
              </div>
            </div>
            <span className="text-[13px] font-semibold tabular-nums text-[#0F172A]">
              {item.session.endedAt ? (
                fmtHours(item.session.durationSeconds)
              ) : (
                <span className="text-[#7C3AED]">פעיל</span>
              )}
            </span>
          </li>
        ) : (
          <li
            key={`u-${item.update.id}`}
            className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 group"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  TONE_CLASS[personalUpdateKindTone(item.update.kind)]
                }`}
              >
                {PERSONAL_UPDATE_KIND_ICON[item.update.kind]}{" "}
                {PERSONAL_UPDATE_KIND_HE[item.update.kind]}
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                {fmtDateTimeHe(item.update.happenedAt)}
              </span>
              <span className="flex-1" />
              <button
                onClick={() => delUpdate(item.update.id)}
                className="text-[12px] text-[#CBD5E1] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="מחק עדכון"
              >
                🗑
              </button>
            </div>

            <p className="text-[14px] font-medium text-[#0F172A] mt-2">{item.update.summary}</p>

            {item.update.details && (
              <p className="text-[13px] text-[#475569] mt-1.5 whitespace-pre-wrap leading-relaxed">
                {item.update.details}
              </p>
            )}

            {item.update.commitSha && (
              <div className="mt-2">
                {item.update.commitUrl ? (
                  <a
                    href={item.update.commitUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-[12px] font-mono px-2 py-1 rounded bg-[#F1F5F9] text-[#2B7FFF] hover:bg-[#EFF6FF]"
                    dir="ltr"
                  >
                    🔀 {shortSha(item.update.commitSha)}
                  </a>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 text-[12px] font-mono px-2 py-1 rounded bg-[#F1F5F9] text-[#64748B]"
                    dir="ltr"
                  >
                    🔀 {shortSha(item.update.commitSha)}
                  </span>
                )}
              </div>
            )}

            {(item.update.statusAfter || item.update.nextAction) && (
              <div className="mt-2.5 pt-2.5 border-t border-[#F1F5F9] space-y-1">
                {item.update.statusAfter && (
                  <div className="text-[12px] text-[#64748B]">
                    סטטוס:{" "}
                    <span className="line-through text-[#CBD5E1]">
                      {item.update.statusBefore ? TASK_STATUS_HE[item.update.statusBefore] : "—"}
                    </span>{" "}
                    ← <span className="font-semibold text-[#0F172A]">
                      {TASK_STATUS_HE[item.update.statusAfter]}
                    </span>
                  </div>
                )}
                {item.update.nextAction && (
                  <div className="text-[12px] text-[#64748B]">
                    הצעד הבא: <span className="text-[#0F172A]">→ {item.update.nextAction}</span>
                  </div>
                )}
              </div>
            )}
          </li>
        ),
      )}

      <li className="flex items-center gap-3 px-4 py-2 text-[12px] text-[#94A3B8]">
        <span>🎬</span>
        המשימה נוצרה · {fmtDateTimeHe(taskCreatedAt)}
      </li>
    </ol>
  );
}
