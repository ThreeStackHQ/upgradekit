export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db, gates, gateEvents, eq } from "@upgradekit/db";
import { ok, fail, notFound, serverError } from "@/lib/api";
import { trackEventSchema } from "@/lib/validators";

// POST /api/track — record an impression or dismiss event
export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const parsed = trackEventSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      parsed.error.issues[0]?.message ?? "Validation failed",
      "VALIDATION_ERROR",
      422
    );
  }

  const { gate_id, user_id, session_id, type } = parsed.data;

  try {
    // Verify gate exists and is active
    const [gate] = await db
      .select({ id: gates.id, isActive: gates.isActive })
      .from(gates)
      .where(eq(gates.id, gate_id))
      .limit(1);

    if (!gate) return notFound("Gate");
    if (!gate.isActive) return fail("Gate is inactive", "GATE_INACTIVE", 400);

    const [event] = await db
      .insert(gateEvents)
      .values({
        gateId: gate_id,
        userId: user_id ?? null,
        sessionId: session_id,
        eventType: type,
        source: null,
      })
      .returning();

    const response = ok({ tracked: true, event_id: event?.id }, 201);

    // CORS for widget usage
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  } catch (err) {
    console.error("[POST /api/track]", err);
    return serverError();
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    },
  });
}
