import { UniquenessResponse, CodeResponse, SubmissionResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  async getLanguages(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}languages`);
      if (!response.ok) {
        throw new ApiError(response.status, 'Failed to fetch languages');
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      // Fallback languages if API fails
      console.warn('Languages API failed, using fallback', error);
      return ['go', 'python', 'java', 'javascript', 'typescript', 'rust', 'cpp'];
    }
  },

  async checkUniqueness(lang: string, code: string): Promise<UniquenessResponse> {
    const formData = new FormData();
    const file = new File([code], 'code.txt', { type: 'text/plain' });
    
    formData.append('lang', lang);
    formData.append('file', file);
    formData.append('top_k', '5');
    formData.append('debug', '1');

    const response = await fetch(`${API_BASE_URL}uniqueness/check`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || 'Failed to check uniqueness');
    }

    return await response.json();
  },

  async getCode(id: string): Promise<CodeResponse> {
    const response = await fetch(`${API_BASE_URL}codes?id=${encodeURIComponent(id)}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || 'Failed to fetch code');
    }

    return await response.json();
  },

  async submitCode(lang: string, code: string): Promise<SubmissionResponse> {
    const formData = new FormData();
    const file = new File([code], 'code.txt', { type: 'text/plain' });
    
    formData.append('lang', lang);
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}codes`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || 'Failed to submit code');
    }

    return await response.json();
  },
};