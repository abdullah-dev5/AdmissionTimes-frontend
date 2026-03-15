/**
 * API Client Configuration
 * 
 * This module provides a centralized HTTP client for all API requests.
 * It includes request/response interceptors for authentication, error handling,
 * and automatic header management.
 * 
 * Features:
 * - Automatic authentication header injection
 * - Request/response interceptors
 * - Error handling and transformation
 * - Timeout configuration
 * - Type-safe API responses
 * 
 * @module services/apiClient
 */

import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, signOutUser } from './supabase';
import { getAuthState } from '../store/authStore';

const isApiDebugEnabled = import.meta.env.VITE_DEBUG_API === 'true';

/**
 * Standard API response structure
 * All backend endpoints return responses in this format
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Paginated API response structure
 * Used for list endpoints with pagination
 */
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

/**
 * API error response structure
 * Standardized error format from backend
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: { [field: string]: string };
  timestamp: string;
}

/**
 * Create axios instance with base configuration
 * 
 * Base URL is read from environment variable VITE_API_BASE_URL
 * Falls back to default development URL if not set
 */
// In development, use absolute URL to backend
// In production, use full URL from environment variable
const getBaseURL = () => {
  // Always use explicit backend URL (Vite proxy may not work reliably in all cases)
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

/**
 * Request Interceptor
 * 
 * Automatically adds JWT authentication token to all requests.
 * 
 * Phase 4C (Current - JWT Authentication):
 * - Reads JWT token from Supabase session
 * - Adds Authorization: Bearer <token> header to all requests
 * - Handles token refresh automatically if expired
 * 
 * Format: Authorization: Bearer <token>
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get JWT token from Supabase
      const token = await getAccessToken();

      // Attach JWT token to request headers
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;

        if (isApiDebugEnabled) {
          console.log(`🔐 [API] JWT token attached to ${config.method?.toUpperCase()} ${config.url}`);
          console.log(`🔐 [API] Token prefix: ${token.substring(0, 20)}...`);

          // Decode and log JWT payload
          try {
            const parts = token.split('.');
            if (parts.length >= 2) {
              const payload = JSON.parse(atob(parts[1]));
              console.log('🔐 [API] JWT Payload:', {
                sub: payload.sub,
                email: payload.email,
                user_metadata: payload.user_metadata,
                role: payload.user_metadata?.role,
                iat: payload.iat,
                exp: payload.exp,
              });
            }
          } catch (decodeErr) {
            console.warn('⚠️ [API] Failed to decode JWT payload:', decodeErr);
          }
        }
      } else {
        if (isApiDebugEnabled) {
          console.warn('⚠️ [API] No JWT token available - request will proceed without authentication');
          console.warn('⚠️ [API] This will cause 401/403 errors on protected endpoints');
        }
      }

      return config;
    } catch (error) {
      console.error('❌ [API] Request interceptor error:', error);
      // Continue with request even if token retrieval fails
      return config;
    }
  },
  (error) => {
    // Handle request configuration errors
    console.error('❌ [API] Request interceptor failure:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles API responses and errors:
 * - Logs responses for debugging
 * - Handles 401 Unauthorized (token expired/invalid)
 * - Handles 403 Forbidden (insufficient permissions)
 * - Handles other error scenarios (4xx, 5xx, network)
 * 
 * Error Types:
 * - 401: JWT token expired or invalid → Sign out user
 * - 403: User doesn't have permission
 * - 4xx: Client errors (validation, not found, etc.)
 * - 5xx: Server errors
 * - Network errors: No response received
 */
apiClient.interceptors.response.use(
  (response) => {
    // Successful response - log and return as-is
    if (import.meta.env.VITE_DEBUG_API === 'true') {
      console.debug(`✅ [API] Response ${response.status}: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      const apiError = error.response.data;
      const status = error.response.status;

      // Handle 401 Unauthorized (JWT token expired/invalid)
      if (status === 401) {
        console.error('❌ [API] Authentication failed (401 Unauthorized) - JWT token invalid or expired');
        console.error('   Message:', apiError.message);

        // Sign out user and clear session
        try {
          await signOutUser();
          console.log('✅ [API] User signed out');
        } catch (signOutError) {
          console.error('❌ [API] Error during sign out:', signOutError);
        }

        // Redirect to login page
        window.location.href = '/signin';

        return Promise.reject(error);
      }

      // Handle 403 Forbidden (insufficient permissions)
      if (status === 403) {
        console.error('❌ [API] Insufficient permissions (403 Forbidden)');
        console.error('   Message:', apiError.message);
        return Promise.reject(error);
      }

      // Handle 404 Not Found
      if (status === 404) {
        if (import.meta.env.VITE_DEBUG_API === 'true') {
          console.warn(`⚠️ [API] Resource not found (404): ${error.config?.url}`);
        }
        return Promise.reject(error);
      }

      // Handle validation errors (400)
      if (status === 400 && apiError.errors) {
        console.warn('⚠️ [API] Validation error (400):', apiError.errors);
        return Promise.reject(error);
      }

      // Handle other client errors (4xx)
      if (status >= 400 && status < 500) {
        console.error(`❌ [API] Client error [${status}]: ${apiError.message}`);
        return Promise.reject(error);
      }

      // Handle server errors (5xx)
      if (status >= 500) {
        console.error(`❌ [API] Server error [${status}]: ${apiError.message}`);
        return Promise.reject(error);
      }
    } else if (error.request) {
      // Request made but no response received (network error)
      console.error('❌ [API] Network Error: No response received');
      console.error('   Details:', error.message);
      return Promise.reject(error);
    } else {
      // Something else happened (request setup error)
      console.error('❌ [API] Request Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
