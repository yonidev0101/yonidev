/**
 * Two honest numbers out of the same rows.
 *
 * Personal work allows several timers at once (working a few tasks in parallel
 * with Claude Code), so time entries can overlap. That makes "how long did this
 * task take" and "how long did I actually work" two different questions:
 *
 *   • per task  → raw `end − start`. Never scaled down. An hour is an hour.
 *   • totals    → wall clock: overlapping stretches counted once.
 *
 * They are not meant to add up to each other. `overlapSeconds` is the gap
 * between them, so a screen can say so out loud instead of looking broken.
 */

export interface TimeInterval {
  startedAt: Date | string;
  /** null = no explicit end — fall back to `durationSeconds`, else it's running. */
  endedAt?: Date | string | null;
  /** Hand-entered hours can carry a duration with no end; that's still closed. */
  durationSeconds?: number | null;
}

const ms = (d: Date | string) => (d instanceof Date ? d.getTime() : new Date(d).getTime());

/** [start, end) pairs in ms, open entries closed at `now`, invalid rows dropped. */
function toRanges(entries: TimeInterval[], now: number): [number, number][] {
  const out: [number, number][] = [];
  for (const e of entries) {
    const start = ms(e.startedAt);
    const end = e.endedAt
      ? ms(e.endedAt)
      : e.durationSeconds != null
        ? start + e.durationSeconds * 1000
        : now;
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    out.push([start, end]);
  }
  return out;
}

/** Sum of every entry on its own — overlaps counted as many times as they occur. */
export function rawSeconds(entries: TimeInterval[], now: Date = new Date()): number {
  const ranges = toRanges(entries, now.getTime());
  return Math.floor(ranges.reduce((sum, [s, e]) => sum + (e - s), 0) / 1000);
}

/** Real time on the clock: overlapping stretches merged, then summed. */
export function wallClockSeconds(entries: TimeInterval[], now: Date = new Date()): number {
  const ranges = toRanges(entries, now.getTime()).sort((a, b) => a[0] - b[0]);
  let total = 0;
  let curStart = 0;
  let curEnd = 0;
  for (const [s, e] of ranges) {
    if (curEnd === 0) {
      curStart = s;
      curEnd = e;
    } else if (s <= curEnd) {
      curEnd = Math.max(curEnd, e);
    } else {
      total += curEnd - curStart;
      curStart = s;
      curEnd = e;
    }
  }
  if (curEnd > 0) total += curEnd - curStart;
  return Math.floor(total / 1000);
}

/** How much of the raw sum is double-counted time. 0 when nothing ran in parallel. */
export function overlapSeconds(entries: TimeInterval[], now: Date = new Date()): number {
  return Math.max(0, rawSeconds(entries, now) - wallClockSeconds(entries, now));
}

/** All three at once — one pass of intent, for screens that show the pair. */
export function timeTotals(entries: TimeInterval[], now: Date = new Date()) {
  const raw = rawSeconds(entries, now);
  const wall = wallClockSeconds(entries, now);
  return { raw, wall, overlap: Math.max(0, raw - wall) };
}
