"use client";

import { cn } from "@/lib/utils";
import type { StudyStats } from "@/lib/study/store";
import { MessageSquare, Zap } from "lucide-react";

interface SessionHeaderProps {
  stats: StudyStats;
  currentIndex: number;
  totalCards: number;
  onToggleAria: () => void;
  ariaPanelOpen: boolean;
}

export default function SessionHeader({
  stats,
  currentIndex,
  totalCards,
  onToggleAria,
  ariaPanelOpen,
}: SessionHeaderProps) {
  const accuracy =
    stats.completed > 0
      ? Math.round((stats.correct / stats.completed) * 100)
      : null;

  const accuracyColor =
    accuracy === null
      ? "text-[#94A3B8]"
      : accuracy >= 80
      ? "text-green-400"
      : accuracy >= 60
      ? "text-amber-400"
      : "text-red-400";

  const progressPct = totalCards > 0 ? (currentIndex / totalCards) * 100 : 0;

  return (
    <div className="w-full sticky top-0 z-10 bg-[#0B1120]/80 backdrop-blur-sm border-b border-white/5">
      {/* Progress bar - full width, 1px */}
      <div className="w-full h-px bg-white/5">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto">
        {/* Card counter */}
        <span className="text-[#94A3B8] text-sm font-mono">
          <span className="text-white font-semibold">{currentIndex + 1}</span>
          <span className="text-[#475569]">/{totalCards}</span>
        </span>

        {/* Accuracy pill */}
        {accuracy !== null && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
              accuracy >= 80
                ? "bg-green-500/10"
                : accuracy >= 60
                ? "bg-amber-500/10"
                : "bg-red-500/10",
              accuracyColor
            )}
          >
            {accuracy}% acc
          </div>
        )}

        {/* XP pill */}
        {stats.xpEarned > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400">
            <Zap className="w-3 h-3" />
            +{stats.xpEarned} XP
          </div>
        )}

        {/* ARIA button */}
        <button
          onClick={onToggleAria}
          className={cn(
            "ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            ariaPanelOpen
              ? "bg-blue-500 text-white"
              : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          ARIA
        </button>
      </div>
    </div>
  );
}
