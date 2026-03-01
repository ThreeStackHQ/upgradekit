import { NextResponse } from "next/server";
import { z } from "zod";
import { db, gates, subscriptions, eq, desc } from "@upgradekit/db";
import { requireAuth } from "@/lib/require-auth";
import { getPlan } from "@/lib/plans";
import type { Tier } from "@/lib/plans";

const createGateSchema = z.object({
  name: z.string().min(1).max(100),
  trigger_type: z.enum(["button-intercept", "feature-hint", "auto-on-load"]),
  trigger_value: z.string().min(1),
  upgrade_url: z.string().url(),
  headline: z.string().min(1).max(200),
  body_text: z.string().optional(),
  cta_text: z.string().min(1).max(100).default("Upgrade Now"),
  dismiss_behavior: z.enum(["close", "force"]).default("close"),
});

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const userGates = await db
    .select()
    .from(gates)
    .where(eq(gates.userId, userId!))
    .orderBy(desc(gates.createdAt));

  return NextResponse.json(userGates);
}

export async function POST(req: Request) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = createGateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.issues },
      { status: 422 }
    );
  }

  // Get user's tier
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId!))
    .limit(1);

  const tier = (sub?.tier ?? "free") as Tier;
  const plan = getPlan(tier);

  if (plan.gateLimit !== null) {
    const existingGates = await db
      .select({ id: gates.id })
      .from(gates)
      .where(eq(gates.userId, userId!));

    if (existingGates.length >= plan.gateLimit) {
      return NextResponse.json(
        { error: "GATE_LIMIT_REACHED", limit: plan.gateLimit, tier },
        { status: 403 }
      );
    }
  }

  const data = parsed.data;
  const [newGate] = await db
    .insert(gates)
    .values({
      userId: userId!,
      name: data.name,
      triggerType: data.trigger_type,
      triggerValue: data.trigger_value,
      upgradeUrl: data.upgrade_url,
      headline: data.headline,
      bodyText: data.body_text ?? null,
      ctaText: data.cta_text,
      dismissBehavior: data.dismiss_behavior,
    })
    .returning();

  return NextResponse.json(newGate, { status: 201 });
}
