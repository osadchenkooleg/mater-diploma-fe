import { Language, UniquenessResponse, CodeRecord, SubmissionResponse } from '@/types/api';

const BASE = import.meta.env.VITE_API_BASE_URL || '/';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function getLanguages(): Promise<Language[]> {
  try {
    const response = await fetch(new URL('/languages', BASE).toString());
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to load languages');
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // Fallback languages if API fails
    console.warn('Languages API failed, using fallback', error);
    return ['go', 'python', 'java', 'javascript', 'typescript', 'rust', 'cpp'];
  }
}

export async function checkUniqueness(code: string, languages?: string[]): Promise<UniquenessResponse> {
  const response = await fetch(new URL('/uniqueness/check', BASE).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(languages?.length ? { code, languages } : { code })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || 'Failed to check uniqueness');
  }

  return await response.json();
}

export async function getCode(id: string): Promise<CodeRecord> {
  const url = new URL('/code', BASE);
  url.searchParams.set('id', id);
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || 'Code not found');
  }

  return await response.json();
}

export async function saveCode(language: string, code: string): Promise<SubmissionResponse> {
  const response = await fetch(new URL('/code', BASE).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, code })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || 'Failed to submit code');
  }

  return await response.json();
}