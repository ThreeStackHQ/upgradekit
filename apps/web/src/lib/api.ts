import { NextResponse } from "next/server";
import { auth } from "@/auth";

export interface ApiError {
  status: "fail" | "error";
  message: string;
  code?: string;
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ status: "success", data }, { status });
}

export function fail(message: string, code?: string, httpStatus = 400): NextResponse {
  return NextResponse.json(
    { status: "fail", message, code } satisfies ApiError,
    { status: httpStatus }
  );
}

export function unauthorized(): NextResponse {
  return fail("Unauthorized", "UNAUTHORIZED", 401);
}

export function forbidden(): NextResponse {
  return fail("Forbidden", "FORBIDDEN", 403);
}

export function notFound(resource = "Resource"): NextResponse {
  return fail(`${resource} not found`, "NOT_FOUND", 404);
}

export function serverError(message = "Internal server error"): NextResponse {
  return NextResponse.json(
    { status: "error", message } satisfies ApiError,
    { status: 500 }
  );
}

/**
 * Get the current authenticated session.
 * Returns null if unauthenticated.
 */
export async function getSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session as { user: { id: string; email: string; name?: string | null } };
}

/**
 * Require authentication — returns session or a 401 response.
 */
export async function requireAuth(): Promise<
  { session: { user: { id: string; email: string; name?: string | null } }; error: null } |
  { session: null; error: NextResponse }
> {
  const session = await getSession();
  if (!session) return { session: null, error: unauthorized() };
  return { session, error: null };
}
