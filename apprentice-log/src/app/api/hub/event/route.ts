import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { emitHubEvent } from "@/lib/hub";

/**
 * Thin proxy for client-side Hub event emission.
 * Requires authenticated user. Forwards event to Hub server-side
 * so the HUB_API_KEY stays secret.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { event_type, payload } = await request.json();

    if (!event_type || typeof event_type !== "string") {
      return NextResponse.json({ error: "event_type required" }, { status: 400 });
    }

    // Fire-and-forget — don't await
    void emitHubEvent(event_type, { ...payload, user_id: user.id });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to emit event" }, { status: 500 });
  }
}
