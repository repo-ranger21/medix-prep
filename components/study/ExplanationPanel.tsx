"use client";

import { cn } from "@/lib/utils";
import type { AnswerOption, ProtocolReference } from "@/types/database.types";
import type { DueCard } from "@/types/fsrs.types";
import { CheckCircle, XCircle, BookOpen, Microscope, Link2, MessageSquare } from "lucide-react";

interface ExplanationPanelProps {
  card: DueCard;
  selectedAnswerId: string;
  isCorrect: boolean;
  onAskAria: (message: string) => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

export default function ExplanationPanel({ card, selectedAnswerId, isCorrect, onAskAria }: ExplanationPanelProps) {
  const options = card.answer_options as AnswerOption[];
  const protocolRefs = card.protocol_references as ProtocolReference[] | null;

  function buildAriaMessage() {
    const selectedOption = options.find((o) => o.id === selectedAnswerId);
    const correctOption = options.find((o) => o.is_correct);

    if (isCorrect) {
      return `I just answered this NREMT question correctly: "${card.stem}" — Can you give me a deeper Socratic explanation of the underlying physiology and why the other options are wrong?`;
    } else {
      return `I got this NREMT question wrong: "${card.stem}". I selected "${selectedOption?.text}" but the correct answer is "${correctOption?.text}". Can you explain why my answer was wrong and help me understand the clinical reasoning?`;
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-fade-up">
      {/* Result banner */}
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-xl border",
          isCorrect
            ? "bg-green-500/10 border-green-500/30"
            : "bg-red-500/10 border-red-500/30"
        )}
      >
        {isCorrect ? (
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
        )}
        <div>
          <p className={cn("font-semibold text-sm", isCorrect ? "text-green-300" : "text-red-300")}>
            {isCorrect ? "Correct!" : "Incorrect"}
          </p>
          {!isCorrect && (
            <p className="text-[#94A3B8] text-xs mt-0.5">
              Correct: {options.find((o) => o.is_correct)?.text}
            </p>
          )}
        </div>
        <button
          onClick={() => onAskAria(buildAriaMessage())}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs font-medium transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Ask ARIA
        </button>
      </div>

      {/* Detailed explanation */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">Explanation</h3>
        </div>
        <p className="text-[#94A3B8] text-sm leading-relaxed">{card.detailed_explanation}</p>

        {card.clinical_reasoning && (
          <div className="pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Microscope className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
                NREMT Testing Principle
              </h4>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed">{card.clinical_reasoning}</p>
          </div>
        )}
      </div>

      {/* Per-option breakdown */}
      <div className="card">
        <h3 className="font-semibold text-white text-sm mb-3">Answer Analysis</h3>
        <div className="space-y-3">
          {options.map((option, i) => (
            <div key={option.id} className="flex gap-3">
              <span
                className={cn(
                  "w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                  option.is_correct
                    ? "bg-green-500 text-white"
                    : option.id === selectedAnswerId
                    ? "bg-red-500 text-white"
                    : "bg-white/10 text-[#94A3B8]"
                )}
              >
                {OPTION_LETTERS[i]}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium mb-0.5",
                    option.is_correct ? "text-green-300" : "text-[#F1F5F9]"
                  )}
                >
                  {option.text}
                </p>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{option.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Protocol references */}
      {protocolRefs && protocolRefs.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-[#94A3B8]" />
            <h3 className="font-semibold text-white text-sm">Protocol References</h3>
          </div>
          <div className="space-y-2">
            {protocolRefs.map((ref, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-blue-400">{ref.source}</span>
                  <span className="text-[#475569] text-xs">·</span>
                  <span className="text-xs text-[#94A3B8]">{ref.section}</span>
                </div>
                <p className="text-xs text-[#94A3B8] italic">&quot;{ref.text}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
