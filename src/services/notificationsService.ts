/**
 * Notifications Service
 * 
 * Service for managing user notifications.
 * Handles fetching, marking as read, and filtering notifications.
 * 
 * Phase 1: Supports both backend API and direct Supabase queries
 * 
 * @module services/notificationsService
 */

import apiClient from './apiClient';
import { supabase } from './supabase';
import type { ApiResponse, PaginatedResponse, Notification } from '../types/api';

export const notificationsService = {
  // ============================================================
  // DIRECT SUPABASE QUERIES (Phase 1 - Fast Read Operations)
  // ============================================================

  /**
   * List own notifications directly from Supabase (Phase 1)
   * 
   * RLS policies enforce: user_id = auth.uid()
   * Only returns notifications for current user
   * 
   * @param params - Filter and pagination params
   * @returns Promise resolving to notifications
   */
  listOwnDirect: async (params?: {
    read?: boolean;
    limit?: number;
  }): Promise<Notification[]> => {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by read status if specified
      if (params?.read !== undefined) {
        if (params.read) {
          query = query.not('read_at', 'is', null);
        } else {
          query = query.is('read_at', null);
        }
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('❌ Failed to fetch notifications:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read directly (Phase 1)
   * 
   * RLS policies enforce: user_id = auth.uid()
   * 
   * @param id - Notification ID
   * @returns Promise resolving to updated notification
   */
  markAsReadDirect: async (id: string): Promise<Notification> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('❌ Failed to mark notification as read:', error);
      throw error;
    }
  },

  /**
   * Get unread notification count directly (Phase 1)
   * 
   * @returns Promise resolving to unread count
   */
  getUnreadCountDirect: async (): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .is('read_at', null);

      if (error) throw error;
      return count || 0;
    } catch (error: any) {
      console.error('❌ Failed to get unread count:', error);
      return 0;
    }
  },

  // ============================================================
  // BACKEND API METHODS (Complex operations)
  // ============================================================

  /**
   * List notifications with optional filters
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to paginated notifications list
   */
  list: async (params?: {
    role_type?: string;
    notification_type?: string;
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
