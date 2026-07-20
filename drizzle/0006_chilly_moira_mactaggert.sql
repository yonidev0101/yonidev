CREATE TYPE "public"."personal_update_kind" AS ENUM('progress', 'decision', 'blocker', 'commit', 'research', 'bug', 'note');--> statement-breakpoint
CREATE TABLE "personal_task_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"happened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"kind" "personal_update_kind" DEFAULT 'progress' NOT NULL,
	"summary" text NOT NULL,
	"details" text,
	"status_before" "task_status",
	"status_after" "task_status",
	"next_action" text,
	"commit_sha" text,
	"commit_url" text,
	"time_entry_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "personal_tasks" ADD COLUMN "estimate_minutes" integer;--> statement-breakpoint
ALTER TABLE "personal_tasks" ADD COLUMN "next_action" text;--> statement-breakpoint
ALTER TABLE "personal_tasks" ADD COLUMN "acceptance" text;--> statement-breakpoint
ALTER TABLE "personal_tasks" ADD COLUMN "started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "personal_tasks" ADD COLUMN "last_update_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "personal_task_updates" ADD CONSTRAINT "personal_task_updates_task_id_personal_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."personal_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_task_updates" ADD CONSTRAINT "personal_task_updates_time_entry_id_personal_time_entries_id_fk" FOREIGN KEY ("time_entry_id") REFERENCES "public"."personal_time_entries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "personal_task_updates_task_idx" ON "personal_task_updates" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "personal_task_updates_happened_idx" ON "personal_task_updates" USING btree ("happened_at");