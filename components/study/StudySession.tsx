"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useStudyStore } from "@/lib/study/store";
import FlashCard from "./FlashCard";
import ExplanationPanel from "./ExplanationPanel";
import RatingButtons from "./RatingButtons";
import SessionHeader from "./SessionHeader";
import SessionComplete from "./SessionComplete";
import TutorPanel from "@/components/tutor/TutorPanel";
import type { DueCard } from "@/types/fsrs.types";
import type { Rating } from "ts-fsrs";
import { Brain } from "lucide-react";

interface StudySessionProps {
  initialCards: DueCard[];
  certLevel: string;
}

export default function StudySession({ initialCards, certLevel }: StudySessionProps) {
  const {
    queue,
    currentIndex,
    phase,
    selectedAnswerId,
    isCorrect,
    stats,
    ariaPanelOpen,
    ariaSeededMessage,
    initSession,
    selectAnswer,
    submitRating,
    nextCard,
    toggleAriaPanel,
    seedAriaMessage,
    resetSession,
  } = useStudyStore();

  // Initialize on mount
  useEffect(() => {
    if (initialCards.length > 0) {
      initSession(initialCards);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentCard = queue[currentIndex];
  const isSessionComplete =
    queue.length > 0 && currentIndex >= queue.length;

  const handleRate = useCallback(
    async (rating: Rating) => {
      await submitRating(rating);
      // Small delay then advance
      setTimeout(() => nextCard(), 300);
    },
    [submitRating, nextCard]
  );

  const handleStudyMore = useCallback(async () => {
    // Re-fetch due cards
    try {
      const res = await fetch(`/api/study/review?cert_level=${certLevel}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        if (data.cards?.length > 0) {
          initSession(data.cards);
        }
      }
    } catch (error) {
      console.error("Failed to fetch more cards:", error);
    }
  }, [certLevel, initSession]);

  if (queue.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">All caught up!</h2>
          <p className="text-[#94A3B8] mb-6">
            No cards are due right now. Come back later or study new material.
          </p>
          <a href="/dashboard" className="btn-primary">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (isSessionComplete) {
    return (
      <SessionComplete
        stats={stats}
        onStudyMore={handleStudyMore}
        onDone={resetSession}
      />
    );
  }

  if (!currentCard) return null;

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <SessionHeader
        stats={stats}
        currentIndex={currentIndex}
        totalCards={queue.length}
        onToggleAria={toggleAriaPanel}
        ariaPanelOpen={ariaPanelOpen}
      />

      <div
        className={cn(
          "transition-all duration-300",
          ariaPanelOpen ? "md:mr-[420px]" : ""
        )}
      >
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Question */}
          <FlashCard
            card={currentCard}
            selectedAnswerId={selectedAnswerId}
            isAnswered={phase !== "unanswered"}
            onSelectAnswer={selectAnswer}
          />

          {/* Explanation (after answering) */}
          {phase !== "unanswered" && selectedAnswerId && isCorrect !== null && (
            <ExplanationPanel
              card={currentCard}
              selectedAnswerId={selectedAnswerId}
              isCorrect={isCorrect}
              onAskAria={seedAriaMessage}
            />
          )}

          {/* Rating buttons (after seeing explanation) */}
          {phase !== "unanswered" && (
            <RatingButtons onRate={handleRate} disabled={phase === "rating"} />
          )}
        </div>
      </div>

      {/* ARIA Panel */}
      <TutorPanel
        isOpen={ariaPanelOpen}
        onClose={toggleAriaPanel}
        seededMessage={ariaSeededMessage}
        certLevel={certLevel}
      />
    </div>
  );
}
