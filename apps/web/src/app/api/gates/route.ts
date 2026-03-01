export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db, gates, eq, desc } from "@upgradekit/db";
import { ok, fail, serverError, requireAuth } from "@/lib/api";
import { createGateSchema } from "@/lib/validators";
import { canCreateGate } from "@/lib/tier";

// POST /api/gates — create a new gate
export async function POST(req: NextRequest): Promise<Response> {
  const { session, error } = await requireAuth();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const parsed = createGateSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      parsed.error.issues[0]?.message ?? "Validation failed",
      "VALIDATION_ERROR",
      422
    );
  }

  const { name, trigger_type, headline, body: bodyText, cta_text, upgrade_url, dismiss_behavior } =
    parsed.data;

  // Enforce per-plan gate creation limits
  const allowed = await canCreateGate(session.user.id);
  if (!allowed) {
    return fail(
      "Gate limit reached for your current plan. Upgrade to create more gates.",
      "GATE_LIMIT_REACHED",
      403
    );
  }

  try {
    const [gate] = await db
      .insert(gates)
      .values({
        userId: session.user.id,
        name,
        triggerType: trigger_type,
        headline,
        bodyText: bodyText ?? "",
        ctaText: cta_text,
        upgradeUrl: upgrade_url,
        dismissBehavior: dismiss_behavior,
      })
      .returning();

    return ok(gate, 201);
  } catch (err) {
    console.error("[POST /api/gates]", err);
    return serverError();
  }
}

// GET /api/gates — list authenticated user's gates
export async function GET(): Promise<Response> {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const userGates = await db
      .select()
      .from(gates)
      .where(eq(gates.userId, session.user.id))
      .orderBy(desc(gates.createdAt));

    return ok(userGates);
  } catch (err) {
    console.error("[GET /api/gates]", err);
    return serverError();
  }
}
