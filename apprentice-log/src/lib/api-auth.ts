import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import type { User } from "@supabase/supabase-js";

export type AuthenticatedHandler = (
  request: NextRequest,
  user: User
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with authentication and rate limiting.
 * Returns 401 if user is not authenticated.
 * Returns 429 if rate limit exceeded.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check rate limit
    const { allowed } = checkRateLimit(user.id);
    if (!allowed) {
      return rateLimitResponse();
    }

    return handler(request, user);
  };
}
