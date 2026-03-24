/**
 * Student Admission Filters
 * 
 * Centralized filtering logic for student portal visibility rules.
 * Ensures rejected admissions are hidden consistently
 * across all student pages.
 * 
 * @module utils/studentFilters
 */

import type { StudentAdmission } from '../data/studentData'

/**
 * Filter admissions for student visibility
 * 
 * BUSINESS RULES:
 * - Students can ONLY see: verified and pending admissions
 * - Students CANNOT see: rejected or unknown status admissions
 * 
 * @param admissions - Array of student admissions
 * @param debugLogging - Enable console logging for debugging (default: false)
 * @returns Filtered array containing only verified and pending admissions
 */
export function filterStudentVisibleAdmissions(
  admissions: StudentAdmission[],
  debugLogging: boolean = false
): StudentAdmission[] {
  if (debugLogging && admissions.length > 0) {
    // Log status breakdown
    const statusCounts = admissions.reduce((acc, a) => {
      const status = a.verificationStatus || 'undefined'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    console.log('📊 [filterStudentVisibleAdmissions] Status breakdown:', statusCounts)
  }

  const filtered = admissions.filter(a => {
    // Only show verified and pending to students.
    // Fallback to mapped status in case raw verificationStatus is missing from API payload.
    const shouldShow =
      a.verificationStatus === 'verified' ||
      a.verificationStatus === 'pending' ||
      a.status === 'Verified' ||
      a.status === 'Pending'
    
    // Debug logging for filtered out admissions
    if (debugLogging && !shouldShow && a.verificationStatus) {
      console.log(`🚫 [filterStudentVisibleAdmissions] Hiding "${a.program}" with status: ${a.verificationStatus}`)
    }
    
    return shouldShow
  })

  if (debugLogging) {
    console.log(
      `📚 [filterStudentVisibleAdmissions] Showing ${filtered.length}/${admissions.length} admissions ` +
      `(hidden: ${admissions.length - filtered.length})`
    )
  }

  return filtered
}

/**
 * Check if a single admission is visible to students
 * 
 * @param admission - Student admission to check
 * @returns true if admission should be visible to students
 */
export function isAdmissionVisibleToStudent(admission: StudentAdmission): boolean {
  return admission.verificationStatus === 'verified' || admission.verificationStatus === 'pending'
}
