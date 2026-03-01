export type Tier = "free" | "indie" | "pro";

export const PLANS: Record<Tier, { gateLimit: number | null; impressionLimit: number | null; priceUsd: number }> = {
  free: {
    gateLimit: 1,
    impressionLimit: 100,
    priceUsd: 0,
  },
  indie: {
    gateLimit: 10,
    impressionLimit: null,
    priceUsd: 9,
  },
  pro: {
    gateLimit: null,
    impressionLimit: null,
    priceUsd: 19,
  },
};

export function getPlan(tier: Tier) {
  return PLANS[tier] ?? PLANS.free;
}
