// GET /api/public/gates/:id — returns a single active gate by ID
// Used by the embeddable widget
import { NextResponse } from "next/server";
import { db, gates, eq, and } from "@upgradekit/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  const [gate] = await db
    .select()
    .from(gates)
    .where(and(eq(gates.id, id), eq(gates.isActive, true)))
    .limit(1);

  if (!gate) {
    return NextResponse.json(
      { error: "NOT_FOUND" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(gate, { headers: CORS_HEADERS });
}
