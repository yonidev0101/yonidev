CREATE TABLE "personal_task_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"title" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "personal_tasks" ADD COLUMN "branch_name" text;--> statement-breakpoint
ALTER TABLE "personal_task_steps" ADD CONSTRAINT "personal_task_steps_task_id_personal_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."personal_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "personal_task_steps_task_idx" ON "personal_task_steps" USING btree ("task_id");