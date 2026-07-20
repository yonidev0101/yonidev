/**
 * Client work and personal projects live in separate tables, but for the user
 * they are one system: a project has a *kind*, and everything below it (tasks,
 * sessions, journal) behaves the same way.
 *
 * This module is the single place that knows how the two map onto routes and
 * endpoints. UI code should ask here instead of hard-coding "/api/admin/personal-…".
 */
export type Domain = "client" | "personal";

export const DOMAIN_LABEL: Record<Domain, string> = {
  client: "לקוח",
  personal: "אישי",
};

/** Chip colours: client work is blue (the brand), personal is violet. */
export const DOMAIN_TONE: Record<Domain, string> = {
  client: "bg-[#EFF6FF] text-[#2B7FFF]",
  personal: "bg-[#F5F3FF] text-[#7C3AED]",
};

export const DOMAIN_ACCENT: Record<Domain, string> = {
  client: "#2B7FFF",
  personal: "#7C3AED",
};

interface DomainRoutes {
  /** Cross-project task list filter value. */
  taskDetail: (taskId: number) => string;
  projectDetail: (projectId: number) => string;
  tasksApi: string;
  taskUpdatesApi: string;
  projectsApi: string;
  timeApi: string;
  timerApi: string;
}

export const ROUTES: Record<Domain, DomainRoutes> = {
  client: {
    taskDetail: (id) => `/admin/tasks/${id}`,
    projectDetail: (id) => `/admin/projects/${id}`,
    tasksApi: "/api/admin/tasks",
    taskUpdatesApi: "/api/admin/task-updates",
    projectsApi: "/api/admin/projects",
    timeApi: "/api/admin/time",
    timerApi: "/api/admin/time/timer",
  },
  personal: {
    taskDetail: (id) => `/admin/personal/tasks/${id}`,
    projectDetail: (id) => `/admin/personal/${id}`,
    tasksApi: "/api/admin/personal-tasks",
    taskUpdatesApi: "/api/admin/personal-task-updates",
    projectsApi: "/api/admin/personal-projects",
    timeApi: "/api/admin/personal-time",
    timerApi: "/api/admin/personal-time/timer",
  },
};

export function routes(domain: Domain): DomainRoutes {
  return ROUTES[domain];
}
