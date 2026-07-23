"use client";

import { useEffect, useState } from "react";
import TaskQuickAdd, { type QuickAddProject } from "./TaskQuickAdd";

/**
 * Sidebar wrapper around {@link TaskQuickAdd}: fetches every trackable project
 * (client work + unfinished personal projects) once, so a task can be dropped
 * into any of them without leaving the current page.
 */
export default function SidebarQuickAdd() {
  const [projects, setProjects] = useState<QuickAddProject[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [c, p] = await Promise.allSettled([
        fetch("/api/admin/projects?status=active", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/personal-projects", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (cancelled) return;
      const clientProjects: QuickAddProject[] =
        c.status === "fulfilled"
          ? (c.value.projects ?? []).map((x: QuickAddProject) => ({ ...x, domain: "client" as const }))
          : [];
      const personalProjects: QuickAddProject[] =
        p.status === "fulfilled"
          ? (p.value.projects ?? [])
              .filter((x: { status: string }) => x.status !== "done" && x.status !== "archived")
              .map((x: QuickAddProject) => ({ ...x, domain: "personal" as const }))
          : [];
      // Personal first — that's the default focus of this workspace.
      setProjects([...personalProjects, ...clientProjects]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TaskQuickAdd
      projects={projects}
      pickerLabel="פרויקט"
      triggerLabel="➕ משימה מהירה"
      enableType
      compact
    />
  );
}
