/**
 * Activity Service
 * 
 * Service for managing user activity and event tracking.
 * Handles fetching activity feeds and user actions.
 * 
 * @module services/activityService
 */

import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, Activity } from '../types/api';

export const activityService = {
  /**
   * Track activity event
   *
   * @param payload - Activity tracking payload
   */
  track: async (payload: {
    activity_type: 'viewed' | 'searched' | 'compared' | 'watchlisted' | 'view' | 'search' | 'saved' | 'alert' | 'deadline' | 'notification';
    entity_type: string;
    entity_id: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<Activity>> => {
    const response = await apiClient.post('/activity', payload);
    return response.data;
  },

  /**
   * List activities with optional filters
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to paginated activities
   */
  list: async (params?: {
    user_id?: string;
    type?: string;
    related_entity_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Activity>> => {
    const response = await apiClient.get('/activity', { params });
    return response.data;
  },

  /**
   * Get activity by ID
   * 
   * @param id - Activity ID
   * @returns Promise resolving to activity data
   */
  getById: async (id: string): Promise<ApiResponse<Activity>> => {
    const response = await apiClient.get(`/activity/${id}`);
    return response.data;
  },

  /**
   * Get current user's activity feed
   * 
   * @param params - Query parameters for pagination
   * @returns Promise resolving to user's activities
   */
  getMyActivity: async (params?: {
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Activity>> => {
    const response = await apiClient.get('/activity/me', { params });
    return response.data;
  },
};
