-- UpgradeKit Sprint 2.1-2.3 Migration
-- Updates gates table for new gate API spec and adds gate_events table

--> statement-breakpoint
-- Update trigger_type enum to match widget API spec
ALTER TYPE "trigger_type" RENAME TO "trigger_type_old";
CREATE TYPE "trigger_type" AS ENUM ('button-intercept', 'feature-hint', 'auto-on-load');

--> statement-breakpoint
-- Add dismiss_behavior enum
CREATE TYPE "dismiss_behavior" AS ENUM ('allow', 'force');

--> statement-breakpoint
-- Add event_type enum
CREATE TYPE "event_type" AS ENUM ('impression', 'dismiss', 'conversion');

--> statement-breakpoint
-- Alter gates table: add new columns, remove old ones
ALTER TABLE "gates"
  ADD COLUMN IF NOT EXISTS "body_text" text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "dismiss_behavior" "dismiss_behavior" NOT NULL DEFAULT 'allow';

--> statement-breakpoint
-- Drop old constraints and columns (safe — new branch, no prod data)
ALTER TABLE "gates"
  DROP COLUMN IF EXISTS "slug",
  DROP COLUMN IF EXISTS "trigger_value",
  DROP COLUMN IF EXISTS "description";

--> statement-breakpoint
-- Migrate trigger_type column to new enum
ALTER TABLE "gates"
  ALTER COLUMN "trigger_type" TYPE text;

--> statement-breakpoint
UPDATE "gates" SET "trigger_type" = 'button-intercept';

--> statement-breakpoint
ALTER TABLE "gates"
  ALTER COLUMN "trigger_type" TYPE "trigger_type" USING "trigger_type"::"trigger_type";

--> statement-breakpoint
DROP TYPE "trigger_type_old";

--> statement-breakpoint
-- Add gate_events table for unified impression/conversion tracking
CREATE TABLE IF NOT EXISTS "gate_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "gate_id" uuid NOT NULL REFERENCES "gates"("id") ON DELETE CASCADE,
  "user_id" text,
  "session_id" text NOT NULL,
  "event_type" "event_type" NOT NULL,
  "source" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gate_events_gate_id_idx" ON "gate_events" ("gate_id");
CREATE INDEX IF NOT EXISTS "gate_events_event_type_idx" ON "gate_events" ("event_type");
CREATE INDEX IF NOT EXISTS "gate_events_created_at_idx" ON "gate_events" ("created_at");
