export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CertLevel = "BLS" | "EMR" | "EMT" | "AEMT" | "Paramedic";
export type SubscriptionTier = "free" | "individual" | "institutional";
export type FsrsState = "New" | "Learning" | "Review" | "Relearning";
export type QuestionType = "mcq" | "select_all" | "ordered";
export type MarketplaceStatus = "pending" | "approved" | "published";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          email: string | null;
          avatar_url: string | null;
          cert_level: CertLevel;
          subscription_tier: SubscriptionTier;
          institution_id: string | null;
          stripe_customer_id: string | null;
          streak_count: number;
          last_study_date: string | null;
          total_xp: number;
          onboarding_complete: boolean;
          diagnostic_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      questions: {
        Row: {
          id: string;
          cert_level: CertLevel;
          topic_category: string;
          subtopic: string | null;
          stem: string;
          answer_options: AnswerOption[];
          correct_answer_id: string;
          detailed_explanation: string;
          clinical_reasoning: string | null;
          protocol_references: ProtocolReference[] | null;
          difficulty: number;
          question_type: QuestionType;
          is_aspt_content: boolean;
          is_marketplace: boolean;
          approved_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["questions"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["questions"]["Row"]>;
      };
      fsrs_cards: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          due: string;
          stability: number;
          difficulty: number;
          elapsed_days: number;
          scheduled_days: number;
          reps: number;
          lapses: number;
          state: FsrsState;
          last_review: string | null;
          first_seen_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["fsrs_cards"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["fsrs_cards"]["Row"]>;
      };
      review_logs: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          rating: number;
          response_time_ms: number | null;
          state_before: FsrsState;
          stability_before: number | null;
          difficulty_before: number | null;
          scheduled_days: number | null;
          study_session_id: string | null;
          reviewed_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["review_logs"]["Row"],
          "id"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["review_logs"]["Row"]>;
      };
      scenarios: {
        Row: {
          id: string;
          title: string;
          cert_level: CertLevel;
          category: string;
          dispatch_info: string;
          initial_presentation: string;
          node_tree: Json;
          max_score: number;
          time_limit_seconds: number | null;
          parameter_schema: Json | null;
          difficulty: number;
          estimated_minutes: number | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["scenarios"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["scenarios"]["Row"]>;
      };
      scenario_attempts: {
        Row: {
          id: string;
          user_id: string;
          scenario_id: string;
          parameters_used: Json | null;
          score: number;
          max_score: number;
          completed: boolean;
          time_taken_ms: number | null;
          decision_path: Json | null;
          aria_debrief: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["scenario_attempts"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<
          Database["public"]["Tables"]["scenario_attempts"]["Row"]
        >;
      };
      guideline_chunks: {
        Row: {
          id: string;
          content: string;
          embedding: number[] | null;
          source: string;
          cert_level: CertLevel | null;
          topic_category: string | null;
          recommendation_class: string | null;
          evidence_level: string | null;
          keywords: string[] | null;
          chunk_index: number;
          total_chunks_in_source: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["guideline_chunks"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["guideline_chunks"]["Row"]>;
      };
      ai_audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          cert_level: CertLevel | null;
          query_text: string;
          retrieved_chunk_ids: string[] | null;
          model_used: string;
          response_text: string;
          confidence_score: number | null;
          guardian_passed: boolean;
          guardian_notes: string | null;
          latency_ms: number | null;
          flagged_for_review: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["ai_audit_log"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["ai_audit_log"]["Row"]>;
      };
      leaderboard_entries: {
        Row: {
          id: string;
          user_id: string;
          cert_level: CertLevel;
          category: string;
          score: number;
          week_key: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["leaderboard_entries"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<
          Database["public"]["Tables"]["leaderboard_entries"]["Row"]
        >;
      };
      marketplace_courses: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string | null;
          cert_level: CertLevel;
          price_cents: number;
          is_exclusive: boolean;
          revenue_split_pct: number;
          stripe_price_id: string | null;
          status: MarketplaceStatus;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["marketplace_courses"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<
          Database["public"]["Tables"]["marketplace_courses"]["Row"]
        >;
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          cards_studied: number;
          cards_correct: number;
          xp_earned: number;
          duration_ms: number | null;
          started_at: string;
          ended_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["study_sessions"]["Row"],
          "id"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["study_sessions"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      hybrid_search_guidelines: {
        Args: {
          query_embedding: number[];
          query_text: string;
          filter_cert: string | null;
          filter_topic: string | null;
          match_count: number;
          semantic_weight: number;
          keyword_weight: number;
        };
        Returns: {
          id: string;
          content: string;
          source: string;
          cert_level: string;
          topic_category: string;
          recommendation_class: string | null;
          evidence_level: string | null;
          keywords: string[] | null;
          chunk_index: number;
          similarity: number;
        }[];
      };
      get_due_cards: {
        Args: {
          p_user_id: string;
          p_cert_level: string | null;
          p_limit: number;
        };
        Returns: {
          card_id: string;
          question_id: string;
          due: string;
          state: FsrsState;
          stability: number;
          difficulty: number;
          elapsed_days: number;
          scheduled_days: number;
          reps: number;
          lapses: number;
          last_review: string | null;
          stem: string;
          answer_options: AnswerOption[];
          correct_answer_id: string;
          detailed_explanation: string;
          clinical_reasoning: string | null;
          protocol_references: ProtocolReference[] | null;
          topic_category: string;
          subtopic: string | null;
          difficulty_level: number;
          cert_level: CertLevel;
        }[];
      };
      increment_xp: {
        Args: { p_user_id: string; p_xp: number };
        Returns: void;
      };
      get_topic_mastery: {
        Args: { p_user_id: string };
        Returns: {
          topic_category: string;
          mastery_score: number;
          mature_cards: number;
          young_cards: number;
          learning_cards: number;
          new_cards: number;
          total_cards: number;
        }[];
      };
    };
    Enums: Record<string, never>;
  };
}

export interface AnswerOption {
  id: string;
  text: string;
  is_correct: boolean;
  explanation: string;
}

export interface ProtocolReference {
  source: string;
  section: string;
  text: string;
}
