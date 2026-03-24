/**
 * Data Transformers
 * 
 * Utility functions to transform backend API data to frontend format.
 * These functions ensure data consistency and handle format conversions
 * between backend (database schema) and frontend (UI components).
 * 
 * @module utils/transformers
 */

import type { Admission, Watchlist, Notification, Deadline, DeadlineType } from '../types/api';
import type { StudentAdmission, StudentNotification } from '../data/studentData';

/**
 * Transform backend admission to frontend StudentAdmission format
 * 
 * @param backend - Backend admission data (may include match_score and match_reason)
 * @param watchlist - Optional watchlist item for this admission
 * @param universityName - Optional university name (if not in admission)
 * @returns Transformed StudentAdmission object
 */
export function transformAdmission(
  backend: Admission & { match_score?: number; match_reason?: string },
  watchlist?: Watchlist,
  universityName?: string
): StudentAdmission {
  const backendAny = backend as any;
  const rawVerificationStatus =
    backend.verification_status ||
    backendAny.verification_status ||
    backendAny.status ||
    undefined;
  const uuidLikePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const fallbackUniversityId = backend.university_id || backendAny.university_id;
  const safeUniversityFallback =
    fallbackUniversityId && !uuidLikePattern.test(String(fallbackUniversityId))
      ? String(fallbackUniversityId)
      : 'University';

  // Get university name from different sources (in order of preference)
  const finalUniversityName = 
    universityName ||
    backendAny.university_name ||
    (backend.universities?.name) ||
    safeUniversityFallback;

  // Get program title from supported response shapes
  const finalProgramTitle =
    backend.title ||
    backendAny.program_title ||
    'Untitled Program';
  
  // Debug logging for watchlist data
  if (watchlist) {
    console.log('🔄 [transformAdmission] Watchlist data for', backend.id, ':', {
      watchlistId: watchlist.id,
      alert_opt_in: watchlist.alert_opt_in,
    });
  }
  
  // Map match score to match label and numeric value
  const matchScore = backend.match_score || 0;
  const matchLabel = getMatchLabel(matchScore);
  
  return {
    id: backend.id,
    university: finalUniversityName,
    universityLogo: backend.universities?.logo_url || backendAny.university_logo_url || undefined,  // University logo URL
    universityCity: backend.universities?.city || backendAny.university_city || undefined,      // University city
    universityCountry: backend.universities?.country || backendAny.university_country || undefined, // University country
    program: finalProgramTitle,
    degree: backend.degree_level || backendAny.degree || 'Degree Not Specified',
    degreeType: mapDegreeType(backend.degree_level || backendAny.degree),
    deadline: backend.deadline,
    deadlineDisplay: formatDate(backend.deadline),
    fee: formatCurrency(backend.application_fee),
    feeNumeric: backend.application_fee,
    location: backend.location,
    city: extractCity(backend.location),
    status: mapVerificationStatus(rawVerificationStatus),
    verificationStatus: mapRawVerificationStatus(rawVerificationStatus),
    programStatus: calculateProgramStatus(backend.deadline),
    updated: formatRelativeTime(backend.updated_at),
    daysRemaining: calculateDaysRemaining(backend.deadline),
    match: matchLabel,
    matchNumeric: matchScore,
    saved: !!watchlist,
    watchlistId: watchlist?.id,  // Store watchlist ID for delete operations
    alertEnabled: watchlist?.alert_opt_in || false,
    aiSummary: backend.match_reason || backend.description || undefined,
    logoBg: '#1F2937', // Default logo background color
  };
}

/**
 * Transform backend notification to frontend StudentNotification format
 * 
 * @param backend - Backend notification data
 * @returns Transformed StudentNotification object
 */
export function transformNotification(backend: Notification): StudentNotification {
  return {
    id: backend.id,
    type: mapNotificationType(backend.notification_type),
    title: backend.title,
    description: backend.message,
    time: backend.created_at,
    timeAgo: formatRelativeTime(backend.created_at),
    read: backend.is_read,
    icon: getNotificationIcon(backend.notification_type),
    iconColor: getNotificationColor(backend.priority),
    admissionId: backend.related_entity_id || undefined,
  };
}

/**
 * Map backend verification status to frontend status
 */
function mapVerificationStatus(
  status: string | null | undefined
): 'Verified' | 'Pending' | 'Updated' | 'Closed' {
  if (!status) {
    return 'Pending'; // Default to Pending if not provided
  }
  const map: Record<string, 'Verified' | 'Pending' | 'Updated' | 'Closed'> = {
    verified: 'Verified',
    pending: 'Pending',
    rejected: 'Closed',
  };
  return map[status.toLowerCase()] || 'Pending';
}

