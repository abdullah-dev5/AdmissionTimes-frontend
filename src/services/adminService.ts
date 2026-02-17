/**
 * Admin Service
 * 
 * Service for admin-specific operations including verification, notifications, and analytics
 * Uses new backend admin domain endpoints: GET/POST /api/v1/admin/*
 * 
 * @module services/adminService
 */

import apiClient from './apiClient';
import type {
  ApiResponse,
  PaginatedResponse,
  AdminAdmission,
  AdminDashboard,
  AdminVerifyAdmissionDTO,
  AdminBulkVerifyDTO,
} from '../types/api';

export const adminService = {
  /**
   * Get admin dashboard with statistics and recent activity
   * GET /api/v1/admin/dashboard
   * 
   * @returns Promise resolving to admin dashboard data
   */
  getDashboard: async (): Promise<ApiResponse<AdminDashboard>> => {
    console.log('📊 [adminService] Fetching admin dashboard...');
    const response = await apiClient.get('/admin/dashboard');
    console.log('📊 [adminService] Dashboard response:', response.data);
    return response.data;
  },

  /**
   * Get pending admissions awaiting verification
   * GET /api/v1/admin/admissions/pending
   * 
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @returns Promise resolving to paginated list of pending admissions
   */
  getPendingAdmissions: async (
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<AdminAdmission>> => {
    console.log('🔵 [adminService] Fetching pending admissions...', { page, limit });
    const response = await apiClient.get('/admin/admissions/pending', {
      params: { page, limit },
    });
    console.log('🔵 [adminService] Pending admissions response:', response.data);
    return response.data;
  },

  /**
   * Get all admissions with optional status filter
   * GET /api/v1/admin/admissions
   * 
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @param status - Filter by status: pending, verified, rejected, disputed (optional)
   * @returns Promise resolving to paginated list of all admissions
   */
  getAllAdmissions: async (
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<PaginatedResponse<AdminAdmission>> => {
    console.log('🔵 [adminService] Fetching all admissions...', { page, limit, status });
    const response = await apiClient.get('/admin/admissions', {
      params: { page, limit, status },
    });
    console.log('🔵 [adminService] All admissions response:', response.data);
    return response.data;
  },

  /**
   * Get single admission details
   * GET /api/v1/admin/admissions/:id
   * 
   * @param admissionId - Admission ID
   * @returns Promise resolving to admission details
   */
  getAdmissionDetails: async (admissionId: string): Promise<ApiResponse<AdminAdmission>> => {
    console.log('📄 [adminService] Fetching admission details:', admissionId);
    const response = await apiClient.get(`/admin/admissions/${admissionId}`);
    return response.data;
  },

  /**
   * Verify or reject a single admission
   * POST /api/v1/admin/admissions/:id/verify
   * 
   * @param admissionId - Admission ID
   * @param data - Verification data (status, rejection_reason, notes, comments)
   * @returns Promise resolving to updated admission
   */
  verifyAdmission: async (
    admissionId: string,
    data: AdminVerifyAdmissionDTO
  ): Promise<ApiResponse<AdminAdmission>> => {
    console.log('✅ [adminService] Verifying admission:', admissionId, data);
    const response = await apiClient.post(`/admin/admissions/${admissionId}/verify`, data);
    console.log('✅ [adminService] Verification response:', response.data);
    return response.data;
  },

  /**
   * Reject an admission
   * Convenience method that calls verifyAdmission with status='rejected'
   * 
   * @param admissionId - Admission ID
   * @param rejectionReason - Reason for rejection (required)
   * @param adminNotes - Optional admin notes
   * @returns Promise resolving to updated admission
   */
  rejectAdmission: async (
    admissionId: string,
    rejectionReason: string,
    adminNotes?: string
  ): Promise<ApiResponse<AdminAdmission>> => {
    console.log('🔴 [adminService] Rejecting admission:', admissionId);
    return adminService.verifyAdmission(admissionId, {
      verification_status: 'rejected',
      rejection_reason: rejectionReason,
      admin_notes: adminNotes,
    });
  },

  /**
   * Mark admission as verified
   * Convenience method that calls verifyAdmission with status='verified'
   * 
   * @param admissionId - Admission ID
   * @param verificationComments - Optional verification comments
   * @returns Promise resolving to updated admission
   */
  acceptAdmission: async (
    admissionId: string,
    verificationComments?: string
  ): Promise<ApiResponse<AdminAdmission>> => {
    console.log('🟢 [adminService] Accepting admission:', admissionId);
    return adminService.verifyAdmission(admissionId, {
      verification_status: 'verified',
      verification_comments: verificationComments,
    });
  },

  /**
   * Dispute an admission (mark as disputed for review)
   * 
   * @param admissionId - Admission ID
   * @param reason - Reason for dispute
   * @returns Promise resolving to updated admission
   */
  disputeAdmission: async (
    admissionId: string,
    reason: string
  ): Promise<ApiResponse<AdminAdmission>> => {
    console.log('🟡 [adminService] Disputing admission:', admissionId);
    return adminService.verifyAdmission(admissionId, {
      verification_status: 'disputed',
      admin_notes: reason,
    });
  },

  /**
   * Bulk verify multiple admissions
   * POST /api/v1/admin/admissions/bulk-verify
   * 
   * @param data - Bulk verification data (admission_ids, status, rejection_reason, notes)
   * @returns Promise resolving to bulk operation result
   */
  bulkVerifyAdmissions: async (
    data: AdminBulkVerifyDTO
  ): Promise<ApiResponse<{ successful: number; failed: number; errors: any[] }>> => {
    console.log('⚡ [adminService] Bulk verifying admissions:', data);
    const response = await apiClient.post('/admin/admissions/bulk-verify', data);
    console.log('⚡ [adminService] Bulk verification response:', response.data);
    return response.data;
  },

  /**
   * Bulk accept multiple admissions
   * Convenience method that calls bulkVerifyAdmissions with status='verified'
   * 
   * @param admissionIds - Array of admission IDs
   * @param adminNotes - Optional admin notes
   * @returns Promise resolving to bulk operation result
   */
  bulkAcceptAdmissions: async (
    admissionIds: string[],
    adminNotes?: string
  ): Promise<ApiResponse<{ successful: number; failed: number; errors: any[] }>> => {
    console.log('🟢⚡ [adminService] Bulk accepting admissions:', admissionIds.length);
    return adminService.bulkVerifyAdmissions({
      admission_ids: admissionIds,
      verification_status: 'verified',
      admin_notes: adminNotes,
    });
  },

  /**
   * Bulk reject multiple admissions
   * Convenience method that calls bulkVerifyAdmissions with status='rejected'
   * 
   * @param admissionIds - Array of admission IDs
   * @param rejectionReason - Reason for rejection (required)
   * @returns Promise resolving to bulk operation result
   */
  bulkRejectAdmissions: async (
    admissionIds: string[],
    rejectionReason: string
  ): Promise<ApiResponse<{ successful: number; failed: number; errors: any[] }>> => {
    console.log('🔴⚡ [adminService] Bulk rejecting admissions:', admissionIds.length);
    return adminService.bulkVerifyAdmissions({
      admission_ids: admissionIds,
      verification_status: 'rejected',
      rejection_reason: rejectionReason,
    });
  },

  /**
   * Get admin notifications
   * Fetches notifications for admin user
   * 
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @returns Promise resolving to list of notifications
   */
  getNotifications: async (page: number = 1, limit: number = 20): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/notifications', {
      params: {
        user_type: 'admin',
        page,
        limit,
      },
    });
    return response.data;
  },

  /**
   * Mark notification as read
   * 
   * @param notificationId - Notification ID
   * @returns Promise resolving to updated notification
   */
  markNotificationAsRead: async (notificationId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`, {
      is_read: true,
    });
    return response.data;
  },

  /**
   * Mark all notifications as read
   * 
   * @returns Promise resolving to success message
   */
  markAllNotificationsAsRead: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch('/notifications/read-all', {});
    return response.data;
  },

  /**
   * Get change logs
   * Fetches audit trail of changes made to admissions
   * 
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @param filters - Optional filters (admission_id, user_id, date range, etc.)
   * @returns Promise resolving to list of change logs
   */
  getChangeLogs: async (
    page: number = 1,
    limit: number = 20,
    filters?: {
      admission_id?: string;
      user_id?: string;
      field_name?: string;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/changelogs', {
      params: {
        page,
        limit,
        ...filters,
      },
    });
    return response.data;
  },

  /**
   * Get analytics data
   * Fetches user activity and event analytics
   * 
   * @param filters - Optional filters (event_type, user_type, date range, etc.)
   * @returns Promise resolving to analytics data
   */
  getAnalytics: async (filters?: {
    event_type?: string;
    user_type?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/analytics/user-activity', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get analytics stats
   * Fetches aggregated analytics statistics
   * 
   * @returns Promise resolving to analytics stats
   */
  getAnalyticsStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/analytics/stats');
    return response.data;
  },
};
