import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      session: null,
      userId: null,
      error: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }),
    } as const;
  }
  return { session, userId: session.user.id, error: null } as const;
}