/**
 * Map backend verification status to frontend enum values
 */
function mapRawVerificationStatus(
  status: string | undefined
): 'verified' | 'pending' | 'rejected' | 'under_review' {
  const map: Record<string, 'verified' | 'pending' | 'rejected' | 'under_review'> = {
    verified: 'verified',
    pending: 'pending',
    rejected: 'rejected',
    draft: 'pending',  // Map draft to pending
    under_review: 'under_review',
  };
  // Default to 'rejected' for unknown statuses (safer - hides from students)
  return map[(status || '').toLowerCase()] || 'rejected';
}

/**
 * Calculate program status based on deadline
 */
function calculateProgramStatus(deadline: string | null | undefined): 'Open' | 'Closing Soon' | 'Closed' {
  if (!deadline) {
    return 'Closed'; // Default to Closed if no deadline
  }
  const daysRemaining = calculateDaysRemaining(deadline);
  if (daysRemaining < 0) return 'Closed';
  if (daysRemaining <= 7) return 'Closing Soon';
  return 'Open';
}

/**
 * Get match label from numeric score (0-100)
 */
function getMatchLabel(score: number): string {
  if (score >= 90) return 'Excellent Match';
  if (score >= 80) return 'High Match';
  if (score >= 70) return 'Good Match';
  if (score >= 60) return 'Fair Match';
  if (score >= 50) return 'Match';
  return '';
}

/**
 * Calculate days remaining until deadline
 */
function calculateDaysRemaining(deadline: string | null | undefined): number {
  if (!deadline) {
    return -1; // Return -1 (past) if no deadline
  }
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format date to human-readable string
 */
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'No deadline'; // Default if no date provided
  }
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date to relative time string (e.g., "2 days ago")
 */
