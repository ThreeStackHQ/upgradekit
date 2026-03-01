export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { ok, fail, serverError, requireAuth } from "@/lib/api";
import { getStripe, PLANS, type PlanId } from "@/lib/stripe";
import { db, subscriptions, eq } from "@upgradekit/db";

interface CheckoutRequestBody {
  plan: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * POST /api/stripe/checkout
 * Body: { plan: "indie" | "pro", successUrl?, cancelUrl? }
 * Returns: { url: string } — redirect the user to Stripe Checkout
 */
export async function POST(req: NextRequest): Promise<Response> {
  const { session, error } = await requireAuth();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const { plan, successUrl, cancelUrl } = body as CheckoutRequestBody;

  if (!plan || !(plan in PLANS)) {
    return fail('Plan must be "indie" or "pro"', "INVALID_PLAN", 422);
  }

  const planConfig = PLANS[plan as PlanId];
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    // Find or create Stripe customer
    const existing = await db
      .select({ stripeCustomerId: subscriptions.stripeCustomerId })
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1);

    let customerId: string | undefined =
      existing[0]?.stripeCustomerId ?? undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planConfig.stripePriceId,
          quantity: 1,
        },
      ],
      success_url:
        successUrl ?? `${appUrl}/dashboard?upgrade=success&plan=${plan}`,
      cancel_url: cancelUrl ?? `${appUrl}/dashboard?upgrade=cancelled`,
      metadata: {
        userId: session.user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan,
        },
      },
    });

    return ok({ url: checkoutSession.url });
  } catch (err) {
    console.error("[POST /api/stripe/checkout]", err);
    return serverError("Failed to create checkout session");
  }
}
