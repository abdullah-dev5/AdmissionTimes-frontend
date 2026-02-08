/**
 * Student Utilities
 * 
 * Utility functions for student-specific data handling.
 * Similar to admissionUtils.ts but for student operations.
 * 
 * @module utils/studentUtils
 */

import type { Watchlist } from '../types/api';

/**
 * Convert watchlist API response to frontend format
 */
export function transformWatchlistToFrontend(
  watchlist: Watchlist,
  admission?: any
): any {
  return {
    id: watchlist.id,
    admissionId: watchlist.admission_id,
    createdAt: watchlist.created_at,
    updatedAt: watchlist.updated_at,
    alertEnabled: watchlist.alert_opt_in,
    notes: watchlist.notes,
    admission: admission || null,
  };
}

/**
 * Convert frontend watchlist to API format
 */
export function transformWatchlistToApi(
  admissionId: string,
  alertOptIn: boolean = false,
  notes?: string
) {
  return {
    admission_id: admissionId,
    alert_opt_in: alertOptIn,
    notes: notes || null,
  };
}

/**
 * Calculate deadline urgency level
 */
export function calculateDeadlineUrgency(daysRemaining: number): 'low' | 'medium' | 'high' | 'urgent' {
  if (daysRemaining < 0) return 'low';
  if (daysRemaining <= 3) return 'urgent';
  if (daysRemaining <= 7) return 'high';
  if (daysRemaining <= 14) return 'medium';
  return 'low';
}

/**
 * Format search filters for API
 */
export function buildSearchParams(filters: {
  search?: string;
  country?: string;
  city?: string;
  degreeLevel?: string;
  fieldOfStudy?: string;
  minFee?: number;
  maxFee?: number;
  deadline?: string;
  deliveryMode?: string;
  verificationStatus?: string;
  page?: number;
  limit?: number;
}) {
  const params: any = {};
  
  if (filters.search) params.search = filters.search;
  if (filters.degreeLevel) params.degree_level = filters.degreeLevel;
  if (filters.fieldOfStudy) params.field_of_study = filters.fieldOfStudy;
  if (filters.deliveryMode) params.delivery_mode = filters.deliveryMode;
  if (filters.verificationStatus) params.verification_status = filters.verificationStatus;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  
  return params;
}

/**
 * Extract city from location string
 * Examples: "Lahore, Pakistan" -> "Lahore"
 *           "New York, USA" -> "New York"
 */
export function extractCity(location: string): string {
  if (!location) return '';
  
  // Split by comma and take first part
  const parts = location.split(',');
  return parts[0].trim();
}

/**
 * Extract country from location string
 * Examples: "Lahore, Pakistan" -> "Pakistan"
 *           "New York, USA" -> "USA"
 */
export function extractCountry(location: string): string {
  if (!location) return '';
  
  // Split by comma and take last part
  const parts = location.split(',');
  return parts.length > 1 ? parts[parts.length - 1].trim() : '';
}

/**
 * Format currency amount with appropriate symbol
 */
export function formatCurrency(amount: number, currency: string = 'PKR'): string {
  const currencyMap: Record<string, string> = {
    PKR: 'en-PK',
    USD: 'en-US',
    EUR: 'en-EU',
    GBP: 'en-GB',
  };
  
  const locale = currencyMap[currency] || 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse JSONB requirements object
 */
export function parseRequirements(requirements: Record<string, any> | null) {
  if (!requirements) return undefined;
  
  return {
    gpa: requirements.gpa || requirements.minimum_gpa,
    testScore: requirements.test_score || requirements.ielts || requirements.toefl,
    documents: requirements.documents_required || requirements.documents,
    experience: requirements.work_experience,
    ...requirements
  };
}

/**
 * Filter admissions by multiple criteria
 */
export function filterAdmissions<T extends {
  university?: string;
  city?: string;
  degreeType?: string;
  feeNumeric?: number;
  deadline?: string;
  program?: string;
  degree?: string;
  status?: string;
}>(
  admissions: T[],
  filters: {
    search?: string;
    university?: string;
    city?: string;
    degreeType?: string;
    minFee?: number;
    maxFee?: number;
    deadline?: string;
    programTitle?: string;
    selectedStatus?: string[];
  }
): T[] {
  let filtered = [...admissions];

  // Search query
  if (filters.search?.trim()) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(a =>
      a.university?.toLowerCase().includes(query) ||
      a.program?.toLowerCase().includes(query) ||
      a.degree?.toLowerCase().includes(query)
    );
  }

  // University filter
  if (filters.university) {
    filtered = filtered.filter(a => a.university === filters.university);
  }

  // City filter
  if (filters.city) {
    filtered = filtered.filter(a => a.city === filters.city);
  }

  // Degree filter
  if (filters.degreeType) {
    filtered = filtered.filter(a => a.degreeType === filters.degreeType);
  }

  // Fee range filter
  if (filters.minFee !== undefined && filters.maxFee !== undefined) {
    filtered = filtered.filter(a => 
      a.feeNumeric !== undefined && 
      a.feeNumeric >= filters.minFee! && 
      a.feeNumeric <= filters.maxFee!
    );
  }

  // Deadline filter
  if (filters.deadline) {
    filtered = filtered.filter(a => a.deadline && a.deadline <= filters.deadline!);
  }

  // Program title filter
  if (filters.programTitle?.trim()) {
    const query = filters.programTitle.toLowerCase();
    filtered = filtered.filter(a => a.program?.toLowerCase().includes(query));
  }

  // Status filter
  if (filters.selectedStatus && filters.selectedStatus.length > 0) {
    filtered = filtered.filter(a => a.status && filters.selectedStatus!.includes(a.status));
  }

  return filtered;
}

/**
 * Sort admissions by various criteria
 */
export function sortAdmissions<T extends {
  deadline?: string;
  feeNumeric?: number;
  matchNumeric?: number;
}>(
  admissions: T[],
  sortBy: 'Deadline' | 'Fee (Low to High)' | 'Fee (High to Low)' | 'Relevance'
): T[] {
  const sorted = [...admissions];

  if (sortBy === 'Deadline') {
    sorted.sort((a, b) => {
      if (!a.deadline || !b.deadline) return 0;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  } else if (sortBy === 'Fee (Low to High)') {
    sorted.sort((a, b) => (a.feeNumeric || 0) - (b.feeNumeric || 0));
  } else if (sortBy === 'Fee (High to Low)') {
    sorted.sort((a, b) => (b.feeNumeric || 0) - (a.feeNumeric || 0));
  } else if (sortBy === 'Relevance') {
    sorted.sort((a, b) => (b.matchNumeric || 0) - (a.matchNumeric || 0));
  }

  return sorted;
}
