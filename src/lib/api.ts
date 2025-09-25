import { LangItem, UniquenessResponse, CodeRecord, SubmissionResponse } from '@/types/api';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/';
const toUrl = (p: string) => new URL(p, BASE).toString();

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function getLanguages(): Promise<string[]> {
  try {
    const response = await fetch(toUrl('/languages'));
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to load languages');
    }
    const data = (await response.json()) as LangItem[];
    return data.map(x => x.lang);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // Fallback languages if API fails
    console.warn('Languages API failed, using fallback', error);
    return ['go', 'python', 'java', 'javascript', 'typescript', 'rust', 'cpp'];
  }
}

export async function checkUniquenessFromText(text: string, lang?: string, top_k = 5, debug = 0): Promise<UniquenessResponse> {
  const fd = new FormData();
  fd.append('file', new File([text], 'code.txt', { type: 'text/plain' }));
  if (lang) fd.append('lang', lang);
  if (top_k) fd.append('top_k', String(top_k));
  if (debug) fd.append('debug', String(debug));
  
  const response = await fetch(toUrl('/uniqueness/check'), { 
    method: 'POST', 
    body: fd 
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || 'Failed to check uniqueness');
  }

  return await response.json();
}

export async function getCodeById(id: string): Promise<CodeRecord> {
  const url = new URL(toUrl('/codes/'));
  url.searchParams.set('id', id);
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || 'Code not found');
  }

  return await response.json();
}

export async function saveCodeFromText(lang: string, text: string): Promise<SubmissionResponse> {
  const fd = new FormData();
  fd.append('lang', lang);
  fd.append('file', new File([text], 'code.txt', { type: 'text/plain' }));
  
  const response = await fetch(toUrl('/codes'), {
    method: 'POST',
    body: fd
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || 'Failed to submit code');
  }

  return await response.json();
}