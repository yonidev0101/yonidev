"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { confirm } from "./ConfirmDialog";
import TaskQuickAdd from "./TaskQuickAdd";
import type {
  PersonalProject,
  PersonalTask,
  PersonalLink,
  PersonalTimeEntry,
} from "@/lib/db/schema";
import {
  TASK_PRIORITY_HE,
  TASK_STATUS_HE,
  TASK_STATUS_TONE,
  TASK_PRIORITY_DOT,
  PERSONAL_TASK_STATUS_ORDER,
  personalTaskSection,
  personalActiveRank,
  fmtDateHe,
  fmtDateTimeHe,
  fmtHours,
} from "@/lib/admin/format";

/** Task rows carry checklist progress from the query, for the "✔ 3/7" badge. */
type TaskRow = PersonalTask & { stepsTotal: number; stepsDone: number };

const TABS: { key: string; label: string }[] = [
  { key: "tasks", label: "משימות" },
  { key: "time", label: "זמן" },
];

type Props = {
  project: PersonalProject;
  tab: string;
  tasks: TaskRow[];
  links: PersonalLink[];
  timeEntries: PersonalTimeEntry[];
};

export default function PersonalProjectShell(props: Props) {
  const { project, tab } = props;
  const router = useRouter();
  const refresh = () => router.refresh();
  const activeTab = tab === "time" ? "time" : "tasks";

  return (
    <div className="space-y-5">
      <ProjectMeta project={project} links={props.links} onChange={refresh} />

      <nav className="flex items-center gap-1 border-b border-[#E2E8F0]" dir="rtl">
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <Link
              key={t.key}
              href={`/admin/personal/${project.id}?tab=${t.key}`}
              scroll={false}
              className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition ${
                active
                  ? "border-[#2B7FFF] text-[#2B7FFF]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {activeTab === "tasks" && (
        <TasksTab project={project} tasks={props.tasks} onChange={refresh} />
      )}
      {activeTab === "time" && (
        <TimeTab
          project={project}
          entries={props.timeEntries}
          tasks={props.tasks}
          onChange={refresh}
        />
      )}
    </div>
  );
}

// ── Meta (edit name / status / priority / next action / dates / description / links / delete) ──

