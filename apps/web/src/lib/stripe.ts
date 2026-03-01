import Stripe from "stripe";

// Lazy singleton — only initialised when first accessed
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

// ---------------------------------------------------------------------------
// Plan configuration
// ---------------------------------------------------------------------------

export type PlanId = "indie" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  priceUsd: number;
  stripePriceId: string;
  gateLimit: number | null; // null = unlimited
  impressionLimit: number | null; // null = unlimited per month
  canUseAB: boolean;
  canUseSegment: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  indie: {
    id: "indie",
    name: "Indie",
    description: "Up to 10 gates, unlimited impressions",
    priceUsd: 9,
    stripePriceId: process.env.STRIPE_PRICE_INDIE ?? "price_indie_placeholder",
    gateLimit: 10,
    impressionLimit: null,
    canUseAB: false,
    canUseSegment: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Unlimited gates + A/B flags + Segment integration",
    priceUsd: 19,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? "price_pro_placeholder",
    gateLimit: null,
    impressionLimit: null,
    canUseAB: true,
    canUseSegment: true,
  },
};

export const FREE_PLAN = {
  id: "free" as const,
  name: "Free",
  description: "1 gate, 100 impressions/month",
  gateLimit: 1,
  impressionLimit: 100,
  canUseAB: false,
  canUseSegment: false,
};
