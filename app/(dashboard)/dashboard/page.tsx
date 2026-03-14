import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";
import type { Database } from "@/types/database.types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function getDueCards(supabase: SupabaseClient, userId: string, certLevel: string) {
  const { data } = await (supabase as unknown as { rpc: (fn: string, args: object) => Promise<{ data: unknown }> })
    .rpc("get_due_cards", { p_user_id: userId, p_cert_level: certLevel, p_limit: 20 });
  return data as Database["public"]["Functions"]["get_due_cards"]["Returns"] ?? [];
}

async function getTopicMastery(supabase: SupabaseClient, userId: string) {
  const { data } = await (supabase as unknown as { rpc: (fn: string, args: object) => Promise<{ data: unknown }> })
    .rpc("get_topic_mastery", { p_user_id: userId });
  return data as Database["public"]["Functions"]["get_topic_mastery"]["Returns"] ?? [];
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Database["public"]["Tables"]["profiles"]["Row"] | null;
  if (!profile) redirect("/signup");

  const [dueCards, sessionsResult, topicMastery] = await Promise.all([
    getDueCards(supabase, user.id, profile.cert_level),
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(10),
    getTopicMastery(supabase, user.id),
  ]);

  return (
    <DashboardClient
      profile={profile}
      dueCards={dueCards as never}
      recentSessions={sessionsResult.data ?? []}
      topicMastery={topicMastery as never}
    />
  );
}
