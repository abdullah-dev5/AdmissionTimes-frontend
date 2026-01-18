/**
 * Preferences Service
 * 
 * Service for managing user preferences and settings.
 * Handles notification preferences, display preferences, and search preferences.
 * 
 * @module services/preferencesService
 */

import apiClient from './apiClient';
import type { ApiResponse, UserPreferences } from '../types/api';

export const preferencesService = {
  /**
   * Get current user preferences
   * 
   * @returns Promise resolving to user preferences
   */
  get: async (): Promise<ApiResponse<UserPreferences>> => {
    const response = await apiClient.get('/users/me/preferences');
    return response.data;
  },

  /**
   * Update user preferences
   * 
   * @param data - Updated preferences data
   * @returns Promise resolving to updated preferences
   */
  update: async (data: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> => {
    const response = await apiClient.put('/users/me/preferences', data);
    return response.data;
  },

  /**
   * Update notification preferences
   * 
   * @param preferences - Notification preferences
   * @returns Promise resolving to updated preferences
   */
  updateNotifications: async (preferences: {
    email?: boolean;
    push?: boolean;
    deadline_alerts?: boolean;
  }): Promise<ApiResponse<UserPreferences>> => {
    const response = await apiClient.patch('/users/me/preferences/notifications', preferences);
    return response.data;
  },

  /**
   * Update display preferences
   * 
   * @param preferences - Display preferences
   * @returns Promise resolving to updated preferences
   */
  updateDisplay: async (preferences: {
    theme?: 'light' | 'dark';
    language?: string;
  }): Promise<ApiResponse<UserPreferences>> => {
    const response = await apiClient.patch('/users/me/preferences/display', preferences);
    return response.data;
  },

  /**
   * Update search preferences
   * 
   * @param preferences - Search preferences
   * @returns Promise resolving to updated preferences
   */
  updateSearch: async (preferences: {
    default_filters?: Record<string, any>;
  }): Promise<ApiResponse<UserPreferences>> => {
    const response = await apiClient.patch('/users/me/preferences/search', preferences);
    return response.data;
  },
};
