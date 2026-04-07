// Mock data for Admin Dashboard

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

export type ScraperJobStatus = "Success" | "Failed" | "No Changes" | "Changes Detected"

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
	admissionTitle: string
	university: string
	submittedBy: string
	submittedOn: string
	status: VerificationStatus
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

// Mock data
export const pendingVerifications: PendingVerification[] = [
	{
		id: "1",
		admissionTitle: "BSCS Fall 2025",
		university: "FAST University",
		submittedBy: "Rep_01",
		submittedOn: "2025-02-07",
		status: "Pending Audit",
	},
	{
		id: "2",
		admissionTitle: "PhD Physics",
		university: "NUST",
		submittedBy: "Rep_02",
		submittedOn: "2025-02-06",
		status: "Pending Audit",
	},
	{
		id: "3",
		admissionTitle: "MBA Executive",
		university: "LUMS",
		submittedBy: "Rep_03",
		submittedOn: "2025-02-05",
		status: "Pending Audit",
	},
	{
		id: "4",
		admissionTitle: "MS Data Science",
		university: "FAST University",
		submittedBy: "Rep_01",
		submittedOn: "2025-02-04",
		status: "Pending Audit",
	},
	{
		id: "5",
		admissionTitle: "BBA Honors",
		university: "IBA",
		submittedBy: "Rep_04",
		submittedOn: "2025-02-03",
		status: "Pending Audit",
	},
]

export const recentAdminActions: AdminAction[] = [
	{
		id: 1,
		admission: "BSCS Fall 2025",
		action: "Verified",
		admin: "Admin",
		timestamp: "2025-02-08 10:30",
		remarks: "All documents verified. Admission approved.",
	},
	{
		id: 2,
		admission: "MS Data Science",
		action: "Rejected",
		admin: "Admin",
		timestamp: "2025-02-08 09:15",
		remarks: "Incomplete fee structure. Please resubmit.",
	},
	{
		id: 3,
		admission: "MBA Executive",
		action: "Verified",
		admin: "Admin",
		timestamp: "2025-02-07 16:45",
		remarks: "Verified successfully.",
	},
	{
		id: 4,
		admission: "BBA Honors",
		action: "Rejected",
		admin: "Admin",
		timestamp: "2025-02-07 14:20",
		remarks: "University requested recheck on deadline.",
	},
	{
		id: 5,
		admission: "PhD Physics",
		action: "Verified",
		admin: "Admin",
		timestamp: "2025-02-06 11:00",
		remarks: "All requirements met.",
	},
]

