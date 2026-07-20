ALTER TYPE "public"."task_status" ADD VALUE 'canceled';--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "estimate_minutes" integer;