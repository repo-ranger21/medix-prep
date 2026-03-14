import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StudySession from "@/components/study/StudySession";
import type { DueCard } from "@/types/fsrs.types";
import type { Database } from "@/types/database.types";

export default async function StudyPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("cert_level")
    .eq("id", user.id)
    .single();

  const certLevel = (profile as Database["public"]["Tables"]["profiles"]["Row"] | null)?.cert_level ?? "EMT";

  const { data: dueCards } = await (supabase as unknown as { rpc: (fn: string, args: object) => Promise<{ data: unknown }> })
    .rpc("get_due_cards", { p_user_id: user.id, p_cert_level: certLevel, p_limit: 20 });

  return (
    <StudySession
      initialCards={((dueCards as DueCard[] | null) ?? []) as DueCard[]}
      certLevel={certLevel}
    />
  );
}
