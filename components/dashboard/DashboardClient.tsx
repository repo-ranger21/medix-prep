"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Brain,
  Activity,
  Trophy,
  BookOpen,
  TrendingUp,
  Flame,
  Zap,
  Target,
  Clock,
  BarChart3,
  LogOut,
} from "lucide-react";
import type { DueCard } from "@/types/fsrs.types";
import type { Database } from "@/types/database.types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type StudySession = Database["public"]["Tables"]["study_sessions"]["Row"];

export interface TopicMastery {
  topic_category: string;
  mastery_score: number;
  mature_cards: number;
  young_cards: number;
  learning_cards: number;
  new_cards: number;
  total_cards: number;
}

interface DashboardClientProps {
  profile: Profile;
  dueCards: DueCard[];
  recentSessions: StudySession[];
  topicMastery: TopicMastery[];
}

const CERT_COLORS: Record<string, string> = {
  BLS: "bg-gray-500/20 text-gray-300",
  EMR: "bg-purple-500/20 text-purple-300",
  EMT: "bg-blue-500/20 text-blue-300",
  AEMT: "bg-amber-500/20 text-amber-300",
  Paramedic: "bg-red-500/20 text-red-300",
};

function getMasteryColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-amber-500";
  if (score > 0) return "bg-red-500";
  return "bg-white/10";
}

function getMasteryTextColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-amber-400";
  if (score > 0) return "text-red-400";
  return "text-[#475569]";
}

export default function DashboardClient({
  profile,
  dueCards,
  recentSessions,
  topicMastery,
}: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const dueCount = dueCards.length;

  const totalAccuracy =
    recentSessions.length > 0
      ? Math.round(
          recentSessions.reduce((a, s) => a + (s.cards_correct / Math.max(s.cards_studied, 1)) * 100, 0) /
            recentSessions.length
        )
      : null;

  const totalCards = recentSessions.reduce((a, s) => a + s.cards_studied, 0);
  const totalXp = profile.total_xp;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <nav className="sticky top-0 z-10 bg-[#0B1120]/80 backdrop-blur-sm border-b border-white/5 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4 h-14">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">MedixPrep</span>
          </div>
          <div className="flex items-center gap-1 flex-1">
            {[
              { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
              { href: "/study", icon: BookOpen, label: "Study" },
              { href: "/scenarios", icon: Brain, label: "Scenarios" },
              { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("px-2 py-0.5 rounded text-xs font-medium", CERT_COLORS[profile.cert_level] ?? CERT_COLORS["EMT"])}>
              {profile.cert_level}
            </span>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-[#475569] hover:text-[#94A3B8] hover:bg-white/5 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {profile.display_name?.split(" ")[0] ?? "Medic"} 👋
            </h1>
            <p className="text-[#94A3B8] mt-1">
              {dueCount > 0
                ? `You have ${dueCount} card${dueCount !== 1 ? "s" : ""} due for review`
                : "You're all caught up — great work!"}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-bold text-white text-lg leading-none">{profile.streak_count}</div>
              <div className="text-[10px] text-amber-300">day streak</div>
            </div>
            <div className="ml-3 flex items-center gap-1">
              <Zap className="w-4 h-4 text-blue-400" />
              <div>
                <div className="font-bold text-white leading-none">{totalXp.toLocaleString()}</div>
                <div className="text-[10px] text-blue-300">total XP</div>
              </div>
            </div>
          </div>
        </div>

        {dueCount > 0 && (
          <Link
            href="/study"
            className="block p-5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 bg-gradient-to-r from-blue-500/10 to-transparent transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-lg">
                  {dueCount} card{dueCount !== 1 ? "s" : ""} due
                </h2>
                <p className="text-[#94A3B8] text-sm mt-0.5">Keep your streak alive — study now</p>
              </div>
              <div className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
                Study Now
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: BookOpen, label: "Cards Studied", value: totalCards.toLocaleString(), color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: Target, label: "Accuracy", value: totalAccuracy !== null ? `${totalAccuracy}%` : "—", color: "text-green-400", bg: "bg-green-500/10" },
            { icon: Zap, label: "Total XP", value: totalXp.toLocaleString(), color: "text-amber-400", bg: "bg-amber-500/10" },
            { icon: Flame, label: "Day Streak", value: profile.streak_count.toString(), color: "text-orange-400", bg: "bg-orange-500/10" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="p-4 rounded-xl border border-white/5 bg-[#0F172A]">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", bg)}>
                <Icon className={cn("w-4 h-4", color)} />
              </div>
              <div className="font-bold text-2xl text-white">{value}</div>
              <div className="text-xs text-[#94A3B8]">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-white/5 bg-[#0F172A]">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#94A3B8]" />
              <h3 className="font-semibold text-white text-sm">Topic Mastery</h3>
            </div>
            {topicMastery.length === 0 ? (
              <p className="text-[#475569] text-sm">Start studying to see mastery scores</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {topicMastery.map((tm) => (
                  <div key={tm.topic_category} className="flex items-center gap-2">
                    <div
                      className={cn("w-3 h-3 rounded-sm flex-shrink-0", getMasteryColor(tm.mastery_score))}
                      style={{ opacity: Math.max(0.3, tm.mastery_score / 100) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#94A3B8] truncate">{tm.topic_category.replace(/_/g, " ")}</p>
                    </div>
                    <span className={cn("text-xs font-mono font-bold", getMasteryTextColor(tm.mastery_score))}>
                      {tm.mastery_score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 rounded-xl border border-white/5 bg-[#0F172A]">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#94A3B8]" />
              <h3 className="font-semibold text-white text-sm">Recent Sessions</h3>
            </div>
            {recentSessions.length === 0 ? (
              <p className="text-[#475569] text-sm">No sessions yet — start studying!</p>
            ) : (
              <div className="space-y-2">
                {recentSessions.slice(0, 5).map((session) => {
                  const acc = session.cards_studied > 0
                    ? Math.round((session.cards_correct / session.cards_studied) * 100)
                    : 0;
                  const date = new Date(session.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  return (
                    <div key={session.id} className="flex items-center gap-3">
                      <div className="text-xs text-[#475569] w-14 flex-shrink-0">{date}</div>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", acc >= 80 ? "bg-green-500" : acc >= 60 ? "bg-amber-500" : "bg-red-500")}
                          style={{ width: `${acc}%` }}
                        />
                      </div>
                      <div className="text-xs font-mono text-[#94A3B8] w-10 text-right">{acc}%</div>
                      <div className="text-xs text-[#475569] w-14 text-right">{session.cards_studied} cards</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href: "/study", icon: BookOpen, label: "Flashcard Review", desc: "FSRS spaced repetition", color: "text-blue-400", bg: "bg-blue-500/10" },
            { href: "/scenarios", icon: Brain, label: "Clinical Scenarios", desc: "Interactive patient simulations", color: "text-purple-400", bg: "bg-purple-500/10" },
            { href: "/leaderboard", icon: Trophy, label: "Leaderboard", desc: "Compare with peers", color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map(({ href, icon: Icon, label, desc, color, bg }) => (
            <Link key={href} href={href} className="p-5 rounded-xl border border-white/5 bg-[#0F172A] hover:border-blue-500/20 transition-all group">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", bg)}>
                <Icon className={cn("w-5 h-5", color)} />
              </div>
              <h3 className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors">{label}</h3>
              <p className="text-xs text-[#475569] mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
