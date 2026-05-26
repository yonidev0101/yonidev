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

export const TASK_STATUS_HE: Record<string, string> = {
  todo: "לעשות",
  in_progress: "בתהליך",
  blocked: "תקוע",
  done: "הושלם",
};

export const TASK_PRIORITY_HE: Record<string, string> = {
  low: "נמוכה",
  medium: "רגילה",
  high: "גבוהה",
};

export const COMM_KIND_HE: Record<string, string> = {
  call: "שיחה",
  email: "מייל",
  meeting: "פגישה",
  note: "הערה",
  decision: "החלטה",
};

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
