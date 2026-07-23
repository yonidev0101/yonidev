export function fmtDateHe(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function fmtDateTimeHe(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Clock time only, pinned to Israel time (the server runs in UTC). */
export function fmtTimeHe(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function fmtIls(n: number | string | null | undefined): string {
  if (n == null) return "—";
  const num = typeof n === "string" ? Number(n) : n;
  if (!Number.isFinite(num)) return "—";
  return `₪${num.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Adaptive duration formatter — minutes for short sessions, hours (decimal) for long ones.
 * Prevents "5 minutes" from displaying as "0.08 ש'", which used to round to 0.
 */
export function fmtHours(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  if (seconds < 60) return "פחות מדקה";
  const totalMin = Math.round(seconds / 60);
  if (totalMin < 60) return `${totalMin} דק'`;
  const hours = totalMin / 60;
  return `${hours.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ש'`;
}

export const CLIENT_STATUS_HE: Record<string, string> = {
  lead: "ליד",
  negotiating: "מו״מ",
  active: "פעיל",
  paused: "מושהה",
  past: "ישן",
};

export const PROJECT_STATUS_HE: Record<string, string> = {
  active: "פעיל",
  paused: "מושהה",
  done: "הושלם",
};

export const PERSONAL_PROJECT_STATUS_HE: Record<string, string> = {
  idea: "רעיון",
  active: "פעיל",
  paused: "מושהה",
  done: "הושלם",
  archived: "בארכיון",
};

export const TASK_STATUS_HE: Record<string, string> = {
  todo: "לעשות",
  in_progress: "בתהליך",
  waiting: "ממתין",
  blocked: "חסום",
  done: "הושלם",
  canceled: "בוטל",
};

/** Terminal statuses — a task in one of these is closed, not "open". */
/**
 * The one place task-status colours are defined. Every chip in the admin reads
 * from here — a status must never look different depending on which page it's on.
 */
export const TASK_STATUS_TONE: Record<string, string> = {
  todo: "bg-[#F1F5F9] text-[#64748B]",
  in_progress: "bg-[#EFF6FF] text-[#2B7FFF]",
  waiting: "bg-[#EFF6FF] text-[#2B7FFF]",
  blocked: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
  canceled: "bg-[#F1F5F9] text-[#94A3B8] line-through",
};

/** Priority dot colour — shared by every task list and card. */
export const TASK_PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-[#94A3B8]",
};

/** Running-timer display: m:ss under an hour, h:mm:ss above it. */
export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const CLOSED_TASK_STATUSES = ["done", "canceled"] as const;

export function isTaskClosed(status: string | null | undefined): boolean {
  return status === "done" || status === "canceled";
}

// ── personal task list: 5 statuses, grouped into 3 clean sections ──────
// Everything open (todo / in_progress / blocked / legacy waiting) shows by
// default under "פעילות"; done and canceled collapse away so the eye only ever
// lands on active work, without losing the ability to cancel or reopen.

/** Which collapsible section a personal task belongs to on the project list. */
export function personalTaskSection(status: string): "active" | "done" | "canceled" {
  if (status === "done") return "done";
  if (status === "canceled") return "canceled";
  return "active";
}

/** Sort weight inside "פעילות": working first, then blocked/parked, then todo. */
export function personalActiveRank(status: string): number {
  if (status === "in_progress") return 0;
  if (status === "blocked" || status === "waiting") return 1;
  return 2; // todo
}

/** Status choices offered when editing a personal task (legacy "waiting" folded into "blocked"). */
export const PERSONAL_TASK_STATUS_ORDER = [
  "todo",
  "in_progress",
  "blocked",
  "done",
  "canceled",
] as const;

export const TASK_PRIORITY_HE: Record<string, string> = {
  low: "נמוכה",
  medium: "רגילה",
  high: "גבוהה",
};

// ── personal task "type" (Notion-style property) — labels, icons, chip tones ──
// The single source of truth for how a personal task's type looks anywhere in the app.

/** Order the types are offered in pickers and filter bars. */
export const PERSONAL_TASK_TYPE_ORDER = [
  "feature",
  "bug",
  "idea",
  "chore",
  "research",
  "design",
] as const;

export const PERSONAL_TASK_TYPE_HE: Record<string, string> = {
  feature: "פיצ׳ר",
  bug: "באג",
  idea: "רעיון",
  chore: "תחזוקה",
  research: "בירור",
  design: "עיצוב",
};

export const PERSONAL_TASK_TYPE_ICON: Record<string, string> = {
  feature: "✨",
  bug: "🐛",
  idea: "💡",
  chore: "🔧",
  research: "🔍",
  design: "🎨",
};

/** Chip tone (bg + text) per type — mirrors TASK_STATUS_TONE's approach. */
export const PERSONAL_TASK_TYPE_TONE: Record<string, string> = {
  feature: "bg-[#EFF6FF] text-[#2B7FFF]",
  bug: "bg-red-50 text-red-700",
  idea: "bg-violet-50 text-violet-700",
  chore: "bg-[#F1F5F9] text-[#64748B]",
  research: "bg-cyan-50 text-cyan-700",
  design: "bg-pink-50 text-pink-700",
};

export const COMM_KIND_HE: Record<string, string> = {
  call: "שיחה",
  email: "מייל",
  meeting: "פגישה",
  note: "הערה",
  decision: "החלטה",
};

export const TASK_UPDATE_KIND_HE: Record<string, string> = {
  progress: "התקדמות",
  call: "שיחה",
  meeting: "פגישה",
  email: "מייל",
  decision: "החלטה",
  blocker: "חסם",
  handoff: "מסירה",
};

export const TASK_UPDATE_KIND_ICON: Record<string, string> = {
  progress: "⚡",
  call: "📞",
  meeting: "🤝",
  email: "✉️",
  decision: "✅",
  blocker: "🚧",
  handoff: "📤",
};

/** Solo-dev update kinds for personal tasks (see personalUpdateKindEnum). */
export const PERSONAL_UPDATE_KIND_HE: Record<string, string> = {
  progress: "התקדמות",
  decision: "החלטה",
  blocker: "חסם",
  commit: "קומיט",
  research: "מחקר",
  bug: "באג",
  note: "הערה",
};

export const PERSONAL_UPDATE_KIND_ICON: Record<string, string> = {
  progress: "⚡",
  decision: "✅",
  blocker: "🚧",
  commit: "🔀",
  research: "🔍",
  bug: "🐞",
  note: "📝",
};

/**
 * The kinds actually offered in the journal composer — trimmed from 7 to 4 to
 * cut clutter. Legacy entries (commit/research/blocker) still render via the full
 * maps above; commits now live in the dedicated commit field, and "חסום" is a task
 * state rather than a journal kind.
 */
export const PERSONAL_ACTIVE_UPDATE_KINDS = ["progress", "decision", "bug", "note"] as const;

export function personalUpdateKindTone(kind: string): "blue" | "amber" | "green" | "slate" {
  if (kind === "blocker" || kind === "bug") return "amber";
  if (kind === "decision") return "green";
  if (kind === "commit" || kind === "research") return "blue";
  return "slate";
}

/** Short SHA for display — commits are stored full-length but read better truncated. */
export function shortSha(sha: string | null | undefined): string | null {
  if (!sha) return null;
  return sha.trim().slice(0, 7);
}

/** Normalises a repo link (web or git@ SSH) to its https base, or null if not GitHub. */
export function githubBaseFromRepo(repoUrl: string | null | undefined): string | null {
  if (!repoUrl) return null;
  const clean = repoUrl.trim().replace(/\.git$/, "").replace(/\/$/, "");
  const ssh = clean.match(/^git@github\.com:(.+)$/);
  const base = ssh ? `https://github.com/${ssh[1]}` : clean;
  return /^https:\/\/github\.com\//.test(base) ? base : null;
}

/**
 * Builds a commit URL from a repo link when the user only typed a SHA.
 * Handles GitHub web URLs and the git@ SSH form; returns null for anything else.
 */
export function commitUrlFromRepo(repoUrl: string | null | undefined, sha: string): string | null {
  const base = githubBaseFromRepo(repoUrl);
  return base ? `${base}/commit/${sha.trim()}` : null;
}

/** Link to a branch's tree view on GitHub. */
export function branchUrlFromRepo(repoUrl: string | null | undefined, branch: string): string | null {
  const base = githubBaseFromRepo(repoUrl);
  const b = branch.trim();
  return base && b ? `${base}/tree/${encodeURIComponent(b)}` : null;
}

/** Link that opens a "new pull request" / compare view for a branch on GitHub. */
export function pullRequestUrlFromRepo(
  repoUrl: string | null | undefined,
  branch: string,
): string | null {
  const base = githubBaseFromRepo(repoUrl);
  const b = branch.trim();
  return base && b ? `${base}/pull/new/${encodeURIComponent(b)}` : null;
}

/** Returns a tone-bucket for coloring the update kind chip. */
export function taskUpdateKindTone(kind: string): "blue" | "amber" | "green" | "slate" {
  if (kind === "blocker") return "amber";
  if (kind === "decision" || kind === "handoff") return "green";
  if (kind === "call" || kind === "meeting" || kind === "email") return "blue";
  return "slate";
}

/** The date that drives "when do I look at this again": follow-up beats due. */
export function actionableDate(t: {
  followUpAt: string | null;
  dueDate: string | null;
}): string | null {
  return t.followUpAt ?? t.dueDate;
}

/** Estimate stored as minutes, shown in the same adaptive hours/minutes format as logged time. */
export function fmtEstimate(minutes: number | null | undefined): string {
  if (minutes == null) return "—";
  return fmtHours(minutes * 60);
}

const STALE_DAYS = 14;

/** Whole days between a past date/timestamp and now (0 if in the future). */
export function daysSince(d: string | Date | null | undefined): number | null {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
}

/**
 * A task is "stale" when it's open and hasn't moved in {@link STALE_DAYS} days —
 * but a parked "waiting" task with a future follow-up is intentionally idle, so it's exempt.
 */
export function isStaleTask(t: {
  status: string;
  lastUpdateAt: string | Date | null;
  createdAt: string | Date | null;
  followUpAt: string | null;
}): boolean {
  if (isTaskClosed(t.status)) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (t.status === "waiting" && t.followUpAt && t.followUpAt > today) return false;
  const since = daysSince(t.lastUpdateAt ?? t.createdAt);
  return since != null && since >= STALE_DAYS;
}

/** "כבר 5 ימים" — how long a task has been parked in "waiting", from its waitingSince date. */
export function waitingSinceDaysHe(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.round((today.getTime() - d.getTime()) / 86_400_000));
  if (days === 0) return "מהיום";
  if (days === 1) return "כבר יום";
  if (days === 2) return "כבר יומיים";
  return `כבר ${days} ימים`;
}

/** "לפני 3 ימים" / "בעוד יומיים" / "היום" — for follow-up date chips. */
export function relativeDayHe(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "היום";
  if (diffDays === 1) return "מחר";
  if (diffDays === -1) return "אתמול";
  if (diffDays === 2) return "מחרתיים";
  if (diffDays > 0 && diffDays <= 7) return `בעוד ${diffDays} ימים`;
  if (diffDays < 0 && diffDays >= -7) return `לפני ${Math.abs(diffDays)} ימים`;
  return fmtDateHe(dateStr);
}

const MONTHS_HE = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

function shortDateHe(d: Date): string {
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

function isFullMonth(from: Date, to: Date): boolean {
  if (from.getFullYear() !== to.getFullYear() || from.getMonth() !== to.getMonth()) return false;
  const lastDay = new Date(from.getFullYear(), from.getMonth() + 1, 0).getDate();
  return from.getDate() <= 3 && to.getDate() >= lastDay - 2;
}

/**
 * Human-friendly Hebrew label for a date range, used in invoice subjects/headings.
 * Falls back to a generic "סיכום עבודה" when no range is given.
 */
export function describePeriodHe(
  fromStr: string | null | undefined,
  toStr: string | null | undefined,
): string {
  const from = fromStr ? new Date(fromStr) : null;
  const to = toStr ? new Date(toStr) : null;
  if (!from && !to) return "סיכום עבודה";
  if (from && !to) return `סיכום מ-${shortDateHe(from)}`;
  if (!from && to) return `סיכום עד ${shortDateHe(to!)}`;
  if (from && to) {
    if (from.toDateString() === to.toDateString()) return `סיכום של ${shortDateHe(from)}`;
    if (isFullMonth(from, to)) {
      const sameYearAsCurrent = from.getFullYear() === new Date().getFullYear();
      return sameYearAsCurrent
        ? `סיכום ${MONTHS_HE[from.getMonth()]}`
        : `סיכום ${MONTHS_HE[from.getMonth()]} ${from.getFullYear()}`;
    }
    return `סיכום ${shortDateHe(from)} – ${shortDateHe(to)}`;
  }
  return "סיכום עבודה";
}

export const INVOICE_STATUS_HE: Record<string, string> = {
  draft: "טיוטה",
  sent: "נשלח",
  paid: "שולם",
  void: "בוטל",
};
