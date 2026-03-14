import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  scheduleReview,
  calculateXp,
  buildStudyQueue,
  Rating,
} from "@/lib/fsrs";
import { createEmptyCard } from "ts-fsrs";
import type { ReviewSubmission, DueCard } from "@/types/fsrs.types";
import type { FsrsState } from "@/types/database.types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ReviewSubmission;
    const { question_id, card_id, rating, response_time_ms, topic_category } = body;

    if (!question_id || !rating || !topic_category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Load or create FSRS card
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseAny = supabase as any;
    let existingCard: {
      id: string;
      due: string;
      stability: number;
      difficulty: number;
      elapsed_days: number;
      scheduled_days: number;
      reps: number;
      lapses: number;
      state: string;
      last_review: string | null;
      first_seen_at: string | null;
    } | null = null;

    if (card_id) {
      const { data } = await supabaseAny
        .from("fsrs_cards")
        .select("*")
        .eq("id", card_id)
        .eq("user_id", user.id)
        .single();
      existingCard = data;
    }

    if (!existingCard) {
      // Try to find by question_id
      const { data } = await supabaseAny
        .from("fsrs_cards")
        .select("*")
        .eq("user_id", user.id)
        .eq("question_id", question_id)
        .single();
      existingCard = data;
    }

    // Convert DB card to ts-fsrs Card format
    const fsrsCard = existingCard
      ? {
          due: new Date(existingCard.due),
          stability: existingCard.stability,
          difficulty: existingCard.difficulty,
          elapsed_days: existingCard.elapsed_days,
          scheduled_days: existingCard.scheduled_days,
          reps: existingCard.reps,
          lapses: existingCard.lapses,
          learning_steps: 0,
          state: existingCard.state as unknown as import("ts-fsrs").State,
          last_review: existingCard.last_review ? new Date(existingCard.last_review) : undefined,
        }
      : createEmptyCard();

    const stateBefore = (existingCard?.state ?? "New") as FsrsState;
    const stabilityBefore = existingCard?.stability ?? null;
    const difficultyBefore = existingCard?.difficulty ?? null;

    // Schedule review
    const result = scheduleReview(fsrsCard, rating as Rating, topic_category);

    // Upsert fsrs_cards
    const cardData = {
      user_id: user.id,
      question_id,
      due: result.dueDate.toISOString(),
      stability: result.updatedCard.stability,
      difficulty: result.updatedCard.difficulty,
      elapsed_days: result.updatedCard.elapsed_days,
      scheduled_days: result.scheduledDays,
      reps: result.updatedCard.reps,
      lapses: result.updatedCard.lapses,
      state: result.state as unknown as FsrsState,
      last_review: new Date().toISOString(),
      first_seen_at: existingCard?.first_seen_at ?? new Date().toISOString(),
    };

    const { data: upsertedCard, error: upsertError } = await supabaseAny
      .from("fsrs_cards")
      .upsert(
        { ...cardData, ...(existingCard ? { id: existingCard.id } : {}) },
        { onConflict: "user_id,question_id" }
      )
      .select("id")
      .single() as { data: { id: string } | null; error: unknown };

    if (upsertError) {
      console.error("Card upsert error:", upsertError);
      return NextResponse.json({ error: "Failed to save card" }, { status: 500 });
    }

    // Insert review log
    await supabaseAny.from("review_logs").insert({
      user_id: user.id,
      question_id,
      rating,
      response_time_ms: response_time_ms ?? null,
      state_before: stateBefore,
      stability_before: stabilityBefore,
      difficulty_before: difficultyBefore,
      scheduled_days: result.scheduledDays,
      reviewed_at: new Date().toISOString(),
    });

    // Calculate and apply XP
    const xpEarned = calculateXp(rating as Rating, topic_category, response_time_ms ?? 30000);
    await supabaseAny.rpc("increment_xp", { p_user_id: user.id, p_xp: xpEarned });

    return NextResponse.json({
      card_id: upsertedCard?.id,
      scheduled_days: result.scheduledDays,
      due_date: result.dueDate.toISOString(),
      new_state: result.state,
      xp_earned: xpEarned,
    });
  } catch (error) {
    console.error("Review POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const certLevel = searchParams.get("cert_level");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const { data: dueCards, error } = await (supabase as any).rpc("get_due_cards", {
      p_user_id: user.id,
      p_cert_level: certLevel,
      p_limit: Math.min(limit, 50),
    }) as { data: DueCard[] | null; error: unknown };

    if (error) {
      console.error("get_due_cards error:", error);
      return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
    }

    const queue = buildStudyQueue((dueCards as DueCard[]) ?? []);
    return NextResponse.json({ cards: queue, total: queue.length });
  } catch (error) {
    console.error("Review GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
