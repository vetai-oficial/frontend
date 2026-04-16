import { toast } from 'sonner';

import { STORAGE_KEYS } from '@/constants';
import type { QueryParams } from '@/types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

export function removeToken(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

export interface HttpClientOptions extends RequestInit {
  skipToast?: boolean;
}

export async function httpClient<T>(
  endpoint: string,
  options: HttpClientOptions = {},
): Promise<T> {
  const token = getToken();
  const { skipToast = false, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        (errorData as { message?: string })?.message ?? 'Erro na requisição';

      if (!skipToast) {
        toast.error(errorMessage);
      }

      throw new ApiError(response.status, errorMessage, errorData);
    }

    if (response.status === 204) return undefined as T;

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const genericMessage = 'Erro de conexão com o servidor';
    if (!skipToast) {
      toast.error(genericMessage);
    }

    throw new Error(genericMessage);
  }
}

export function buildQuery(params?: QueryParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.size) searchParams.set('size', String(params.size));
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.direction) searchParams.set('direction', params.direction);
  if (params.search) searchParams.set('search', params.search);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}
