/**
 * Dashboard Data Transformers
 * 
 * Transform backend API dashboard responses to frontend data structures.
 * Handles type conversions between API and internal representations.
 * 
 * @module utils/dashboardTransformers
 */

import type { UniversityDashboard } from '../types/api'
import type { Admission, ChangeLogItem, NotificationItem } from '../data/universityData'

const isDashboardDebugEnabled = import.meta.env.VITE_DEBUG_DASHBOARD === 'true'

const toObject = (value: unknown): Record<string, any> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, any>
  }
  return {}
}

const isUuidLike = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

const mapActorTypeToLabel = (actorType: string): string | undefined => {
  const normalized = actorType.trim().toLowerCase()
  if (!normalized) return undefined

  if (normalized.includes('admin')) return 'Admin'
  if (normalized.includes('university') || normalized.includes('rep')) return 'University Rep'
  if (normalized.includes('system')) return undefined

  return undefined
}

const inferActorLabelFromAction = (change: any): string | undefined => {
  const actionType = String(change?.action_type || '').trim().toLowerCase()
  const fieldName = String(change?.field_name || change?.field || '').trim().toLowerCase()

  const adminOwnedFields = new Set([
    'verification_status',
    'verified_by',
    'verified_at',
    'rejection_reason',
    'admin_notes',
    'verification_comments',
    'status',
    'status_label',
  ])

  // Verification lifecycle is admin-owned.
  if (actionType === 'verified' || actionType === 'rejected') {
    return 'Admin'
  }

  if (adminOwnedFields.has(fieldName)) {
    return 'Admin'
  }

  // Some backends send status_changed for many edits; only treat as admin when status fields changed.
  if (actionType === 'status_changed') {
    return adminOwnedFields.has(fieldName) ? 'Admin' : 'University Rep'
  }

  // In university dashboard, create/update content edits come from university portal.
  if (actionType === 'created' || actionType === 'updated') {
    return 'University Rep'
  }

  // Fallback by field ownership when action_type is missing or noisy.
  if (fieldName) {
    return adminOwnedFields.has(fieldName) ? 'Admin' : 'University Rep'
  }

  return undefined
}

const normalizeActorLabel = (change: any): string => {
  const modifiedBy = typeof change?.modified_by === 'string' ? change.modified_by.trim() : ''
  const changedBy = typeof change?.changed_by === 'string' ? change.changed_by.trim() : ''
  const actorType = typeof change?.actor_type === 'string' ? change.actor_type : ''

  const actorTypeLabel = mapActorTypeToLabel(actorType)
  const inferredLabel = inferActorLabelFromAction(change)

  // Human-readable modified_by is preferred when provided.
  if (modifiedBy && modifiedBy.toLowerCase() !== 'system' && !isUuidLike(modifiedBy) && Number.isNaN(Date.parse(modifiedBy))) {
    return modifiedBy
  }

  // If backend explicitly provides actor type, trust it for role label.
  if (actorTypeLabel) {
    return actorTypeLabel
  }

  // If actor type is missing/ambiguous (often system), infer from action semantics.
  if (inferredLabel) {
    return inferredLabel
  }

  // Keep non-UUID changed_by values (e.g., username/email) when available.
  if (changedBy && changedBy.toLowerCase() !== 'system' && !isUuidLike(changedBy) && Number.isNaN(Date.parse(changedBy))) {
    return changedBy
  }

  // Default to Admin only when actor cannot be determined.
  return 'Admin'
}

const normalizeDiffValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—'

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return '—'

    try {
      const parsed = JSON.parse(trimmed)
      if (typeof parsed === 'string' || typeof parsed === 'number' || typeof parsed === 'boolean') {
        return String(parsed)
      }
      return JSON.stringify(parsed)
    } catch {
      return trimmed
    }
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const toIsoOrNow = (...candidates: unknown[]): string => {
  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue
    const parsed = new Date(candidate)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }
  return new Date().toISOString()
}

