ALTER TYPE "public"."task_status" ADD VALUE 'waiting' BEFORE 'blocked';--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "waiting_on" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "waiting_since" date;