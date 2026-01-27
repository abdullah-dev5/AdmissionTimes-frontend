/**
 * Change Logs Service
 * 
 * Service for managing change logs and audit trails.
 * Handles fetching change history, filtering, and viewing diffs.
 * 
 * @module services/changelogsService
 */

import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, ChangeLog } from '../types/api';

export const changelogsService = {
  /**
   * List change logs with optional filters
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to paginated change logs
   */
  list: async (params?: {
    admission_id?: string;
    changed_by?: string;
    change_type?: string;
    field_name?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ChangeLog>> => {
    const response = await apiClient.get('/change-logs', { params });
    return response.data;
  },

  /**
   * Get change log by ID
   * 
   * @param id - Change log ID
   * @returns Promise resolving to change log data
   */
  getById: async (id: string): Promise<ApiResponse<ChangeLog>> => {
    const response = await apiClient.get(`/change-logs/${id}`);
    return response.data;
  },

  /**
   * Get change logs for specific admission
   * 
   * @param admissionId - Admission ID
   * @param params - Query parameters for pagination
   * @returns Promise resolving to change logs for admission
   */
  getByAdmissionId: async (
    admissionId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<ChangeLog>> => {
    const response = await apiClient.get(`/change-logs/admission/${admissionId}`, { params });
    return response.data;
  },
};
