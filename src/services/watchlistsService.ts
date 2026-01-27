/**
 * Watchlists Service
 * 
 * Service for managing saved/favorited admission programs.
 * Handles adding/removing from watchlist, managing alerts, and notes.
 * 
 * @module services/watchlistsService
 */

import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, Watchlist } from '../types/api';

export const watchlistsService = {
  /**
   * List watchlist items for current user
   * 
   * @param params - Query parameters for pagination
   * @returns Promise resolving to paginated watchlist
   */
  list: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Watchlist>> => {
    const response = await apiClient.get('/watchlists', { params });
    return response.data;
  },

  /**
   * Get watchlist item by ID
   * 
   * @param id - Watchlist ID
   * @returns Promise resolving to watchlist item
   */
  getById: async (id: string): Promise<ApiResponse<Watchlist>> => {
    const response = await apiClient.get(`/watchlists/${id}`);
    return response.data;
  },

  /**
   * Add admission to watchlist
   * 
   * @param admissionId - Admission ID to add
   * @param alertOptIn - Whether to enable deadline alerts
   * @returns Promise resolving to created watchlist item
   */
  add: async (admissionId: string, alertOptIn: boolean = false): Promise<ApiResponse<Watchlist>> => {
    const response = await apiClient.post('/watchlists', {
      admission_id: admissionId,
      alert_opt_in: alertOptIn,
    });
    return response.data;
  },

  /**
   * Remove admission from watchlist
   * 
   * @param id - Watchlist ID to remove
   * @returns Promise resolving to success response
   */
  remove: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/watchlists/${id}`);
    return response.data;
  },

  /**
   * Remove by admission ID (convenience method)
   * 
   * @param admissionId - Admission ID to remove from watchlist
   * @returns Promise resolving to success response
   */
  removeByAdmissionId: async (admissionId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/watchlists/admission/${admissionId}`);
    return response.data;
  },

  /**
   * Update watchlist item (e.g., toggle alert, update notes)
   * 
   * @param id - Watchlist ID
   * @param data - Updated watchlist data
   * @returns Promise resolving to updated watchlist item
   */
  update: async (id: string, data: Partial<Watchlist>): Promise<ApiResponse<Watchlist>> => {
    const response = await apiClient.patch(`/watchlists/${id}`, data);
    return response.data;
  },

  /**
   * Toggle alert opt-in for watchlist item
   * 
   * @param id - Watchlist ID
   * @returns Promise resolving to updated watchlist item
   */
  toggleAlert: async (id: string): Promise<ApiResponse<Watchlist>> => {
    const response = await apiClient.patch(`/watchlists/${id}/toggle-alert`);
    return response.data;
  },
};
