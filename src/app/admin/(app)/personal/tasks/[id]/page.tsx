import Link from "next/link";
import { notFound } from "next/navigation";
import { getPersonalTaskWithUpdates } from "@/lib/admin/queries";
import {
  TASK_STATUS_HE,
  TASK_STATUS_TONE,
  TASK_PRIORITY_HE,
  fmtDateHe,
  fmtDateTimeHe,
  fmtHours,
  fmtEstimate,
} from "@/lib/admin/format";
import PersonalTaskSession from "@/components/admin/PersonalTaskSession";
import PersonalTaskUpdateForm from "@/components/admin/PersonalTaskUpdateForm";
import PersonalTaskTimeline, {
  type TimelineUpdate,
  type TimelineSession,
} from "@/components/admin/PersonalTaskTimeline";
import PersonalTaskMetaPanel from "@/components/admin/PersonalTaskMetaPanel";
import TaskTypeTag from "@/components/admin/TaskTypeTag";
import PersonalTaskChecklist from "@/components/admin/PersonalTaskChecklist";
import PersonalTaskGitPanel, {
  type GitCommit,
} from "@/components/admin/PersonalTaskGitPanel";

export const dynamic = "force-dynamic";

type TaskStatus = keyof typeof TASK_STATUS_HE;

const iso = (d: Date | string) => (d instanceof Date ? d.toISOString() : d);

export default async function PersonalTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const data = await getPersonalTaskWithUpdates(id);
  if (!data) notFound();
  const { task, project, repoUrl, updates, sessions, activeSession, steps, totalSeconds } = data;

  const estSeconds = task.estimateMinutes != null ? task.estimateMinutes * 60 : null;
  const overBudget = estSeconds != null && totalSeconds > estSeconds;

  const timelineUpdates: TimelineUpdate[] = updates.map((u) => ({
    id: u.id,
    kind: u.kind,
    happenedAt: iso(u.happenedAt),
    summary: u.summary,
    details: u.details,
    statusBefore: u.statusBefore,
    statusAfter: u.statusAfter,
    nextAction: u.nextAction,
    commitSha: u.commitSha,
    commitUrl: u.commitUrl,
  }));

  const timelineSessions: TimelineSession[] = sessions.map((s) => ({
    id: s.id,
    startedAt: iso(s.startedAt),
    endedAt: s.endedAt ? iso(s.endedAt) : null,
    durationSeconds: s.durationSeconds,
    note: s.note,
  }));

  // Commits for the git panel are the journal entries that carry a SHA.
  const commits: GitCommit[] = updates
    .filter((u) => u.commitSha)
    .map((u) => ({
      id: u.id,
      sha: u.commitSha as string,
      url: u.commitUrl,
      summary: u.summary,
      happenedAt: iso(u.happenedAt),
    }));

  const checklistSteps = steps.map((s) => ({
    id: s.id,
    title: s.title,
    done: s.done,
    sortOrder: s.sortOrder,
  }));

  return (
    <div dir="rtl" className="space-y-5 max-w-3xl">
      {/* ── Header: title, status, edit ── */}
      <header>
        <Link
          href={`/admin/personal/${task.projectId}?tab=tasks`}
          className="text-[12px] text-[#94A3B8] hover:text-[#2B7FFF]"
        >
          ← {project?.name ?? "פרויקט אישי"}
        </Link>

        <div className="flex items-start gap-3 mt-2">
          <div className="flex-1 min-w-0">
            <TaskTypeTag type={task.type} size="md" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight leading-tight mt-1.5">
              {task.title}
            </h1>
          </div>
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${TASK_STATUS_TONE[task.status]}`}
          >
            {TASK_STATUS_HE[task.status as TaskStatus]}
          </span>
          <PersonalTaskMetaPanel
            task={{
              id: task.id,
              title: task.title,
              description: task.description,
              type: task.type,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate,
              estimateMinutes: task.estimateMinutes,
              acceptance: task.acceptance,
              nextAction: task.nextAction,
            }}
            projectId={task.projectId}
          />
        </div>
      </header>

      {/* ── 1. Now / focus: the session control + next step ── */}
      <PersonalTaskSession
        taskId={task.id}
        projectId={task.projectId}
        taskStatus={task.status}
        activeSession={
          activeSession ? { id: activeSession.id, startedAt: iso(activeSession.startedAt) } : null
        }
      />

      {task.nextAction ? (
        <div className="rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] px-5 py-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#2B7FFF] mb-0.5">
            הצעד הבא
          </div>
          <div className="text-[15px] text-[#0F172A] font-medium">→ {task.nextAction}</div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#E2E8F0] px-5 py-3 text-[13px] text-[#94A3B8]">
          אין צעד הבא מוגדר — רשום עדכון בלוג כדי לקבוע אותו.
        </div>
      )}

      {/* ── stats strip ── */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-3 grid grid-cols-3 sm:grid-cols-6 gap-3 text-[12px]">
        <Stat label="עדיפות" value={TASK_PRIORITY_HE[task.priority]} />
        <Stat label="אומדן" value={fmtEstimate(task.estimateMinutes)} />
        <Stat label="בפועל" value={fmtHours(totalSeconds)} tone={overBudget ? "red" : undefined} />
        <Stat label="סשנים" value={String(sessions.length)} />
        <Stat label="קומיטים" value={String(commits.length)} />
        <Stat label="דד-ליין" value={task.dueDate ? fmtDateHe(task.dueDate) : "—"} />
      </section>

      {/* ── 2. Spec: what & why + definition of done ── */}
      {(task.description || task.acceptance) && (
        <section className="bg-white border border-[#E2E8F0] rounded-xl divide-y divide-[#F1F5F9]">
          {task.description && (
            <div className="px-5 py-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                אפיון — מה צריך ולמה
              </div>
              <p className="text-[14px] text-[#0F172A] whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          )}
          {task.acceptance && (
            <div className="px-5 py-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                הגדרת סיום — מתי זה גמור
              </div>
              <p className="text-[14px] text-[#0F172A] whitespace-pre-wrap leading-relaxed">
                {task.acceptance}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ── 3. Checklist ── */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4">
        <PersonalTaskChecklist taskId={task.id} steps={checklistSteps} />
      </section>

      {/* ── 4. Git ── */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4">
        <PersonalTaskGitPanel
          taskId={task.id}
          branchName={task.branchName}
          repoUrl={repoUrl}
          commits={commits}
        />
      </section>

      {/* ── 5. Log / journal — the centre of gravity ── */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[13px] font-bold text-[#0F172A]">לוג התקדמות</h2>
          <span className="text-[11px] text-[#94A3B8]">
            נוצרה {fmtDateHe(task.createdAt)}
            {task.startedAt ? ` · התחלה ${fmtDateTimeHe(task.startedAt)}` : ""}
          </span>
        </div>
        <PersonalTaskUpdateForm
          taskId={task.id}
          currentStatus={task.status as TaskStatus}
          hasRepo={!!repoUrl}
        />
        <PersonalTaskTimeline
          updates={timelineUpdates}
          sessions={timelineSessions}
          taskCreatedAt={iso(task.createdAt)}
        />
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "red" }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">{label}</div>
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
