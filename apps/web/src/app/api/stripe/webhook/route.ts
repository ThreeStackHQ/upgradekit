export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db, subscriptions, eq } from "@upgradekit/db";

async function upsertSubscription(params: {
  userId: string;
  tier: "free" | "indie" | "pro";
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}): Promise<void> {
  const existing = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.userId, params.userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(subscriptions)
      .set({
        tier: params.tier,
        status: params.status,
        stripeCustomerId: params.stripeCustomerId,
        stripeSubscriptionId: params.stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, params.userId));
  } else {
    await db.insert(subscriptions).values({
      userId: params.userId,
      tier: params.tier,
      status: params.status,
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: params.stripeSubscriptionId,
    });
  }
}

function planFromPriceId(priceId: string): "free" | "indie" | "pro" {
  const indiePrice = process.env.STRIPE_PRICE_INDIE ?? "";
  const proPrice = process.env.STRIPE_PRICE_PRO ?? "";
  if (priceId === proPrice) return "pro";
  if (priceId === indiePrice) return "indie";
  return "free";
}

function planFromMetadata(metadata: Stripe.Metadata): "free" | "indie" | "pro" {
  const p = metadata["plan"];
  if (p === "pro") return "pro";
  if (p === "indie") return "indie";
  return "free";
}

function customerId(customer: Stripe.Subscription["customer"]): string {
  if (typeof customer === "string") return customer;
  if (customer && typeof customer === "object" && "id" in customer) {
    return (customer as { id: string }).id;
  }
  return "";
}

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events to keep subscriptions in sync.
 * Events: checkout.session.completed, customer.subscription.updated,
 *         customer.subscription.deleted
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", webhookSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.["userId"];
        if (!userId) {
          console.warn(
            "[webhook] checkout.session.completed: no userId in metadata"
          );
          break;
        }

        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription as Stripe.Subscription | null)?.id;
        if (!subId) break;

        // Fetch full subscription to get price details
        const sub = await stripe.subscriptions.retrieve(subId);
        const priceId = sub.items.data[0]?.price.id ?? "";
        const metaTier = planFromMetadata(session.metadata ?? {});
        const tier = metaTier !== "free" ? metaTier : planFromPriceId(priceId);

        await upsertSubscription({
          userId,
          tier,
          status: sub.status,
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : (session.customer as Stripe.Customer | null)?.id ?? "",
          stripeSubscriptionId: subId,
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata["userId"];
        if (!userId) {
          console.warn(
            "[webhook] subscription.updated: no userId in metadata, skipping"
          );
          break;
        }

        const priceId = sub.items.data[0]?.price.id ?? "";
        const priceTier = planFromPriceId(priceId);
        const tier =
          priceTier !== "free" ? priceTier : planFromMetadata(sub.metadata);

        await upsertSubscription({
          userId,
          tier,
          status: sub.status,
          stripeCustomerId: customerId(sub.customer),
          stripeSubscriptionId: sub.id,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata["userId"];
        if (!userId) {
          console.warn(
            "[webhook] subscription.deleted: no userId in metadata, skipping"
          );
          break;
        }

        await upsertSubscription({
          userId,
          tier: "free",
          status: "canceled",
          stripeCustomerId: customerId(sub.customer),
          stripeSubscriptionId: sub.id,
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[webhook] Error handling ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
