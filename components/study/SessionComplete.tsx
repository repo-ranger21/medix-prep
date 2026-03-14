"use client";

import { cn } from "@/lib/utils";
import type { StudyStats } from "@/lib/study/store";
import { useRouter } from "next/navigation";
import { RotateCcw, Home } from "lucide-react";

interface SessionCompleteProps {
  stats: StudyStats;
  onStudyMore: () => void;
  onDone: () => void;
}

function getGrade(accuracy: number): {
  emoji: string;
  label: string;
  message: string;
  color: string;
} {
  if (accuracy >= 90) return { emoji: "🏆", label: "Excellent", message: "Outstanding performance! You're mastering this material.", color: "text-green-400" };
  if (accuracy >= 80) return { emoji: "⭐", label: "Great", message: "Strong performance! Keep up the consistency.", color: "text-green-400" };
  if (accuracy >= 70) return { emoji: "👍", label: "Good", message: "Good progress! Review the missed concepts and retry.", color: "text-amber-400" };
  if (accuracy >= 60) return { emoji: "📚", label: "Fair", message: "Keep studying — consistency is key to NREMT success.", color: "text-amber-400" };
  return { emoji: "🔄", label: "Keep Going", message: "Don't give up! Every review strengthens your recall.", color: "text-red-400" };
}

export default function SessionComplete({ stats, onStudyMore, onDone }: SessionCompleteProps) {
  const router = useRouter();
  const accuracy = stats.completed > 0 ? Math.round((stats.correct / stats.completed) * 100) : 0;
  const grade = getGrade(accuracy);
  const durationMin = Math.round((Date.now() - stats.sessionStartMs) / 60000);

  const ratingData = [
    { label: "Again", count: stats.ratingCounts[1] ?? 0, color: "#F87171" },
    { label: "Hard", count: stats.ratingCounts[2] ?? 0, color: "#FB923C" },
    { label: "Good", count: stats.ratingCounts[3] ?? 0, color: "#34D399" },
    { label: "Easy", count: stats.ratingCounts[4] ?? 0, color: "#60A5FA" },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Grade header */}
        <div className="text-center">
          <div className="text-6xl mb-3">{grade.emoji}</div>
          <h1 className={cn("text-3xl font-display font-bold", grade.color)}>{grade.label}</h1>
          <p className="text-[#94A3B8] mt-2 max-w-sm mx-auto">{grade.message}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Cards Reviewed", value: stats.completed, icon: "📋" },
            { label: "Accuracy", value: `${accuracy}%`, icon: "🎯" },
            { label: "XP Earned", value: `+${stats.xpEarned}`, icon: "⚡" },
            { label: "Time", value: `${durationMin}m`, icon: "⏱️" },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold font-display text-white">{stat.value}</div>
              <div className="text-xs text-[#94A3B8]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Rating breakdown */}
        <div className="card">
          <h3 className="text-sm font-semibold text-[#94A3B8] mb-3">Rating Breakdown</h3>
          <div className="flex gap-2 items-end h-16">
            {ratingData.map((r) => {
              const pct = stats.completed > 0 ? (r.count / stats.completed) * 100 : 0;
              return (
                <div key={r.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: 48 }}>
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: r.color + "40", borderTop: `2px solid ${r.color}` }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: r.color }}>{r.label}</span>
                  <span className="text-[10px] text-[#475569]">{r.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={onStudyMore} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Study More
          </button>
          <button
            onClick={() => {
              onDone();
              router.push("/dashboard");
            }}
            className="btn-ghost flex-1 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
