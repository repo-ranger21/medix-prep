export * from "./types";
export * from "./router";
export { runGuardian, resolveFinalResponse } from "./guardian";
export { buildSystemPrompt, buildScopeViolationResponse, detectMode } from "./prompts";

import { createClient } from "@/lib/supabase/server";
import type { AuditLogEntry } from "./types";

export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("ai_audit_log").insert({
      user_id: entry.userId,
      cert_level: entry.certLevel,
      query_text: entry.queryText,
      retrieved_chunk_ids: entry.retrievedChunkIds,
      model_used: entry.modelUsed,
      response_text: entry.responseText,
      confidence_score: entry.confidenceScore,
      guardian_passed: entry.guardianPassed,
      guardian_notes: entry.guardianNotes,
      latency_ms: entry.latencyMs,
      flagged_for_review: entry.flaggedForReview,
    });
  } catch (error) {
    console.error("Audit log write error (non-blocking):", error);
  }
}
