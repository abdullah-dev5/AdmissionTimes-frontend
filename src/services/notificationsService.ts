/**
 * Notifications Service
 * 
 * Service for managing user notifications.
 * Handles fetching, marking as read, and filtering notifications.
 * 
 * @module services/notificationsService
 */

import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, Notification } from '../types/api';

export const notificationsService = {
  /**
   * List notifications with optional filters
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to paginated notifications list
   */
  list: async (params?: {
    user_type?: string;
    category?: string;
    priority?: string;
    is_read?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  /**
   * Get notification by ID
   * 
   * @param id - Notification ID
   * @returns Promise resolving to notification data
   */
  getById: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Mark notification as read
   * 
   * @param id - Notification ID
   * @returns Promise resolving to updated notification
   */
  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   * 
   * @returns Promise resolving to success response
   */
  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * Get unread notifications count
   * 
   * @returns Promise resolving to count
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },
};
