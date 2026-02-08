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
 * @param backend - Backend admission data
 * @param watchlist - Optional watchlist item for this admission
 * @param universityName - Optional university name (if not in admission)
 * @returns Transformed StudentAdmission object
 */
export function transformAdmission(
  backend: Admission,
  watchlist?: Watchlist,
  universityName?: string
): StudentAdmission {
  // Get university name from different sources (in order of preference)
  const finalUniversityName = 
    universityName ||
    (backend.universities?.name) ||
    backend.university_id || 
    'Unknown';
  
  // Debug logging for watchlist data
  if (watchlist) {
    console.log('🔄 [transformAdmission] Watchlist data for', backend.id, ':', {
      watchlistId: watchlist.id,
      alert_opt_in: watchlist.alert_opt_in,
    });
  }
  
  return {
    id: backend.id,
    university: finalUniversityName,
    universityLogo: backend.universities?.logo_url || undefined,  // University logo URL
    universityCity: backend.universities?.city || undefined,      // University city
    universityCountry: backend.universities?.country || undefined, // University country
    program: backend.title,
    degree: backend.degree_level,
    degreeType: mapDegreeType(backend.degree_level),
    deadline: backend.deadline,
    deadlineDisplay: formatDate(backend.deadline),
    fee: formatCurrency(backend.application_fee),
    feeNumeric: backend.application_fee,
    location: backend.location,
    city: extractCity(backend.location),
    status: mapVerificationStatus(backend.verification_status),
    verificationStatus: mapRawVerificationStatus(backend.verification_status),
    programStatus: calculateProgramStatus(backend.deadline),
    updated: formatRelativeTime(backend.updated_at),
    daysRemaining: calculateDaysRemaining(backend.deadline),
    saved: !!watchlist,
    watchlistId: watchlist?.id,  // Store watchlist ID for delete operations
    alertEnabled: watchlist?.alert_opt_in || false,
    aiSummary: backend.description || undefined,
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
    type: mapNotificationType(backend.category),
    title: backend.title,
    description: backend.message,
    time: backend.created_at,
    timeAgo: formatRelativeTime(backend.created_at),
    read: backend.is_read,
    icon: getNotificationIcon(backend.category),
    iconColor: getNotificationColor(backend.priority),
    admissionId: backend.related_entity_id || undefined,
  };
}

/**
 * Map backend verification status to frontend status
 */
function mapVerificationStatus(
  status: string
): 'Verified' | 'Pending' | 'Updated' | 'Closed' {
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
    disputed: 'under_review',  // Map disputed to under_review
    under_review: 'under_review',
  };
  return map[(status || '').toLowerCase()] || 'pending';
}

/**
 * Calculate program status based on deadline
 */
function calculateProgramStatus(deadline: string): 'Open' | 'Closing Soon' | 'Closed' {
  const daysRemaining = calculateDaysRemaining(deadline);
  if (daysRemaining < 0) return 'Closed';
  if (daysRemaining <= 7) return 'Closing Soon';
  return 'Open';
}

/**
 * Calculate days remaining until deadline
 */
function calculateDaysRemaining(deadline: string): number {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format date to human-readable string
 */
function formatDate(dateString: string): string {
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
function formatRelativeTime(dateString: string): string {
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
function formatCurrency(amount: number): string {
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
function extractCity(location: string): string {
  const parts = location.split(',');
  return parts[parts.length - 2]?.trim() || location;
}

/**
 * Map degree level to frontend degree type
 */
function mapDegreeType(degreeLevel: string): 'BS' | 'MS' | 'PhD' | 'MBA' | 'BBA' | 'MD' | 'MPhil' {
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
  category: string
): 'alert' | 'system' | 'admission' {
  const map: Record<string, 'alert' | 'system' | 'admission'> = {
    deadline: 'alert',
    verification: 'admission',
    system: 'system',
    update: 'admission',
  };
  return map[category.toLowerCase()] || 'system';
}

/**
 * Get notification icon based on category
 */
function getNotificationIcon(category: string): string {
  const map: Record<string, string> = {
    deadline: '⏰',
    verification: '✅',
    system: '🔔',
    update: '📢',
  };
  return map[category.toLowerCase()] || '🔔';
}

/**
 * Get notification color based on priority
 */
function getNotificationColor(priority: string): string {
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
