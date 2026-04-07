/**
 * Deadlines Service
 * 
 * Service for managing admission deadlines.
 * Handles fetching deadlines, upcoming deadlines, and deadline tracking.
 * 
 * @module services/deadlinesService
 *
 * Backend API only. Direct Supabase deadline queries were removed.
 */

import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, Deadline } from '../types/api';

export const deadlinesService = {
  // ============================================================
  // BACKEND API METHODS (Complex operations)
  // ============================================================

  /**
   * List deadlines with optional filters
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to paginated deadlines list
   */
  list: async (params?: {
    admission_id?: string;
    urgency_level?: string;
    days_remaining?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Deadline>> => {
    const response = await apiClient.get('/deadlines', { params });
    return response.data;
  },

  /**
   * Get deadline by ID
   * 
   * @param id - Deadline ID
   * @returns Promise resolving to deadline data
   */
  getById: async (id: string): Promise<ApiResponse<Deadline>> => {
    const response = await apiClient.get(`/deadlines/${id}`);
    return response.data;
  },

  /**
   * Get upcoming deadlines (within specified days)
   * 
   * @param days - Number of days to look ahead (default: 7)
   * @returns Promise resolving to upcoming deadlines
   */
  getUpcoming: async (days: number = 7): Promise<ApiResponse<Deadline[]>> => {
    const response = await apiClient.get('/deadlines/upcoming', {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get urgent deadlines (within 3 days)
   * 
   * @returns Promise resolving to urgent deadlines
   */
  getUrgent: async (): Promise<ApiResponse<Deadline[]>> => {
    const response = await apiClient.get('/deadlines/urgent');
    return response.data;
  },

  /**
   * Get current user's upcoming deadlines with  admission and university details
   * ✅ Uses backend API (replaces getUserDeadlinesDirect - Phase 1)
   * 
   * @param days - Number of days to look ahead (default: 7)
   * @param alertOptIn - Only include deadlines with alerts enabled (default: true)
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @returns Promise resolving to paginated deadlines with enriched data
   */
  getUserDeadlines: async (
    days: number = 7,
    alertOptIn: boolean = true,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get('/users/me/upcoming-deadlines', {
      params: { days, alert_enabled: alertOptIn, page, limit }
    });
    return response.data;
  },
};
