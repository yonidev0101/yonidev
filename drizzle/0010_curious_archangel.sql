CREATE TYPE "public"."author_source" AS ENUM('human', 'agent');--> statement-breakpoint
ALTER TABLE "personal_task_updates" ADD COLUMN "source" "author_source" DEFAULT 'human' NOT NULL;--> statement-breakpoint
ALTER TABLE "personal_task_updates" ADD COLUMN "agent_name" text;--> statement-breakpoint
ALTER TABLE "personal_task_updates" ADD COLUMN "external_key" text;--> statement-breakpoint
ALTER TABLE "personal_tasks" ADD COLUMN "source" "author_source" DEFAULT 'human' NOT NULL;--> statement-breakpoint
ALTER TABLE "personal_tasks" ADD COLUMN "agent_key" text;--> statement-breakpoint
ALTER TABLE "task_updates" ADD COLUMN "source" "author_source" DEFAULT 'human' NOT NULL;--> statement-breakpoint
ALTER TABLE "task_updates" ADD COLUMN "agent_name" text;--> statement-breakpoint
ALTER TABLE "task_updates" ADD COLUMN "external_key" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "source" "author_source" DEFAULT 'human' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "agent_key" text;--> statement-breakpoint
CREATE UNIQUE INDEX "personal_task_updates_external_key_idx" ON "personal_task_updates" USING btree ("external_key");--> statement-breakpoint
CREATE UNIQUE INDEX "personal_tasks_agent_key_idx" ON "personal_tasks" USING btree ("project_id","agent_key");--> statement-breakpoint
CREATE UNIQUE INDEX "task_updates_external_key_idx" ON "task_updates" USING btree ("external_key");--> statement-breakpoint
CREATE UNIQUE INDEX "tasks_agent_key_idx" ON "tasks" USING btree ("project_id","agent_key");