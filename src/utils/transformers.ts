/**
 * Data Transformers
 * 
 * Utility functions to transform backend API data to frontend format.
 * These functions ensure data consistency and handle format conversions
 * between backend (database schema) and frontend (UI components).
 * 
 * @module utils/transformers
 */

import type { Admission, Watchlist, Notification } from '../types/api';
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
  return {
    id: backend.id,
    university: universityName || backend.university_id || 'Unknown',
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
    programStatus: calculateProgramStatus(backend.deadline),
    updated: formatRelativeTime(backend.updated_at),
    daysRemaining: calculateDaysRemaining(backend.deadline),
    saved: !!watchlist,
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
