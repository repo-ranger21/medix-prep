"use client";

import { useEffect } from "react";
import type { Rating } from "ts-fsrs";

interface RatingButtonsProps {
  onRate: (rating: Rating) => void;
  disabled?: boolean;
  nextIntervals?: Record<number, number>;
}

const RATINGS: Array<{
  rating: Rating;
  label: string;
  color: string;
  hoverColor: string;
  borderColor: string;
  key: string;
  description: string;
}> = [
  {
    rating: 1 as Rating,
    label: "Again",
    color: "#F87171",
    hoverColor: "hover:bg-red-500/20",
    borderColor: "border-red-500/30 hover:border-red-500/60",
    key: "1",
    description: "Didn't remember",
  },
  {
    rating: 2 as Rating,
    label: "Hard",
    color: "#FB923C",
    hoverColor: "hover:bg-orange-500/20",
    borderColor: "border-orange-500/30 hover:border-orange-500/60",
    key: "2",
    description: "Remembered with difficulty",
  },
  {
    rating: 3 as Rating,
    label: "Good",
    color: "#34D399",
    hoverColor: "hover:bg-green-500/20",
    borderColor: "border-green-500/30 hover:border-green-500/60",
    key: "3",
    description: "Remembered correctly",
  },
  {
    rating: 4 as Rating,
    label: "Easy",
    color: "#60A5FA",
    hoverColor: "hover:bg-blue-500/20",
    borderColor: "border-blue-500/30 hover:border-blue-500/60",
    key: "4",
    description: "Perfect recall",
  },
];

export default function RatingButtons({ onRate, disabled, nextIntervals }: RatingButtonsProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (disabled) return;
      const rating = RATINGS.find((r) => r.key === e.key);
      if (rating) {
        e.preventDefault();
        onRate(rating.rating);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRate, disabled]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <p className="text-center text-[#475569] text-xs mb-3">
        How well did you know this? (Press 1-4)
      </p>
      <div className="grid grid-cols-4 gap-2">
        {RATINGS.map((r) => {
          const interval = nextIntervals?.[r.rating];
          return (
            <button
              key={r.rating}
              onClick={() => !disabled && onRate(r.rating)}
              disabled={disabled}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border bg-white/5 transition-all disabled:opacity-50 ${r.hoverColor} ${r.borderColor}`}
            >
              <span className="font-bold text-sm" style={{ color: r.color }}>
                {r.label}
              </span>
              <span className="text-[10px] text-[#475569] text-center leading-tight">
                {r.description}
              </span>
              {interval !== undefined && (
                <span className="text-[10px] font-mono text-[#475569]">
                  {interval === 0 ? "<1d" : interval === 1 ? "1d" : `${interval}d`}
                </span>
              )}
              <kbd className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-[#475569] font-mono">
                {r.key}
              </kbd>
            </button>
          );
        })}
      </div>
    </div>
  );
}
