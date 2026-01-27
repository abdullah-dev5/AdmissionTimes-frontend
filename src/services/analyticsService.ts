/**
 * Analytics Service
 * 
 * Service for fetching analytics and statistics data.
 * Handles user activity tracking, system metrics, and reporting.
 * 
 * @module services/analyticsService
 */

import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';

export const analyticsService = {
  /**
   * Get user activity analytics
   * 
   * @param params - Query parameters for filtering
   * @returns Promise resolving to activity analytics
   */
  getUserActivity: async (params?: {
    user_id?: string;
    user_type?: string;
    start_date?: string;
    end_date?: string;
    event_type?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/analytics/user-activity', { params });
    return response.data;
  },

  /**
   * Get system metrics
   * 
   * @returns Promise resolving to system metrics
   */
  getSystemMetrics: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/analytics/system-metrics');
    return response.data;
  },

  /**
   * Get admission statistics
   * 
   * @param params - Query parameters for filtering
   * @returns Promise resolving to admission statistics
   */
  getAdmissionStats: async (params?: {
    university_id?: string;
    degree_level?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/analytics/admission-stats', { params });
    return response.data;
  },
};
