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
 * The two domains have independent timers (separate tables), so both can run at
 * once and this returns a list. Every timer surface in the admin — sidebar,
 * mobile bar, project tab, task page — uses this hook so they can never disagree.
 */
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
    if (personal?.active) {
      next.push({
        domain: "personal",
        id: personal.active.id,
        projectId: personal.active.projectId,
        taskId: personal.active.taskId ?? null,
        projectName: personal.active.projectName ?? "",
        subtitle: "",
        startedAt: personal.active.startedAt,
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

  const stop = useCallback(
    async (domain: Domain) => {
      const res = await fetch(ROUTES[domain].timerApi, { method: "PATCH" });
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
