/**
 * Admission Utilities
 * 
 * Helper functions for admission data manipulation and validation
 * 
 * @module utils/admissionUtils
 */

import type { Admission } from '../data/universityData'
import type { Admission as ApiAdmission } from '../types/api'

/**
 * Ensure admission object has all required fields with defaults
 * Prevents errors when some fields are missing from API responses
 * 
 * @param admission - Partial admission object
 * @returns Admission with all fields populated (using defaults where needed)
 */
export function sanitizeAdmission(admission: Partial<Admission>): Admission {
  return {
    id: admission.id || `adm-${Date.now()}`,
    title: admission.title || 'Unknown Program',
    deadline: admission.deadline || new Date().toISOString(),
    status: admission.status || 'Pending Audit' as const,
    views: admission.views || '0',
    verifiedBy: admission.verifiedBy || undefined,
    lastAction: admission.lastAction || new Date().toISOString(),
    remarks: admission.remarks || '',
    degreeType: admission.degreeType || '',
    department: admission.department || '',
    academicYear: admission.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    fee: admission.fee || '0',
    overview: admission.overview || '',
    eligibility: admission.eligibility || '',
    websiteUrl: admission.websiteUrl || '',
    admissionPortalLink: admission.admissionPortalLink || '',
  }
}

/**
 * Format date from ISO format to yyyy-MM-dd for HTML date input
 * Handles formats like: 2026-07-30, 2026-07-30 23:59:59, 2026-07-30 23:59:59+00
 * 
 * @param dateString - ISO or custom format date string
 * @returns Formatted date string (yyyy-MM-dd) or empty string if invalid
 */
export function formatDateForInput(dateString: string | undefined): string {
  if (!dateString) return ''
  // Extract just the date part (yyyy-MM-dd) from ISO format
  const match = dateString.match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ''
}

/**
 * Transform frontend Admission format to backend API format
 * Maps all 25 frontend fields to backend database fields
 * 
 * NOTE: verification_status is included if present in the payload
 * Backend also handles status transitions automatically:
 * - New admissions start as 'draft' by default
 * - Editing verified admissions automatically moves to 'pending'
 * - Pending admissions are editable (university can make changes)
 * 
 * @param frontendAdmission - Admission in frontend format
 * @param universityId - University ID (required for backend)
 * @returns Admission in backend API format
 */
export function transformAdmissionToApi(
  frontendAdmission: Admission,
  universityId: string
): Partial<ApiAdmission> {
  const payload: Partial<ApiAdmission> = {
    // Core identifiers
    university_id: universityId,
    title: frontendAdmission.title,
    
    // Program classification
    degree_level: frontendAdmission.degreeType || frontendAdmission.program_type || '',
    program_type: frontendAdmission.program_type,
    field_of_study: frontendAdmission.field_of_study || frontendAdmission.department,
    
    // Program details
    delivery_mode: frontendAdmission.delivery_mode,
    duration: frontendAdmission.duration,
    location: frontendAdmission.department || '',
    requirements: frontendAdmission.requirements,
    
    // Financial information
    application_fee: parseFloat(frontendAdmission.fee || '0'),
    tuition_fee: frontendAdmission.tuition_fee ? parseFloat(frontendAdmission.tuition_fee) : undefined,
    currency: frontendAdmission.currency,
    
    // Important dates
    deadline: frontendAdmission.deadline,
    start_date: frontendAdmission.start_date,
    
    // Description
    description: frontendAdmission.overview,
    
    // NOTE: website_url and admission_portal_link columns don't exist in current schema
    // If you need these fields, add them to the database first:
    // ALTER TABLE admissions ADD COLUMN website_url TEXT;
    // ALTER TABLE admissions ADD COLUMN admission_portal_link TEXT;
  }

  // Include verification_status if explicitly set by the caller
  // This allows frontend to control status transitions (e.g., when publishing)
  if (frontendAdmission.verification_status) {
    payload.verification_status = frontendAdmission.verification_status
  }

  return payload
}
