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
  console.log('🔵 [dashboardTransformers] Raw API data:', data)
  console.log('🔵 [dashboardTransformers] recent_admissions count:', data.recent_admissions?.length || 0)
  console.log('🔵 [dashboardTransformers] recent_admissions raw:', JSON.stringify(data.recent_admissions, null, 2))
  
  // Transform recent_admissions (all admissions) to Admission objects
  // Maps all 25 database fields from backend to frontend Admission type
  const admissions: Admission[] = (data.recent_admissions || []).map((admission: any, _index: number) => ({
    // Core identifiers
    id: admission.id || `admission-${_index}`,
    university_id: admission.university_id,
    
    // Program basic info
    title: admission.title || 'Unknown Program',
    overview: admission.description || admission.overview,
    
    // Program classification
    degreeType: admission.degree_level,
    program_type: admission.program_type,
    field_of_study: admission.field_of_study,
    
    // Program details
    department: admission.field_of_study || admission.department,
    duration: admission.duration,
    delivery_mode: admission.delivery_mode,
    requirements: admission.requirements,
    
    // Financial information
    fee: admission.application_fee?.toString() || admission.fee?.toString() || '0',
    tuition_fee: admission.tuition_fee?.toString(),
    currency: admission.currency,
    
    // Important dates
    deadline: admission.deadline || new Date().toISOString(),
    start_date: admission.start_date,
    
    // Web presence
    website_url: admission.website_url,
    websiteUrl: admission.website_url,
    admission_portal_link: admission.admission_portal_link,
    admissionPortalLink: admission.admission_portal_link,
    
    // Status & verification
    status: mapVerificationStatusToAdmissionStatus(admission.verification_status || admission.status || 'pending'),
    verification_status: admission.verification_status,
    verified_at: admission.verified_at,
    verifiedBy: admission.verified_by,
    verified_by: admission.verified_by,
    rejection_reason: admission.rejection_reason,
    dispute_reason: admission.dispute_reason,
    
    // Audit trail
    created_by: admission.created_by,
    created_at: admission.created_at,
    updated_at: admission.updated_at,
    lastAction: admission.updated_at || admission.created_at || new Date().toISOString(),
    is_active: admission.is_active ?? true,
    
    // Optional fields
    views: admission.views?.toString() || '0',
    remarks: admission.remarks || '',
    eligibility: admission.eligibility || '',
    academicYear: admission.academic_year || extractYear(admission.deadline || admission.created_at || ''),
  }));

  console.log('🔵 [dashboardTransformers] Transformed admissions count:', admissions.length)
  console.log('🔵 [dashboardTransformers] Transformed admissions:', admissions.map(a => ({ id: a.id, title: a.title, status: a.status, verification_status: a.verification_status })))

  // Transform recent_changes to ChangeLogItem objects
  const changeLogs: ChangeLogItem[] = (data.recent_changes || []).map((change: any, index: number) => ({
    id: index + 1,
    admission: change.program_title || change.admission_title || `Admission ${change.admission_id}`,
    modifiedBy: change.changed_by || change.actor_type || 'Admin',
    date: new Date(change.changed_at || change.created_at || '').toISOString(),
    diff: [
      {
        field: change.field_name || change.field || 'status',
        old: change.old_value || '—',
        new: change.new_value || '—',
      },
    ],
  }));

  // Transform recent_notifications to NotificationItem objects
  const notifications: NotificationItem[] = (data.recent_notifications || []).map((notif: any, index: number) => ({
    id: index + 1,
    title: notif.title || 'Notification',
    message: notif.message || '',
    type: mapNotificationCategory(notif.category || notif.type),
    time: notif.created_at || new Date().toISOString(),
    read: notif.is_read || false,
    admissionId: notif.related_entity_id,
  }));

  return {
    admissions,
    changeLogs,
    notifications,
  };
}

/**
 * Map backend verification status to frontend admission status
 * 
 * @param status - Backend verification status
 * @returns Frontend AdmissionStatus
 */
function mapVerificationStatusToAdmissionStatus(status: string): 'Active' | 'Verified' | 'Rejected' | 'Pending Audit' | 'Draft' | 'Closed' | 'Disputed' {
  const statusMap: Record<string, any> = {
    'verified': 'Verified',
    'pending': 'Pending Audit',
    'rejected': 'Rejected',
    'disputed': 'Disputed',
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
function mapNotificationCategory(category: string): 'Admin Feedback' | 'System Alert' | 'Data Update' {
  const categoryMap: Record<string, any> = {
    'verification': 'Admin Feedback',
    'deadline': 'System Alert',
    'system': 'System Alert',
    'update': 'Data Update',
  };
  return categoryMap[category?.toLowerCase()] || 'System Alert';
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
