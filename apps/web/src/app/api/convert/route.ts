// POST /api/convert — record conversion events (public, CORS-enabled)
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, gates, gateEvents, eq } from "@upgradekit/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

const convertSchema = z.object({
  gate_id: z.string().uuid(),
  session_id: z.string().min(1),
  source: z.enum(["cta-click", "dismiss"]).default("cta-click"),
  end_user_id: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400, headers: CORS_HEADERS });
  }

  const parsed = convertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.issues },
      { status: 422, headers: CORS_HEADERS }
    );
  }

  const { gate_id, session_id, source, end_user_id, metadata } = parsed.data;

  // Verify gate exists
  const [gate] = await db
    .select({ id: gates.id })
    .from(gates)
    .where(eq(gates.id, gate_id))
    .limit(1);

  if (!gate) {
    return NextResponse.json(
      { error: "GATE_NOT_FOUND" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  await db.insert(gateEvents).values({
    gateId: gate_id,
    eventType: "conversion",
    sessionId: session_id,
    source,
    endUserId: end_user_id ?? null,
    metadata: metadata ?? null,
  });

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
