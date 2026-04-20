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

export interface CreateUniversityRepPayload {
  email: string;
  display_name: string;
  university_name: string;
  city?: string;
  country?: string;
  website?: string;
}

export interface CreateUniversityRepResult {
  user: {
    id: string;
    email: string;
    role: 'university';
    university_id: string;
    display_name: string;
  };
  university: {
    id: string;
    name: string;
  };
  credentials: {
    temporary_password: string;
    show_once: true;
  };
}

export interface EmailDeliveryLog {
  id: string;
  notification_id: string;
  recipient_email: string;
  subject: string;
  status: 'sent' | 'failed';
  error_message: string | null;
  attempt_number: number;
  provider_message_id: string | null;
  created_at: string;
  notification_type?: string;
  notification_title?: string;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
}

export interface EmailLogListResult {
  logs: EmailDeliveryLog[];
  meta: {
    status: 'sent' | 'failed' | null;
    limit: number;
    count: number;
  };
}

export interface EmailReplayResultByLog {
  log_id: string;
  notification_id: string;
  recipient_email: string;
  replayed: boolean;
}

export interface EmailReplayResultByNotification {
  notification_id: string;
  recipient_email: string;
  replayed: boolean;
}

export interface ManualReminderCleanupResult {
  deleted_count: number;
}

export interface SchedulerJobMetrics {
  lastRunAt: string | null;
  lastDurationMs: number;
  lastStatus: 'success' | 'failed' | 'idle';
  totalRuns: number;
  totalFailures: number;
  lastError: string | null;
}

export interface SchedulerHealthResult {
  deadlineReminders: SchedulerJobMetrics;
  recommendationGeneration: SchedulerJobMetrics;
  recommendationCleanup: SchedulerJobMetrics;
}

export interface ReminderDeliveryLog {
  id: string;
  deadline_id: string;
  recipient_id: string;
  threshold_day: number;
  notification_id: string | null;
  status: 'sent' | 'failed' | 'deduped';
  event_key: string;
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
  deadline_type?: string | null;
  deadline_date?: string | null;
  admission_id?: string | null;
  admission_title?: string | null;
}

export interface ReminderLogListResult {
  success: boolean;
  data: ReminderDeliveryLog[];
  meta: {
    status: 'sent' | 'failed' | 'deduped' | null;
    limit: number;
    count: number;
  };
}

export interface EmailMetricsResult {
  readiness: {
    enabled: boolean;
    ready: boolean;
    lastVerifyAt: string | null;
    lastVerifyError: string | null;
  };
  retry_backlog: number;
  sent_1h: number;
  failed_1h: number;
  sent_24h: number;
  failed_24h: number;
  failure_rate_1h: number;
  failure_rate_24h: number;
  permanent_skips_24h: number;
  retry_attempts_24h: number;
}

export type ScraperRunStatus = 'running' | 'completed' | 'failed' | 'partial';
export type ScraperRunStatusLabel = 'Success' | 'Failed' | 'No Changes' | 'Changes Detected' | 'Running';

export interface ScraperRunSummary {
  total_jobs: number;
  successful_jobs: number;
  failed_jobs: number;
  running_jobs: number;
  last_execution: string | null;
}

export interface ScraperRunListItem {
  id: string;
  job_id: string;
  university: string;
  started_at: string;
  finished_at: string | null;
  status: ScraperRunStatus;
  status_label: ScraperRunStatusLabel;
  source_url: string | null;
  duration_seconds: number;
  scheduler_triggered: boolean;
  changes_detected: number;
  fetched_count: number;
  mirrored_count: number;
  published_count: number;
  updated_count: number;
  skipped_count: number;
  failed_count: number;
}

export interface ScraperRunEventItem {
  id: string;
  event_status: 'inserted' | 'updated' | 'unchanged' | 'failed' | 'skipped';
  source_university_name: string | null;
  source_program_title: string | null;
  source_last_date: string | null;
  source_details_link: string | null;
  reason: string | null;
  error_detail: string | null;
  created_at: string;
}

export interface ScraperRunDetail {
  run: ScraperRunListItem;
  events: ScraperRunEventItem[];
  university_breakdown?: Array<{
    source_university_name: string;
    total: number;
    inserted: number;
    updated: number;
    skipped: number;
    failed: number;
  }>;
  skip_reasons?: Array<{
    source_university_name: string;
    reason: string;
    count: number;
  }>;
}