export const adminNotifications: AdminNotification[] = [
	{
		id: 1,
		title: "Admission Verified",
		message: "Admission 'BSCS Fall 2025' from FAST University has been verified by Admin.",
		type: "admission_verified",
		timestamp: "2025-02-08T10:30:00Z",
		timeAgo: "2 hours ago",
		unread: true,
		admissionId: "1",
		university: "FAST University",
	},
	{
		id: 2,
		title: "New Admission Uploaded",
		message: "FAST University uploaded a new admission: 'MS Data Science' requiring verification.",
		type: "admission_submitted",
		timestamp: "2025-02-08T09:15:00Z",
		timeAgo: "3 hours ago",
		unread: true,
		admissionId: "4",
		university: "FAST University",
	},
	{
		id: 3,
		title: "System Maintenance Scheduled",
		message: "Scheduled system maintenance will occur on February 12, 2025 at 2:00 AM. Expected downtime: 30 minutes.",
		type: "system_broadcast",
		timestamp: "2025-02-08T08:30:00Z",
		timeAgo: "4 hours ago",
		unread: true,
	},
	{
		id: 4,
		title: "Scraper Error Detected",
		message: "Scraper failed to fetch data from NUST website. Error: Connection timeout. Retry scheduled.",
		type: "system_error",
		timestamp: "2025-02-08T07:00:00Z",
		timeAgo: "5 hours ago",
		unread: true,
		university: "NUST",
	},
	{
		id: 5,
		title: "Admission Rejected",
		message: "Admission 'MS Data Science' from FAST University was rejected by Admin. Reason: Incomplete fee structure.",
		type: "admission_rejected",
		timestamp: "2025-02-08T06:45:00Z",
		timeAgo: "5 hours ago",
		unread: false,
		admissionId: "4",
		university: "FAST University",
	},
	{
		id: 6,
		title: "New Admission Uploaded",
		message: "LUMS uploaded a new admission: 'MBA Executive' requiring verification.",
		type: "admission_submitted",
		timestamp: "2025-02-07T16:00:00Z",
		timeAgo: "1 day ago",
		unread: false,
		admissionId: "3",
		university: "LUMS",
	},
	{
		id: 7,
		title: "Admission Rejected",
		message: "Admission 'BBA Honors' from IBA has been marked as rejected. University requested recheck on deadline.",
		type: "admission_rejected",
		timestamp: "2025-02-07T14:20:00Z",
		timeAgo: "1 day ago",
		unread: false,
		admissionId: "5",
		university: "IBA",
	},
	{
		id: 8,
		title: "Scraper Success",
		message: "Scraper successfully updated 3 admissions from FAST University website.",
		type: "system_broadcast",
		timestamp: "2025-02-07T09:00:00Z",
		timeAgo: "1 day ago",
		unread: false,
		university: "FAST University",
	},
	{
		id: 9,
		title: "New Admission Uploaded",
		message: "NUST uploaded a new admission: 'PhD Physics' requiring verification.",
		type: "admission_submitted",
		timestamp: "2025-02-06T11:00:00Z",
		timeAgo: "2 days ago",
		unread: false,
		admissionId: "2",
		university: "NUST",
	},
	{
		id: 10,
		title: "Database Backup Completed",
		message: "Daily database backup completed successfully. Backup size: 2.5 GB. Stored in secure location.",
		type: "system_broadcast",
		timestamp: "2025-02-06T03:00:00Z",
		timeAgo: "2 days ago",
		unread: false,
	},
	{
		id: 11,
		title: "Admission Verified",
		message: "Admission 'MBA Executive' from LUMS has been verified by Admin.",
		type: "admission_verified",
		timestamp: "2025-02-05T16:45:00Z",
		timeAgo: "3 days ago",
		unread: false,
		admissionId: "3",
		university: "LUMS",
	},
	{
		id: 12,
		title: "Scraper No Changes",
		message: "Scraper ran for LUMS website. No changes detected in admission data.",
		type: "system_broadcast",
		timestamp: "2025-02-05T18:00:00Z",
		timeAgo: "3 days ago",
		unread: false,
		university: "LUMS",
	},
]

export const scraperActivities: ScraperActivity[] = [
	{
		id: 1,
		university: "FAST University",
		lastRun: "2025-02-08 09:00",
		status: "Success",
		changesDetected: 3,
	},
	{
		id: 2,
		university: "NUST",
		lastRun: "2025-02-08 08:30",
		status: "Error",
		changesDetected: 0,
	},
	{
		id: 3,
		university: "LUMS",
		lastRun: "2025-02-07 18:00",
		status: "No Change",
		changesDetected: 0,
	},
	{
		id: 4,
		university: "IBA",
		lastRun: "2025-02-07 15:00",
		status: "Success",
		changesDetected: 2,
	},
]

