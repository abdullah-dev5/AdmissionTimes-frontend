/**
 * API client (axios)
 *
 * - Attaches the current Supabase access token.
 * - On 401, refreshes the session once and retries; if that fails, the local
 *   session and all user-scoped stores are cleared (route guards redirect).
 * - Never logs tokens or token payloads.
 *
 * @module services/apiClient
 */

import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, supabase } from './supabase';

const isApiDebugEnabled = import.meta.env.VITE_DEBUG_API === 'true';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { [field: string]: string };
  timestamp: string;
}

const resolveBaseUrl = (): string => {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured) return configured;
  if (import.meta.env.DEV) return 'http://localhost:3000/api/v1';
  // A production build without an API URL is a deployment error; fail loudly.
  throw new Error('VITE_API_BASE_URL is not configured');
};

const apiClient: AxiosInstance = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15000,
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  if (isApiDebugEnabled) {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.url} (auth: ${token ? 'yes' : 'no'})`);
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _authRetried?: boolean };

/** Clear the local session; imported lazily to avoid a store <-> client cycle. */
const clearLocalSession = async (): Promise<void> => {
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
  const { useAuthStore } = await import('../store/authStore');
  useAuthStore.getState().clearSession();
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const original = error.config as RetriableConfig | undefined;

    if (status === 401 && original && !original._authRetried) {
      original._authRetried = true;
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshError && data.session?.access_token) {
        original.headers.set('Authorization', `Bearer ${data.session.access_token}`);
        return apiClient(original);
      }
      await clearLocalSession();
      return Promise.reject(Object.assign(error, { isAuthError: true }));
    }

    if (isApiDebugEnabled) {
      console.debug(`[API] ${status ?? 'network'} ${original?.method?.toUpperCase()} ${original?.url}: ${error.response?.data?.message ?? error.message}`);
    }
    return Promise.reject(error);
  }
);

/** Extract a user-facing message from any API error. */
export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Cannot reach the server. Check your connection and try again.';
    return (error.response.data as ApiError | undefined)?.message || fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
};

export default apiClient;

/** Typed view of an unknown thrown value (axios or plain Error). */
export interface ApiErrorShape {
  message?: string;
  code?: string;
  isAuthError?: boolean;
  response?: {
    status?: number;
    data?: { message?: string; error?: string; errors?: Record<string, string> };
  };
}

export const toApiError = (error: unknown): ApiErrorShape =>
  error && typeof error === 'object' ? (error as ApiErrorShape) : { message: typeof error === 'string' ? error : undefined };
