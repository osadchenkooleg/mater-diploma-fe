export interface UniquenessResponse {
  uniqueness_percent: number;
  closest_id: string | null;
  similarity: number;
  debug_info?: any;
}

export interface CodeResponse {
  id: string;
  lang: string;
  split: string;
  label: string;
  code: string;
  code_id: string;
  old_id: string;
}

export interface SubmissionResponse {
  id: string;
}