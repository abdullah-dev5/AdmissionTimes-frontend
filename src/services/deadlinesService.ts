/**
 * Deadlines Service
 * 
 * Service for managing admission deadlines.
 * Handles fetching deadlines, upcoming deadlines, and deadline tracking.
 * 
 * @module services/deadlinesService
 * 
 * ⚠️  STATUS: NO ACTIVE CONSUMERS
 * This service has no confirmed runtime consumers (pages/stores/hooks).
 * The direct Supabase methods below are deprecated; the backend API methods
 * are ready to use. Wire up a consumer (e.g., DeadlinePage or studentStore)
 * before removing the deprecation note.
 * 
 * Phase 1: Supports both backend API and direct Supabase queries
 */

import apiClient from './apiClient';
import { supabase } from './supabase';
import type { ApiResponse, PaginatedResponse, Deadline } from '../types/api';

export const deadlinesService = {
  // ============================================================
  // DIRECT SUPABASE QUERIES (Phase 1 - DEPRECATED)
  // ============================================================
  // @deprecated - These methods make direct Supabase calls
  // Use the backend API methods below instead
  // Timeline: Phase 2 (next sprint) will remove these entirely
  // ============================================================

  /**
   * @deprecated Use list() instead
   * List deadlines directly from Supabase (Phase 1)
   * 
   * @param params - Filter and pagination params
   * @returns Promise resolving to paginated deadlines
   */
  listDirect: async (params?: {
    admission_id?: string;
    urgency_level?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Deadline[];
    count: number;
  }> => {
    console.warn('⚠️  listDirect is deprecated. Use list() instead.');
    try {
      let query = supabase.from('deadlines').select('*', { count: 'exact' });

      if (params?.admission_id) {
        query = query.eq('admission_id', params.admission_id);
      }
      if (params?.urgency_level) {
        query = query.eq('urgency_level', params.urgency_level);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const start = (page - 1) * limit;
      query = query.range(start, start + limit - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
      };
    } catch (error: any) {
      console.error('❌ Failed to fetch deadlines:', error);
      throw error;
    }
  },

  /**
   * @deprecated Use getById() instead
   * Get deadline by ID directly from Supabase (Phase 1)
   * 
   * @param id - Deadline ID
   * @returns Promise resolving to deadline
   */
  getByIdDirect: async (id: string): Promise<Deadline> => {
    console.warn('⚠️  getByIdDirect is deprecated. Use getById() instead.');
    try {
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch deadline:', error);
      throw error;
    }
  },

  /**
   * @deprecated Use getUpcoming() instead
   * Get upcoming deadlines directly from Supabase (Phase 1)
   * 
   * @param days - Days ahead to look (default: 7)
   * @returns Promise resolving to upcoming deadlines
   */
  getUpcomingDirect: async (days: number = 7): Promise<Deadline[]> => {
    console.warn('⚠️  getUpcomingDirect is deprecated. Use getUpcoming() instead.');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .lte('deadline_date', futureDate.toISOString())  // ✅ Changed from deadline
        .gte('deadline_date', new Date().toISOString())  // ✅ Changed from deadline
        .order('deadline_date', { ascending: true });    // ✅ Changed from deadline

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('❌ Failed to fetch upcoming deadlines:', error);
      throw error;
    }
  },

  /**
   * @deprecated Use getUserDeadlines() instead
   * Get urgent deadlines (Phase 1)
   * 
   * @returns Promise resolving to urgent deadlines (within 3 days)
   */
  getUrgentDirect: async (): Promise<Deadline[]> => {
    console.warn('⚠️  getUrgentDirect is deprecated. Use getUrgent() instead.');
    return deadlinesService.getUpcomingDirect(3);
  },

  /**
   * @deprecated Use getUserDeadlines() instead
   * Get deadlines for user's watchlist items (Phase 1)
   * 
   * NOTE: Deadlines don't have user_id - they're linked via:
   * User → Watchlists → Admissions → Deadlines
   * 
   * @param userId - User ID to get deadlines for
   * @param alertOptIn - If true, only get deadlines for items with alerts enabled
   * @returns Promise resolving to user's relevant deadlines
   */
  getUserDeadlinesDirect: async (
    userId: string,
    alertOptIn: boolean = true
  ): Promise<Deadline[]> => {
    console.warn('⚠️  getUserDeadlinesDirect is deprecated. Use getUserDeadlines() instead.');
    try {
      // First get user's watchlist admission IDs
      let watchlistQuery = supabase
        .from('watchlists')
        .select('admission_id')
        .eq('user_id', userId);
      
      if (alertOptIn) {
        watchlistQuery = watchlistQuery.eq('alert_opt_in', true);
      }

      const { data: watchlistData, error: watchlistError } = await watchlistQuery;

      if (watchlistError) throw watchlistError;
      
      if (!watchlistData || watchlistData.length === 0) {
        return [];
      }

      // Get deadlines for those admissions
      const admissionIds = watchlistData.map(w => w.admission_id);
      
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .in('admission_id', admissionIds)
        .gte('deadline_date', new Date().toISOString())  // Only future deadlines
        .order('deadline_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('❌ Failed to fetch user deadlines:', error);
      throw error;
    }
  },

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
