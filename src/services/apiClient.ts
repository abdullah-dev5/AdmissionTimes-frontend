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
// In development, use relative path to leverage Vite proxy
// In production, use full URL from environment variable
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    // Use relative path in development (Vite proxy handles it)
    return '/api/v1';
  }
  // Use full URL in production
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
 * Automatically adds authentication headers to all requests.
 * 
 * Development Mode:
 * - Reads user context from localStorage (mock authentication)
 * - Adds x-user-id, x-user-role, x-university-id headers
 * 
 * Production Mode (Future):
 * - Reads JWT token from localStorage
 * - Adds Authorization: Bearer <token> header
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get user context from localStorage (mock auth for development)
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const universityId = localStorage.getItem('universityId');

    // Add mock auth headers (development only)
    if (userId && config.headers) {
      config.headers['x-user-id'] = userId;
    }
    if (userRole && config.headers) {
      config.headers['x-user-role'] = userRole;
    }
    if (universityId && config.headers) {
      config.headers['x-university-id'] = universityId;
    }

    // Future: Add real auth token (Phase 4C - Authentication)
    // const token = localStorage.getItem('authToken');
    // if (token && config.headers) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    // Handle request configuration errors
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles API responses and errors:
 * - Logs errors for debugging
 * - Transforms error responses to consistent format
 * - Can dispatch to toast notification system
 * 
 * Error Types:
 * - 4xx: Client errors (validation, authentication, etc.)
 * - 5xx: Server errors
 * - Network errors: No response received
 */
apiClient.interceptors.response.use(
  (response) => {
    // Successful response - return as-is
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      const apiError = error.response.data;
      const status = error.response.status;
      
      console.error(`API Error [${status}]:`, apiError.message);
      
      // Log validation errors if present
      if (apiError.errors) {
        console.error('Validation errors:', apiError.errors);
      }
      
      // TODO: Dispatch to toast notification system
      // toast.error(apiError.message);
      
    } else if (error.request) {
      // Request made but no response received (network error)
      console.error('Network Error: No response received', error.message);
      
      // TODO: Show network error toast
      // toast.error('Network error. Please check your connection.');
      
    } else {
      // Something else happened (request setup error)
      console.error('Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
