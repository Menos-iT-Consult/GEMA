DO $$ BEGIN
  CREATE TYPE "organization_submission_status" AS ENUM ('NEW', 'REVIEWED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "organization_submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "submitted_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "status" "organization_submission_status" DEFAULT 'NEW' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "reviewed_at" timestamp with time zone
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "organization_submissions_org_created_idx"
  ON "organization_submissions" ("org_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_submissions_status_created_idx"
  ON "organization_submissions" ("status", "created_at");
