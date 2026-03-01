// POST /api/stripe/webhook — handle Stripe subscription events
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db, subscriptions, eq } from "@upgradekit/db";
import type { Tier } from "@/lib/plans";

const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"]!, {
  apiVersion: "2025-02-24.acacia" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "MISSING_SIGNATURE" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env["STRIPE_WEBHOOK_SECRET"]!
    );
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.["userId"];
        const tier = session.metadata?.["tier"] as Tier;
        const subscriptionId = session.subscription as string;

        if (!userId || !tier) break;

        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const currentPeriodEnd = new Date(
          (stripeSubscription as any).current_period_end * 1000
        );

        await db
          .insert(subscriptions)
          .values({
            userId,
            tier,
            status: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscriptionId,
            currentPeriodEnd,
          })
          .onConflictDoUpdate({
            target: subscriptions.userId,
            set: {
              tier,
              status: "active",
              stripeSubscriptionId: subscriptionId,
              currentPeriodEnd,
              updatedAt: new Date(),
            },
          });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.["userId"];
        if (!userId) break;

        const tier = resolveTierFromPrice(sub);
        const currentPeriodEnd = new Date((sub as any).current_period_end * 1000);

        await db
          .update(subscriptions)
          .set({
            tier,
            status: sub.status === "active" ? "active" : sub.status,
            currentPeriodEnd,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        await db
          .update(subscriptions)
          .set({
            tier: "free",
            status: "canceled",
            stripeSubscriptionId: null,
            currentPeriodEnd: null,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }

      default:
        // Unhandled event type — that's fine
        break;
    }
  } catch (err) {
    console.error("[Webhook] Handler error:", err);
    return NextResponse.json({ error: "HANDLER_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function resolveTierFromPrice(sub: Stripe.Subscription): Tier {
  const priceId = sub.items.data[0]?.price.id;
  const indiePriceId = process.env["STRIPE_PRICE_INDIE"];
  const proPriceId = process.env["STRIPE_PRICE_PRO"];

  if (priceId === indiePriceId) return "indie";
  if (priceId === proPriceId) return "pro";
  return "free";
}
