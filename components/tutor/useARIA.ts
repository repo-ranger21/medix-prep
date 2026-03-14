"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { TutorMode } from "@/lib/ai/types";

export interface ARIAMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export function useARIA() {
  const [messages, setMessages] = useState<ARIAMessage[]>([]);
  const [mode, setMode] = useState<TutorMode>("chat");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const MAX_HISTORY = 8;

  const sendMessage = useCallback(
    async (userMessage: string, seededMode?: TutorMode) => {
      if (isStreaming || !userMessage.trim()) return;

      const activeMode = seededMode ?? mode;

      // Abort any existing stream
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const newUserMsg: ARIAMessage = { role: "user", content: userMessage };
      const assistantMsg: ARIAMessage = { role: "assistant", content: "", streaming: true };

      setMessages((prev) => {
        const limited = prev.slice(-MAX_HISTORY + 1);
        return [...limited, newUserMsg, assistantMsg];
      });
      setIsStreaming(true);
      setError(null);

      try {
        const history = messages.slice(-MAX_HISTORY).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/ai/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            conversationHistory: history,
            mode: activeMode,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data) as { word: string };
                fullContent += parsed.word;

                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (updated[lastIdx]?.role === "assistant") {
                    updated[lastIdx] = { ...updated[lastIdx], content: fullContent, streaming: true };
                  }
                  return updated;
                });
              } catch {
                // Skip malformed SSE chunks
              }
            }
          }
        }

        // Mark streaming complete
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === "assistant") {
            updated[lastIdx] = { ...updated[lastIdx], streaming: false };
          }
          return updated;
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("ARIA error:", err);
        setError("Failed to get response. Please try again.");
        // Remove the incomplete assistant message
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, mode, isStreaming]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    // Clean up streaming flag
    setMessages((prev) => {
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      if (updated[lastIdx]?.role === "assistant" && updated[lastIdx].streaming) {
        updated[lastIdx] = { ...updated[lastIdx], streaming: false };
      }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    messages,
    mode,
    setMode,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearHistory,
  };
}
