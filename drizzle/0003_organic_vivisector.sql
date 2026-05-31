CREATE TYPE "public"."personal_project_status" AS ENUM('idea', 'active', 'paused', 'done', 'archived');--> statement-breakpoint
CREATE TABLE "personal_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"kind" "link_kind" DEFAULT 'other' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" "personal_project_status" DEFAULT 'idea' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"description" text,
	"next_action" text,
	"start_date" date,
	"target_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "personal_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_time_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"task_id" integer,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_seconds" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "personal_links" ADD CONSTRAINT "personal_links_project_id_personal_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."personal_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_tasks" ADD CONSTRAINT "personal_tasks_project_id_personal_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."personal_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_time_entries" ADD CONSTRAINT "personal_time_entries_project_id_personal_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."personal_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_time_entries" ADD CONSTRAINT "personal_time_entries_task_id_personal_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."personal_tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "personal_links_project_idx" ON "personal_links" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "personal_tasks_project_idx" ON "personal_tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "personal_tasks_status_idx" ON "personal_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "personal_time_project_idx" ON "personal_time_entries" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "personal_time_started_idx" ON "personal_time_entries" USING btree ("started_at");