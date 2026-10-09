// Admin UI types and display helpers (colors, labels). No data lives here.

export interface PendingVerification {
	id: string
	admissionTitle: string
	university: string
	submittedBy: string
	submittedOn: string
	status: "Pending Audit"
}

export interface AdminAction {
	id: number
	admission: string
	action: "Verified" | "Rejected"
	admin: string
	timestamp: string
	remarks: string
}

export type NotificationType =
	| "admission_submitted"
	| "admission_resubmitted"
	| "admission_verified"
	| "admission_rejected"
	| "admission_revision_required"
	| "admission_updated_saved"
	| "deadline_near"
	| "system_broadcast"
	| "system_error"

export interface AdminNotification {
	id: number
	title: string
	message: string
	type: NotificationType
	timestamp: string
	timeAgo: string
	unread: boolean
	admissionId?: string
	university?: string
}

export interface ScraperActivity {
	id: number
	university: string
	lastRun: string
	status: "Success" | "No Change" | "Error"
	changesDetected: number
}

export type ScraperJobStatus = "Success" | "Failed" | "No Changes" | "Changes Detected" | "Running"

export interface ScraperJob {
	id: string
	jobId: string
	university: string
	universityId: string
	startedAt: string
	finishedAt: string
	status: ScraperJobStatus
	sourceUrl: string
	duration: string // e.g., "2m 15s"
	schedulerTriggered: boolean
	logs?: string
	errorLog?: string
	requestMetadata?: {
		headers?: Record<string, string>
		statusCode?: number
	}
	changesDetected?: Array<{
		admissionId: string
		admissionTitle: string
		fields: string[]
	}>
}

export interface ScraperSummary {
	totalJobs: number
	successfulJobs: number
	failedJobs: number
	lastExecution: string
}

export interface SystemMetrics {
	totalUsers: number
	totalAdmissions: number
	totalAlertsSent: number
	aiSummary?: string
}

export type VerificationStatus = "Pending" | "Verified" | "Rejected"

export interface VerificationItem {
	id: string
	sourceAdmissionId?: string
	admissionTitle: string
	university: string
	submittedBy: string
	submittedOn: string
	status: VerificationStatus
	dataOrigin?: "scraper" | "manual" | "university"
	sourceSystem?: string | null
	verificationStatusRaw?: string
	rejectionReason?: string | null
	reviewReason?: string | null
	verificationComments?: string | null
	adminNotes?: string | null
	remarks?: string | null
	// Full admission metadata for review modal
	metadata?: {
		title: string
		degree: string
		program: string
		fee: string
		deadline: string
		academicYear: string
		university: string
		department?: string
		overview?: string
		eligibility?: string
	}
	// Change log diff data (if admission was updated)
	diffData?: Array<{
		field: string
		oldValue: string
		newValue: string
		changeCount?: number
		latestAt?: string
	}>
}

export const getChangeTypeColor = (type: ChangeType) => {
	switch (type) {
		case "Scraper Update":
			return { bg: "#D1E7FF", text: "#0055CC" }
		case "Manual Edit":
			return { bg: "#FFF4E6", text: "#CC6600" }
		case "Admin Edit":
			return { bg: "#F0E6FF", text: "#7700CC" }
		default:
			return { bg: "#F3F4F6", text: "#6B7280" }
	}
}

// Helper functions
export const getActionColor = (action: AdminAction["action"] | string) => {
	switch (action) {
		case "Verified":
			return { bg: "#D1FAE5", text: "#10B981" }
		case "Rejected":
			return { bg: "#FEE2E2", text: "#EF4444" }
		default:
			return { bg: "#F3F4F6", text: "#6B7280" }
	}
}

/** Accepts both legacy labels and the API's run labels (Success, No Changes, Changes Detected, Failed, Running). */
export const getScraperStatusColor = (status: ScraperActivity["status"] | string) => {
	switch (status) {
		case "Success":
			return { bg: "#D1FAE5", text: "#10B981" }
		case "No Change":
		case "No Changes":
			return { bg: "#DBEAFE", text: "#2563EB" }
		case "Changes Detected":
			return { bg: "#FEF3C7", text: "#B45309" }
		case "Running":
			return { bg: "#E0E7FF", text: "#4338CA" }
		case "Error":
		case "Failed":
			return { bg: "#FEE2E2", text: "#EF4444" }
		default:
			return { bg: "#F3F4F6", text: "#6B7280" }
	}
}

export const getScraperJobStatusColor = (status: ScraperJobStatus) => {
	switch (status) {
		case "Success":
			return { bg: "#D1FAE5", text: "#10B981" }
		case "Running":
			return { bg: "#E0E7FF", text: "#4338CA" }
		case "No Changes":
			return { bg: "#FEF3C7", text: "#F59E0B" }
		case "Changes Detected":
			return { bg: "#DBEAFE", text: "#2563EB" }
		case "Failed":
			return { bg: "#FEE2E2", text: "#EF4444" }
		default:
			return { bg: "#F3F4F6", text: "#6B7280" }
	}
}

export type ChangeType = "Manual Edit" | "Scraper Update" | "Admin Edit"

export interface AdminChangeLog {
	id: number | string
	admissionId: string
	admissionTitle: string
	modifiedBy: string
	modifiedByUserId: string
	changeType: ChangeType
	timestamp: string
	summary: string // First 2-3 changed fields
	diff: Array<{
		field: string
		oldValue: string
		newValue: string
	}>
	reasonForChange?: string
	verificationLogId?: number
	metadata?: Record<string, any>
	action_type?: string
	actor_type?: 'admin' | 'university' | 'system'
}

export type AnalyticsEventType = "page_view" | "search" | "admission_view" | "download" | "click"

export interface AnalyticsEvent {
	id: number
	userId: string
	userName: string
	userRole: "Student" | "UniversityRep" | "Admin"
	eventType: AnalyticsEventType
	deviceInfo: {
		browser: string
		os: string
		deviceType: "desktop" | "mobile" | "tablet"
	}
	sessionId: string
	metadata?: Record<string, any>
	timestamp: string
}



// Admission Analytics Data
export interface AdmissionAnalytics {
	statusBreakdown: {
		status: VerificationStatus
		count: number
		percentage: number
	}[]
	universityDistribution: {
		university: string
		count: number
	}[]
	monthlyTrend: {
		month: string
		count: number
	}[]
	degreeTypeDistribution: {
		degreeType: string
		count: number
	}[]
	topAdmissions: {
		title: string
		university: string
		views: string
		status: VerificationStatus
	}[]
}

export const getVerificationStatusColor = (status: VerificationStatus) => {
	switch (status) {
		case "Pending":
			return { bg: "#FEF3C7", text: "#F59E0B" }
		case "Verified":
			return { bg: "#D1FAE5", text: "#10B981" }
		case "Rejected":
			return { bg: "#FEE2E2", text: "#EF4444" }
		default:
			return { bg: "#F3F4F6", text: "#6B7280" }
	}
}

