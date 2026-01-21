import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    // Check cookies
    const cookies = request.cookies.getAll();
    const authCookies = cookies.filter(c =>
      c.name.includes('auth') ||
      c.name.includes('supabase') ||
      c.name.includes('sb-')
    );

    return NextResponse.json({
      status: "ok",
      authenticated: !!user,
      userId: user?.id || null,
      email: user?.email || null,
      error: error?.message || null,
      cookiesFound: authCookies.length,
      cookieNames: authCookies.map(c => c.name),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      authenticated: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
