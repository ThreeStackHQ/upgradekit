-- UpgradeKit Initial Migration
-- Auto-generated to match packages/db/src/schema/*

CREATE TYPE "trigger_type" AS ENUM ('button-intercept', 'feature-hint', 'auto-on-load');
CREATE TYPE "dismiss_behavior" AS ENUM ('close', 'force');
CREATE TYPE "event_type" AS ENUM ('impression', 'dismiss', 'conversion');
CREATE TYPE "tier" AS ENUM ('free', 'indie', 'pro');

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL UNIQUE,
  "name" text,
  "image" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "trigger_type" "trigger_type" NOT NULL,
  "trigger_value" text NOT NULL,
  "upgrade_url" text NOT NULL,
  "headline" text NOT NULL,
  "body_text" text,
  "cta_text" text NOT NULL DEFAULT 'Upgrade Now',
  "dismiss_behavior" "dismiss_behavior" NOT NULL DEFAULT 'close',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gate_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "gate_id" uuid NOT NULL REFERENCES "gates"("id") ON DELETE CASCADE,
  "event_type" "event_type" NOT NULL,
  "session_id" text NOT NULL,
  "end_user_id" text,
  "source" text,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "tier" "tier" NOT NULL DEFAULT 'free',
  "status" text NOT NULL DEFAULT 'active',
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "current_period_end" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gates_user_id_idx" ON "gates" ("user_id");
CREATE INDEX IF NOT EXISTS "gate_events_gate_id_idx" ON "gate_events" ("gate_id");
CREATE INDEX IF NOT EXISTS "gate_events_event_type_idx" ON "gate_events" ("event_type");
CREATE INDEX IF NOT EXISTS "gate_events_session_id_idx" ON "gate_events" ("session_id");
CREATE INDEX IF NOT EXISTS "subscriptions_user_id_idx" ON "subscriptions" ("user_id");