function ProjectMeta({
  project,
  links,
  onChange,
}: {
  project: PersonalProject;
  links: PersonalLink[];
  onChange: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(formFrom(project));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function openEdit() {
    // Seed the form from the freshest project data whenever edit opens.
    setForm(formFrom(project));
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/personal-projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        status: form.status,
        priority: form.priority,
        nextAction: form.nextAction || null,
        description: form.description || null,
        startDate: form.startDate || null,
        targetDate: form.targetDate || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("הפרויקט עודכן");
      setEditing(false);
      router.refresh();
    } else {
      toast.error("עדכון נכשל");
    }
  }

  async function del() {
    const ok = await confirm({
      title: "למחוק את הפרויקט?",
      description: "כל המשימות, השעות והקישורים של הפרויקט יימחקו. אי אפשר להחזיר אחורה.",
      confirmLabel: "מחק פרויקט",
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/personal-projects/${project.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      toast.success("הפרויקט נמחק");
      router.push("/admin/personal");
      router.refresh();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  // ── Display mode (default) — a clean read view, edit behind a button. ──
  if (!editing) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4" dir="rtl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
              הצעד הבא
            </div>
            {project.nextAction ? (
              <p className="text-[15px] font-medium text-[#0F172A]">→ {project.nextAction}</p>
            ) : (
              <p className="text-[13px] text-[#94A3B8]">אין צעד הבא מוגדר</p>
            )}
          </div>
          <button
            onClick={openEdit}
            className="shrink-0 text-[12px] font-semibold text-[#94A3B8] hover:text-[#2B7FFF]"
          >
            ✎ ערוך פרטים
          </button>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-[13px] border-t border-[#F1F5F9] pt-3">
          <MetaItem k="עדיפות" v={TASK_PRIORITY_HE[project.priority]} />
          {project.startDate && <MetaItem k="התחלה" v={fmtDateHe(project.startDate)} />}
          {project.targetDate && <MetaItem k="יעד" v={fmtDateHe(project.targetDate)} />}
        </div>

        {project.description && (
          <p className="text-[13px] text-[#475569] whitespace-pre-wrap leading-relaxed border-t border-[#F1F5F9] pt-3">
            {project.description}
          </p>
        )}

        {links.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 border-t border-[#F1F5F9] pt-3">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-[12px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-2.5 py-1 text-[#2B7FFF] hover:border-[#2B7FFF]/40"
              >
                {l.label}
                <span className="text-[10px] text-[#94A3B8] uppercase">{l.kind}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Edit mode ──
  return (
    <div className="bg-white border border-[#2B7FFF]/30 ring-1 ring-[#2B7FFF]/10 rounded-xl p-5 space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-[#0F172A]">עריכת פרטי הפרויקט</span>
        <button
          onClick={() => setEditing(false)}
          className="text-[13px] text-[#94A3B8] hover:text-[#0F172A]"
          aria-label="סגור"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="שם הפרויקט">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="ipt-meta"
          />
        </Field>
        <Field label="סטטוס">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as PersonalProject["status"] })}
            className="ipt-meta"
          >
            <option value="idea">רעיון</option>
            <option value="active">פעיל</option>
            <option value="paused">מושהה</option>
            <option value="done">הושלם</option>
            <option value="archived">בארכיון</option>
          </select>
        </Field>
        <Field label="עדיפות">
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as PersonalProject["priority"] })}
            className="ipt-meta"
          >
            <option value="low">נמוכה</option>
            <option value="medium">רגילה</option>
            <option value="high">גבוהה</option>
          </select>
        </Field>
      </div>

      <Field label="הצעד הבא">
        <input
          value={form.nextAction}
          onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
          placeholder="מה הדבר הבא שצריך לקרות?"
          className="ipt-meta"
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="תאריך התחלה">
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="ipt-meta"
          />
        </Field>
        <Field label="תאריך יעד">
          <input
            type="date"
            value={form.targetDate}
            onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            className="ipt-meta"
          />
        </Field>
      </div>

      <Field label="תיאור / הערות">
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="ipt-meta resize-y"
        />
      </Field>

      {/* Links are managed here, in edit mode. */}
      <Field label="קישורים">
        <LinksInline projectId={project.id} links={links} onChange={onChange} />
      </Field>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-2"
          >
            {saving ? "שומר..." : "שמור"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-[13px] text-[#64748B] hover:text-[#0F172A] px-2"
          >
            ביטול
          </button>
        </div>
        <button
          onClick={del}
          disabled={deleting}
          className="text-[12px] text-[#94A3B8] hover:text-red-600"
        >
          {deleting ? "מוחק..." : "מחק פרויקט"}
        </button>
      </div>

      <style jsx>{`
        :global(.ipt-meta) {
          width: 100%;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        :global(.ipt-meta:focus) {
          border-color: #2b7fff;
          background: white;
        }
      `}</style>
    </div>
  );
}

function formFrom(project: PersonalProject) {
  return {
    name: project.name,
    status: project.status,
    priority: project.priority,
    nextAction: project.nextAction ?? "",
    description: project.description ?? "",
    startDate: project.startDate ?? "",
    targetDate: project.targetDate ?? "",
  };
}

function MetaItem({ k, v }: { k: string; v: string }) {
  return (
    <span className="text-[#0F172A]">
      <span className="text-[#94A3B8]">{k}: </span>
      {v}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

// ── Links (inline, compact — replaces the old links tab) ──

function LinksInline({
  projectId,
  links,
  onChange,
}: {
  projectId: number;
  links: PersonalLink[];
  onChange: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    label: "",
    url: "",
    kind: "other" as PersonalLink["kind"],
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/personal-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, ...form }),
    });
    if (res.ok) {
      setForm({ label: "", url: "", kind: "other" });
      setAdding(false);
      onChange();
    } else {
      toast.error("הוספה נכשלה");
    }
  }

  async function del(id: number) {
    await fetch(`/api/admin/personal-links/${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div>
      <div className="flex items-center flex-wrap gap-2">
        {links.map((l) => (
          <span
            key={l.id}
            className="group inline-flex items-center gap-1.5 text-[12px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-full pl-1 pr-2.5 py-1"
          >
            <a
              href={l.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[#2B7FFF] hover:underline font-medium"
            >
              {l.label}
            </a>
            <span className="text-[10px] text-[#94A3B8] uppercase">{l.kind}</span>
            <button
              onClick={() => del(l.id)}
              className="text-[#CBD5E1] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="מחק קישור"
            >
              ✕
            </button>
          </span>
        ))}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-[12px] font-semibold text-[#94A3B8] hover:text-[#2B7FFF] border border-dashed border-[#E2E8F0] rounded-full px-3 py-1"
          >
            + קישור
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-2">
          <input
            required
            placeholder="תווית (ריפו, Figma…)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="md:col-span-3 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]"
          />
          <input
            required
            type="url"
            placeholder="https://…"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            dir="ltr"
            className="md:col-span-5 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]"
          />
          <select
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value as PersonalLink["kind"] })}
            className="md:col-span-2 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]"
          >
            <option value="other">אחר</option>
            <option value="github">GitHub</option>
            <option value="figma">Figma</option>
            <option value="drive">Drive</option>
            <option value="notion">Notion</option>
          </select>
          <button className="md:col-span-1 rounded-md bg-[#2B7FFF] text-white text-[13px] font-semibold px-3 py-2">
            הוסף
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="md:col-span-1 text-[12px] text-[#64748B] hover:text-[#0F172A]"
          >
            ביטול
          </button>
        </form>
      )}
    </div>
  );
}

// ── Tasks (focus strip + one clean grouped list) ──

function TasksTab({
  project,
  tasks,
  onChange,
}: {
  project: PersonalProject;
  tasks: TaskRow[];
  onChange: () => void;
}) {
  async function setStatus(id: number, status: PersonalTask["status"]) {
    const res = await fetch(`/api/admin/personal-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) onChange();
    else toast.error("עדכון נכשל");
  }

  async function del(id: number) {
    const ok = await confirm({ title: "למחוק את המשימה?", confirmLabel: "מחק", destructive: true });
    if (!ok) return;
    const res = await fetch(`/api/admin/personal-tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("המשימה נמחקה");
      onChange();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  const active = tasks
    .filter((t) => personalTaskSection(t.status) === "active")
    .sort((a, b) => {
      const r = personalActiveRank(a.status) - personalActiveRank(b.status);
      if (r !== 0) return r;
      const p = priorityWeight(b.priority) - priorityWeight(a.priority);
      if (p !== 0) return p;
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
  const done = tasks.filter((t) => t.status === "done");
  const canceled = tasks.filter((t) => t.status === "canceled");

  // Focus: what am I on now — the working task, else the top-priority todo.
  const focus =
    active.find((t) => t.status === "in_progress") ??
    active.find((t) => t.status === "todo") ??
    null;

  return (
    <div className="space-y-4">
      {focus && <FocusStrip task={focus} />}

      <TaskQuickAdd
        projects={[]}
        fixedProjectId={project.id}
        fixedDomain="personal"
        onCreated={onChange}
      />

      {active.length === 0 && done.length === 0 && canceled.length === 0 ? (
        <p className="text-[13px] text-[#94A3B8] bg-white border border-[#E2E8F0] rounded-xl py-10 text-center">
          עוד אין משימות. הוסף את הראשונה למעלה.
        </p>
      ) : (
        <>
          <TaskGroup
            title="פעילות"
            count={active.length}
            tasks={active}
            onStatus={setStatus}
            onDelete={del}
            defaultOpen
          />
          {done.length > 0 && (
            <TaskGroup
              title="הושלמו"
              count={done.length}
              tasks={done}
              onStatus={setStatus}
              onDelete={del}
            />
          )}
          {canceled.length > 0 && (
            <TaskGroup
              title="בוטלו"
              count={canceled.length}
              tasks={canceled}
              onStatus={setStatus}
              onDelete={del}
            />
          )}
        </>
      )}
    </div>
  );
}

function priorityWeight(p: string): number {
  return p === "high" ? 3 : p === "medium" ? 2 : 1;
}

function FocusStrip({ task }: { task: TaskRow }) {
  const working = task.status === "in_progress";
  return (
    <Link
      href={`/admin/personal/tasks/${task.id}`}
      className={`block rounded-xl border px-5 py-4 transition hover:brightness-[0.99] ${
        working ? "bg-[#F5F3FF] border-[#DDD6FE]" : "bg-[#EFF6FF] border-[#BFDBFE]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
            working ? "text-[#7C3AED]" : "text-[#2B7FFF]"
          }`}
        >
          {working && <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />}
          {working ? "על מה אני עכשיו" : "הבא בתור"}
        </span>
        {task.stepsTotal > 0 && (
          <span className="text-[11px] text-[#64748B] tabular-nums">
            ✔ {task.stepsDone}/{task.stepsTotal}
          </span>
        )}
      </div>
      <div className="text-[15px] font-semibold text-[#0F172A] mt-1">{task.title}</div>
      {task.nextAction && (
        <div className="text-[13px] text-[#475569] mt-0.5">→ {task.nextAction}</div>
      )}
      <span className="inline-block mt-2 text-[12px] font-semibold text-[#2B7FFF]">
        {working ? "המשך לעבוד ←" : "פתח משימה ←"}
      </span>
    </Link>
  );
}

function TaskGroup({
  title,
  count,
  tasks,
  onStatus,
  onDelete,
  defaultOpen = false,
}: {
  title: string;
  count: number;
  tasks: TaskRow[];
  onStatus: (id: number, status: PersonalTask["status"]) => void;
  onDelete: (id: number) => void;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="flex items-center gap-2 cursor-pointer list-none select-none py-1.5">
        <svg
          className="w-3 h-3 text-[#94A3B8] transition-transform group-open:rotate-90"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
          {title} · {count}
        </span>
      </summary>
      <ul className="mt-2 bg-white border border-[#E2E8F0] rounded-xl divide-y divide-[#F1F5F9] overflow-hidden">
        {tasks.map((t) => (
          <TaskListRow key={t.id} task={t} onStatus={onStatus} onDelete={onDelete} />
        ))}
      </ul>
    </details>
  );
}

function TaskListRow({
  task,
  onStatus,
  onDelete,
}: {
  task: TaskRow;
  onStatus: (id: number, status: PersonalTask["status"]) => void;
  onDelete: (id: number) => void;
}) {
  const closed = task.status === "done" || task.status === "canceled";
  return (
    <li className="group flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors">
      <span
        className={`shrink-0 w-1.5 h-1.5 rounded-full ${TASK_PRIORITY_DOT[task.priority]}`}
        aria-hidden
      />
      <div className="flex-1 min-w-0">
        <Link
          href={`/admin/personal/tasks/${task.id}`}
          className={`block text-[14px] font-medium truncate hover:text-[#2B7FFF] ${
            closed ? "text-[#94A3B8]" : "text-[#0F172A]"
          } ${task.status === "canceled" ? "line-through" : ""}`}
        >
          {task.title}
        </Link>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#94A3B8]">
          {task.stepsTotal > 0 && (
            <span className="tabular-nums">✔ {task.stepsDone}/{task.stepsTotal}</span>
          )}
          {task.nextAction && !closed && (
            <span className="truncate text-[#64748B]">→ {task.nextAction}</span>
          )}
          {task.dueDate && <span className="tabular-nums">{fmtDateHe(task.dueDate)}</span>}
        </div>
      </div>

      <span
        className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${TASK_STATUS_TONE[task.status]}`}
      >
        {TASK_STATUS_HE[task.status]}
      </span>

      <select
        value={task.status}
        onChange={(e) => onStatus(task.id, e.target.value as PersonalTask["status"])}
        aria-label="שנה סטטוס"
        className="shrink-0 text-[11px] border border-[#E2E8F0] rounded-md bg-white px-1.5 py-1 text-[#64748B]"
      >
        {PERSONAL_TASK_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {TASK_STATUS_HE[s]}
          </option>
        ))}
      </select>

      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 text-[12px] text-[#CBD5E1] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="מחק"
      >
        ✕
      </button>
    </li>
  );
}

