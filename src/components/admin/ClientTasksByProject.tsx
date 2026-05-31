import Link from "next/link";
import {
  TASK_STATUS_HE,
  actionableDate,
  fmtDateHe,
  relativeDayHe,
  isTaskClosed,
} from "@/lib/admin/format";

export interface ClientTaskRow {
  id: number;
  title: string;
  status: "todo" | "in_progress" | "waiting" | "blocked" | "done" | "canceled";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  nextAction: string | null;
  followUpAt: string | null;
  projectId: number;
  projectName: string | null;
}

const STATUS_TONE: Record<string, string> = {
  todo: "bg-[#F1F5F9] text-[#64748B]",
  in_progress: "bg-[#EFF6FF] text-[#2B7FFF]",
  waiting: "bg-[#EFF6FF] text-[#2B7FFF]",
  blocked: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
  canceled: "bg-[#F1F5F9] text-[#94A3B8] line-through",
};

/**
 * Open tasks for a client, grouped by project, each row links to /admin/tasks/[id].
 */
export default function ClientTasksByProject({ tasks }: { tasks: ClientTaskRow[] }) {
  const open = tasks.filter((t) => !isTaskClosed(t.status));
  if (open.length === 0) {
    return (
      <p className="text-[13px] text-[#94A3B8] py-6 text-center">
        אין משימות פתוחות ללקוח הזה.
      </p>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const byProject = new Map<number, { name: string; tasks: ClientTaskRow[] }>();
  for (const t of open) {
    const key = t.projectId;
    if (!byProject.has(key)) {
      byProject.set(key, { name: t.projectName ?? "—", tasks: [] });
    }
    byProject.get(key)!.tasks.push(t);
  }
  // Sort tasks within each group by actionableDate (overdue first, then nearest)
  for (const g of byProject.values()) {
    g.tasks.sort((a, b) => {
      const da = actionableDate(a);
      const db = actionableDate(b);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da < db ? -1 : da > db ? 1 : 0;
    });
  }

  return (
    <div className="space-y-4">
      {Array.from(byProject.entries()).map(([projectId, group]) => (
        <section key={projectId}>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2 px-1">
            <Link
              href={`/admin/projects/${projectId}`}
              className="hover:text-[#2B7FFF]"
            >
              {group.name}
            </Link>{" "}
            · {group.tasks.length}
          </h3>
          <ul className="bg-white border border-[#E2E8F0] rounded-xl divide-y divide-[#F1F5F9] overflow-hidden">
            {group.tasks.map((t) => {
              const d = actionableDate(t);
              const isOverdue = d && d < today;
              const dateLabel = t.followUpAt ? relativeDayHe(t.followUpAt) : null;
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
                    {t.nextAction && (
                      <div className="text-[12px] text-[#475569] mt-0.5 truncate">
                        → {t.nextAction}
                      </div>
                    )}
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_TONE[t.status]}`}
                  >
                    {TASK_STATUS_HE[t.status]}
                  </span>
                  {d && (
                    <span
                      className={`shrink-0 text-[12px] tabular-nums ${
                        isOverdue ? "text-red-600 font-semibold" : "text-[#64748B]"
                      }`}
                      title={
                        t.followUpAt
                          ? `מעקב: ${fmtDateHe(t.followUpAt)}`
                          : `דד-ליין: ${fmtDateHe(t.dueDate!)}`
                      }
                    >
                      {dateLabel ?? fmtDateHe(d)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
