CREATE TABLE "personal_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"color" text DEFAULT 'slate' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"source" "author_source" DEFAULT 'human' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_task_tags" (
	"task_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "personal_task_tags_task_id_tag_id_pk" PRIMARY KEY("task_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "personal_tags" ADD CONSTRAINT "personal_tags_project_id_personal_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."personal_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_task_tags" ADD CONSTRAINT "personal_task_tags_task_id_personal_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."personal_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_task_tags" ADD CONSTRAINT "personal_task_tags_tag_id_personal_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."personal_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "personal_tags_project_idx" ON "personal_tags" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "personal_tags_slug_idx" ON "personal_tags" USING btree ("project_id","slug");--> statement-breakpoint
CREATE INDEX "personal_task_tags_tag_idx" ON "personal_task_tags" USING btree ("tag_id");