/**
 * Admission Utilities
 * 
 * Helper functions for admission data manipulation and validation
 * 
 * @module utils/admissionUtils
 */

import type { Admission } from '../data/universityData'
import type { Admission as ApiAdmission } from '../types/api'

const normalizeMoneyInput = (value: string | undefined): number | undefined => {
  if (!value) return undefined
  const sanitized = value.replace(/[^0-9.-]/g, '').trim()
  if (!sanitized) return undefined

  const parsed = Number(sanitized)
  return Number.isFinite(parsed) ? parsed : undefined
}

const toRequirementsObject = (value: unknown): Record<string, any> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...(value as Record<string, any>) }
  }
  return {}
}

/**
 * Ensure admission object has all required fields with defaults
 * Prevents errors when some fields are missing from API responses
 * 
 * @param admission - Partial admission object
 * @returns Admission with all fields populated (using defaults where needed)
 */
export function sanitizeAdmission(admission: Partial<Admission>): Admission {
  const remarks =
    admission.rejection_reason ||
    admission.verification_comments ||
    admission.admin_notes ||
    admission.remarks ||
    ''

  return {
    id: admission.id || `adm-${Date.now()}`,
    title: admission.title || 'Unknown Program',
    deadline: admission.deadline || new Date().toISOString(),
    status: admission.status || 'Pending Audit' as const,
    views: admission.views || '0',
    verifiedBy: admission.verifiedBy || undefined,
    lastAction: admission.lastAction || new Date().toISOString(),
    remarks,
    degreeType: admission.degreeType || 'BS',
    department: admission.department || '',
    location: admission.location || '',
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
 * Transform API Admission format to frontend format
 * Converts database API format to the format expected by frontend components
 * 
 * @param apiAdmission - Admission in API/database format
 * @returns Admission in frontend format with all required fields
 */
export function transformApiAdmissionToFrontend(apiAdmission: ApiAdmission): Admission {
  // Determine frontend status based on verification_status
  let status: Admission['status'] = 'Draft'
  const verificationStatus = apiAdmission.verification_status
  
  if (verificationStatus === 'verified') {
    status = 'Verified'
  } else if (verificationStatus === 'rejected') {
    status = 'Rejected'
  } else if (verificationStatus === 'pending') {
    status = 'Pending Audit'
  } else if (verificationStatus === 'draft') {
    status = 'Draft'
  }

  const remarks =
    apiAdmission.rejection_reason ||
    apiAdmission.verification_comments ||
    apiAdmission.admin_notes ||
    ''

  const requirements = toRequirementsObject(apiAdmission.requirements)
  const links = toRequirementsObject(requirements.links)

  const eligibility =
    (typeof requirements.eligibility === 'string' && requirements.eligibility) ||
    (typeof requirements.criteria === 'string' && requirements.criteria) ||
    ''

  const websiteUrl =
    apiAdmission.website_url ||
    (typeof requirements.websiteUrl === 'string' ? requirements.websiteUrl : '') ||
    (typeof links.websiteUrl === 'string' ? links.websiteUrl : '') ||
    (typeof links.officialWebsite === 'string' ? links.officialWebsite : '') ||
    ''

  const admissionPortalLink =
    apiAdmission.admission_portal_link ||
    (typeof requirements.admissionPortalLink === 'string' ? requirements.admissionPortalLink : '') ||
    (typeof links.admissionPortalLink === 'string' ? links.admissionPortalLink : '') ||
    (typeof links.portalUrl === 'string' ? links.portalUrl : '') ||
    ''

  return {
    id: apiAdmission.id,
    title: apiAdmission.title || 'Unknown Program',
    deadline: apiAdmission.deadline || new Date().toISOString(),
    status,
    verification_status: verificationStatus,
    views: '0',
    verifiedBy: apiAdmission.verified_by,
    lastAction: apiAdmission.updated_at || apiAdmission.created_at || new Date().toISOString(),
    remarks,
    rejection_reason: apiAdmission.rejection_reason || undefined,
    verification_comments: apiAdmission.verification_comments || undefined,
    admin_notes: apiAdmission.admin_notes || undefined,
    
    // Program classification
    degreeType: apiAdmission.degree_level || 'BS',
    program_type: apiAdmission.program_type || '',
    field_of_study: apiAdmission.field_of_study || '',
    
    // Program details
    department: apiAdmission.field_of_study || apiAdmission.location || '',
    location: apiAdmission.location || '',
    duration: apiAdmission.duration || '',
    delivery_mode: apiAdmission.delivery_mode || '',
    
    // Financial
    fee: apiAdmission.application_fee?.toString() || '0',
    tuition_fee: apiAdmission.tuition_fee?.toString(),
    currency: apiAdmission.currency || 'USD',
    
    // Descriptions
    overview: apiAdmission.description || '',
    eligibility,
    requirements: requirements,
    
    // Web presence
    websiteUrl,
    admissionPortalLink,
    website_url: apiAdmission.website_url,
    admission_portal_link: apiAdmission.admission_portal_link,
    
    // Metadata
    start_date: apiAdmission.start_date,
    created_at: apiAdmission.created_at,
    updated_at: apiAdmission.updated_at,
    verified_at: apiAdmission.verified_at,
    created_by: apiAdmission.created_by,
    university_id: apiAdmission.university_id,
    is_active: apiAdmission.is_active,
    
    // Auto-tracking fields (system managed)
    needs_reverification: apiAdmission.needs_reverification,
    updated_by: apiAdmission.updated_by,
  }
}

/**
 * Convert date from yyyy-MM-dd format to ISO8601 datetime (end of day)
 * Used to convert HTML date inputs to backend-compatible ISO8601 format
 * 
 * @param dateString - Date in yyyy-MM-dd format or ISO8601 format
 * @returns ISO8601 datetime string or undefined
 */
function convertDateToIso8601(dateString: string | undefined): string | undefined {
  if (!dateString) return undefined
  
  // If already in ISO format with time, return as-is
  if (dateString.includes('T')) return dateString
  
  // Convert yyyy-MM-dd to yyyy-MM-ddT23:59:59Z (end of day in UTC)
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return `${dateString}T23:59:59Z`
  }
  
  return dateString
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
  const applicationFee = normalizeMoneyInput(frontendAdmission.fee)
  const tuitionFee = normalizeMoneyInput(frontendAdmission.tuition_fee)
  const uiLocation = frontendAdmission.location

  const baseRequirements = toRequirementsObject(frontendAdmission.requirements)
  const links = toRequirementsObject(baseRequirements.links)
  const officialLinks: string[] = Array.from(
    new Set(
      [frontendAdmission.admissionPortalLink, frontendAdmission.websiteUrl]
        .map((item) => (item || '').trim())
        .filter(Boolean)
    )
  )

  const requirements: Record<string, any> = {
    ...baseRequirements,
    eligibility: frontendAdmission.eligibility?.trim() || baseRequirements.eligibility || null,
    websiteUrl: frontendAdmission.websiteUrl?.trim() || baseRequirements.websiteUrl || null,
    admissionPortalLink: frontendAdmission.admissionPortalLink?.trim() || baseRequirements.admissionPortalLink || null,
    links: {
      ...links,
      websiteUrl: frontendAdmission.websiteUrl?.trim() || links.websiteUrl || null,
      admissionPortalLink: frontendAdmission.admissionPortalLink?.trim() || links.admissionPortalLink || null,
      officialLinks: officialLinks.length > 0 ? officialLinks : links.officialLinks || [],
    },
    officialLinks,
  }

  const payload: Partial<ApiAdmission> = {
    // Core identifiers
    university_id: universityId,
    title: frontendAdmission.title,
    
    // Program classification
    degree_level: frontendAdmission.degreeType || frontendAdmission.program_type || 'BS',
    program_type: frontendAdmission.program_type,
    field_of_study: frontendAdmission.field_of_study || frontendAdmission.department,
    
    // Program details
    delivery_mode: frontendAdmission.delivery_mode,
    duration: frontendAdmission.duration,
    location: (uiLocation || frontendAdmission.department || '').trim() || undefined,
    requirements,
    
    // Financial information
    application_fee: applicationFee,
    tuition_fee: tuitionFee,
    currency: frontendAdmission.currency,
    
    // Important dates - convert to ISO8601 format
    deadline: convertDateToIso8601(frontendAdmission.deadline),
    start_date: convertDateToIso8601(frontendAdmission.start_date),
    
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