// ── Time (live timer + manual + list) — unchanged behaviour ──

function TimeTab({
  project,
  entries,
  tasks,
  onChange,
}: {
  project: PersonalProject;
  entries: PersonalTimeEntry[];
  tasks: TaskRow[];
  onChange: () => void;
}) {
  const [active, setActive] = useState<{ id: number; projectId: number; startedAt: string } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [note, setNote] = useState("");
  const [taskId, setTaskId] = useState("");
  const [manual, setManual] = useState({ date: "", hours: "", note: "" });

  const openTasks = tasks.filter((t) => t.status !== "done" && t.status !== "canceled");
  const taskTitleById = new Map(tasks.map((t) => [t.id, t.title]));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/personal-time/timer", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled) setActive(json.active ?? null);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const startMs = new Date(active.startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  const isThisProject = active?.projectId === project.id;

  async function startTimer() {
    const res = await fetch("/api/admin/personal-time/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        taskId: taskId ? Number(taskId) : null,
        note: note || null,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      setActive({ id: json.entry.id, projectId: project.id, startedAt: json.entry.startedAt });
      setNote("");
      setTaskId("");
      toast.success("הטיימר התחיל");
      onChange();
    } else {
      toast.error("נכשל להתחיל טיימר");
    }
  }

  async function stopTimer() {
    const res = await fetch("/api/admin/personal-time/timer", { method: "PATCH" });
    if (res.ok) {
      setActive(null);
      toast.success("הטיימר נעצר");
      onChange();
    } else {
      toast.error("עצירת טיימר נכשלה");
    }
  }

  async function addManual(e: React.FormEvent) {
    e.preventDefault();
    const hours = Number(manual.hours);
    if (!manual.date || !Number.isFinite(hours) || hours <= 0) {
      toast.error("הזן תאריך ומספר שעות");
      return;
    }
    const startedAt = new Date(`${manual.date}T09:00:00`);
    const res = await fetch("/api/admin/personal-time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        startedAt: startedAt.toISOString(),
        durationSeconds: Math.round(hours * 3600),
        note: manual.note || null,
      }),
    });
    if (res.ok) {
      setManual({ date: "", hours: "", note: "" });
      toast.success("רשומת השעות נוספה");
      onChange();
    } else {
      toast.error("הוספה נכשלה");
    }
  }

  async function del(id: number) {
    const ok = await confirm({ title: "למחוק את רשומת השעות?", confirmLabel: "מחק", destructive: true });
    if (!ok) return;
    const res = await fetch(`/api/admin/personal-time/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("הרשומה נמחקה");
      onChange();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  const totalSec = entries.reduce((sum, t) => sum + (t.durationSeconds ?? 0), 0);

  return (
    <div className="space-y-4">
      {isThisProject ? (
        <div className="rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] p-4 flex items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#2B7FFF] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B7FFF] animate-pulse" />
              טיימר פעיל
            </span>
            <div className="font-mono text-[22px] font-bold text-[#0F172A] tabular-nums mt-1" dir="ltr">
              {formatElapsed(elapsed)}
            </div>
          </div>
          <button
            onClick={stopTimer}
            className="rounded-full bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[13px] font-semibold px-5 py-2"
          >
            ⏹ עצור
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-3 flex-wrap">
          {openTasks.length > 0 && (
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="min-w-[160px] border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
            >
              <option value="">— ללא משימה —</option>
              {openTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          )}
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="על מה אני עובד עכשיו? (לא חובה)"
            className="flex-1 min-w-[200px] border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
          />
          <button
            onClick={startTimer}
            className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] text-white text-[13px] font-semibold px-5 py-2"
          >
            ▶ התחל טיימר
          </button>
        </div>
      )}

      {active && !isThisProject && (
        <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          יש טיימר פעיל בפרויקט אישי אחר. התחלת טיימר כאן תעצור אותו.
        </p>
      )}

      <form
        onSubmit={addManual}
        className="bg-white border border-[#E2E8F0] rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3"
      >
        <input
          type="date"
          value={manual.date}
          onChange={(e) => setManual({ ...manual, date: e.target.value })}
          className="md:col-span-3 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        />
        <input
          type="number"
          min="0"
          step="0.25"
          placeholder="שעות"
          value={manual.hours}
          onChange={(e) => setManual({ ...manual, hours: e.target.value })}
          className="md:col-span-2 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px] tabular-nums"
        />
        <input
          placeholder="הערה (לא חובה)"
          value={manual.note}
          onChange={(e) => setManual({ ...manual, note: e.target.value })}
          className="md:col-span-5 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        />
        <button className="md:col-span-2 rounded-full bg-[#0F172A] hover:bg-[#1e293b] text-white text-[13px] font-semibold px-3 py-2">
          + רשומה ידנית
        </button>
      </form>

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F1F5F9]">
          <span className="text-[12px] text-[#64748B]">{entries.length} רשומות</span>
          <span className="text-[13px] font-bold text-[#0F172A] tabular-nums">
            סה&quot;כ {fmtHours(totalSec)}
          </span>
        </div>
        {entries.length === 0 ? (
          <p className="px-5 py-8 text-center text-[#94A3B8] text-[13px]">אין רשומות שעות עדיין.</p>
        ) : (
          <ul className="divide-y divide-[#F1F5F9]">
            {entries.map((e) => (
              <li key={e.id} className="px-5 py-3 flex items-center gap-3 group">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[#0F172A] truncate">
                    {e.taskId && taskTitleById.get(e.taskId) ? (
                      taskTitleById.get(e.taskId)
                    ) : e.note ? (
                      e.note
                    ) : (
                      <span className="text-[#94A3B8]">— ללא הערה —</span>
                    )}
                  </div>
                  {e.taskId && e.note && (
                    <div className="text-[12px] text-[#64748B] truncate">{e.note}</div>
                  )}
                  <div className="text-[11px] text-[#94A3B8]">{fmtDateTimeHe(e.startedAt)}</div>
                </div>
                <span className="text-[13px] font-semibold tabular-nums text-[#0F172A]">
                  {e.endedAt ? fmtHours(e.durationSeconds) : <span className="text-[#2B7FFF]">פעיל</span>}
                </span>
                {e.endedAt && (
                  <button
                    onClick={() => del(e.id)}
                    className="text-[12px] text-[#94A3B8] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="מחק"
                  >
                    🗑
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
