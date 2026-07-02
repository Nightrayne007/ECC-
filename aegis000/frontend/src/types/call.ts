// Mirrors app/schemas/call.py field-for-field. Kept in manual sync — no
// codegen in scope for Phase 1, so re-check this file when schemas change.

export interface SegmentOut {
  speaker: string;
  start_ms: number;
  end_ms: number;
  text: string;
  confidence: number;
}

export interface FlagOut {
  phrase: string;
  category: string;
  severity: string;
  snippet: string;
  timestamp_ms: number;
}

export interface CoachingMomentOut {
  criterion_key: string;
  timestamp_ms: number;
  snippet: string;
  note: string;
}

export interface CriterionScoreOut {
  criterion_key: string;
  score: number;
  weight: number;
  rationale: string;
}

export interface QAScoreOut {
  overall_score: number;
  model_name: string;
  model_version: string;
  prompt_version: string;
  criterion_scores: CriterionScoreOut[];
}

export interface DistressMarkerOut {
  kind: string;
  value: number;
  severity: string;
  timestamp_ms: number;
  description: string;
}

export interface DistressAssessmentOut {
  overall_distress_score: number;
  model_name: string;
  model_version: string;
  markers: DistressMarkerOut[];
}

export interface CallSummaryOut {
  id: string;
  agent_id: string;
  started_at: string;
  duration_seconds: number;
  language_detected: string;
  non_english_flag: boolean;
  overall_score: number | null;
  flag_count: number;
  distress_score: number | null;
}

export interface CallDetailOut {
  id: string;
  agent_id: string;
  started_at: string;
  duration_seconds: number;
  language_detected: string;
  non_english_flag: boolean;
  segments: SegmentOut[];
  qa_score: QAScoreOut | null;
  flags: FlagOut[];
  coaching_moments: CoachingMomentOut[];
  distress_assessment: DistressAssessmentOut | null;
}

export interface AuditEntryOut {
  id: string;
  action: string;
  model_name: string;
  model_version: string;
  prompt_version: string | null;
  input_hash: string;
  output_hash: string;
  created_at: string;
  verified: boolean;
}
