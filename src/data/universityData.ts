// University module UI types and display helpers. No data lives here.

export type AdmissionStatus = "Active" | "Closing Soon" | "Draft" | "Closed" | "Pending Audit" | "Verified" | "Rejected"

export type AuditStatus = "Pending" | "Verified" | "Rejected"

export interface Admission {
	id: string
	title: string
	deadline: string
	status: AdmissionStatus
	verification_status?: 'verified' | 'pending' | 'rejected' | 'draft'
	views?: string // Optional - may not be present in API data
	verifiedBy?: string
	lastAction?: string
	remarks?: string
	rejection_reason?: string
	verification_comments?: string
	admin_notes?: string
	
	// Program classification
	degreeType?: string
	program_type?: string
	field_of_study?: string
	
	// Program details
	department?: string
	location?: string
	duration?: string
	delivery_mode?: string
	
	// Financial
	fee?: string
	tuition_fee?: string
	currency?: string
	
	// Descriptions
	overview?: string
	eligibility?: string
	requirements?: Record<string, any>
	
	// Web presence
	websiteUrl?: string
	admissionPortalLink?: string
	website_url?: string
	admission_portal_link?: string
	
	// Status details
	start_date?: string
	created_at?: string
	updated_at?: string
	verified_at?: string
	created_by?: string
	university_id?: string
	is_active?: boolean
	
	// Auto-tracking fields (system managed)
	needs_reverification?: boolean | null
	updated_by?: string | null
	
	// Internal fields
	academicYear?: string
}

export interface AuditItem {
	id: number
	title: string
	status: AuditStatus
	verifiedBy?: string
	lastAction: string
	remarks?: string
}

export interface ChangeLogItem {
	id: number
	admissionId?: string
	admission: string
	modifiedBy: string
	date: string
	diff: Array<{ field: string; old: string; new: string }>
	status?: AdmissionStatus | AuditStatus
	remarks?: string
}

export interface NotificationItem {
	id: number | string
	title: string
	message: string
	type: "Admin Feedback" | "System Alert" | "Data Update"
	time: string
	read: boolean
	admissionId?: string
}


// Helper functions
export const getStatusColor = (status: AdmissionStatus | AuditStatus) => {
	switch (status) {
		case "Active":
		case "Verified":
			return { bg: "#D1FAE5", text: "#10B981" }
		case "Closing Soon":
			return { bg: "#FEF3C7", text: "#F59E0B" }
		case "Draft":
		case "Pending":
		case "Pending Audit":
			return { bg: "#DBEAFE", text: "#2563EB" }
		case "Closed":
		case "Rejected":
			return { bg: "#FEE2E2", text: "#EF4444" }
		default:
			return { bg: "#F3F4F6", text: "#6B7280" }
	}
}


