// GET /api/public/gates — returns all active gates for a project (by X-Api-Key)
// Used by @upgradekit/react SDK
import { NextResponse } from "next/server";
import { db, gates, users, eq, and } from "@upgradekit/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: Request) {
  const apiKey =
    req.headers.get("x-api-key") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!apiKey) {
    return NextResponse.json(
      { error: "MISSING_API_KEY" },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  // API key format: uk_<userId>
  const userId = apiKey.startsWith("uk_") ? apiKey.slice(3) : apiKey;

  // Verify user exists
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return NextResponse.json(
      { error: "INVALID_API_KEY" },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  // Return all active gates for the user/project
  const enabledGates = await db
    .select()
    .from(gates)
    .where(and(eq(gates.userId, user.id), eq(gates.isActive, true)));

  return NextResponse.json(enabledGates, { headers: CORS_HEADERS });
}