function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'Never'; // Default if no date provided
  }
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number | null | undefined): string {
  if (!amount) {
    return 'Not specified'; // Default if no amount provided
  }
  // For now, assume PKR currency
  // Can be enhanced to support multiple currencies
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Extract city from location string
 */
function extractCity(location: string | null | undefined): string {
  if (!location) {
    return 'Unknown Location';
  }
  const parts = location.split(',');
  return parts[parts.length - 2]?.trim() || location;
}

/**
 * Map degree level to frontend degree type
 */
function mapDegreeType(degreeLevel: string | null | undefined): 'BS' | 'MS' | 'PhD' | 'MBA' | 'BBA' | 'MD' | 'MPhil' {
  if (!degreeLevel) {
    return 'BS'; // Default to Bachelor of Science if not provided
  }
  const lower = degreeLevel.toLowerCase();
  const map: Record<string, 'BS' | 'MS' | 'PhD' | 'MBA' | 'BBA' | 'MD' | 'MPhil'> = {
    bachelor: 'BS',
    'bachelor of science': 'BS',
    'bachelor of arts': 'BS',
    master: 'MS',
    'master of science': 'MS',
    'master of arts': 'MS',
    phd: 'PhD',
    doctorate: 'PhD',
    mba: 'MBA',
    'master of business administration': 'MBA',
    bba: 'BBA',
    'bachelor of business administration': 'BBA',
    md: 'MD',
    'doctor of medicine': 'MD',
    mphil: 'MPhil',
    'master of philosophy': 'MPhil',
  };
  return map[lower] || 'BS';
}

/**
 * Map notification category to frontend type
 */
function mapNotificationType(
  notificationType: string | null | undefined
): 'alert' | 'system' | 'admission' {
  if (!notificationType) {
    return 'system'; // Default to system if not provided
  }
  const map: Record<string, 'alert' | 'system' | 'admission'> = {
    deadline_near: 'alert',
    admission_submitted: 'admission',
    admission_resubmitted: 'admission',
    admission_verified: 'admission',
    admission_rejected: 'admission',
    admission_revision_required: 'admission',
    admission_updated_saved: 'admission',
    system_broadcast: 'system',
    system_error: 'system',
  };
  return map[notificationType.toLowerCase()] || 'system';
}

/**
 * Get notification icon based on category
 * Returns SVG path data for rendering in notification icons
 */
function getNotificationIcon(notificationType: string | null | undefined): string {
  if (!notificationType) {
    return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'; // Default bell icon
  }
  const map: Record<string, string> = {
    // Deadline near - clock icon
    deadline_near: 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z',
    // Admission submitted - inbox icon
    admission_submitted: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
    // Admission resubmitted - refresh icon
    admission_resubmitted: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    // Admission verified - check circle icon
    admission_verified: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    // Admission rejected - x circle icon
    admission_rejected: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    // Admission revision required - pencil icon
    admission_revision_required: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    // Admission updated - speaker icon
    admission_updated_saved: 'M11 5.882V19.24a1.961 1.961 0 01-1.936-1.954V5.882m0 0a1.961 1.961 0 011.936-1.954h6.128a1.961 1.961 0 011.936 1.954m0 0A1.966 1.966 0 0120 5.882v12.358A1.966 1.966 0 0118.128 20H6.128A1.966 1.966 0 014 18.24V5.882m16 0A1.966 1.966 0 0019.964 3.88V1.96a1.961 1.961 0 00-1.936-1.954h-6.128a1.961 1.961 0 00-1.936 1.954v1.92m0 0A1.966 1.966 0 004 5.882',
    // System broadcast - speaker volume icon
    system_broadcast: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728m-.9-1.425a7 7 0 010-9.9m1.31-2.567a11 11 0 010 15.456M3.05 11a7 7 0 009.9 0M5.555 7.555A11 11 0 0015.455 17m-2.333-2.333A7 7 0 005.888 7.888',
    // System error - x icon
    system_error: 'M6 18L18 6M6 6l12 12',
  };
  return map[notificationType.toLowerCase()] || 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9';
}

/**
 * Get notification color based on priority
 */
function getNotificationColor(priority: string | null | undefined): string {
  if (!priority) {
    return 'text-gray-600'; // Default color if not provided
  }
  const map: Record<string, string> = {
    urgent: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600',
    low: 'text-blue-600',
  };
  return map[priority.toLowerCase()] || 'text-gray-600';
}

/**
 * Transform backend watchlist to frontend format
 * 
 * @param backend - Backend watchlist data
 * @param admission - Optional admission details for this watchlist item
 * @returns Transformed watchlist object with frontend naming conventions
 */
export function transformWatchlist(
  backend: Watchlist,
  admission?: any
): any {
  return {
    id: backend.id,
    admissionId: backend.admission_id,
    userId: backend.user_id,
    notes: backend.notes,
    savedAt: backend.created_at,      // Map created_at to savedAt for display
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
    alertEnabled: backend.alert_opt_in,
    admission: admission || null,
  };
}

/**
 * Transform backend deadline to frontend format
 * 
 * @param backend - Backend deadline data
 * @returns Transformed deadline object with calculated fields
 */
export function transformDeadline(backend: Deadline): any {
  const daysRemaining = calculateDaysRemainingFromDate(backend.deadline_date);
  const urgencyLevel = calculateDeadlineUrgency(daysRemaining);
  
  return {
    id: backend.id,
    admissionId: backend.admission_id,
    deadlineType: backend.deadline_type,
    deadlineDate: backend.deadline_date,
    timezone: backend.timezone,
    isFlexible: backend.is_flexible,
    reminderSent: backend.reminder_sent,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
    
    // Computed fields
    daysRemaining,
    urgencyLevel,
    
    // For backward compatibility with existing code
    deadline: backend.deadline_date,
  };
}

/**
 * Calculate days remaining until a deadline
 * 
 * @param deadlineDate - ISO 8601 deadline date string
 * @returns Number of days remaining (negative if past deadline)
 */
export function calculateDaysRemainingFromDate(deadlineDate: string): number {
  const now = new Date();
  const deadline = new Date(deadlineDate);
  const diffTime = deadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate urgency level based on days remaining
 * 
 * @param daysRemaining - Number of days until deadline
 * @returns Urgency level classification
 */
export function calculateDeadlineUrgency(
  daysRemaining: number
): 'low' | 'medium' | 'high' | 'urgent' {
  if (daysRemaining < 0) return 'low';      // Past deadline
  if (daysRemaining <= 3) return 'urgent';  // Within 3 days
  if (daysRemaining <= 7) return 'high';    // Within a week
  if (daysRemaining <= 14) return 'medium'; // Within 2 weeks
  return 'low';                             // More than 2 weeks
}

/**
 * Format deadline type for display
 * 
 * @param deadlineType - Deadline type enum value
 * @returns Human-readable deadline type label
 */
export function formatDeadlineType(deadlineType: DeadlineType): string {
  const map: Record<DeadlineType, string> = {
    application: 'Application Deadline',
    decision: 'Decision Date',
    enrollment: 'Enrollment Deadline',
    document: 'Document Submission',
    interview: 'Interview Deadline',
    payment: 'Payment Deadline',
    orientation: 'Orientation Date',
  };
  return map[deadlineType] || deadlineType;
}
