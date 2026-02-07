/**
 * Dashboard Service
 * 
 * Service for fetching aggregated dashboard data from backend.
 * Uses the aggregated dashboard endpoints (Approach B) for optimal performance.
 * 
 * @module services/dashboardService
 */

import apiClient from './apiClient';
import type { ApiResponse, StudentDashboard, UniversityDashboard, AdminDashboard } from '../types/api';

export const dashboardService = {
  /**
   * Get student dashboard data
   * Fetches aggregated data including stats, recommendations, deadlines, notifications, and activity
   * 
   * @returns Promise resolving to student dashboard data
   */
  getStudentDashboard: async (): Promise<ApiResponse<StudentDashboard>> => {
    const response = await apiClient.get('/student/dashboard');
    return response.data;
  },

  /**
   * Get university dashboard data
   * Fetches aggregated data including stats, pending verifications, recent changes, and notifications
   * 
   * @returns Promise resolving to university dashboard data
   */
  getUniversityDashboard: async (): Promise<ApiResponse<UniversityDashboard>> => {
    console.log('🔵 [dashboardService] Fetching university dashboard...')
    const response = await apiClient.get('/university/dashboard');
    console.log('🔵 [dashboardService] Raw API response:', response)
    console.log('🔵 [dashboardService] Response data:', response.data)
    console.log('🔵 [dashboardService] recent_admissions count:', response.data?.data?.recent_admissions?.length || 0)
    return response.data;
  },

  /**
   * Get admin dashboard data
   * Fetches aggregated data including stats, pending verifications, system metrics, and activity
   * 
   * @returns Promise resolving to admin dashboard data
   */
  getAdminDashboard: async (): Promise<ApiResponse<AdminDashboard>> => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },
};
