import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  numeric,
  serial,
  pgEnum,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── enums ─────────────────────────────────────────────────────────────

export const clientStatusEnum = pgEnum("client_status", [
  "lead",
  "negotiating",
  "active",
  "paused",
  "past",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "active",
  "paused",
  "done",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "waiting",
  "blocked",
  "done",
  "canceled",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

export const linkKindEnum = pgEnum("link_kind", [
  "figma",
  "drive",
  "github",
  "notion",
  "other",
  // Infra links common to every Next.js + Vercel + Neon project.
  "live",
  "preview",
  "vercel",
  "database",
  "domain",
]);

export const commKindEnum = pgEnum("comm_kind", [
  "call",
  "email",
  "meeting",
  "note",
  "decision",
]);

export const taskUpdateKindEnum = pgEnum("task_update_kind", [
  "progress",
  "call",
  "meeting",
  "email",
  "decision",
  "blocker",
  "handoff",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "void",
]);

// Personal (non-client) side projects. Richer lifecycle than client projects:
// an idea can sit before it's active, and "shipped" / archived states matter.
export const personalProjectStatusEnum = pgEnum("personal_project_status", [
  "idea",
  "active",
  "paused",
  "done",
  "archived",
]);

// What a personal task *is* — a Notion-style "Type" property. Distinct from
// personalUpdateKindEnum, which classifies journal entries ("what happened").
export const personalTaskTypeEnum = pgEnum("personal_task_type", [
  "feature",
  "bug",
  "idea",
  "chore",
  "research",
  "design",
]);

// Solo-dev flavoured update kinds — the client-work equivalent (taskUpdateKindEnum)
// is about calls/meetings/handoffs, which don't exist on personal projects.
export const personalUpdateKindEnum = pgEnum("personal_update_kind", [
  "progress",
  "decision",
  "blocker",
  "commit",
  "research",
  "bug",
  "note",
]);

// Who wrote a row: me in the dashboard, or a coding agent through /api/agent.
// Lets the UI mark agent-written entries and keeps the journal honest about
// where each line came from.
export const authorSourceEnum = pgEnum("author_source", ["human", "agent"]);

// ── tables ────────────────────────────────────────────────────────────

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  status: clientStatusEnum("status").notNull().default("active"),
  defaultHourlyRateIls: numeric("default_hourly_rate_ils", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).notNull().default("ILS"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: projectStatusEnum("status").notNull().default("active"),
    hourlyRateIls: numeric("hourly_rate_ils", { precision: 10, scale: 2 }),
    nextAction: text("next_action"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("projects_client_idx").on(t.clientId)],
);

export const projectLinks = pgTable(
  "project_links",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    kind: linkKindEnum("kind").notNull().default("other"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("links_project_idx").on(t.projectId)],
);

export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").notNull().default("todo"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    dueDate: date("due_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    nextAction: text("next_action"),
    followUpAt: date("follow_up_at"),
    // Up-front time estimate (minutes). Compared against logged time to sharpen quoting.
    estimateMinutes: integer("estimate_minutes"),
    // When status is "waiting": who/what we're parked on, and since when (powers "כבר X ימים").
    waitingOn: text("waiting_on"),
    waitingSince: date("waiting_since"),
    lastUpdateAt: timestamp("last_update_at", { withTimezone: true }),
    source: authorSourceEnum("source").notNull().default("human"),
    // Stable slug an agent picks for a task ("dark-mode"), so it can find the
    // same task across sessions without persisting a numeric id anywhere.
    agentKey: text("agent_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("tasks_project_idx").on(t.projectId),
    index("tasks_status_idx").on(t.status),
    index("tasks_due_idx").on(t.dueDate),
    index("tasks_follow_up_idx").on(t.followUpAt),
    uniqueIndex("tasks_agent_key_idx").on(t.projectId, t.agentKey),
  ],
);

export const taskUpdates = pgTable(
  "task_updates",
  {
    id: serial("id").primaryKey(),
    taskId: integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    happenedAt: timestamp("happened_at", { withTimezone: true }).notNull().defaultNow(),
    kind: taskUpdateKindEnum("kind").notNull().default("progress"),
    summary: text("summary").notNull(),
    details: text("details"),
    statusBefore: taskStatusEnum("status_before"),
    statusAfter: taskStatusEnum("status_after"),
    nextAction: text("next_action"),
    followUpAt: date("follow_up_at"),
    timeEntryId: integer("time_entry_id").references(() => timeEntries.id, {
      onDelete: "set null",
    }),
    communicationId: integer("communication_id").references(() => communications.id, {
      onDelete: "set null",
    }),
    source: authorSourceEnum("source").notNull().default("human"),
    // Which agent wrote this, free-form ("claude-code").
    agentName: text("agent_name"),
    // Agent-supplied idempotency key — a retried POST returns the existing row
    // instead of duplicating the journal entry.
    externalKey: text("external_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("task_updates_task_idx").on(t.taskId),
    index("task_updates_happened_idx").on(t.happenedAt),
    uniqueIndex("task_updates_external_key_idx").on(t.externalKey),
  ],
);

export const invoices = pgTable(
  "invoices",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    number: text("number").notNull().unique(),
    issuedAt: date("issued_at").notNull(),
    dueAt: date("due_at"),
    periodFrom: date("period_from"),
    periodTo: date("period_to"),
    status: invoiceStatusEnum("status").notNull().default("draft"),
    currency: varchar("currency", { length: 3 }).notNull().default("ILS"),
    subtotalIls: numeric("subtotal_ils", { precision: 12, scale: 2 }).notNull().default("0"),
    vatRate: numeric("vat_rate", { precision: 4, scale: 2 }).notNull().default("0"),
    totalIls: numeric("total_ils", { precision: 12, scale: 2 }).notNull().default("0"),
    notes: text("notes"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("invoices_client_idx").on(t.clientId)],
);

export const timeEntries = pgTable(
  "time_entries",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    taskId: integer("task_id").references(() => tasks.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds"),
    note: text("note"),
    billable: boolean("billable").notNull().default(true),
    invoicedInvoiceId: integer("invoiced_invoice_id").references(() => invoices.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("time_project_idx").on(t.projectId),
    index("time_started_idx").on(t.startedAt),
    index("time_invoice_idx").on(t.invoicedInvoiceId),
  ],
);

export const communications = pgTable(
  "communications",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
    kind: commKindEnum("kind").notNull().default("note"),
    happenedAt: timestamp("happened_at", { withTimezone: true }).notNull().defaultNow(),
    summary: text("summary").notNull(),
    details: text("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("comm_client_idx").on(t.clientId),
    index("comm_project_idx").on(t.projectId),
  ],
);

export const invoiceLines = pgTable(
  "invoice_lines",
  {
    id: serial("id").primaryKey(),
    invoiceId: integer("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantityHours: numeric("quantity_hours", { precision: 8, scale: 2 }).notNull(),
    rateIls: numeric("rate_ils", { precision: 10, scale: 2 }).notNull(),
    amountIls: numeric("amount_ils", { precision: 12, scale: 2 }).notNull(),
    sourceTimeEntryId: integer("source_time_entry_id").references(() => timeEntries.id, {
      onDelete: "set null",
    }),
  },
  (t) => [index("lines_invoice_idx").on(t.invoiceId)],
);

// ── personal projects (no client, no billing) ─────────────────────────

export const personalProjects = pgTable("personal_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: personalProjectStatusEnum("status").notNull().default("idea"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  description: text("description"),
  nextAction: text("next_action"),
  startDate: date("start_date"),
  targetDate: date("target_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

export const personalLinks = pgTable(
  "personal_links",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => personalProjects.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    kind: linkKindEnum("kind").notNull().default("other"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("personal_links_project_idx").on(t.projectId)],
);

export const personalTasks = pgTable(
  "personal_tasks",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => personalProjects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").notNull().default("todo"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    type: personalTaskTypeEnum("type").notNull().default("feature"),
    dueDate: date("due_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    // Up-front estimate (minutes), compared against logged time to calibrate future guesses.
    estimateMinutes: integer("estimate_minutes"),
    nextAction: text("next_action"),
    // Definition of done — what has to be true before this can be closed.
    acceptance: text("acceptance"),
    // Git branch this task's work lives on — powers the branch/PR link in the git panel.
    branchName: text("branch_name"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    lastUpdateAt: timestamp("last_update_at", { withTimezone: true }),
    source: authorSourceEnum("source").notNull().default("human"),
    // Stable slug an agent picks for a task ("dark-mode"), so it can find the
    // same task across sessions without persisting a numeric id anywhere.
    agentKey: text("agent_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("personal_tasks_project_idx").on(t.projectId),
    index("personal_tasks_status_idx").on(t.status),
    uniqueIndex("personal_tasks_agent_key_idx").on(t.projectId, t.agentKey),
  ],
);

/**
 * Lightweight checklist inside a personal task. Steps are flat (no status, no
 * timer) — just "break the feature into concrete moves and tick them off".
 * Completing every step does NOT auto-close the task; that stays a manual status move.
 */
export const personalTaskSteps = pgTable(
  "personal_task_steps",
  {
    id: serial("id").primaryKey(),
    taskId: integer("task_id")
      .notNull()
      .references(() => personalTasks.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    done: boolean("done").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("personal_task_steps_task_idx").on(t.taskId)],
);

/**
 * Per-project tag catalogue. `type` says what a task *is* (feature/bug); a tag
 * says what area of the project it touches — "PWA", "נדל״ן", "עיצוב". Each
 * project defines its own vocabulary, so "שרת" on one project is unrelated to
 * "שרת" on another and they can carry different colours.
 *
 * `slug` is the stable English handle an agent addresses the tag by; `label` is
 * what the dashboard shows (usually Hebrew).
 */
export const personalTags = pgTable(
  "personal_tags",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => personalProjects.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    label: text("label").notNull(),
    // Palette key resolved to classes in lib/admin/format.ts — not a raw colour.
    color: text("color").notNull().default("slate"),
    sortOrder: integer("sort_order").notNull().default(0),
    source: authorSourceEnum("source").notNull().default("human"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("personal_tags_project_idx").on(t.projectId),
    uniqueIndex("personal_tags_slug_idx").on(t.projectId, t.slug),
  ],
);

/** Many-to-many: a task carries as many area tags as it actually touches. */
export const personalTaskTags = pgTable(
  "personal_task_tags",
  {
    taskId: integer("task_id")
      .notNull()
      .references(() => personalTasks.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => personalTags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.taskId, t.tagId] }),
    index("personal_task_tags_tag_idx").on(t.tagId),
  ],
);

/** Work journal for a personal task: what happened, when, and against which commit. */
export const personalTaskUpdates = pgTable(
  "personal_task_updates",
  {
    id: serial("id").primaryKey(),
    taskId: integer("task_id")
      .notNull()
      .references(() => personalTasks.id, { onDelete: "cascade" }),
    happenedAt: timestamp("happened_at", { withTimezone: true }).notNull().defaultNow(),
    kind: personalUpdateKindEnum("kind").notNull().default("progress"),
    summary: text("summary").notNull(),
    details: text("details"),
    statusBefore: taskStatusEnum("status_before"),
    statusAfter: taskStatusEnum("status_after"),
    nextAction: text("next_action"),
    commitSha: text("commit_sha"),
    commitUrl: text("commit_url"),
    timeEntryId: integer("time_entry_id").references(() => personalTimeEntries.id, {
      onDelete: "set null",
    }),
    source: authorSourceEnum("source").notNull().default("human"),
    // Which agent wrote this, free-form ("claude-code").
    agentName: text("agent_name"),
    // Agent-supplied idempotency key — a retried POST returns the existing row
    // instead of duplicating the journal entry.
    externalKey: text("external_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("personal_task_updates_task_idx").on(t.taskId),
    index("personal_task_updates_happened_idx").on(t.happenedAt),
    uniqueIndex("personal_task_updates_external_key_idx").on(t.externalKey),
  ],
);

export const personalTimeEntries = pgTable(
  "personal_time_entries",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => personalProjects.id, { onDelete: "cascade" }),
    taskId: integer("task_id").references(() => personalTasks.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("personal_time_project_idx").on(t.projectId),
    index("personal_time_started_idx").on(t.startedAt),
  ],
);

// ── relations ─────────────────────────────────────────────────────────

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
  invoices: many(invoices),
  communications: many(communications),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  tasks: many(tasks),
  links: many(projectLinks),
  timeEntries: many(timeEntries),
  communications: many(communications),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  timeEntries: many(timeEntries),
  updates: many(taskUpdates),
}));

export const taskUpdatesRelations = relations(taskUpdates, ({ one }) => ({
  task: one(tasks, { fields: [taskUpdates.taskId], references: [tasks.id] }),
  timeEntry: one(timeEntries, {
    fields: [taskUpdates.timeEntryId],
    references: [timeEntries.id],
  }),
  communication: one(communications, {
    fields: [taskUpdates.communicationId],
    references: [communications.id],
  }),
}));

export const projectLinksRelations = relations(projectLinks, ({ one }) => ({
  project: one(projects, { fields: [projectLinks.projectId], references: [projects.id] }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  project: one(projects, { fields: [timeEntries.projectId], references: [projects.id] }),
  task: one(tasks, { fields: [timeEntries.taskId], references: [tasks.id] }),
  invoice: one(invoices, {
    fields: [timeEntries.invoicedInvoiceId],
    references: [invoices.id],
  }),
}));

export const communicationsRelations = relations(communications, ({ one }) => ({
  client: one(clients, { fields: [communications.clientId], references: [clients.id] }),
  project: one(projects, { fields: [communications.projectId], references: [projects.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  lines: many(invoiceLines),
  timeEntries: many(timeEntries),
}));

export const invoiceLinesRelations = relations(invoiceLines, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceLines.invoiceId], references: [invoices.id] }),
  sourceTimeEntry: one(timeEntries, {
    fields: [invoiceLines.sourceTimeEntryId],
    references: [timeEntries.id],
  }),
}));

export const personalProjectsRelations = relations(personalProjects, ({ many }) => ({
  tasks: many(personalTasks),
  links: many(personalLinks),
  timeEntries: many(personalTimeEntries),
  tags: many(personalTags),
}));

export const personalTasksRelations = relations(personalTasks, ({ one, many }) => ({
  project: one(personalProjects, {
    fields: [personalTasks.projectId],
    references: [personalProjects.id],
  }),
  timeEntries: many(personalTimeEntries),
  updates: many(personalTaskUpdates),
  steps: many(personalTaskSteps),
  taskTags: many(personalTaskTags),
}));

export const personalTagsRelations = relations(personalTags, ({ one, many }) => ({
  project: one(personalProjects, {
    fields: [personalTags.projectId],
    references: [personalProjects.id],
  }),
  taskTags: many(personalTaskTags),
}));

export const personalTaskTagsRelations = relations(personalTaskTags, ({ one }) => ({
  task: one(personalTasks, {
    fields: [personalTaskTags.taskId],
    references: [personalTasks.id],
  }),
  tag: one(personalTags, {
    fields: [personalTaskTags.tagId],
    references: [personalTags.id],
  }),
}));

export const personalTaskStepsRelations = relations(personalTaskSteps, ({ one }) => ({
  task: one(personalTasks, {
    fields: [personalTaskSteps.taskId],
    references: [personalTasks.id],
  }),
}));

export const personalTaskUpdatesRelations = relations(personalTaskUpdates, ({ one }) => ({
  task: one(personalTasks, {
    fields: [personalTaskUpdates.taskId],
    references: [personalTasks.id],
  }),
  timeEntry: one(personalTimeEntries, {
    fields: [personalTaskUpdates.timeEntryId],
    references: [personalTimeEntries.id],
  }),
}));

export const personalLinksRelations = relations(personalLinks, ({ one }) => ({
  project: one(personalProjects, {
    fields: [personalLinks.projectId],
    references: [personalProjects.id],
  }),
}));

export const personalTimeEntriesRelations = relations(personalTimeEntries, ({ one }) => ({
  project: one(personalProjects, {
    fields: [personalTimeEntries.projectId],
    references: [personalProjects.id],
  }),
  task: one(personalTasks, {
    fields: [personalTimeEntries.taskId],
    references: [personalTasks.id],
  }),
}));

// ── inferred types ────────────────────────────────────────────────────

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type ProjectLink = typeof projectLinks.$inferSelect;
export type NewProjectLink = typeof projectLinks.$inferInsert;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type NewTimeEntry = typeof timeEntries.$inferInsert;
export type Communication = typeof communications.$inferSelect;
export type NewCommunication = typeof communications.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceLine = typeof invoiceLines.$inferSelect;
export type NewInvoiceLine = typeof invoiceLines.$inferInsert;
export type TaskUpdate = typeof taskUpdates.$inferSelect;
export type NewTaskUpdate = typeof taskUpdates.$inferInsert;
export type PersonalProject = typeof personalProjects.$inferSelect;
export type NewPersonalProject = typeof personalProjects.$inferInsert;
export type PersonalTask = typeof personalTasks.$inferSelect;
export type NewPersonalTask = typeof personalTasks.$inferInsert;
export type PersonalLink = typeof personalLinks.$inferSelect;
export type NewPersonalLink = typeof personalLinks.$inferInsert;
export type PersonalTimeEntry = typeof personalTimeEntries.$inferSelect;
export type NewPersonalTimeEntry = typeof personalTimeEntries.$inferInsert;
export type PersonalTaskUpdate = typeof personalTaskUpdates.$inferSelect;
export type NewPersonalTaskUpdate = typeof personalTaskUpdates.$inferInsert;
export type PersonalTaskStep = typeof personalTaskSteps.$inferSelect;
export type NewPersonalTaskStep = typeof personalTaskSteps.$inferInsert;
export type PersonalTag = typeof personalTags.$inferSelect;
export type NewPersonalTag = typeof personalTags.$inferInsert;