const deriveChangeStatus = (change: any): ChangeLogItem['status'] | undefined => {
  const fieldName = String(change.field_name || change.field || '').toLowerCase()
  if (!fieldName) return undefined

  if (fieldName === 'verification_status' || fieldName === 'status' || fieldName === 'status_label') {
    const newValue = normalizeDiffValue(change.new_value)
    return mapVerificationStatusToAdmissionStatus(newValue)
  }

  return undefined
}

/**
 * Transform backend UniversityDashboard to frontend data structures
 * 
 * Maps backend dashboard response to frontend context data:
 * - recent_admissions → admissions array (ALL admissions)
 * - recent_changes → changelogs array
 * - recent_notifications → notifications array
 * 
 * @param data - Backend UniversityDashboard response
 * @returns Object with transformed admissions, changeLogs, and notifications
 */
export function transformUniversityDashboard(data: UniversityDashboard) {
  if (isDashboardDebugEnabled) {
    console.log('🔵 [dashboardTransformers] Raw API data:', data)
    console.log('🔵 [dashboardTransformers] recent_admissions count:', data.recent_admissions?.length || 0)
  }
  
  // Transform recent_admissions (all admissions) to Admission objects
  // Maps all 25 database fields from backend to frontend Admission type
  const admissions: Admission[] = (data.recent_admissions || []).map((admission: any, _index: number) => {
    const requirements = toObject(admission.requirements)
    const links = toObject(requirements.links)
    const websiteUrl =
      admission.website_url ||
      (typeof requirements.websiteUrl === 'string' ? requirements.websiteUrl : '') ||
      (typeof links.websiteUrl === 'string' ? links.websiteUrl : '') ||
      (typeof links.officialWebsite === 'string' ? links.officialWebsite : '') ||
      ''
    const admissionPortalLink =
      admission.admission_portal_link ||
      (typeof requirements.admissionPortalLink === 'string' ? requirements.admissionPortalLink : '') ||
      (typeof links.admissionPortalLink === 'string' ? links.admissionPortalLink : '') ||
      (typeof links.portalUrl === 'string' ? links.portalUrl : '') ||
      ''
    const eligibility =
      admission.eligibility_text ||
      admission.eligibility ||
      (typeof requirements.eligibility === 'string' ? requirements.eligibility : '') ||
      (typeof requirements.criteria === 'string' ? requirements.criteria : '') ||
      ''

    return ({
    // Core identifiers
    id: admission.id || `admission-${_index}`,
    university_id: admission.university_id,
    
    // Program basic info
    title: admission.title || 'Unknown Program',
    overview: admission.description || admission.overview,
    
    // Program classification
    degreeType: admission.degree_type || admission.degree_level,
    program_type: admission.program_type,
    field_of_study: admission.field_of_study,
    
    // Program details
    department: admission.field_of_study || admission.department || admission.location,
    location: admission.location,
    duration: admission.duration,
    delivery_mode: admission.delivery_mode,
    requirements,
    
    // Financial information
    fee: (typeof admission.fee_amount === 'number' ? admission.fee_amount : admission.application_fee)?.toString() || admission.fee?.toString() || '0',
    tuition_fee: admission.tuition_fee?.toString(),
    currency: admission.currency,
    
    // Important dates
    deadline: admission.deadline_iso || admission.deadline || new Date().toISOString(),
    start_date: admission.start_date,
    
    // Web presence
    website_url: admission.university_website_url || admission.website_url,
    websiteUrl: admission.university_website_url || websiteUrl,
    admission_portal_link: admission.admission_portal_url || admission.admission_portal_link,
    admissionPortalLink: admission.admission_portal_url || admissionPortalLink,
    
    // Status & verification
    status: admission.status_label === 'Verified'
      ? 'Verified'
      : admission.status_label === 'Closed'
      ? 'Rejected'
      : mapVerificationStatusToAdmissionStatus(admission.verification_status || admission.status || 'pending'),
    verification_status: admission.verification_status,
    verified_at: admission.verified_at,
    verifiedBy: admission.verified_by,
    verified_by: admission.verified_by,
    rejection_reason: admission.rejection_reason,
    verification_comments: admission.verification_comments,
    admin_notes: admission.admin_notes,
    
    // Audit trail
    created_by: admission.created_by,
    created_at: admission.created_at,
    updated_at: admission.updated_at,
    lastAction: admission.updated_at || admission.created_at || new Date().toISOString(),
    is_active: admission.is_active ?? true,
    
    // Optional fields
    views: admission.views?.toString() || '0',
    remarks:
      admission.rejection_reason ||
      admission.verification_comments ||
      admission.admin_notes ||
      admission.remarks ||
      '',
    eligibility,
    academicYear: admission.academic_year || extractYear((admission.deadline_iso || admission.deadline || admission.created_at || '')),
  })});

  if (isDashboardDebugEnabled) {
    console.log('🔵 [dashboardTransformers] Transformed admissions count:', admissions.length)
  }

  // Transform recent_changes to ChangeLogItem objects
  const changeLogs: ChangeLogItem[] = (data.recent_changes || []).map((change: any, index: number) => {
    const fieldName = change.field_name || change.field || 'status'
    const status = deriveChangeStatus(change)
    const remarks =
      change.reason ||
      change.notes ||
      change.comment ||
      change.verification_comments ||
      change.admin_notes ||
      ''

    return {
      id: index + 1,
      admissionId: change.admission_id || undefined,
      admission: change.program_title || change.admission_title || 'Admission',
      modifiedBy: normalizeActorLabel(change),
      date: toIsoOrNow(change.changed_at_iso, change.changed_at, change.created_at),
      diff: [
        {
          field: fieldName,
          old: normalizeDiffValue(change.old_value),
          new: normalizeDiffValue(change.new_value),
        },
      ],
      status,
      remarks,
    }
  });

  // Transform recent_notifications to NotificationItem objects
  const notifications: NotificationItem[] = (data.recent_notifications || []).map((notif: any, index: number) => ({
    id: notif.id || index + 1,
    title: notif.title || 'Notification',
    message: notif.message || '',
    type: mapNotificationCategory(notif.notification_type || notif.type),
    time: notif.created_at || new Date().toISOString(),
    read: notif.is_read || false,
    admissionId: notif.related_entity_id,
  }));

  return {
    admissions,
    changeLogs,
    notifications,
    engagementTrends: {
      labels: data.engagement_trends?.labels || [],
      views: data.engagement_trends?.views || [],
      clicks: data.engagement_trends?.clicks || [],
      reminders: data.engagement_trends?.reminders || [],
      saves: data.engagement_trends?.saves || [],
    },
  };
}

