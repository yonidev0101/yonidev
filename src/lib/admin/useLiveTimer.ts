"use client";

import { useCallback, useEffect, useState } from "react";
import { ROUTES, type Domain } from "./domain";

export interface ActiveTimer {
  domain: Domain;
  id: number;
  projectId: number;
  taskId: number | null;
  projectName: string;
  /** Client name for client work; empty for personal projects. */
  subtitle: string;
  startedAt: string;
}

/**
 * Single source of truth for "is a timer running, and which one".
 *
 * Client work runs one timer at a time; personal work can run several at once
 * (parallel tasks), so this always returns a list. Every timer surface in the
 * admin — sidebar, mobile bar, project tab, task page — uses this hook so they
 * can never disagree.
 */
interface PersonalTimerRow {
  id: number;
  projectId: number;
  taskId: number | null;
  projectName: string | null;
  taskTitle: string | null;
  startedAt: string;
}

export function useLiveTimer(pollMs = 30_000) {
  const [active, setActive] = useState<ActiveTimer[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const results = await Promise.allSettled([
      fetch(ROUTES.client.timerApi, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
      fetch(ROUTES.personal.timerApi, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
    ]);

    const next: ActiveTimer[] = [];
    const client = results[0].status === "fulfilled" ? results[0].value : null;
    if (client?.active) {
      next.push({
        domain: "client",
        id: client.active.id,
        projectId: client.active.projectId,
        taskId: client.active.taskId ?? null,
        projectName: client.active.projectName ?? "",
        subtitle: client.active.clientName ?? "",
        startedAt: client.active.startedAt,
      });
    }
    const personal = results[1].status === "fulfilled" ? results[1].value : null;
    // Personal timers come back as a list — several tasks can be running.
    const personalRows: PersonalTimerRow[] = Array.isArray(personal?.active)
      ? personal.active
      : personal?.active
        ? [personal.active]
        : [];
    for (const row of personalRows) {
      next.push({
        domain: "personal",
        id: row.id,
        projectId: row.projectId,
        taskId: row.taskId ?? null,
        projectName: row.projectName ?? "",
        subtitle: row.taskTitle ?? "",
        startedAt: row.startedAt,
      });
    }
    setActive(next);
    setLoaded(true);
  }, []);

  useEffect(() => {
    const run = () => {
      void refresh();
    };
    run();
    const id = setInterval(run, pollMs);
    return () => clearInterval(id);
  }, [refresh, pollMs]);

  const start = useCallback(
    async (
      domain: Domain,
      body: { projectId: number; taskId?: number | null; note?: string | null },
    ) => {
      const res = await fetch(ROUTES[domain].timerApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) await refresh();
      return res.ok;
    },
    [refresh],
  );

  /** `entryId` stops that one timer; without it, every timer in the domain. */
  const stop = useCallback(
    async (domain: Domain, entryId?: number) => {
      const res = await fetch(ROUTES[domain].timerApi, {
        method: "PATCH",
        ...(entryId
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: entryId }),
            }
          : {}),
      });
      if (res.ok) await refresh();
      return res.ok;
    },
    [refresh],
  );

  return { active, loaded, refresh, start, stop };
}

/** Seconds elapsed since `startedAt`, ticking once per second. */
export function useElapsed(startedAt: string | null): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const startMs = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  // Reported as 0 while nothing is running, without an extra render to reset it.
  return startedAt ? elapsed : 0;
}
