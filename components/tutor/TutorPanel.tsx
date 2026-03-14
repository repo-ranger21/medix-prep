"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useARIA, type ARIAMessage } from "./useARIA";
import type { TutorMode } from "@/lib/ai/types";
import {
  MessageSquare,
  Brain,
  HelpCircle,
  Zap,
  Send,
  Square,
  X,
  Activity,
} from "lucide-react";

interface TutorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  seededMessage?: string | null;
  certLevel?: string;
}

const MODES: Array<{ mode: TutorMode; label: string; icon: React.ReactNode }> = [
  { mode: "chat", label: "Chat", icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { mode: "explain", label: "Explain", icon: <Brain className="w-3.5 h-3.5" /> },
  { mode: "quiz", label: "Quiz", icon: <HelpCircle className="w-3.5 h-3.5" /> },
  { mode: "cram", label: "Cram", icon: <Zap className="w-3.5 h-3.5" /> },
];

const CERT_SUGGESTIONS: Record<string, string[]> = {
  EMT: [
    "Explain why NTG is contraindicated with PDE-5 inhibitors",
    "Walk me through the 5-and-5 FBAO algorithm",
    "What are the H's and T's of cardiac arrest?",
  ],
  Paramedic: [
    "Explain RSI sequence and succinylcholine mechanism",
    "When do you cardiovert vs defibrillate?",
    "Walk me through post-ROSC care goals",
  ],
};

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="font-mono text-blue-300 bg-blue-500/10 px-1 rounded">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="font-bold text-white mt-3 mb-1 text-sm">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-bold text-white mt-3 mb-1">$1</h2>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-[#94A3B8]">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-[#94A3B8]">$2</li>')
    .replace(/^⚡ (.+)$/gm, '<p class="text-amber-400 font-semibold">⚡ $1</p>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, "<br/>");
}

function MessageBubble({ message }: { message: ARIAMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2 mb-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 text-sm",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-[#1E2940] text-[#94A3B8] border border-white/5"
        )}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div
            className="prose-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}
        {message.streaming && (
          <span className="inline-block w-1.5 h-4 bg-blue-400 ml-1 animate-pulse rounded-sm align-middle" />
        )}
      </div>
    </div>
  );
}

export default function TutorPanel({
  isOpen,
  onClose,
  seededMessage,
  certLevel = "EMT",
}: TutorPanelProps) {
  const { messages, mode, setMode, isStreaming, error, sendMessage, stopStreaming } = useARIA();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef<string | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle seeded message
  useEffect(() => {
    if (seededMessage && seededMessage !== seededRef.current && isOpen) {
      seededRef.current = seededMessage;
      sendMessage(seededMessage, "explain");
    }
  }, [seededMessage, isOpen, sendMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  const suggestions = CERT_SUGGESTIONS[certLevel] ?? CERT_SUGGESTIONS["EMT"];

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-full md:w-[420px] bg-[#0F172A] border-l border-white/5 flex flex-col z-50 transition-transform duration-300",
        isOpen ? "translate-x-0 animate-slide-right" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Activity className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h2 className="font-display font-bold text-white text-sm">ARIA</h2>
          <p className="text-[10px] text-[#475569]">AI Tutor · {certLevel} Mode</p>
        </div>

        {/* Mode switcher */}
        <div className="ml-auto flex gap-1">
          {MODES.map((m) => (
            <button
              key={m.mode}
              onClick={() => setMode(m.mode)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
                mode === m.mode
                  ? "bg-blue-500 text-white"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/5"
              )}
              title={m.label}
            >
              {m.icon}
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="ml-2 p-1.5 rounded hover:bg-white/10 text-[#94A3B8] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <p className="font-display font-bold text-white text-sm mb-1">Ask ARIA anything</p>
            <p className="text-[#475569] text-xs mb-6 max-w-[240px]">
              Protocol-verified EMS education for {certLevel} candidates
            </p>
            <div className="space-y-2 w-full">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/20 transition-all text-xs text-[#94A3B8] hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {error && (
              <p className="text-red-400 text-xs text-center py-2">{error}</p>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-white/5 p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${certLevel} protocols...`}
            rows={1}
            className="flex-1 resize-none bg-[#1E2940] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-blue-500/40 max-h-32 scrollbar-thin"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={stopStreaming}
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
            >
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-[10px] text-[#475569] mt-1.5 px-1">
          Enter to send · Shift+Enter for newline
        </p>
      </form>
    </div>
  );
}
