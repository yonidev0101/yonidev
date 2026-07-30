import Link from "next/link";
import { notFound } from "next/navigation";
import { getTaskWithUpdates } from "@/lib/admin/queries";
import {
  TASK_PRIORITY_HE,
  fmtDateHe,
  fmtHours,
  fmtEstimate,
  relativeDayHe,
  waitingSinceDaysHe,
} from "@/lib/admin/format";
import TaskUpdateForm from "@/components/admin/TaskUpdateForm";
import TaskStatusPicker from "@/components/admin/TaskStatusPicker";
import TaskDetailEditPanel from "@/components/admin/TaskDetailEditPanel";
import TaskTimeline, { type TimelineUpdate } from "@/components/admin/TaskTimeline";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const data = await getTaskWithUpdates(id);
  if (!data) notFound();
  const { task, project, client, updates, totalSeconds } = data;

  const followUpLabel = relativeDayHe(task.followUpAt);
  const isOverdue =
    task.followUpAt && task.followUpAt < new Date().toISOString().slice(0, 10);
  const estSeconds = task.estimateMinutes != null ? task.estimateMinutes * 60 : null;
  const overBudget = estSeconds != null && totalSeconds > estSeconds;

  const timelineUpdates: TimelineUpdate[] = updates.map((u) => ({
    id: u.id,
    kind: u.kind,
    happenedAt: u.happenedAt instanceof Date ? u.happenedAt.toISOString() : u.happenedAt,
    summary: u.summary,
    details: u.details,
    statusBefore: u.statusBefore,
    statusAfter: u.statusAfter,
    nextAction: u.nextAction,
    followUpAt: u.followUpAt,
    communicationId: u.communicationId,
    timeEntry: u.timeEntry
      ? { durationSeconds: u.timeEntry.durationSeconds }
      : null,
    source: u.source,
    agentName: u.agentName,
  }));

  return (
    <div dir="rtl" className="space-y-6 max-w-3xl">
      <header>
        <Link
          href="/admin/tasks"
          className="text-[12px] text-[#94A3B8] hover:text-[#2B7FFF]"
        >
          ← משימות
        </Link>

        <div className="flex items-start gap-3 mt-2">
          <h1 className="flex-1 text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight leading-tight">
            {task.title}
          </h1>
          <TaskStatusPicker taskId={task.id} status={task.status} kind="task" />
          <TaskDetailEditPanel
            task={{
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate,
              nextAction: task.nextAction,
              followUpAt: task.followUpAt,
              waitingOn: task.waitingOn,
              estimateMinutes: task.estimateMinutes,
            }}
          />
        </div>

        <p className="text-[13px] text-[#64748B] mt-2">
          {client && (
            <Link href={`/admin/clients/${client.id}`} className="hover:text-[#2B7FFF]">
              {client.name}
            </Link>
          )}
          {client && project && <span className="mx-1.5 text-[#CBD5E1]">·</span>}
          {project && (
            <Link href={`/admin/projects/${project.id}`} className="hover:text-[#2B7FFF]">
              {project.name}
            </Link>
          )}
        </p>

        {task.description && (
          <p className="text-[14px] text-[#475569] mt-3 whitespace-pre-wrap leading-relaxed">
            {task.description}
          </p>
        )}
      </header>

      {/* Status strip */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl divide-y divide-[#F1F5F9]">
        {task.status === "waiting" && (
          <div className="px-5 py-4 bg-[#EFF6FF]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#2B7FFF] mb-1">
              ממתין
            </div>
            <div className="text-[15px] text-[#0F172A] font-medium">
              ⏳ {task.waitingOn ? `ממתין ל${task.waitingOn}` : "ממתין לתשובה"}
              {waitingSinceDaysHe(task.waitingSince) && (
                <span className="text-[13px] text-[#64748B] font-normal">
                  {" · "}
                  {waitingSinceDaysHe(task.waitingSince)}
                </span>
              )}
            </div>
          </div>
        )}
        {task.nextAction ? (
          <div className="px-5 py-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
              הצעד הבא
            </div>
            <div className="text-[15px] text-[#0F172A] font-medium">→ {task.nextAction}</div>
          </div>
        ) : (
          <div className="px-5 py-4 text-[13px] text-[#94A3B8]">
            אין צעד הבא מוגדר — הוסף עדכון כדי לקבוע אותו.
          </div>
        )}

        <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-5 gap-3 text-[12px]">
          <Stat label="עדיפות" value={TASK_PRIORITY_HE[task.priority]} />
          <Stat
            label="מעקב"
            value={followUpLabel ?? "—"}
            tone={isOverdue ? "red" : undefined}
          />
          <Stat label="דד-ליין" value={task.dueDate ? fmtDateHe(task.dueDate) : "—"} />
          <Stat label="אומדן" value={fmtEstimate(task.estimateMinutes)} />
          <Stat
            label="זמן רשום"
            value={fmtHours(totalSeconds)}
            tone={overBudget ? "red" : undefined}
          />
        </div>
      </section>

      <TaskUpdateForm
        taskId={task.id}
        currentStatus={task.status}
        clientHasProject={!!client}
      />

      <section>
        <h2 className="text-[13px] font-bold text-[#0F172A] mb-3">היסטוריה</h2>
        <TaskTimeline updates={timelineUpdates} taskCreatedAt={task.createdAt} />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "red";
}) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
        {label}
      </div>
      <div
        className={`text-[13px] tabular-nums mt-0.5 ${
          tone === "red" ? "text-red-600 font-semibold" : "text-[#0F172A]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
