/**
 * Deadlines Service
 * 
 * Service for managing admission deadlines.
 * Handles fetching deadlines, upcoming deadlines, and deadline tracking.
 * 
 * Phase 1: Supports both backend API and direct Supabase queries
 * 
 * @module services/deadlinesService
 */

import apiClient from './apiClient';
import { supabase } from './supabase';
import type { ApiResponse, PaginatedResponse, Deadline } from '../types/api';

export const deadlinesService = {
  // ============================================================
  // DIRECT SUPABASE QUERIES (Phase 1 - Fast Read Operations)
  // ============================================================

  /**
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
   * Get deadline by ID directly from Supabase (Phase 1)
   * 
   * @param id - Deadline ID
   * @returns Promise resolving to deadline
   */
  getByIdDirect: async (id: string): Promise<Deadline> => {
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
   * Get upcoming deadlines directly from Supabase (Phase 1)
   * 
   * @param days - Days ahead to look (default: 7)
   * @returns Promise resolving to upcoming deadlines
   */
  getUpcomingDirect: async (days: number = 7): Promise<Deadline[]> => {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .lte('deadline_date', futureDate.toISOString())
        .gte('deadline_date', new Date().toISOString())
        .order('deadline_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('❌ Failed to fetch upcoming deadlines:', error);
      throw error;
    }
  },

  /**
   * Get urgent deadlines (Phase 1)
   * 
   * @returns Promise resolving to urgent deadlines (within 3 days)
   */
  getUrgentDirect: async (): Promise<Deadline[]> => {
    return deadlinesService.getUpcomingDirect(3);
  },

  // ============================================================
  // BACKEND API METHODS (Complex operations)
  // ============================================================

export const deadlinesService = {
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
};
