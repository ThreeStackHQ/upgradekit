-- UpgradeKit Initial Migration
-- Generated for all core tables

CREATE TYPE "trigger_type" AS ENUM ('feature', 'page', 'usage');
CREATE TYPE "tier" AS ENUM ('free', 'pro', 'business');

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
  "slug" text NOT NULL UNIQUE,
  "trigger_type" "trigger_type" NOT NULL,
  "trigger_value" text NOT NULL,
  "upgrade_url" text NOT NULL,
  "headline" text NOT NULL,
  "description" text,
  "cta_text" text NOT NULL DEFAULT 'Upgrade Now',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gate_impressions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "gate_id" uuid NOT NULL REFERENCES "gates"("id") ON DELETE CASCADE,
  "project_id" text NOT NULL,
  "end_user_id" text,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gate_conversions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "gate_id" uuid NOT NULL REFERENCES "gates"("id") ON DELETE CASCADE,
  "project_id" text NOT NULL,
  "end_user_id" text,
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
CREATE INDEX IF NOT EXISTS "gate_impressions_gate_id_idx" ON "gate_impressions" ("gate_id");
CREATE INDEX IF NOT EXISTS "gate_impressions_project_id_idx" ON "gate_impressions" ("project_id");
CREATE INDEX IF NOT EXISTS "gate_conversions_gate_id_idx" ON "gate_conversions" ("gate_id");
CREATE INDEX IF NOT EXISTS "gate_conversions_project_id_idx" ON "gate_conversions" ("project_id");
