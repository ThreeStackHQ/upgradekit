import { db, subscriptions, gates, eq, count } from "@upgradekit/db";
import { FREE_PLAN, PLANS } from "./stripe";

export type Tier = "free" | "indie" | "pro";

// ---------------------------------------------------------------------------
// Fetch the user's current tier from DB (defaults to "free")
// ---------------------------------------------------------------------------
export async function getUserTier(userId: string): Promise<Tier> {
  const rows = await db
    .select({ tier: subscriptions.tier })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const row = rows[0];
  if (!row) return "free";

  // Only treat active subscriptions as paid
  const sub = await db
    .select({ tier: subscriptions.tier, status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const s = sub[0];
  if (!s || s.status !== "active") return "free";
  return s.tier as Tier;
}

// ---------------------------------------------------------------------------
// Tier capability helpers
// ---------------------------------------------------------------------------

export async function canCreateGate(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);

  if (tier === "pro") return true;

  const limit =
    tier === "indie"
      ? PLANS.indie.gateLimit
      : FREE_PLAN.gateLimit;

  if (limit === null) return true;

  // Count existing gates for this user
  const [result] = await db
    .select({ value: count() })
    .from(gates)
    .where(eq(gates.userId, userId));

  const current = result?.value ?? 0;
  return current < limit;
}

export async function canUseAB(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  return tier === "pro";
}

export async function canUseSegment(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  return tier === "pro";
}

// ---------------------------------------------------------------------------
// Gate limit info (for UI display)
// ---------------------------------------------------------------------------
export function getGateLimitForTier(tier: Tier): number | null {
  if (tier === "pro") return null;
  if (tier === "indie") return PLANS.indie.gateLimit;
  return FREE_PLAN.gateLimit;
}
