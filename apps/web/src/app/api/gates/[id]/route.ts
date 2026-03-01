import { NextResponse } from "next/server";
import { z } from "zod";
import { db, gates, gateEvents, eq, and, sql } from "@upgradekit/db";
import { requireAuth } from "@/lib/require-auth";

const updateGateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  trigger_type: z.enum(["button-intercept", "feature-hint", "auto-on-load"]).optional(),
  trigger_value: z.string().min(1).optional(),
  upgrade_url: z.string().url().optional(),
  headline: z.string().min(1).max(200).optional(),
  body_text: z.string().optional(),
  cta_text: z.string().min(1).max(100).optional(),
  dismiss_behavior: z.enum(["close", "force"]).optional(),
  is_active: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const [gate] = await db
    .select()
    .from(gates)
    .where(and(eq(gates.id, id), eq(gates.userId, userId!)))
    .limit(1);

  if (!gate) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // Fetch stats from gate_events
  const statsRows = await db
    .select({
      eventType: gateEvents.eventType,
      count: sql<number>`count(*)::int`,
    })
    .from(gateEvents)
    .where(eq(gateEvents.gateId, id))
    .groupBy(gateEvents.eventType);

  const statsMap: Record<string, number> = {};
  for (const row of statsRows) {
    statsMap[row.eventType] = row.count;
  }

  const impressions = statsMap["impression"] ?? 0;
  const conversions = statsMap["conversion"] ?? 0;
  const conversionRate = impressions > 0 ? (conversions / impressions) * 100 : 0;

  return NextResponse.json({
    ...gate,
    stats: {
      impressions,
      conversions,
      conversion_rate: Math.round(conversionRate * 10) / 10,
    },
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(gates)
    .where(and(eq(gates.id, id), eq(gates.userId, userId!)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = updateGateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.issues },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const [updated] = await db
    .update(gates)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.trigger_type !== undefined && { triggerType: data.trigger_type }),
      ...(data.trigger_value !== undefined && { triggerValue: data.trigger_value }),
      ...(data.upgrade_url !== undefined && { upgradeUrl: data.upgrade_url }),
      ...(data.headline !== undefined && { headline: data.headline }),
      ...(data.body_text !== undefined && { bodyText: data.body_text }),
      ...(data.cta_text !== undefined && { ctaText: data.cta_text }),
      ...(data.dismiss_behavior !== undefined && { dismissBehavior: data.dismiss_behavior }),
      ...(data.is_active !== undefined && { isActive: data.is_active }),
      updatedAt: new Date(),
    })
    .where(and(eq(gates.id, id), eq(gates.userId, userId!)))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const [existing] = await db
    .select({ id: gates.id })
    .from(gates)
    .where(and(eq(gates.id, id), eq(gates.userId, userId!)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await db.delete(gates).where(and(eq(gates.id, id), eq(gates.userId, userId!)));

  return new NextResponse(null, { status: 204 });
}