// Verification items for Verification Center
export const verificationItems: VerificationItem[] = [
	{
		id: "1",
		admissionTitle: "BSCS Fall 2025",
		university: "FAST University",
		submittedBy: "Rep_01",
		submittedOn: "2025-02-07",
		status: "Pending",
		metadata: {
			title: "BSCS Fall 2025",
			degree: "Bachelor of Science",
			program: "Computer Science",
			fee: "5000",
			deadline: "2025-07-15",
			academicYear: "2025-2026",
			university: "FAST University",
			department: "School of Engineering",
			overview: "A comprehensive undergraduate program in Computer Science covering core CS fundamentals.",
			eligibility: "Minimum 60% in FSc/A-Levels with Mathematics.",
		},
		diffData: [
			{ field: "Deadline", oldValue: "2025-07-10", newValue: "2025-07-15" },
			{ field: "Fee", oldValue: "4500", newValue: "5000" },
		],
	},
	{
		id: "2",
		admissionTitle: "PhD Physics",
		university: "NUST",
		submittedBy: "Rep_02",
		submittedOn: "2025-02-06",
		status: "Pending",
		metadata: {
			title: "PhD Physics",
			degree: "Doctor of Philosophy",
			program: "Physics",
			fee: "8000",
			deadline: "2025-09-01",
			academicYear: "2025-2026",
			university: "NUST",
			department: "School of Sciences",
			overview: "Advanced research program in Physics with focus on theoretical and experimental physics.",
			eligibility: "MS/MPhil in Physics or related field with minimum 3.0 CGPA.",
		},
	},
	{
		id: "3",
		admissionTitle: "MBA Executive",
		university: "LUMS",
		submittedBy: "Rep_03",
		submittedOn: "2025-02-05",
		status: "Verified",
		metadata: {
			title: "MBA Executive",
			degree: "Master of Business Administration",
			program: "Executive MBA",
			fee: "7500",
			deadline: "2025-08-10",
			academicYear: "2025-2026",
			university: "LUMS",
			department: "Business School",
			overview: "Executive MBA program designed for working professionals.",
			eligibility: "Bachelor's degree with minimum 2.5 CGPA and 3 years work experience.",
		},
	},
	{
		id: "4",
		admissionTitle: "MS Data Science",
		university: "FAST University",
		submittedBy: "Rep_01",
		submittedOn: "2025-02-04",
		status: "Rejected",
		metadata: {
			title: "MS Data Science",
			degree: "Master of Science",
			program: "Data Science",
			fee: "6000",
			deadline: "2025-06-30",
			academicYear: "2025-2026",
			university: "FAST University",
			department: "School of Computing",
			overview: "Master's program in Data Science covering machine learning, statistics, and big data.",
			eligibility: "BS in CS/IT/Mathematics with minimum 2.5 CGPA.",
		},
	},
	{
		id: "5",
		admissionTitle: "BBA Honors",
		university: "IBA",
		submittedBy: "Rep_04",
		submittedOn: "2025-02-03",
		status: "Rejected",
		metadata: {
			title: "BBA Honors",
			degree: "Bachelor of Business Administration",
			program: "BBA Honors",
			fee: "4500",
			deadline: "2025-07-20",
			academicYear: "2025-2026",
			university: "IBA",
			department: "Business School",
			overview: "Honors program in Business Administration with focus on leadership and management.",
			eligibility: "Minimum 60% in FSc/A-Levels.",
		},
		diffData: [
			{ field: "Deadline", oldValue: "2025-07-15", newValue: "2025-07-20" },
		],
	},
	{
		id: "6",
		admissionTitle: "MPhil English Literature",
		university: "University of Karachi",
		submittedBy: "Rep_05",
		submittedOn: "2025-02-08",
		status: "Pending",
		metadata: {
			title: "MPhil English Literature",
			degree: "Master of Philosophy",
			program: "English Literature",
			fee: "5500",
			deadline: "2025-08-15",
			academicYear: "2025-2026",
			university: "University of Karachi",
			department: "Department of English",
			overview: "Research-oriented program in English Literature.",
			eligibility: "MA in English Literature with minimum 2.5 CGPA.",
		},
	},
	{
		id: "7",
		admissionTitle: "BS Mathematics",
		university: "Quaid-e-Azam University",
		submittedBy: "Rep_06",
		submittedOn: "2025-02-07",
		status: "Pending",
		metadata: {
			title: "BS Mathematics",
			degree: "Bachelor of Science",
			program: "Mathematics",
			fee: "4000",
			deadline: "2025-07-25",
			academicYear: "2025-2026",
			university: "Quaid-e-Azam University",
			department: "Department of Mathematics",
			overview: "Undergraduate program in Pure and Applied Mathematics.",
			eligibility: "Minimum 60% in FSc/A-Levels with Mathematics.",
		},
	},
	{
		id: "8",
		admissionTitle: "LLB",
		university: "University of Punjab",
		submittedBy: "Rep_07",
		submittedOn: "2025-02-06",
		status: "Verified",
		metadata: {
			title: "LLB",
			degree: "Bachelor of Laws",
			program: "Law",
			fee: "5000",
			deadline: "2025-08-01",
			academicYear: "2025-2026",
			university: "University of Punjab",
			department: "Law College",
			overview: "Five-year integrated LLB program.",
			eligibility: "Minimum 60% in FSc/A-Levels.",
		},
	},
	{
		id: "9",
		admissionTitle: "MS Computer Engineering",
		university: "NED University",
		submittedBy: "Rep_08",
		submittedOn: "2025-02-05",
		status: "Pending",
		metadata: {
			title: "MS Computer Engineering",
			degree: "Master of Science",
			program: "Computer Engineering",
			fee: "6500",
			deadline: "2025-07-10",
			academicYear: "2025-2026",
			university: "NED University",
			department: "Department of Computer Engineering",
			overview: "Graduate program in Computer Engineering.",
			eligibility: "BS in Computer Engineering with minimum 2.5 CGPA.",
		},
		diffData: [
			{ field: "Fee", oldValue: "6000", newValue: "6500" },
		],
	},
	{
		id: "10",
		admissionTitle: "BSc Electrical Engineering",
		university: "GIKI",
		submittedBy: "Rep_09",
		submittedOn: "2025-02-04",
		status: "Rejected",
		metadata: {
			title: "BSc Electrical Engineering",
			degree: "Bachelor of Science",
			program: "Electrical Engineering",
			fee: "7000",
			deadline: "2025-07-05",
			academicYear: "2025-2026",
			university: "GIKI",
			department: "Department of Electrical Engineering",
			overview: "Undergraduate program in Electrical Engineering.",
			eligibility: "Minimum 70% in FSc/A-Levels with Physics, Chemistry, Mathematics.",
		},
	},
]

