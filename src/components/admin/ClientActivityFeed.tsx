import Link from "next/link";
import {
  TASK_UPDATE_KIND_HE,
  TASK_UPDATE_KIND_ICON,
  COMM_KIND_HE,
  fmtDateTimeHe,
  taskUpdateKindTone,
} from "@/lib/admin/format";

export interface FeedTaskUpdate {
  id: number;
  taskId: number;
  kind: string;
  happenedAt: Date | string;
  summary: string;
  details: string | null;
  communicationId: number | null;
  taskTitle: string | null;
  projectId: number | null;
  projectName: string | null;
}

export interface FeedCommunication {
  id: number;
  kind: string;
  happenedAt: Date | string;
  summary: string;
  details: string | null;
  projectId: number | null;
}

interface UnifiedItem {
  key: string;
  source: "task_update" | "communication";
  kind: string;
  happenedAt: string;
  summary: string;
  details: string | null;
  taskId?: number;
  taskTitle?: string | null;
  projectId?: number | null;
  projectName?: string | null;
}

const TONE_CLASS = {
  blue: "bg-[#EFF6FF] text-[#2B7FFF]",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700",
  slate: "bg-[#F1F5F9] text-[#64748B]",
};

/**
 * Merges task updates and stand-alone communications into one chronological feed.
 * Communications linked to a task update (via task_updates.communication_id) are
 * dropped to avoid showing the same event twice.
 */
export default function ClientActivityFeed({
  taskUpdates,
  communications,
  projects,
}: {
  taskUpdates: FeedTaskUpdate[];
  communications: FeedCommunication[];
  projects: { id: number; name: string }[];
}) {
  const linkedCommIds = new Set(
    taskUpdates.map((u) => u.communicationId).filter((id): id is number => id != null),
  );
  const projectNameById = new Map(projects.map((p) => [p.id, p.name]));

  const items: UnifiedItem[] = [
    ...taskUpdates.map<UnifiedItem>((u) => ({
      key: `u-${u.id}`,
      source: "task_update",
      kind: u.kind,
      happenedAt: typeof u.happenedAt === "string" ? u.happenedAt : u.happenedAt.toISOString(),
      summary: u.summary,
      details: u.details,
      taskId: u.taskId,
      taskTitle: u.taskTitle,
      projectId: u.projectId,
      projectName: u.projectName,
    })),
    ...communications
      .filter((c) => !linkedCommIds.has(c.id))
      .map<UnifiedItem>((c) => ({
        key: `c-${c.id}`,
        source: "communication",
        kind: c.kind,
        happenedAt: typeof c.happenedAt === "string" ? c.happenedAt : c.happenedAt.toISOString(),
        summary: c.summary,
        details: c.details,
        projectId: c.projectId,
        projectName: c.projectId ? projectNameById.get(c.projectId) ?? null : null,
      })),
  ].sort((a, b) => (a.happenedAt < b.happenedAt ? 1 : -1));

  if (items.length === 0) {
    return (
      <p className="text-[13px] text-[#94A3B8] py-6 text-center">
        אין פעילות עדיין. תוסיפי עדכון או רשומת תקשורת.
      </p>
    );
  }

  return (
    <ol className="relative space-y-3">
      <span
        aria-hidden
        className="absolute top-2 bottom-2 right-[11px] w-px bg-[#E2E8F0]"
      />
      {items.map((it) => {
        const isUpdate = it.source === "task_update";
        const tone = isUpdate ? taskUpdateKindTone(it.kind) : "slate";
        const icon = isUpdate
          ? TASK_UPDATE_KIND_ICON[it.kind]
          : it.kind === "decision"
            ? "✅"
            : it.kind === "meeting"
              ? "🤝"
              : it.kind === "call"
                ? "📞"
                : it.kind === "email"
                  ? "✉️"
                  : "📝";
        const kindLabel = isUpdate
          ? TASK_UPDATE_KIND_HE[it.kind]
          : COMM_KIND_HE[it.kind];

        return (
          <li key={it.key} className="relative ps-8">
            <span
              className={`absolute right-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[12px] ring-4 ring-[#F8FAFC] ${TONE_CLASS[tone]}`}
            >
              {icon}
            </span>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
              <div className="flex items-baseline gap-2.5 mb-1.5 flex-wrap">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${TONE_CLASS[tone]}`}
                >
                  {kindLabel}
                </span>
                <span className="text-[11px] text-[#94A3B8]">{fmtDateTimeHe(it.happenedAt)}</span>
                {it.taskId && it.taskTitle && (
                  <Link
                    href={`/admin/tasks/${it.taskId}`}
                    className="text-[11px] text-[#2B7FFF] hover:underline truncate max-w-[200px]"
                  >
                    → {it.taskTitle}
                  </Link>
                )}
                {!it.taskId && it.projectId && it.projectName && (
                  <Link
                    href={`/admin/projects/${it.projectId}`}
                    className="text-[11px] text-[#94A3B8] hover:text-[#2B7FFF] truncate max-w-[200px]"
                  >
                    {it.projectName}
                  </Link>
                )}
              </div>

              <p className="text-[14px] text-[#0F172A] font-medium">{it.summary}</p>
              {it.details && (
                <p className="text-[13px] text-[#64748B] mt-1 whitespace-pre-wrap leading-relaxed">
                  {it.details}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
