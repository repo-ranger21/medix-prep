"use client";

import { create } from "zustand";
import type { DueCard } from "@/types/fsrs.types";
import type { Rating } from "ts-fsrs";

export type StudyPhase = "unanswered" | "answered" | "rating";

export interface StudyStats {
  totalCards: number;
  completed: number;
  correct: number;
  incorrect: number;
  hard: number;
  xpEarned: number;
  sessionStartMs: number;
  averageResponseMs: number;
  responseTimes: number[];
  ratingCounts: Record<number, number>;
}

interface StudyState {
  // Queue
  queue: DueCard[];
  currentIndex: number;

  // Phase
  phase: StudyPhase;

  // Answer state
  selectedAnswerId: string | null;
  isCorrect: boolean | null;
  answerTimestamp: number | null;

  // Stats
  stats: StudyStats;

  // ARIA panel
  ariaPanelOpen: boolean;
  ariaSeededMessage: string | null;

  // Actions
  initSession: (cards: DueCard[]) => void;
  selectAnswer: (answerId: string) => void;
  submitRating: (rating: Rating) => Promise<{ xpEarned: number }>;
  nextCard: () => void;
  toggleAriaPanel: () => void;
  seedAriaMessage: (message: string) => void;
  resetSession: () => void;
}

const initialStats = (): StudyStats => ({
  totalCards: 0,
  completed: 0,
  correct: 0,
  incorrect: 0,
  hard: 0,
  xpEarned: 0,
  sessionStartMs: Date.now(),
  averageResponseMs: 0,
  responseTimes: [],
  ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0 },
});

export const useStudyStore = create<StudyState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  phase: "unanswered",
  selectedAnswerId: null,
  isCorrect: null,
  answerTimestamp: null,
  stats: initialStats(),
  ariaPanelOpen: false,
  ariaSeededMessage: null,

  initSession: (cards: DueCard[]) => {
    set({
      queue: cards,
      currentIndex: 0,
      phase: "unanswered",
      selectedAnswerId: null,
      isCorrect: null,
      answerTimestamp: null,
      stats: {
        ...initialStats(),
        totalCards: cards.length,
        sessionStartMs: Date.now(),
      },
    });
  },

  selectAnswer: (answerId: string) => {
    const { queue, currentIndex, phase } = get();
    if (phase !== "unanswered") return;

    const currentCard = queue[currentIndex];
    if (!currentCard) return;

    const isCorrect = answerId === currentCard.correct_answer_id;
    const now = Date.now();

    set({
      selectedAnswerId: answerId,
      isCorrect,
      answerTimestamp: now,
      phase: "answered",
    });
  },

  submitRating: async (rating: Rating) => {
    const { queue, currentIndex, isCorrect, answerTimestamp, stats } = get();
    const currentCard = queue[currentIndex];
    if (!currentCard) return { xpEarned: 0 };

    const responseTimeMs = answerTimestamp ? Date.now() - answerTimestamp : 30000;

    // API call
    let xpEarned = 0;
    try {
      const response = await fetch("/api/study/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: currentCard.question_id,
          card_id: currentCard.card_id,
          rating,
          response_time_ms: responseTimeMs,
          topic_category: currentCard.topic_category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        xpEarned = data.xp_earned ?? 0;
      }
    } catch (error) {
      console.error("Review submission error:", error);
    }

    // Update stats
    const newResponseTimes = [...stats.responseTimes, responseTimeMs];
    const avgMs =
      newResponseTimes.reduce((a, b) => a + b, 0) / newResponseTimes.length;

    set({
      phase: "rating",
      stats: {
        ...stats,
        completed: stats.completed + 1,
        correct: isCorrect ? stats.correct + 1 : stats.correct,
        incorrect: !isCorrect ? stats.incorrect + 1 : stats.incorrect,
        hard: rating <= 2 ? stats.hard + 1 : stats.hard,
        xpEarned: stats.xpEarned + xpEarned,
        responseTimes: newResponseTimes,
        averageResponseMs: avgMs,
        ratingCounts: {
          ...stats.ratingCounts,
          [rating]: (stats.ratingCounts[rating] ?? 0) + 1,
        },
      },
    });

    return { xpEarned };
  },

  nextCard: () => {
    const { currentIndex, queue } = get();
    if (currentIndex + 1 < queue.length) {
      set({
        currentIndex: currentIndex + 1,
        phase: "unanswered",
        selectedAnswerId: null,
        isCorrect: null,
        answerTimestamp: null,
        ariaSeededMessage: null,
      });
    } else {
      // Session complete - keep in rating phase at last card
      set({ phase: "rating" });
    }
  },

  toggleAriaPanel: () => {
    set((state) => ({ ariaPanelOpen: !state.ariaPanelOpen }));
  },

  seedAriaMessage: (message: string) => {
    set({ ariaSeededMessage: message, ariaPanelOpen: true });
  },

  resetSession: () => {
    set({
      queue: [],
      currentIndex: 0,
      phase: "unanswered",
      selectedAnswerId: null,
      isCorrect: null,
      answerTimestamp: null,
      stats: initialStats(),
      ariaPanelOpen: false,
      ariaSeededMessage: null,
    });
  },
}));
