// Shared mock data for University Module - ensures consistency across all pages

export type AdmissionStatus = "Active" | "Closing Soon" | "Draft" | "Closed" | "Pending Audit" | "Verified" | "Rejected" | "Disputed"

export type AuditStatus = "Pending" | "Verified" | "Rejected" | "Disputed"

export interface Admission {
	id: string
	title: string
	deadline: string
	status: AdmissionStatus
	verification_status?: 'verified' | 'pending' | 'rejected' | 'draft' | 'disputed'
	views?: string // Optional - may not be present in API data
	verifiedBy?: string
	lastAction?: string
	remarks?: string
	
	// Program classification
	degreeType?: string
	program_type?: string
	field_of_study?: string
	
	// Program details
	department?: string
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
	admission: string
	modifiedBy: string
	date: string
	diff: Array<{ field: string; old: string; new: string }>
}

export interface NotificationItem {
	id: number
	title: string
	message: string
	type: "Admin Feedback" | "System Alert" | "Data Update"
	time: string
	read: boolean
	admissionId?: string
}

// Shared admissions data - used across Dashboard, ManageAdmissions, VerificationCenter, ChangeLogs
export const sharedAdmissions: Admission[] = [
	{
		id: "1",
		title: "BSCS Fall 2025",
		deadline: "2025-07-15",
		status: "Pending Audit",
		verification_status: "pending",
		views: "1.2k",
		verifiedBy: "Admin",
		lastAction: "2025-02-07",
		remarks: "Under review",
		degreeType: "BS",
		department: "School of Engineering",
		academicYear: "2025-2026",
		fee: "5000",
		created_at: "2025-02-01T10:00:00Z",
		updated_at: "2025-02-07T15:30:00Z",
	},
	{
		id: "2",
		title: "MBA Executive",
		deadline: "2025-08-10",
		status: "Verified",
		verification_status: "verified",
		views: "890",
		verifiedBy: "Admin",
		lastAction: "2025-02-05",
		remarks: "Data validated successfully",
		degreeType: "MBA",
		department: "Business School",
		academicYear: "2025-2026",
		fee: "7500",
		created_at: "2025-01-15T10:00:00Z",
		updated_at: "2025-02-05T10:00:00Z",
	},
	{
		id: "3",
		title: "MS Data Science",
		deadline: "2025-06-30",
		status: "Rejected",
		verification_status: "rejected",
		views: "640",
		verifiedBy: "Admin",
		lastAction: "2025-02-06",
		remarks: "Incomplete document",
		degreeType: "MS",
		department: "School of Computing",
		academicYear: "2025-2026",
		fee: "6000",
		created_at: "2025-01-20T10:00:00Z",
		updated_at: "2025-02-06T10:00:00Z",
	},
	{
		id: "4",
		title: "PhD Physics",
		deadline: "2025-09-01",
		status: "Pending Audit",
		verification_status: "pending",
		views: "150",
		verifiedBy: "Admin",
		lastAction: "2025-02-03",
		remarks: "Queue position updated",
		degreeType: "PhD",
		department: "School of Sciences",
		academicYear: "2025-2026",
		fee: "8000",
		created_at: "2025-01-25T10:00:00Z",
		updated_at: "2025-02-03T10:00:00Z",
	},
	{
		id: "5",
		title: "BBA Honors",
		deadline: "2025-07-20",
		status: "Disputed",
		verification_status: "disputed",
		views: "320",
		verifiedBy: "Admin",
		lastAction: "2025-02-04",
		remarks: "University requested recheck",
		degreeType: "BBA",
		department: "Business School",
		academicYear: "2025-2026",
		fee: "4500",
		created_at: "2025-01-30T10:00:00Z",
		updated_at: "2025-02-04T10:00:00Z",
	},
]

// Audit items derived from admissions
export const sharedAudits: AuditItem[] = sharedAdmissions
	.filter((a) => ["Pending Audit", "Verified", "Rejected", "Disputed"].includes(a.status))
	.map((a, idx) => ({
		id: idx + 1,
		title: a.title,
		status: (a.status === "Pending Audit" ? "Pending" : a.status) as AuditStatus,
		verifiedBy: a.verifiedBy,
		lastAction: a.lastAction || "",
		remarks: a.remarks,
	}))

// Change logs
export const sharedChangeLogs: ChangeLogItem[] = [
	{
		id: 1,
		admission: "BSCS Fall 2025",
		modifiedBy: "Rep_01",
		date: "2025-02-07 13:45",
		diff: [
			{ field: "Deadline", old: "2025-07-10", new: "2025-07-15" },
			{ field: "Fee", old: "5000", new: "5500" },
		],
	},
	{
		id: 2,
		admission: "MBA Executive",
		modifiedBy: "Admin",
		date: "2025-02-05 09:20",
		diff: [{ field: "Status", old: "Pending Audit", new: "Verified" }],
	},
	{
		id: 3,
		admission: "MS Data Science",
		modifiedBy: "Admin",
		date: "2025-02-06 14:30",
		diff: [{ field: "Status", old: "Pending Audit", new: "Rejected" }],
	},
	{
		id: 4,
		admission: "BBA Honors",
		modifiedBy: "Rep_01",
		date: "2025-02-04 11:15",
		diff: [{ field: "Status", old: "Verified", new: "Disputed" }],
	},
]

// Notifications
export const sharedNotifications: NotificationItem[] = [
	{
		id: 1,
		title: "Audit Update",
		message: "Your admission 'BSCS Fall 2025' is under review.",
		type: "Admin Feedback",
		time: "2025-02-08T10:00:00Z",
		read: false,
		admissionId: "1",
	},
	{
		id: 2,
		title: "System Alert",
		message: "Scheduled maintenance on 12th Feb, 2 AM.",
		type: "System Alert",
		time: "2025-02-07T14:00:00Z",
		read: true,
	},
	{
		id: 3,
		title: "Admission Update",
		message: "Admission 'BBA Honors' has been marked as Disputed.",
		type: "Data Update",
		time: "2025-02-07T08:30:00Z",
		read: false,
		admissionId: "5",
	},
	{
		id: 4,
		title: "Verification Complete",
		message: "Your admission 'MBA Executive' has been verified.",
		type: "Admin Feedback",
		time: "2025-02-06T16:00:00Z",
		read: false,
		admissionId: "2",
	},
	{
		id: 5,
		title: "Verification Result",
		message: "Your admission 'MS Data Science' was rejected. Reason: Incomplete document.",
		type: "Admin Feedback",
		time: "2025-02-06T14:30:00Z",
		read: false,
		admissionId: "3",
	},
]

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
		case "Disputed":
			return { bg: "#FED7AA", text: "#EA580C" }
		default:
			return { bg: "#F3F4F6", text: "#6B7280" }
	}
}

export const getAdmissionById = (id: string): Admission | undefined => {
	return sharedAdmissions.find((a) => a.id === id)
}

