export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db, gates, gateEvents, eq, and, count, sql } from "@upgradekit/db";
import { ok, fail, notFound, forbidden, serverError, requireAuth } from "@/lib/api";
import { updateGateSchema } from "@/lib/validators";

type RouteParams = { params: { id: string } };

// GET /api/gates/:id — get gate details with stats
export async function GET(_req: NextRequest, { params }: RouteParams): Promise<Response> {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = params;

  try {
    const [gate] = await db
      .select()
      .from(gates)
      .where(and(eq(gates.id, id), eq(gates.userId, session.user.id)))
      .limit(1);

    if (!gate) return notFound("Gate");

    // Fetch basic stats
    const [impressionCount] = await db
      .select({ count: count() })
      .from(gateEvents)
      .where(and(eq(gateEvents.gateId, id), eq(gateEvents.eventType, "impression")));

    const [conversionCount] = await db
      .select({ count: count() })
      .from(gateEvents)
      .where(and(eq(gateEvents.gateId, id), eq(gateEvents.eventType, "conversion")));

    const impressions = Number(impressionCount?.count ?? 0);
    const conversions = Number(conversionCount?.count ?? 0);
    const conversionRate = impressions > 0 ? (conversions / impressions) * 100 : 0;

    return ok({
      ...gate,
      stats: {
        impressions,
        conversions,
        conversion_rate: Math.round(conversionRate * 100) / 100,
      },
    });
  } catch (err) {
    console.error("[GET /api/gates/:id]", err);
    return serverError();
  }
}

// PATCH /api/gates/:id — update gate
export async function PATCH(req: NextRequest, { params }: RouteParams): Promise<Response> {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const parsed = updateGateSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      parsed.error.issues[0]?.message ?? "Validation failed",
      "VALIDATION_ERROR",
      422
    );
  }

  try {
    // Verify ownership
    const [existing] = await db
      .select({ id: gates.id, userId: gates.userId })
      .from(gates)
      .where(eq(gates.id, id))
      .limit(1);

    if (!existing) return notFound("Gate");
    if (existing.userId !== session.user.id) return forbidden();

    const { name, trigger_type, headline, body: bodyText, cta_text, upgrade_url, dismiss_behavior } =
      parsed.data;

    const updateValues: Partial<{
      name: string;
      triggerType: "button-intercept" | "feature-hint" | "auto-on-load";
      headline: string;
      bodyText: string;
      ctaText: string;
      upgradeUrl: string;
      dismissBehavior: "allow" | "force";
      updatedAt: Date;
    }> = { updatedAt: new Date() };

    if (name !== undefined) updateValues.name = name;
    if (trigger_type !== undefined) updateValues.triggerType = trigger_type;
    if (headline !== undefined) updateValues.headline = headline;
    if (bodyText !== undefined) updateValues.bodyText = bodyText;
    if (cta_text !== undefined) updateValues.ctaText = cta_text;
    if (upgrade_url !== undefined) updateValues.upgradeUrl = upgrade_url;
    if (dismiss_behavior !== undefined) updateValues.dismissBehavior = dismiss_behavior;

    const [updated] = await db
      .update(gates)
      .set(updateValues)
      .where(eq(gates.id, id))
      .returning();

    return ok(updated);
  } catch (err) {
    console.error("[PATCH /api/gates/:id]", err);
    return serverError();
  }
}

// DELETE /api/gates/:id — delete gate
export async function DELETE(_req: NextRequest, { params }: RouteParams): Promise<Response> {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = params;

  try {
    // Verify ownership
    const [existing] = await db
      .select({ id: gates.id, userId: gates.userId })
      .from(gates)
      .where(eq(gates.id, id))
      .limit(1);

    if (!existing) return notFound("Gate");
    if (existing.userId !== session.user.id) return forbidden();

    await db.delete(gates).where(eq(gates.id, id));

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("[DELETE /api/gates/:id]", err);
    return serverError();
  }
}
