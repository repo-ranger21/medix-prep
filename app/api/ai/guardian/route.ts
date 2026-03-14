import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runGuardian } from "@/lib/ai/guardian";
import type { GuardianRequest } from "@/lib/ai/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as GuardianRequest;
    const result = await runGuardian(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Guardian API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
