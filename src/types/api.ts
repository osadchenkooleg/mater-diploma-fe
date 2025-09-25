export type Language = string;

export interface UniquenessResponse {
  uniqueness_percent: number;
  closest_id: string | null;
  similarity: number;
  debug_info?: Record<string, unknown>;
}

export interface CodeRecord {
  id: string;
  lang: string;
  split?: string;
  label?: string;
  code: string;
  code_id?: string;
  old_id?: string;
}

export interface SubmissionResponse {
  id: string;
}