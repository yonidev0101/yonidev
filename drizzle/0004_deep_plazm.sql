CREATE TABLE "signature_opens" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipient_id" integer NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_agent" text,
	"ip" text
);
--> statement-breakpoint
CREATE TABLE "signature_recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" varchar(64) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "signature_recipients_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "signature_opens" ADD CONSTRAINT "signature_opens_recipient_id_signature_recipients_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."signature_recipients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sig_opens_recipient_idx" ON "signature_opens" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "sig_opens_opened_idx" ON "signature_opens" USING btree ("opened_at");--> statement-breakpoint
CREATE INDEX "sig_recipients_email_idx" ON "signature_recipients" USING btree ("email");