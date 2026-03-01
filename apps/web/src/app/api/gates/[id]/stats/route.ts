export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db, gates, gateEvents, eq, and, count, gte, sql } from "@upgradekit/db";
import { ok, notFound, forbidden, serverError, requireAuth } from "@/lib/api";

type RouteParams = { params: { id: string } };

interface DayStats {
  date: string;
  impressions: number;
  conversions: number;
}

// GET /api/gates/:id/stats — detailed analytics for a gate
export async function GET(_req: NextRequest, { params }: RouteParams): Promise<Response> {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = params;

  try {
    // Verify gate ownership
    const [gate] = await db
      .select({ id: gates.id, userId: gates.userId })
      .from(gates)
      .where(eq(gates.id, id))
      .limit(1);

    if (!gate) return notFound("Gate");
    if (gate.userId !== session.user.id) return forbidden();

    // Total counts
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

    // Last 7 days breakdown
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Include today
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const rawEvents = await db
      .select({
        date: sql<string>`DATE(${gateEvents.createdAt})`.as("date"),
        eventType: gateEvents.eventType,
        count: count(),
      })
      .from(gateEvents)
      .where(
        and(
          eq(gateEvents.gateId, id),
          gte(gateEvents.createdAt, sevenDaysAgo)
        )
      )
      .groupBy(sql`DATE(${gateEvents.createdAt})`, gateEvents.eventType);

    // Build a map for the last 7 days
    const dayMap = new Map<string, DayStats>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      dayMap.set(dateStr, { date: dateStr, impressions: 0, conversions: 0 });
    }

    for (const row of rawEvents) {
      const entry = dayMap.get(row.date);
      if (entry) {
        if (row.eventType === "impression") {
          entry.impressions = Number(row.count);
        } else if (row.eventType === "conversion") {
          entry.conversions = Number(row.count);
        }
      }
    }

    const last7Days = Array.from(dayMap.values());

    return ok({
      impressions,
      conversions,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      last_7_days: last7Days,
    });
  } catch (err) {
    console.error("[GET /api/gates/:id/stats]", err);
    return serverError();
  }
}
