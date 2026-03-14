"use client";

import { cn } from "@/lib/utils";
import type { AnswerOption } from "@/types/database.types";
import type { DueCard } from "@/types/fsrs.types";
import { Brain } from "lucide-react";

type OptionState = "idle" | "selected-correct" | "selected-wrong" | "correct-unselected" | "dimmed";

interface FlashCardProps {
  card: DueCard;
  selectedAnswerId: string | null;
  isAnswered: boolean;
  onSelectAnswer: (id: string) => void;
}

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Easy", color: "text-green-400 bg-green-500/10" },
  2: { label: "Medium", color: "text-amber-400 bg-amber-500/10" },
  3: { label: "Hard", color: "text-orange-400 bg-orange-500/10" },
  4: { label: "Expert", color: "text-red-400 bg-red-500/10" },
  5: { label: "Master", color: "text-purple-400 bg-purple-500/10" },
};

const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

export default function FlashCard({ card, selectedAnswerId, isAnswered, onSelectAnswer }: FlashCardProps) {
  const options = card.answer_options as AnswerOption[];
  const diff = DIFFICULTY_LABELS[card.difficulty_level] ?? DIFFICULTY_LABELS[2];

  function getOptionState(option: AnswerOption): OptionState {
    if (!isAnswered) return "idle";
    if (option.id === selectedAnswerId) {
      return option.is_correct ? "selected-correct" : "selected-wrong";
    }
    if (option.is_correct) return "correct-unselected";
    return "dimmed";
  }

  const optionStyles: Record<OptionState, string> = {
    idle: "border-white/10 bg-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer",
    "selected-correct": "border-green-500 bg-green-500/10 cursor-default",
    "selected-wrong": "border-red-500 bg-red-500/10 cursor-default",
    "correct-unselected": "border-green-500/60 bg-green-500/5 cursor-default",
    dimmed: "border-white/5 bg-white/2 opacity-50 cursor-default",
  };

  const badgeStyles: Record<OptionState, string> = {
    idle: "bg-white/10 text-[#94A3B8]",
    "selected-correct": "bg-green-500 text-white",
    "selected-wrong": "bg-red-500 text-white",
    "correct-unselected": "bg-green-500/30 text-green-400",
    dimmed: "bg-white/5 text-[#475569]",
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Meta tags */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {card.topic_category.replace(/_/g, " ")}
        </span>
        {card.subtopic && (
          <span className="badge bg-white/5 text-[#94A3B8]">{card.subtopic}</span>
        )}
        <span className={cn("badge border border-white/10", diff.color)}>{diff.label}</span>
        <span className="badge bg-white/5 text-[#475569] ml-auto font-mono text-xs">
          {card.cert_level}
        </span>
      </div>

      {/* Question stem */}
      <div className="card mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Brain className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-[#F1F5F9] text-base leading-relaxed font-medium">{card.stem}</p>
        </div>
      </div>

      {/* Answer options */}
      <div className="space-y-2">
        {options.map((option, i) => {
          const state = getOptionState(option);
          return (
            <button
              key={option.id}
              onClick={() => !isAnswered && onSelectAnswer(option.id)}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-150 text-left group",
                optionStyles[state]
              )}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all",
                  badgeStyles[state]
                )}
              >
                {OPTION_LETTERS[i]}
              </span>
              <span
                className={cn(
                  "text-sm leading-relaxed transition-colors",
                  state === "dimmed" ? "text-[#475569]" : "text-[#F1F5F9]"
                )}
              >
                {option.text}
              </span>
              {state === "selected-correct" && (
                <span className="ml-auto text-green-400 text-xs font-semibold">✓ Correct</span>
              )}
              {state === "selected-wrong" && (
                <span className="ml-auto text-red-400 text-xs font-semibold">✗ Wrong</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
