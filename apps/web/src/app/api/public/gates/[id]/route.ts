export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db, gates, eq, and } from "@upgradekit/db";
import { ok, notFound, serverError } from "@/lib/api";

type RouteParams = { params: { id: string } };

// GET /api/public/gates/:id — public gate config (used by widget)
// No authentication required
export async function GET(_req: NextRequest, { params }: RouteParams): Promise<Response> {
  const { id } = params;

  try {
    const [gate] = await db
      .select({
        id: gates.id,
        name: gates.name,
        triggerType: gates.triggerType,
        headline: gates.headline,
        bodyText: gates.bodyText,
        ctaText: gates.ctaText,
        upgradeUrl: gates.upgradeUrl,
        dismissBehavior: gates.dismissBehavior,
        isActive: gates.isActive,
      })
      .from(gates)
      .where(and(eq(gates.id, id), eq(gates.isActive, true)))
      .limit(1);

    if (!gate) {
      return notFound("Gate");
    }

    // CORS headers so the widget can call this cross-origin
    const res = ok({
      id: gate.id,
      name: gate.name,
      trigger_type: gate.triggerType,
      headline: gate.headline,
      body: gate.bodyText,
      cta_text: gate.ctaText,
      upgrade_url: gate.upgradeUrl,
      dismiss_behavior: gate.dismissBehavior,
    });

    const response = new Response(res.body, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });

    return response;
  } catch (err) {
    console.error("[GET /api/public/gates/:id]", err);
    return serverError();
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    },
  });
}
