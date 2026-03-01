-- UpgradeKit Sprint 3.3 Migration
-- Update tier enum: free/indie/pro (remove 'business', add 'indie')
-- Add Stripe price IDs column to subscriptions

--> statement-breakpoint
-- Rename old enum, recreate with new values
ALTER TYPE "tier" RENAME TO "tier_old";

--> statement-breakpoint
CREATE TYPE "tier" AS ENUM ('free', 'indie', 'pro');

--> statement-breakpoint
-- Migrate existing rows (business -> pro)
ALTER TABLE "subscriptions"
  ALTER COLUMN "tier" TYPE text;

--> statement-breakpoint
UPDATE "subscriptions" SET "tier" = 'pro' WHERE "tier" = 'business';

--> statement-breakpoint
ALTER TABLE "subscriptions"
  ALTER COLUMN "tier" TYPE "tier" USING "tier"::"tier";

--> statement-breakpoint
DROP TYPE "tier_old";