export interface ScraperManualRunResult {
  source_run_id: string;
  replayed_records: number;
  ingestion: {
    run_id: string;
    mode: 'mirror' | 'publish';
    fetched_count: number;
    mirrored_count: number;
    published_count: number;
    updated_count: number;
    skipped_count: number;
    failed_count: number;
    status: 'completed' | 'failed' | 'partial';
  };
}

const toCanonicalAdmissionId = (admissionId: string): string => {
  if (!admissionId) return admissionId;
  return admissionId.includes('::program::') ? admissionId.split('::program::')[0] : admissionId;
};

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
   * @param status - Filter by status: pending, verified, rejected (optional)
   * @returns Promise resolving to paginated list of all admissions
   */
  getAllAdmissions: async (
    page: number = 1,
    limit: number = 20,
    status?: string,
    dataOrigin?: 'scraper' | 'manual' | 'university'
  ): Promise<PaginatedResponse<AdminAdmission>> => {
    console.log('🔵 [adminService] Fetching all admissions...', { page, limit, status, dataOrigin });
    const response = await apiClient.get('/admin/admissions', {
      params: { page, limit, status, data_origin: dataOrigin },
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
    const canonicalId = toCanonicalAdmissionId(admissionId);
    console.log('✅ [adminService] Verifying admission:', canonicalId, data);
    const response = await apiClient.post(`/admin/admissions/${canonicalId}/verify`, data);
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
   * Request revision for an admission
   *
   * POST /api/v1/admin/admissions/:id/revision-required
   *
   * @param admissionId - Admission ID
   * @param reason - Revision reason/notes
   * @returns Promise resolving to updated admission
   */
  requestRevision: async (
    admissionId: string,
    reason: string
  ): Promise<ApiResponse<AdminAdmission>> => {
    const canonicalId = toCanonicalAdmissionId(admissionId);
    console.log('🟠 [adminService] Requesting revision:', canonicalId);
    const response = await apiClient.post(`/admin/admissions/${canonicalId}/revision-required`, {
      reason,
    });
    return response.data;
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
   * Manually trigger deadline reminders (admin only)
   * POST /api/v1/scheduler/reminder
   *
   * @param thresholdDays - Reminder thresholds in days (default: [7,3,1])
   * @returns Reminder dispatch summary
   */
  triggerDeadlineReminders: async (
    thresholdDays: number[] = [7, 3, 1],
    forceRun: boolean = false
  ): Promise<ApiResponse<{ targets: number; attempted: number; succeeded: number; failed: number; deduped?: number }>> => {
    const response = await apiClient.post('/scheduler/reminder', {
      threshold_days: thresholdDays,
      force_run: forceRun,
    });
    return response.data;
  },

  /**
   * Get scheduler health (admin only)
   * GET /api/v1/scheduler/health
   */
  getSchedulerHealth: async (): Promise<{ success: boolean; data: SchedulerHealthResult }> => {
    const response = await apiClient.get('/scheduler/health');
    return response.data;
  },

  /**
   * Get reminder delivery logs (admin only)
   * GET /api/v1/scheduler/reminder-logs
   */
  getReminderLogs: async (
    params?: { status?: 'sent' | 'failed' | 'deduped'; limit?: number }
  ): Promise<ReminderLogListResult> => {
    const response = await apiClient.get('/scheduler/reminder-logs', { params });
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

  /**
   * Create university representative from admin panel (Flow C)
   * POST /api/v1/admin/university-reps
   */
  createUniversityRep: async (
    payload: CreateUniversityRepPayload
  ): Promise<ApiResponse<CreateUniversityRepResult>> => {
    const response = await apiClient.post('/admin/university-reps', payload);
    return response.data;
  },

  /**
   * Get email delivery logs (admin only)
   * GET /api/v1/notifications/admin/email-logs
   */
  getEmailDeliveryLogs: async (
    params?: { status?: 'sent' | 'failed'; limit?: number }
  ): Promise<ApiResponse<EmailLogListResult>> => {
    const response = await apiClient.get('/notifications/admin/email-logs', {
      params,
    });
    return response.data;
  },

  /**
   * Replay email by log id (admin only)
   * POST /api/v1/notifications/admin/email-logs/:id/replay
   */
  replayEmailFromLog: async (logId: string): Promise<ApiResponse<EmailReplayResultByLog>> => {
    const response = await apiClient.post(`/notifications/admin/email-logs/${logId}/replay`);
    return response.data;
  },

  /**
   * Replay email by notification id (admin only)
   * POST /api/v1/notifications/admin/notifications/:id/replay-email
   */
  replayEmailByNotificationId: async (
    notificationId: string
  ): Promise<ApiResponse<EmailReplayResultByNotification>> => {
    const response = await apiClient.post(
      `/notifications/admin/notifications/${notificationId}/replay-email`
    );
    return response.data;
  },

  /**
   * Cleanup manual reminder test notifications (admin only)
   * DELETE /api/v1/notifications/admin/manual-test-cleanup
   */
  cleanupManualReminderTestNotifications: async (): Promise<ApiResponse<ManualReminderCleanupResult>> => {
    const response = await apiClient.delete('/notifications/admin/manual-test-cleanup');
    return response.data;
  },

  /**
   * Get email transport readiness (admin only)
   * GET /api/v1/notifications/admin/email-readiness
   */
  getEmailReadiness: async (): Promise<ApiResponse<{
    enabled: boolean;
    ready: boolean;
    lastVerifyAt: string | null;
    lastVerifyError: string | null;
  }>> => {
    const response = await apiClient.get('/notifications/admin/email-readiness');
    return response.data;
  },

  /**
   * Force email transport verification (admin only)
   * POST /api/v1/notifications/admin/email-readiness/verify
   */
  verifyEmailReadiness: async (): Promise<ApiResponse<{
    enabled: boolean;
    ready: boolean;
    lastVerifyAt: string | null;
    lastVerifyError: string | null;
  }>> => {
    const response = await apiClient.post('/notifications/admin/email-readiness/verify');
    return response.data;
  },

  /**
   * Process email retry backlog now (admin only)
   * POST /api/v1/notifications/admin/email-retries/process
   */
  processEmailRetries: async (params?: {
    limit?: number;
    max_failed_attempts?: number;
    min_age_seconds?: number;
    max_age_hours?: number;
  }): Promise<ApiResponse<{
    backlog: number;
    backlog_failed: number;
    backlog_unattempted: number;
    attempted: number;
    queued: number;
    attempted_unattempted: number;
    attempted_failed: number;
    skipped_permanent: number;
    blocked_by_readiness: boolean;
  }>> => {
    const response = await apiClient.post('/notifications/admin/email-retries/process', params || {});
    return response.data;
  },

  /**
   * Get email delivery metrics summary (admin only)
   * GET /api/v1/notifications/admin/email-metrics
   */
  getEmailMetrics: async (): Promise<ApiResponse<EmailMetricsResult>> => {
    const response = await apiClient.get('/notifications/admin/email-metrics');
    return response.data;
  },

  /**
   * Get scraper run summary cards (admin only)
   * GET /api/v1/admin/scraper/summary
   */
  getScraperRunSummary: async (): Promise<ApiResponse<ScraperRunSummary>> => {
    const response = await apiClient.get('/admin/scraper/summary');
    return response.data;
  },

  /**
   * Get paginated scraper runs (admin only)
   * GET /api/v1/admin/scraper/runs
   */
  getScraperRuns: async (
    page: number = 1,
    limit: number = 20,
    filters?: { status?: ScraperRunStatus; mode?: 'mirror' | 'publish' }
  ): Promise<PaginatedResponse<ScraperRunListItem>> => {
    const response = await apiClient.get('/admin/scraper/runs', {
      params: {
        page,
        limit,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.mode ? { mode: filters.mode } : {}),
      },
    });
    return response.data;
  },

  /**
   * Get scraper run detail and event log (admin only)
   * GET /api/v1/admin/scraper/runs/:id
   */
  getScraperRunDetail: async (runId: string): Promise<ApiResponse<ScraperRunDetail>> => {
    const response = await apiClient.get(`/admin/scraper/runs/${runId}`);
    return response.data;
  },

  /**
   * Trigger a manual scraper run replay from the latest ingestion snapshot (admin only)
   * POST /api/v1/admin/scraper/run-all
   */
  triggerScraperRunAll: async (forcePublish: boolean = false): Promise<ApiResponse<ScraperManualRunResult>> => {
    const response = await apiClient.post('/admin/scraper/run-all', {
      force_publish: forcePublish,
    });
    return response.data;
  },

  /**
   * Trigger rerun from a specific scraper run snapshot (admin only)
   * POST /api/v1/admin/scraper/runs/:id/rerun
   */
  rerunScraperRun: async (
    runId: string,
    forcePublish: boolean = false
  ): Promise<ApiResponse<ScraperManualRunResult>> => {
    const response = await apiClient.post(`/admin/scraper/runs/${runId}/rerun`, {
      force_publish: forcePublish,
    });
    return response.data;
  },
};
