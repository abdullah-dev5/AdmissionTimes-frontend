/**
 * Admission visibility and status utilities
 */

export type VerificationStatus = 'pending' | 'verified' | 'rejected'

/**
 * Check if admission should be visible to students
 * Students can ONLY see verified and pending admissions
 * Rejected admissions are HIDDEN
 */
export const isVisibleToStudents = (verificationStatus: string | undefined | null): boolean => {
	if (!verificationStatus) return false
	
	const status = verificationStatus.toLowerCase()
	
	// ✅ Show verified admissions
	if (status === 'verified') return true
	
	// ✅ Show pending admissions (they can see what's being reviewed)
	if (status === 'pending') return true
	
	// ❌ HIDE rejected admissions
	if (status === 'rejected') return false
	
	// Default: show (for backwards compatibility)
	return true
}

/**
 * Check if admission should be visible to university
 * Universities can see ALL their own admissions
 */
export const isVisibleToUniversity = (
	admission: any,
	currentUniversityId: string | undefined
): boolean => {
	if (!currentUniversityId) return false
	return admission.university_id === currentUniversityId
}

/**
 * Check if admission should be visible to admin
 * Admins can see ALL admissions
 */
export const isVisibleToAdmin = (): boolean => {
	return true
}

/**
 * Get status badge configuration
 */
export const getStatusBadgeConfig = (verificationStatus: string | undefined | null) => {
	if (!verificationStatus) {
		return {
			label: 'Unknown',
			bgColor: '#F3F4F6',
			textColor: '#6B7280',
			icon: '?',
		}
	}
	
	const status = verificationStatus.toLowerCase()
	
	switch (status) {
		case 'verified':
			return {
				label: 'Verified',
				bgColor: '#D1FAE5',
				textColor: '#10B981',
				icon: '✓',
			}
		case 'pending':
			return {
				label: 'Pending Review',
				bgColor: '#FEF3C7',
				textColor: '#F59E0B',
				icon: '⏳',
			}
		case 'rejected':
			return {
				label: 'Rejected',
				bgColor: '#FEE2E2',
				textColor: '#EF4444',
				icon: '✕',
			}
		default:
			return {
				label: status,
				bgColor: '#F3F4F6',
				textColor: '#6B7280',
				icon: '•',
			}
	}
}

/**
 * Filter admissions by visibility rules
 */
export const filterAdmissionsByRole = (
	admissions: any[],
	role: 'student' | 'university' | 'admin',
	universityId?: string
): any[] => {
	if (!admissions || admissions.length === 0) return []
	
	switch (role) {
		case 'student':
			return admissions.filter(a => isVisibleToStudents(a.verification_status))
		
		case 'university':
			return admissions.filter(a => isVisibleToUniversity(a, universityId))
		
		case 'admin':
			return admissions // Admins see all
		
		default:
			return admissions
	}
}

/**
 * Check if admission needs re-verification
 * (was verified, then updated by university)
 */
export const needsReverification = (admission: any): boolean => {
	return (
		admission.verification_status === 'pending' &&
		admission.needs_reverification === true
	)
}

/**
 * Get user-friendly status message
 */
export const getStatusMessage = (
	verificationStatus: string | undefined | null,
	role: 'student' | 'university' | 'admin'
): string => {
	if (!verificationStatus) return ''
	
	const status = verificationStatus.toLowerCase()
	
	if (role === 'student') {
		switch (status) {
			case 'verified':
				return 'This admission has been verified by our team'
			case 'pending':
				return 'This admission is currently under review'
			default:
				return ''
		}
	}
	
	if (role === 'university') {
		switch (status) {
			case 'verified':
				return 'Your admission has been verified. Changes will require re-verification.'
			case 'pending':
				return 'Your admission is awaiting admin verification'
			case 'rejected':
				return 'Your admission has been rejected. Please review the rejection reason.'
			default:
				return ''
		}
	}
	
	// Admin
	switch (status) {
		case 'verified':
			return 'This admission has been verified'
		case 'pending':
			return 'This admission needs verification'
		case 'rejected':
			return 'This admission has been rejected'
		default:
			return ''
	}
}