/**
 * Map backend verification status to frontend admission status
 * 
 * @param status - Backend verification status
 * @returns Frontend AdmissionStatus
 */
function mapVerificationStatusToAdmissionStatus(status: string): 'Active' | 'Verified' | 'Rejected' | 'Pending Audit' | 'Draft' | 'Closed' {
  const statusMap: Record<string, any> = {
    'verified': 'Verified',
    'pending': 'Pending Audit',
    'rejected': 'Rejected',
    'draft': 'Draft',
    'active': 'Active',
    'closed': 'Closed',
  };
  return statusMap[status?.toLowerCase()] || 'Pending Audit';
}

/**
 * Map backend notification category to frontend type
 * 
 * @param category - Backend notification category
 * @returns Frontend notification type
 */
function mapNotificationCategory(notificationType: string): 'Admin Feedback' | 'System Alert' | 'Data Update' {
  const typeMap: Record<string, any> = {
    admission_submitted: 'Admin Feedback',
    admission_resubmitted: 'Admin Feedback',
    admission_verified: 'Admin Feedback',
    admission_rejected: 'Admin Feedback',
    admission_revision_required: 'Admin Feedback',
    admission_updated_saved: 'Data Update',
    deadline_near: 'System Alert',
    system_broadcast: 'System Alert',
    system_error: 'System Alert',
  };
  return typeMap[notificationType?.toLowerCase()] || 'System Alert';
}

/**
 * Extract academic year from date string
 * 
 * @param dateStr - ISO date string
 * @returns Academic year string (e.g., "2025-2026")
 */
function extractYear(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    return `${year}-${year + 1}`;
  } catch {
    const now = new Date();
    return `${now.getFullYear()}-${now.getFullYear() + 1}`;
  }
}
