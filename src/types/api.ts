/**
 * API Type Definitions
 * 
 * This module contains all TypeScript type definitions that match
 * the backend API response structures. These types ensure type safety
 * when working with API responses throughout the application.
 * 
 * All types are based on the backend database schema and API specifications.
 * 
 * @module types/api
 */

/**
 * Base API response structure
 * All successful API responses follow this format
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Paginated API response structure
 * Used for list endpoints that support pagination
 */
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

/**
 * Admission/Program entity
 * Represents a university admission program
 * 
 * FIELD REQUIREMENTS:
 * - REQUIRED (user must provide): title
 * - OPTIONAL (user may provide): all others except auto-set fields
 * - AUTO-SET (system provides): id, verification_status, created_at, updated_at, is_active
 * 
 * Maps to database admissions table with 25 fields total
 */
export interface Admission {
  // Auto-set by backend (never ask user to provide)
  id: string;
  verification_status: 'verified' | 'pending' | 'rejected' | 'draft';
  created_at: string;
  updated_at: string;
  
  // REQUIRED: User must provide
  title: string;
  
  // OPTIONAL: User may provide (all nullable)
  description?: string | null;
  program_type?: string | null;
  degree_level?: string | null;
  field_of_study?: string | null;
  duration?: string | null;
  delivery_mode?: string | null;
  location?: string | null;
  requirements?: Record<string, any> | null;
  application_fee?: number | null;
  tuition_fee?: number | null;
  currency?: string | null;
  deadline?: string | null;
  start_date?: string | null;
  website_url?: string | null;
  admission_portal_link?: string | null;
  
  // ADMIN-ONLY: Never ask user to set these (admins only)
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_reason?: string | null;
  verification_comments?: string | null;
  admin_notes?: string | null;
  
  // AUTO-TRACKING: System-managed fields for status transitions
  needs_reverification?: boolean | null;
  updated_by?: string | null;
  
  // CONTEXT: Auto-set by system
  created_by?: string | null;
  university_id?: string | null;
  is_active?: boolean;
  
  // RELATIONSHIPS: Populated when joining with other tables
  universities?: University | null;  // Populated from university_id join
}

/**
 * University entity
 * Represents a university/institution
 */
export interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  website: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiChatResponse {
  intent: 'search_admissions' | 'clarification' | 'unsupported';
  extracted_filters: {
    search?: string;
    degree_level?: string;
    field_of_study?: string;
    location?: string;
    program_type?: string;
    delivery_mode?: string;
    deadline_within_days?: number;
  };
  clarification_needed: boolean;
  clarification_question?: string;
  answer: string;
  result_count: number;
  results: Array<{
    id: string;
    title: string;
    degree_level: string | null;
    location: string | null;
    deadline: string | null;
    verification_status: string;
    university_id: string | null;
  }>;
}

export interface AiSummarizeResponse {
  title?: string | null;
  degree_level?: string | null;
  location?: string | null;
  application_fee?: number | null;
  deadline?: string | null;
  description?: string | null;
  eligibility?: string | null;
  summary_text: string;
  highlights: string[];
  extracted_fields: string[];
  confidence: number;
  provider: 'gemini' | 'regex';
  model?: string;
  method: 'ai' | 'fallback';
}

export interface ParsedPdfData {
  title: string;
  degree_level: string;
  deadline: string;
  application_fee: number;
  location: string;
  description: string;
  eligibility?: string | null;
  summary_text?: string;
  highlights?: string[];
  provider?: 'gemini' | 'regex';
  model?: string;
  method?: 'ai' | 'fallback';
  confidence: number;
  extracted_fields: string[];
}
/**
 * Notification entity
 * Represents a user notification
 */
export interface Notification {
  id: string;
  recipient_id: string;
  role_type: 'student' | 'university' | 'admin' | 'maintenance';
  notification_type:
    | 'admission_submitted'
    | 'admission_resubmitted'
    | 'admission_verified'
    | 'admission_rejected'
    | 'admission_revision_required'
    | 'admission_updated_saved'
    | 'deadline_near'
    | 'system_broadcast'
    | 'system_error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  event_key: string;
  created_at: string;
}

/**
 * Deadline Type Enum
 * Types of deadlines in the admission process
 */
export type DeadlineType = 
  | 'application'    // Application submission deadline
  | 'decision'       // Decision notification date
  | 'enrollment'     // Enrollment confirmation deadline
  | 'document'       // Document submission deadline
  | 'interview'      // Interview scheduling deadline
  | 'payment'        // Fee payment deadline
  | 'orientation';   // Orientation date

/**
 * Deadline entity
 * Represents a deadline for a specific admission program
 * 
 * NOTE: Deadlines are linked to admissions, not directly to users.
 * To get user deadlines, join through watchlists:
 * User → Watchlists → Admissions → Deadlines
 */
export interface Deadline {
  id: string;
  admission_id: string;
  deadline_type: DeadlineType;      // Type of deadline (application, decision, etc.)
  deadline_date: string;            // ISO 8601 format - actual deadline timestamp
  timezone: string;                 // Timezone for deadline (default: "UTC")
  is_flexible: boolean;             // Whether deadline can be extended
  reminder_sent: boolean;           // Whether reminder notification was sent
  created_at: string;
  updated_at: string;
  
  // Optional: Computed fields (not in database, calculated on frontend)
  days_remaining?: number;          // Calculated from deadline_date
  urgency_level?: 'low' | 'medium' | 'high' | 'urgent';  // Calculated
}

/**
 * Watchlist entity
 * Represents a saved/favorited admission program
 * 
 * NOTE: Unique constraint on (user_id, admission_id) - user can only save each admission once
 */
