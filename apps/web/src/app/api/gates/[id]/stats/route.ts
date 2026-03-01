import { NextResponse } from "next/server";
import { db, gates, gateEvents, eq, and, sql } from "@upgradekit/db";
import { requireAuth } from "@/lib/require-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  // Verify ownership
  const [gate] = await db
    .select({ id: gates.id })
    .from(gates)
    .where(and(eq(gates.id, id), eq(gates.userId, userId!)))
    .limit(1);

  if (!gate) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

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
  const dismissals = statsMap["dismiss"] ?? 0;
  const conversions = statsMap["conversion"] ?? 0;
  const conversionRate = impressions > 0 ? (conversions / impressions) * 100 : 0;

  return NextResponse.json({
    gate_id: id,
    impressions,
    dismissals,
    conversions,
    conversion_rate: Math.round(conversionRate * 10) / 10,
  });
}
