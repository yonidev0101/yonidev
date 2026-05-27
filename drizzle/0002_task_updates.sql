CREATE TYPE "public"."task_update_kind" AS ENUM('progress', 'call', 'meeting', 'email', 'decision', 'blocker', 'handoff');--> statement-breakpoint
CREATE TABLE "task_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"happened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"kind" "task_update_kind" DEFAULT 'progress' NOT NULL,
	"summary" text NOT NULL,
	"details" text,
	"status_before" "task_status",
	"status_after" "task_status",
	"next_action" text,
	"follow_up_at" date,
	"time_entry_id" integer,
	"communication_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "next_action" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "follow_up_at" date;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "last_update_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "task_updates" ADD CONSTRAINT "task_updates_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_updates" ADD CONSTRAINT "task_updates_time_entry_id_time_entries_id_fk" FOREIGN KEY ("time_entry_id") REFERENCES "public"."time_entries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_updates" ADD CONSTRAINT "task_updates_communication_id_communications_id_fk" FOREIGN KEY ("communication_id") REFERENCES "public"."communications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "task_updates_task_idx" ON "task_updates" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_updates_happened_idx" ON "task_updates" USING btree ("happened_at");--> statement-breakpoint
CREATE INDEX "tasks_follow_up_idx" ON "tasks" USING btree ("follow_up_at");