export interface Watchlist {
  id: string;
  user_id: string;
  admission_id: string;
  notes: string | null;
  created_at: string;               // When item was added to watchlist
  updated_at: string;               // Last modification time
  alert_opt_in: boolean;            // Whether user wants deadline reminders
}

/**
 * User entity
 * Represents a system user
 */
export interface User {
  id: string;
  email: string;
  display_name?: string;  // User's display name
  role: 'student' | 'university' | 'admin' | 'maintenance';  // Changed from user_type to role
  user_type?: 'student' | 'university' | 'admin' | 'maintenance';  // Keep as optional for backward compatibility
  university_id?: string | null;  // For university users - maps to universities.id
  created_at: string;
  updated_at: string;
}

/**
 * Student Profile entity
 * Extended user information for students
 */
export interface StudentProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  country: string | null;
  city: string | null;
  academic_background: Record<string, any> | null;
  preferences: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

/**
 * University Profile entity
 * University profile details stored in universities table
 */
export interface UniversityProfile {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  address: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User Preferences entity
 * User-specific preferences and settings
 */
export interface UserPreferences {
  id: string;
  user_id: string;
  email_notifications_enabled: boolean;
  email_frequency: 'immediate'; // Only immediate delivery supported, use email_notifications_enabled for on/off
  push_notifications_enabled: boolean;
  notification_categories: {
    system: boolean;
    update: boolean;
    deadline: boolean;
    verification: boolean;
  };
  language: 'en' | 'ar' | 'fr' | 'es';
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  created_at: string;
  updated_at: string;
}

/**
 * Change Log entity
 * Represents a change/update to an admission program
 */
export interface ChangeLog {
  id: string;
  admission_id: string;
  actor_type: 'admin' | 'university' | 'system';
  changed_by: string | null;
  action_type: 'created' | 'updated' | 'verified' | 'rejected' | 'status_changed';
  field_name: string | null;
  old_value: any | null;
  new_value: any | null;
  diff_summary?: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
}

/**
 * Activity entity
 * Represents user activity/events
 */
export interface Activity {
  id: string;
  user_id: string;
  type: 'notification' | 'saved' | 'alert' | 'deadline' | 'view' | 'search';
  action: string;
  related_entity_id: string | null;
  related_entity_type: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

/**
 * Student Dashboard Response
 * Aggregated data for student dashboard
 */
export interface StudentDashboard {
  stats: {
    active_admissions: number;
    saved_count: number;
    upcoming_deadlines: number;
    recommendations_count: number;
    unread_notifications: number;
    urgent_deadlines: number;
  };
  recommended_programs: Array<Admission & {
    university_name: string;
    match_score?: number;
    match_reason?: string;
    saved: boolean;
    alert_enabled: boolean;
  }>;
  upcoming_deadlines: Array<Deadline & {
    university_name: string;
    program_title: string;
    saved: boolean;
    alert_enabled: boolean;
  }>;
  recent_notifications: Notification[];
  recent_activity: Array<{
    type: 'notification' | 'saved' | 'alert' | 'deadline';
    action: string;
    timestamp: string;
    related_entity_id?: string;
    related_entity_type?: string;
  }>;
}

/**
 * University Dashboard Response
 * Aggregated data for university dashboard
 */
export interface UniversityDashboard {
  stats: {
    total_admissions: number;
    pending_verification: number;
    verified_admissions: number;
    recent_changes: number;
    unread_notifications: number;
    reminder_notifications?: number;
    saved_admissions?: number;
  };  recent_admissions: Array<Admission & {
    degree_level?: string;
    field_of_study?: string;
  }>;  pending_verifications: Array<Admission & {
    verification_requested_at: string;
    verification_notes: string | null;
  }>;
  recent_changes: ChangeLog[];
  recent_notifications: Notification[];
  engagement_trends?: {
    labels: string[];
    views: number[];
    clicks: number[];
    reminders: number[];
    saves?: number[];
  };
}

/**
 * Admin Dashboard Response
 * Aggregated data for admin dashboard with real backend structure
 */
export interface AdminDashboard {
  stats: AdminDashboardStats;
  recent_actions: AdminAuditLog[];
  pending_admissions: AdminAdmission[];
  reminder_coverage?: {
    look_ahead_days: number;
    total_targets_next_7_days: number;
    total_due_now: number;
    total_sent_now: number;
    total_missing_now: number;
    by_threshold: Array<{
      threshold_day: 7 | 3 | 1;
      due_targets: number;
      sent_targets: number;
      missing_targets: number;
    }>;
    generated_at: string;
  };
}

/**
 * Admin Dashboard Statistics
 */
export interface AdminDashboardStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

/**
 * Admin Admission Type
 * Extended Admission type with admin-specific fields
 */
export interface AdminAdmission extends Admission {
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_reason?: string | null;
  admin_notes?: string | null;
  verification_comments?: string | null;
}

/**
 * Admin Audit Log Type
 * Tracks all admin actions on admissions
 */
export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  reason?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_by?: string;
  created_at: string;
}

/**
 * Admin Verify Request DTO
 */
export interface AdminVerifyAdmissionDTO {
  verification_status: 'verified' | 'rejected';
  rejection_reason?: string | null;
  admin_notes?: string | null;
  verification_comments?: string | null;
}

/**
 * Admin Bulk Verify Request DTO
 */
export interface AdminBulkVerifyDTO {
  admission_ids: string[];
  verification_status: 'verified' | 'rejected';
  rejection_reason?: string | null;
  admin_notes?: string | null;
}