// Admin Change Logs
export const adminChangeLogs: AdminChangeLog[] = [
	{
		id: 1,
		admissionId: "1",
		admissionTitle: "BSCS Fall 2025",
		modifiedBy: "Rep_01",
		modifiedByUserId: "user_1",
		changeType: "Manual Edit",
		timestamp: "2025-02-08T10:15:00Z",
		summary: "Deadline, Fee",
		diff: [
			{ field: "Deadline", oldValue: "2025-07-10", newValue: "2025-07-15" },
			{ field: "Fee", oldValue: "4500", newValue: "5000" },
		],
		reasonForChange: "Updated deadline and fee based on university announcement.",
	},
	{
		id: 2,
		admissionId: "1",
		admissionTitle: "BSCS Fall 2025",
		modifiedBy: "Scraper System",
		modifiedByUserId: "system_scraper",
		changeType: "Scraper Update",
		timestamp: "2025-02-08T09:00:00Z",
		summary: "Deadline",
		diff: [
			{ field: "Deadline", oldValue: "2025-07-05", newValue: "2025-07-10" },
		],
	},
	{
		id: 3,
		admissionId: "4",
		admissionTitle: "MS Data Science",
		modifiedBy: "Scraper System",
		modifiedByUserId: "system_scraper",
		changeType: "Scraper Update",
		timestamp: "2025-02-08T09:00:00Z",
		summary: "Fee",
		diff: [
			{ field: "Fee", oldValue: "5500", newValue: "6000" },
		],
	},
	{
		id: 4,
		admissionId: "5",
		admissionTitle: "BBA Honors",
		modifiedBy: "Admin",
		modifiedByUserId: "admin_main",
		changeType: "Admin Edit",
		timestamp: "2025-02-07T14:30:00Z",
		summary: "Deadline, Status",
		diff: [
			{ field: "Deadline", oldValue: "2025-07-15", newValue: "2025-07-20" },
			{ field: "Status", oldValue: "Verified", newValue: "Rejected" },
		],
		reasonForChange: "University requested deadline extension. Status changed to Rejected for review.",
		verificationLogId: 4,
	},
	{
		id: 5,
		admissionId: "3",
		admissionTitle: "MBA Executive",
		modifiedBy: "Rep_03",
		modifiedByUserId: "user_3",
		changeType: "Manual Edit",
		timestamp: "2025-02-07T11:20:00Z",
		summary: "Fee, Overview",
		diff: [
			{ field: "Fee", oldValue: "7000", newValue: "7500" },
			{ field: "Overview", oldValue: "Executive MBA program.", newValue: "Executive MBA program designed for working professionals with flexible scheduling." },
		],
		reasonForChange: "Updated fee structure and expanded program overview.",
	},
	{
		id: 6,
		admissionId: "6",
		admissionTitle: "PhD Computer Science",
		modifiedBy: "Scraper System",
		modifiedByUserId: "system_scraper",
		changeType: "Scraper Update",
		timestamp: "2025-02-08T09:00:00Z",
		summary: "Title, Deadline, Fee",
		diff: [
			{ field: "Title", oldValue: "PhD CS", newValue: "PhD Computer Science" },
			{ field: "Deadline", oldValue: "2025-08-01", newValue: "2025-08-15" },
			{ field: "Fee", oldValue: "8000", newValue: "8500" },
		],
	},
	{
		id: 7,
		admissionId: "2",
		admissionTitle: "PhD Physics",
		modifiedBy: "Admin",
		modifiedByUserId: "admin_main",
		changeType: "Admin Edit",
		timestamp: "2025-02-06T15:45:00Z",
		summary: "Eligibility",
		diff: [
			{ field: "Eligibility", oldValue: "MS/MPhil in Physics.", newValue: "MS/MPhil in Physics or related field with minimum 3.0 CGPA." },
		],
		reasonForChange: "Clarified eligibility requirements based on university guidelines.",
		verificationLogId: 5,
	},
	{
		id: 8,
		admissionId: "7",
		admissionTitle: "MBA Executive",
		modifiedBy: "Scraper System",
		modifiedByUserId: "system_scraper",
		changeType: "Scraper Update",
		timestamp: "2025-02-07T15:00:00Z",
		summary: "Fee",
		diff: [
			{ field: "Fee", oldValue: "7000", newValue: "7500" },
		],
	},
	{
		id: 9,
		admissionId: "10",
		admissionTitle: "BSc Electrical Engineering",
		modifiedBy: "Scraper System",
		modifiedByUserId: "system_scraper",
		changeType: "Scraper Update",
		timestamp: "2025-02-05T14:00:00Z",
		summary: "Fee",
		diff: [
			{ field: "Fee", oldValue: "6500", newValue: "7000" },
		],
	},
	{
		id: 10,
		admissionId: "1",
		admissionTitle: "BSCS Fall 2025",
		modifiedBy: "Rep_01",
		modifiedByUserId: "user_1",
		changeType: "Manual Edit",
		timestamp: "2025-02-05T09:30:00Z",
		summary: "Overview, Eligibility",
		diff: [
			{ field: "Overview", oldValue: "Computer Science program.", newValue: "A comprehensive undergraduate program in Computer Science covering core CS fundamentals." },
			{ field: "Eligibility", oldValue: "Minimum 60% in FSc.", newValue: "Minimum 60% in FSc/A-Levels with Mathematics." },
		],
		reasonForChange: "Enhanced program description and eligibility criteria.",
	},
]

