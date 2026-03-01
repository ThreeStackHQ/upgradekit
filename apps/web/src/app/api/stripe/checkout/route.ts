// POST /api/stripe/checkout — create a Stripe checkout session
import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { db, subscriptions, users, eq } from "@upgradekit/db";
import { requireAuth } from "@/lib/require-auth";
import type { Tier } from "@/lib/plans";

const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"]!, {
  apiVersion: "2025-02-24.acacia" as any,
});

const PRICE_IDS: Record<Exclude<Tier, "free">, string> = {
  indie: process.env["STRIPE_PRICE_INDIE"] ?? "price_indie_placeholder",
  pro: process.env["STRIPE_PRICE_PRO"] ?? "price_pro_placeholder",
};

const checkoutSchema = z.object({
  tier: z.enum(["indie", "pro"]),
});

export async function POST(req: Request) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.issues },
      { status: 422 }
    );
  }

  const { tier } = parsed.data;
  const priceId = PRICE_IDS[tier];

  // Get user email for Stripe customer creation
  const [user] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, userId!))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  // Get or create Stripe customer
  const [sub] = await db
    .select({ stripeCustomerId: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId!))
    .limit(1);

  let customerId = sub?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: userId! },
    });
    customerId = customer.id;

    // Upsert subscription record with customer ID
    await db
      .insert(subscriptions)
      .values({
        userId: userId!,
        tier: "free",
        status: "active",
        stripeCustomerId: customerId,
      })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: { stripeCustomerId: customerId, updatedAt: new Date() },
      });
  }

  const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=1`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { userId: userId!, tier },
  });

  return NextResponse.json({ url: session.url });
}
