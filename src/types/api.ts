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
  verification_status: 'verified' | 'pending' | 'rejected' | 'draft' | 'disputed';
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
  dispute_reason?: string | null;
  
  // CONTEXT: Auto-set by system
  created_by?: string | null;
  university_id?: string | null;
  is_active?: boolean;
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

/**
 * Notification entity
 * Represents a user notification
 */
export interface Notification {
  id: string;
  user_id: string | null;
  user_type: 'student' | 'university' | 'admin' | 'all';
  category: 'verification' | 'deadline' | 'system' | 'update';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
}

/**
 * Deadline entity
 * Represents a deadline for a specific admission program
 */
export interface Deadline {
  id: string;
  admission_id: string;
  user_id: string;
  deadline: string; // ISO 8601 format
  days_remaining: number;
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
}

/**
 * Watchlist entity
 * Represents a saved/favorited admission program
 */
export interface Watchlist {
  id: string;
  user_id: string;
  admission_id: string;
  saved_at: string;
  alert_opt_in: boolean;
  notes: string | null;
}

/**
 * User entity
 * Represents a system user
 */
export interface User {
  id: string;
  email: string;
  display_name?: string;  // User's display name
  role: 'student' | 'university' | 'admin';  // Changed from user_type to role
  user_type?: 'student' | 'university' | 'admin';  // Keep as optional for backward compatibility
  organization_id?: string | null;  // For university users - maps to universities.id
  university_id?: string | null;  // Backward compatibility
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
  notification_preferences: {
    email: boolean;
    push: boolean;
    deadline_alerts: boolean;
  };
  display_preferences: {
    theme: 'light' | 'dark';
    language: string;
  };
  search_preferences: {
    default_filters: Record<string, any>;
  };
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
  changed_by: string | null;
  change_type: 'created' | 'updated' | 'deleted' | 'verified' | 'rejected';
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
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
  };  recent_admissions: Array<Admission & {
    degree_level?: string;
    field_of_study?: string;
  }>;  pending_verifications: Array<Admission & {
    verification_requested_at: string;
    verification_notes: string | null;
  }>;
  recent_changes: ChangeLog[];
  recent_notifications: Notification[];
}

/**
 * Admin Dashboard Response
 * Aggregated data for admin dashboard
 */
export interface AdminDashboard {
  stats: {
    total_users: number;
    total_admissions: number;
    pending_verifications: number;
    total_notifications_sent: number;
  };
  pending_verifications: Array<Admission & {
    university_name: string;
    verification_requested_at: string;
  }>;
  recent_activity: Activity[];
  system_metrics: {
    scraper_jobs_today: number;
    successful_scrapes: number;
    failed_scrapes: number;
  };
}