// Get unique admissions for filter
export const getUniqueAdmissions = (): Array<{ id: string; title: string }> => {
	const admissions = new Map<string, string>()
	adminChangeLogs.forEach((log) => {
		if (!admissions.has(log.admissionId)) {
			admissions.set(log.admissionId, log.admissionTitle)
		}
	})
	return Array.from(admissions.entries()).map(([id, title]) => ({ id, title })).sort((a, b) => a.title.localeCompare(b.title))
}

// Get unique users for filter
export const getUniqueUsers = (): string[] => {
	const users = new Set(adminChangeLogs.map((log) => log.modifiedBy))
	return Array.from(users).sort()
}

export const getChangeTypeColor = (type: ChangeType) => {
	switch (type) {
		// TODO: Enable when scraper module is ready
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

// Get unique universities for filter
export const getUniqueUniversities = (): string[] => {
	const universities = new Set(verificationItems.map((item) => item.university))
	return Array.from(universities).sort()
}

// Helper functions
export const getActionColor = (action: AdminAction["action"]) => {
	switch (action) {
		case "Verified":
			return { bg: "#D1FAE5", text: "#10B981" }
		case "Rejected":
			return { bg: "#FEE2E2", text: "#EF4444" }
		default:
			return { bg: "#F3F4F6", text: "#6B7280" }
	}
}

export const getScraperStatusColor = (status: ScraperActivity["status"]) => {
	switch (status) {
		case "Success":
			return { bg: "#D1FAE5", text: "#10B981" }
		case "No Change":
			return { bg: "#DBEAFE", text: "#2563EB" }
		case "Error":
			return { bg: "#FEE2E2", text: "#EF4444" }
		default:
			return { bg: "#F3F4F6", text: "#6B7280" }
	}
}

export const getScraperJobStatusColor = (status: ScraperJobStatus) => {
	switch (status) {
		case "Success":
			return { bg: "#D1FAE5", text: "#10B981" }
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

// Mock scraper summary data
export const scraperSummary: ScraperSummary = {
	totalJobs: 24,
	successfulJobs: 18,
	failedJobs: 3,
	lastExecution: "2025-02-08 09:00",
}

// Mock system metrics data
export const systemMetrics: SystemMetrics = {
	totalUsers: 1234,
	totalAdmissions: 567,
	totalAlertsSent: 8901,
	aiSummary: "System is running smoothly with 18 successful scraper jobs this week. Total user engagement has increased by 12% compared to last month. 5 new admissions were verified today, and notification delivery rate stands at 98.5%.",
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

// Mock analytics events data
export const analyticsEvents: AnalyticsEvent[] = [
	{
		id: 1,
		userId: "user_1",
		userName: "Rep_01",
		userRole: "UniversityRep",
		eventType: "page_view",
		deviceInfo: { browser: "Chrome", os: "Windows", deviceType: "desktop" },
		sessionId: "session_abc123",
		metadata: { page: "/university/dashboard" },
		timestamp: "2025-02-08T10:15:00Z",
	},
	{
		id: 2,
		userId: "student_1",
		userName: "Student_01",
		userRole: "Student",
		eventType: "search",
		deviceInfo: { browser: "Firefox", os: "macOS", deviceType: "desktop" },
		sessionId: "session_def456",
		metadata: { query: "computer science", results: 15 },
		timestamp: "2025-02-08T10:20:00Z",
	},
	{
		id: 3,
		userId: "student_2",
		userName: "Student_02",
		userRole: "Student",
		eventType: "admission_view",
		deviceInfo: { browser: "Safari", os: "iOS", deviceType: "mobile" },
		sessionId: "session_ghi789",
		metadata: { admissionId: "1", admissionTitle: "BSCS Fall 2025" },
		timestamp: "2025-02-08T10:25:00Z",
	},
	{
		id: 4,
		userId: "admin_main",
		userName: "Admin",
		userRole: "Admin",
		eventType: "page_view",
		deviceInfo: { browser: "Chrome", os: "Windows", deviceType: "desktop" },
		sessionId: "session_jkl012",
		metadata: { page: "/admin/verification" },
		timestamp: "2025-02-08T10:30:00Z",
	},
	{
		id: 5,
		userId: "user_2",
		userName: "Rep_02",
		userRole: "UniversityRep",
		eventType: "download",
		deviceInfo: { browser: "Edge", os: "Windows", deviceType: "desktop" },
		sessionId: "session_mno345",
		metadata: { file: "verification_log.pdf", admissionId: "3" },
		timestamp: "2025-02-08T10:35:00Z",
	},
	{
		id: 6,
		userId: "student_3",
		userName: "Student_03",
		userRole: "Student",
		eventType: "click",
		deviceInfo: { browser: "Chrome", os: "Android", deviceType: "mobile" },
		sessionId: "session_pqr678",
		metadata: { element: "save_to_watchlist", admissionId: "5" },
		timestamp: "2025-02-08T10:40:00Z",
	},
	{
		id: 7,
		userId: "admin_main",
		userName: "Admin",
		userRole: "Admin",
		eventType: "page_view",
		deviceInfo: { browser: "Chrome", os: "Linux", deviceType: "desktop" },
		sessionId: "session_vwx234",
		metadata: { page: "/admin/scraper-logs" },
		timestamp: "2025-02-08T11:00:00Z",
	},
	{
		id: 8,
		userId: "user_3",
		userName: "Rep_03",
		userRole: "UniversityRep",
		eventType: "admission_view",
		deviceInfo: { browser: "Safari", os: "macOS", deviceType: "desktop" },
		sessionId: "session_yza567",
		metadata: { admissionId: "7", admissionTitle: "MBA Executive" },
		timestamp: "2025-02-08T11:15:00Z",
	},
	{
		id: 9,
		userId: "student_4",
		userName: "Student_04",
		userRole: "Student",
		eventType: "search",
		deviceInfo: { browser: "Chrome", os: "Windows", deviceType: "tablet" },
		sessionId: "session_bcd890",
		metadata: { query: "engineering", results: 23 },
		timestamp: "2025-02-08T11:30:00Z",
	},
	{
		id: 10,
		userId: "admin_main",
		userName: "Admin",
		userRole: "Admin",
		eventType: "click",
		deviceInfo: { browser: "Chrome", os: "Windows", deviceType: "desktop" },
		sessionId: "session_efg123",
		metadata: { element: "verify_admission", admissionId: "2" },
		timestamp: "2025-02-08T11:45:00Z",
	},
]

// Get unique users for filter
export const getUniqueAnalyticsUsers = (): string[] => {
	const users = new Set(analyticsEvents.map((event) => event.userName))
	return Array.from(users).sort()
}

// Get unique event types for filter
export const getUniqueEventTypes = (): AnalyticsEventType[] => {
	const types = new Set(analyticsEvents.map((event) => event.eventType))
	return Array.from(types).sort()
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

// Mock admission analytics data
export const admissionAnalytics: AdmissionAnalytics = {
	statusBreakdown: [
		{ status: "Verified", count: 245, percentage: 43.2 },
		{ status: "Pending", count: 189, percentage: 33.3 },
		{ status: "Rejected", count: 89, percentage: 15.7 },
		{ status: "Rejected", count: 44, percentage: 7.8 },
	],
	universityDistribution: [
		{ university: "FAST University", count: 125 },
		{ university: "NUST", count: 98 },
		{ university: "LUMS", count: 87 },
		{ university: "IBA", count: 76 },
		{ university: "GIKI", count: 65 },
		{ university: "Others", count: 116 },
	],
	monthlyTrend: [
		{ month: "Aug 2024", count: 42 },
		{ month: "Sep 2024", count: 58 },
		{ month: "Oct 2024", count: 65 },
		{ month: "Nov 2024", count: 71 },
		{ month: "Dec 2024", count: 68 },
		{ month: "Jan 2025", count: 89 },
		{ month: "Feb 2025", count: 174 },
	],
	degreeTypeDistribution: [
		{ degreeType: "BS", count: 198 },
		{ degreeType: "MS", count: 156 },
		{ degreeType: "MBA", count: 98 },
		{ degreeType: "PhD", count: 67 },
		{ degreeType: "BBA", count: 48 },
	],
	topAdmissions: [
		{ title: "BSCS Fall 2025", university: "FAST University", views: "1.2k", status: "Pending" },
		{ title: "MS Data Science", university: "NUST", views: "980", status: "Verified" },
		{ title: "MBA Executive", university: "LUMS", views: "890", status: "Verified" },
		{ title: "PhD Computer Science", university: "FAST University", views: "750", status: "Verified" },
		{ title: "BBA Honors", university: "IBA", views: "650", status: "Rejected" },
	],
}

// Mock scraper jobs data
export const scraperJobs: ScraperJob[] = [
	{
		id: "1",
		jobId: "SCR-2025-02-08-001",
		university: "FAST University",
		universityId: "1",
		startedAt: "2025-02-08T09:00:00Z",
		finishedAt: "2025-02-08T09:02:15Z",
		status: "Changes Detected",
		sourceUrl: "https://www.nu.edu.pk/admissions",
		duration: "2m 15s",
		schedulerTriggered: true,
		logs: "Starting scraper for FAST University...\nFetching page: https://www.nu.edu.pk/admissions\nParsing HTML structure...\nFound 15 admission entries\nComparing with database...\nDetected 3 changes:\n- BSCS Fall 2025: Deadline updated\n- MS Data Science: Fee updated\n- PhD Computer Science: New admission\nScraping completed successfully.",
		requestMetadata: {
			statusCode: 200,
			headers: {
				"Content-Type": "text/html",
				"User-Agent": "AdmissionTimes-Scraper/1.0",
			},
		},
		changesDetected: [
			{
				admissionId: "1",
				admissionTitle: "BSCS Fall 2025",
				fields: ["deadline"],
			},
			{
				admissionId: "4",
				admissionTitle: "MS Data Science",
				fields: ["fee"],
			},
			{
				admissionId: "6",
				admissionTitle: "PhD Computer Science",
				fields: ["title", "deadline", "fee"],
			},
		],
	},
	{
		id: "2",
		jobId: "SCR-2025-02-08-002",
		university: "NUST",
		universityId: "2",
		startedAt: "2025-02-08T08:30:00Z",
		finishedAt: "2025-02-08T08:32:45Z",
		status: "Failed",
		sourceUrl: "https://www.nust.edu.pk/admissions",
		duration: "2m 45s",
		schedulerTriggered: true,
		logs: "Starting scraper for NUST...\nFetching page: https://www.nust.edu.pk/admissions\nConnection timeout after 30 seconds.\nRetrying...\nConnection timeout after 30 seconds.\nScraping failed.",
		errorLog: "Error: Connection timeout\nFailed to fetch page: https://www.nust.edu.pk/admissions\nStatus: ETIMEDOUT\nTime: 2025-02-08T08:32:45Z",
		requestMetadata: {
			statusCode: 408,
		},
	},
	{
		id: "3",
		jobId: "SCR-2025-02-07-003",
		university: "LUMS",
		universityId: "3",
		startedAt: "2025-02-07T18:00:00Z",
		finishedAt: "2025-02-07T18:01:30Z",
		status: "No Changes",
		sourceUrl: "https://lums.edu.pk/admissions",
		duration: "1m 30s",
		schedulerTriggered: true,
		logs: "Starting scraper for LUMS...\nFetching page: https://lums.edu.pk/admissions\nParsing HTML structure...\nFound 12 admission entries\nComparing with database...\nNo changes detected.\nScraping completed successfully.",
		requestMetadata: {
			statusCode: 200,
		},
	},
	{
		id: "4",
		jobId: "SCR-2025-02-07-004",
		university: "IBA",
		universityId: "4",
		startedAt: "2025-02-07T15:00:00Z",
		finishedAt: "2025-02-07T15:02:00Z",
		status: "Changes Detected",
		sourceUrl: "https://www.iba.edu.pk/admissions",
		duration: "2m 0s",
		schedulerTriggered: true,
		logs: "Starting scraper for IBA...\nFetching page: https://www.iba.edu.pk/admissions\nParsing HTML structure...\nFound 8 admission entries\nComparing with database...\nDetected 2 changes:\n- BBA Honors: Deadline updated\n- MBA Executive: Fee updated\nScraping completed successfully.",
		requestMetadata: {
			statusCode: 200,
		},
		changesDetected: [
			{
				admissionId: "5",
				admissionTitle: "BBA Honors",
				fields: ["deadline"],
			},
			{
				admissionId: "7",
				admissionTitle: "MBA Executive",
				fields: ["fee"],
			},
		],
	},
	{
		id: "5",
		jobId: "SCR-2025-02-07-005",
		university: "University of Karachi",
		universityId: "5",
		startedAt: "2025-02-07T12:00:00Z",
		finishedAt: "2025-02-07T12:01:45Z",
		status: "Success",
		sourceUrl: "https://www.uok.edu.pk/admissions",
		duration: "1m 45s",
		schedulerTriggered: false,
		logs: "Starting scraper for University of Karachi...\nFetching page: https://www.uok.edu.pk/admissions\nParsing HTML structure...\nFound 20 admission entries\nComparing with database...\nAll entries match database.\nScraping completed successfully.",
		requestMetadata: {
			statusCode: 200,
		},
	},
	{
		id: "6",
		jobId: "SCR-2025-02-06-006",
		university: "Quaid-e-Azam University",
		universityId: "6",
		startedAt: "2025-02-06T10:00:00Z",
		finishedAt: "2025-02-06T10:02:30Z",
		status: "Failed",
		sourceUrl: "https://www.qau.edu.pk/admissions",
		duration: "2m 30s",
		schedulerTriggered: true,
		logs: "Starting scraper for Quaid-e-Azam University...\nFetching page: https://www.qau.edu.pk/admissions\nReceived 403 Forbidden response.\nScraping failed.",
		errorLog: "Error: 403 Forbidden\nAccess denied to page: https://www.qau.edu.pk/admissions\nStatus: 403\nTime: 2025-02-06T10:02:30Z",
		requestMetadata: {
			statusCode: 403,
		},
	},
	{
		id: "7",
		jobId: "SCR-2025-02-06-007",
		university: "NED University",
		universityId: "7",
		startedAt: "2025-02-06T08:00:00Z",
		finishedAt: "2025-02-06T08:01:20Z",
		status: "No Changes",
		sourceUrl: "https://www.neduet.edu.pk/admissions",
		duration: "1m 20s",
		schedulerTriggered: true,
		logs: "Starting scraper for NED University...\nFetching page: https://www.neduet.edu.pk/admissions\nParsing HTML structure...\nFound 10 admission entries\nComparing with database...\nNo changes detected.\nScraping completed successfully.",
		requestMetadata: {
			statusCode: 200,
		},
	},
	{
		id: "8",
		jobId: "SCR-2025-02-05-008",
		university: "GIKI",
		universityId: "8",
		startedAt: "2025-02-05T14:00:00Z",
		finishedAt: "2025-02-05T14:03:00Z",
		status: "Changes Detected",
		sourceUrl: "https://www.giki.edu.pk/admissions",
		duration: "3m 0s",
		schedulerTriggered: true,
		logs: "Starting scraper for GIKI...\nFetching page: https://www.giki.edu.pk/admissions\nParsing HTML structure...\nFound 6 admission entries\nComparing with database...\nDetected 1 change:\n- BSc Electrical Engineering: Fee updated\nScraping completed successfully.",
		requestMetadata: {
			statusCode: 200,
		},
		changesDetected: [
			{
				admissionId: "10",
				admissionTitle: "BSc Electrical Engineering",
				fields: ["fee"],
			},
		],
	},
]

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


