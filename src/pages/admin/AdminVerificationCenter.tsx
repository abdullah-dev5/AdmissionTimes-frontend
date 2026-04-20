import { useState, useMemo, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import AdminLayout from "../../layouts/AdminLayout"
import { adminService } from "../../services/adminService"
import {
	getVerificationStatusColor,
	type VerificationItem,
	type VerificationStatus,
} from "../../data/adminData"
import { formatDisplayDate, formatDisplayDateTime } from "../../utils/dateUtils"
import { LoadingSpinner } from "../../components/common/LoadingSpinner"
import { showSuccessToast } from "../../utils/swal"
import { flattenProgramAdmissions, shouldHideGenericScraperAnnouncement } from "../../utils/scraperAdmissionAdapter"

const formatLabel = (value: string) =>
	value
		.replace(/_/g, " ")
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/\b\w/g, (char) => char.toUpperCase())

const isDateLikeField = (field?: string) => {
	if (!field) return false
	return /(date|deadline|time|updated|created|verified|submitted)/i.test(field)
}

const formatDateValue = (value?: string) => {
	if (!value) return "—"
	const parsed = new Date(value)
	if (Number.isNaN(parsed.getTime())) return value
	return formatDisplayDateTime(parsed.toISOString(), value)
}

const normalizeForCompare = (value: unknown): string => {
	if (value === null || value === undefined) return ""
	if (typeof value === "string") return value.trim()
	if (typeof value === "number" || typeof value === "boolean") return String(value)
	try {
		return JSON.stringify(value)
	} catch {
		return String(value)
	}
}

const normalizeValue = (value: unknown) => {
	if (typeof value === "string") {
		const trimmed = value.trim()
		if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
			try {
				return JSON.parse(trimmed)
			} catch {
				return value
			}
		}
	}
	return value
}

const formatInline = (value: unknown): string => {
	const normalized = normalizeValue(value)
	if (normalized === null || normalized === undefined || normalized === "") {
		return "—"
	}
	if (Array.isArray(normalized)) {
		return normalized.map((item) => formatInline(item)).join(", ")
	}
	if (typeof normalized === "object") {
		return Object.entries(normalized as Record<string, unknown>)
			.map(([key, val]) => `${formatLabel(key)}: ${formatInline(val)}`)
			.join(", ")
	}
	return String(normalized)
}

const renderValue = (value: unknown) => {
	const normalized = normalizeValue(value)
	if (normalized === null || normalized === undefined || normalized === "") {
		return <span className="text-gray-400 italic">(empty)</span>
	}
	if (Array.isArray(normalized)) {
		return (
			<div className="flex flex-wrap gap-2">
				{normalized.map((item, idx) => (
					<span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
						{formatInline(item)}
					</span>
				))}
			</div>
		)
	}
	if (typeof normalized === "object") {
		return (
			<div className="space-y-1">
				{Object.entries(normalized as Record<string, unknown>).map(([key, val]) => (
					<div key={key} className="flex items-start gap-3">
						<span className="text-xs text-gray-500 min-w-[120px]">{formatLabel(key)}</span>
						<span className="text-sm text-gray-800 break-words">{formatInline(val)}</span>
					</div>
				))}
			</div>
		)
	}
	return <span className="text-sm text-gray-800 break-words">{String(normalized)}</span>
}

const renderDiffValue = (value: unknown, fieldName?: string) => {
	const normalized = normalizeValue(value)
	if (normalized === null || normalized === undefined || normalized === "") {
		return <span className="text-gray-400 italic">(empty)</span>
	}

	if (typeof normalized === "string") {
		const cleaned = normalized.trim()
		if (!cleaned || cleaned.toLowerCase() === "null" || cleaned.toLowerCase() === "undefined") {
			return <span className="text-gray-400 italic">(empty)</span>
		}
		if (isDateLikeField(fieldName)) {
			return <span className="text-sm text-gray-800 break-words">{formatDateValue(cleaned)}</span>
		}
		return <span className="text-sm text-gray-800 break-words">{cleaned}</span>
	}

	return renderValue(normalized)
}

const isUuid = (value: string) => /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(value)

const safeLabel = (value: string | null | undefined, fallback: string) => {
	if (!value) return fallback
	if (isUuid(value)) return fallback
	return value
}

const getSubmittedViaLabel = (admission: any) => {
	if (admission?.data_origin === "scraper") {
		return "Crawl"
	}

	return safeLabel(admission?.submitted_by_label || admission?.submitted_by || admission?.created_by, "University")
}

const buildRemarksList = (item: VerificationItem | null) => {
	if (!item) return []
	const entries = [
		{ label: "Rejection reason", value: item.rejectionReason },
		{ label: "Review reason", value: item.reviewReason },
		{ label: "Verification comments", value: item.verificationComments },
		{ label: "Admin notes", value: item.adminNotes },
	]
	return entries.filter((entry) => entry.value && String(entry.value).trim())
}

const getFriendlyErrorMessage = (raw?: string | null) => {
	const message = (raw || "").toLowerCase()
	if (!message) return "Something went wrong while loading verification data."
	if (message.includes("already verified")) return "This admission is already verified."
	if (message.includes("already rejected")) return "This admission is already rejected."
	if (message.includes("already pending")) return "This admission is already pending review."
	if (message.includes("401") || message.includes("unauthorized")) return "Your session has expired. Please sign in again."
	if (message.includes("403") || message.includes("forbidden")) return "You do not have permission to perform this action."
	if (message.includes("timeout") || message.includes("network") || message.includes("fetch")) {
		return "Connection issue detected. Please check your internet and try again."
	}
	return "We could not complete this request right now. Please try again."
}

const inferDegreeFromTitle = (title?: string | null): string => {
	const text = String(title || "").toLowerCase()
	if (!text) return "N/A"
	if (/\bbba\b|bachelor of business administration/.test(text)) return "BBA"
	if (/\bmba\b|master of business administration/.test(text)) return "MBA"
	if (/\bphd\b|doctor of philosophy|doctorate/.test(text)) return "PhD"
	if (/\bmd\b|doctor of medicine/.test(text)) return "MD"
	if (/\bmphil\b|master of philosophy/.test(text)) return "MPhil"
	if (/\bms\b|master of science|\bmaster\b|postgraduate|post-graduate|\bgraduate\b/.test(text)) return "MS"
	if (/\bbs\b|bachelor of science|\bbe\b|bachelor|undergraduate|under-graduate/.test(text)) return "BS"
	return "N/A"
}

const resolveCanonicalAdmissionId = (item: Pick<VerificationItem, "id" | "sourceAdmissionId">): string => {
	if (item.sourceAdmissionId && item.sourceAdmissionId.trim().length > 0) {
		return item.sourceAdmissionId
	}

	const currentId = String(item.id || "")
	const normalized = currentId.includes("::program::") ? currentId.split("::program::")[0] : currentId
	return isUuid(normalized) ? normalized : ""
}

	interface AdminVerificationCenterProps {
		forcedDataOrigin?: "scraper" | "manual" | "university"
	}

	function AdminVerificationCenter({ forcedDataOrigin }: AdminVerificationCenterProps) {
	const navigate = useNavigate()
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const queryDataOrigin = searchParams.get("source")
	const resolvedDataOrigin =
		forcedDataOrigin ||
		(queryDataOrigin === "scraper" || queryDataOrigin === "manual" || queryDataOrigin === "university"
			? queryDataOrigin
			: undefined)
	const [statusFilter, setStatusFilter] = useState<VerificationStatus | "All">("All")
	const [dataOriginFilter, setDataOriginFilter] = useState<"All" | "scraper" | "manual" | "university">(
		resolvedDataOrigin || "All",
	)
	const [universityFilter, setUniversityFilter] = useState<string>("All")
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null)
	const [actionType, setActionType] = useState<"Verify" | "Reject" | "Revision" | null>(null)
	const [remarks, setRemarks] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 10
	const autoRefreshMs = 30_000

	// API state
	const [apiVerifications, setApiVerifications] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	// Fetch pending admissions on component mount
	useEffect(() => {
		fetchAllAdmissions()
	}, [])

	useEffect(() => {
		// Refetch when status filter changes
		if (currentPage === 1) {
			fetchAllAdmissions()
		} else {
			setCurrentPage(1)
		}
	}, [statusFilter, dataOriginFilter])

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			void fetchAllAdmissions()
		}, autoRefreshMs)

		return () => {
			window.clearInterval(intervalId)
		}
	}, [statusFilter, dataOriginFilter, resolvedDataOrigin])

	useEffect(() => {
		const selectedId = (location.state as { selectedId?: string } | null | undefined)?.selectedId
		if (!selectedId || !apiVerifications.length) {
			return
		}
		if (selectedItem?.id === selectedId) {
			return
		}
		const match = apiVerifications.find((item) => item.id === selectedId)
		if (match) {
			handleReview(match)
		}
	}, [apiVerifications, location.state, selectedItem?.id])

	/**
	 * Fetch all admissions from API with status filter
	 */
	const fetchAllAdmissions = async () => {
		try {
			setLoading(true)
			setError(null)
			const status = statusFilter === "All" ? undefined : statusFilter?.toLowerCase()
			const pageSize = 100
			let page = 1
			let hasNext = true
			const allAdmissions: any[] = []

			while (hasNext) {
				const response = await adminService.getAllAdmissions(
					page,
					pageSize,
					status,
					resolvedDataOrigin || (dataOriginFilter === "All" ? undefined : dataOriginFilter),
				)

				allAdmissions.push(...(response.data || []))
				hasNext = Boolean(response.pagination?.hasNext)
				page += 1

				// Hard guard to prevent accidental infinite paging loops on malformed pagination metadata.
				if (page > 200) {
					hasNext = false
				}
			}

			// Transform API data to VerificationItem format
			const transformed = transformApiAdmissions(allAdmissions)
			setApiVerifications(transformed)
		} catch (err: any) {
			console.error('🔴 [AdminVerificationCenter] Error fetching admissions:', err)
			setError(getFriendlyErrorMessage(err?.message || 'Failed to fetch admissions'))
		} finally {
			setLoading(false)
		}
	}

	/**
	 * Transform API admissions to VerificationItem format with university data enrichment
	 */
	const transformApiAdmissions = (data: any): VerificationItem[] => {
		// Handle both paginated and non-paginated responses
		const admissions = flattenProgramAdmissions(Array.isArray(data) ? data : (data?.data || data?.pending_verifications || []))
			.filter((admission) => !shouldHideGenericScraperAnnouncement(admission))
		const statusMap: Record<string, VerificationStatus> = {
			pending: "Pending",
			verified: "Verified",
			rejected: "Rejected",
		}
		
		const mappedItems = admissions.map((admission: any) => {
			const resolvedTitle = admission.admission_title || admission.title || admission.program_title || 'Unknown'
			const resolvedDegree = admission.degree_level || admission.degree_type || inferDegreeFromTitle(resolvedTitle)
			const resolvedFee =
				admission.fee_display ||
				admission.fee ||
				(admission.application_fee ? `${admission.currency || 'PKR'} ${admission.application_fee}` : 'N/A')
			const sourceAdmissionId =
				admission.source_admission_id ||
				admission.parent_admission_id ||
				(String(admission.id || '').includes('::program::') ? String(admission.id).split('::program::')[0] : undefined)

			const universityName = safeLabel(
				admission.university_name || admission.universities?.name || admission.location,
				'Unknown University'
			)
			
			return {
				rejectionReason: admission.rejection_reason ?? null,
				reviewReason: admission.rejection_reason ?? null,
				verificationComments: admission.verification_comments ?? null,
				adminNotes: admission.admin_notes ?? null,
				remarks:
					admission.rejection_reason ||
					admission.verification_comments ||
					admission.admin_notes ||
					null,
				verificationStatusRaw: admission.verification_status,
				dataOrigin: ((admission.data_origin || (String(admission.source_system || '').toLowerCase().includes('scraper') ? 'scraper' : 'manual')) as "scraper" | "manual" | "university"),
				sourceSystem: admission.source_system || null,
				id: admission.id || admission.admission_id,
				sourceAdmissionId,
				admissionTitle: resolvedTitle,
				university: universityName,
				submittedBy: getSubmittedViaLabel(admission),
				submittedOn: formatDisplayDate(admission.submitted_on || admission.created_at, 'N/A'),
				status: statusMap[admission.verification_status] || (admission.status_label === 'Pending' ? 'Pending' : 'Pending' as VerificationStatus),
				metadata: {
					title: resolvedTitle,
					degree: resolvedDegree,
					program: admission.program_type || admission.program_title || 'N/A',
					fee: resolvedFee,
					deadline: formatDisplayDate(admission.deadline, 'N/A'),
					academicYear: 'N/A',
					university: universityName,
				},
			}
		})

		// Keep scraper-origin records isolated to the dedicated scraped verification route
		// to avoid duplicate rendering across both verification pages.
		if (!resolvedDataOrigin) {
			return mappedItems.filter((item) => item.dataOrigin !== "scraper")
		}

		return mappedItems
	}

	// Use API data only; no mock fallback
	const verificationDataToUse = apiVerifications
	const universityList = useMemo(() => {
		const uniqueUniversities = new Set<string>()
		verificationDataToUse.forEach(item => uniqueUniversities.add(item.university))
		return Array.from(uniqueUniversities).sort()
	}, [verificationDataToUse])

	// Filter and search logic
	const filteredItems = useMemo(() => {
		let filtered = [...verificationDataToUse]

		// Status filter
		if (statusFilter !== "All") {
			filtered = filtered.filter((item) => item.status === statusFilter)
		}

		// University filter
		if (universityFilter !== "All") {
			filtered = filtered.filter((item) => item.university === universityFilter)
		}

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.trim().toLowerCase()
			filtered = filtered.filter((item) =>
				item.admissionTitle.toLowerCase().includes(query) ||
				item.university.toLowerCase().includes(query) ||
				item.submittedBy.toLowerCase().includes(query)
			)
		}

		return filtered
	}, [statusFilter, universityFilter, searchQuery, verificationDataToUse])

	// Pagination
	const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
	const paginatedItems = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage
		return filteredItems.slice(startIndex, startIndex + itemsPerPage)
	}, [filteredItems, currentPage])

	const handleReview = async (item: VerificationItem) => {
		setSelectedItem(item)
		setActionType(null)
		setRemarks("")
		const admissionId = resolveCanonicalAdmissionId(item)
		if (!admissionId) {
			setError('This record cannot be reviewed yet because its canonical admission ID is missing. Please refresh and try again.')
			return
		}
		
		// Fetch changelog data for this admission
		try {
			const changelogResponse = await adminService.getChangeLogs(1, 100, {
				admission_id: admissionId,
			})
			
			// Handle both paginated and non-paginated responses
			let changelogs: any[] = []
			if (Array.isArray(changelogResponse)) {
				changelogs = changelogResponse
			} else if (Array.isArray(changelogResponse?.data)) {
				changelogs = changelogResponse.data
			} else if (Array.isArray(changelogResponse?.data?.data)) {
				changelogs = changelogResponse.data.data
			} else if (Array.isArray(changelogResponse?.data?.changelogs)) {
				changelogs = changelogResponse.data.changelogs
			}
			
			// Keep field-level change actions relevant for review
			const updatedChanges = changelogs
				.filter((log: any) => ['updated', 'status_changed', 'verified', 'rejected'].includes(String(log.action_type || '').toLowerCase()))
				.filter((log: any) => Boolean(log.field_name))
				.sort((a: any, b: any) => {
					const aTime = new Date(a.created_at || a.changed_at || a.changed_at_iso || 0).getTime()
					const bTime = new Date(b.created_at || b.changed_at || b.changed_at_iso || 0).getTime()
					return aTime - bTime
				})
			
			// Merge repeated field updates into one clear net change per field.
			const fieldMap = new Map<string, { field: string; oldValue: string; newValue: string; changeCount: number; latestAt?: string }>()
			for (const log of updatedChanges) {
				const field = String(log.field_name || 'Unknown')
				const oldRaw = normalizeForCompare(log.old_value)
				const newRaw = normalizeForCompare(log.new_value)

				// Ignore noisy no-op entries (old == new)
				if (oldRaw === newRaw) continue

				if (!fieldMap.has(field)) {
					fieldMap.set(field, {
						field,
						oldValue: oldRaw,
						newValue: newRaw,
						changeCount: 1,
						latestAt: log.created_at || log.changed_at || log.changed_at_iso,
					})
				} else {
					const existing = fieldMap.get(field)!
					existing.newValue = newRaw
					existing.changeCount += 1
					existing.latestAt = log.created_at || log.changed_at || log.changed_at_iso || existing.latestAt
				}
			}

			const diffData = Array.from(fieldMap.values()).sort((a, b) => {
				const aTime = new Date(a.latestAt || 0).getTime()
				const bTime = new Date(b.latestAt || 0).getTime()
				return bTime - aTime
			})
			
			// Update selected item with diff data
			setSelectedItem((prev) => prev ? { ...prev, diffData } : item)
			console.log('🔍 [AdminVerificationCenter] Changelog diff data:', diffData)
		} catch (err) {
			console.error('🔴 [AdminVerificationCenter] Error fetching changelog:', err)
		}
	}

	const closeReviewModal = () => {
		setSelectedItem(null)
		setActionType(null)
		setRemarks("")
		if ((location.state as { selectedId?: string } | null | undefined)?.selectedId) {
			navigate(`${location.pathname}${location.search}`, { replace: true, state: {} })
		}
	}

	const handleActionSelect = (action: "Verify" | "Reject" | "Revision") => {
		setActionType(action)
		setRemarks("")
	}

	const handleSubmitAction = async () => {
		if (!selectedItem || !actionType || remarks.trim().length < 10) {
			return
		}

		// ✅ Validate state transition before submitting
		const currentStatus = selectedItem.verificationStatusRaw || selectedItem.status.toLowerCase()
		
		if (actionType === 'Verify' && currentStatus === 'verified') {
			setError('This admission is already verified. No action needed.')
			return
		}
		if (actionType === 'Reject' && currentStatus === 'rejected') {
			setError('This admission is already rejected. No action needed.')
			return
		}
		if (actionType === 'Revision' && currentStatus === 'pending') {
			setError('This admission is already pending. You can still send revision notes if needed.')
		}

		try {
			setSubmitting(true)
			setError(null) // Clear any previous errors
			const admissionId = resolveCanonicalAdmissionId(selectedItem)
			if (!admissionId) {
				setError('Unable to submit verification because canonical admission ID is missing for this record.')
				return
			}

			if (actionType === 'Verify') {
				console.log('✅ Verifying admission:', admissionId)
				await adminService.verifyAdmission(admissionId, {
					verification_status: 'verified',
					verification_comments: remarks,
				})
			} else if (actionType === 'Reject') {
				console.log('❌ Rejecting admission:', admissionId)
				await adminService.rejectAdmission(admissionId, remarks)
			} else if (actionType === 'Revision') {
				console.log('🟠 Requesting revision:', admissionId)
				await adminService.requestRevision(admissionId, remarks)
			}

			await showSuccessToast(
				actionType === 'Verify'
					? 'Admission marked as verified.'
					: actionType === 'Reject'
						? 'Admission rejected successfully.'
						: 'Revision request submitted successfully.',
				'Verification Updated',
				'top-end'
			)

			// Close immediately after successful action.
			// This avoids route-state driven modal reopen while list refreshes.
			closeReviewModal()

			// Refresh the list after successful action
			await fetchAllAdmissions()
		} catch (err: any) {
			console.error('🔴 [AdminVerificationCenter] Error submitting action:', err)
			setError(getFriendlyErrorMessage(err?.message || 'Failed to submit action'))
		} finally {
			setSubmitting(false)
		}
	}

	const handleResetFilters = () => {
		setStatusFilter("All")
		setDataOriginFilter(resolvedDataOrigin || "All")
		setUniversityFilter("All")
		setSearchQuery("")
		setCurrentPage(1)
	}

	const showInitialLoading = loading && apiVerifications.length === 0

	if (showInitialLoading) {
		return (
			<AdminLayout>
				<LoadingSpinner fullScreen message="Loading admissions from backend..." />
			</AdminLayout>
		)
	}

	return (
		<AdminLayout>
			<div className="p-6">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-2xl font-bold mb-2" style={{ color: "#111827" }}>
						{resolvedDataOrigin === "scraper" ? "Scraped Verification Center" : "Verification Center"}
					</h1>
					<p className="text-gray-600">
						{resolvedDataOrigin === "scraper"
							? "Review and manage scraper-origin admissions synced from scraper DB through backend ingestion, including FAST and other universities."
							: "Review and manage admissions requiring verification."}
					</p>
				</div>

				{/* Error Banner */}
				{error && (
					<div className="mb-6 rounded-2xl border border-red-200 bg-white shadow-sm p-5">
						<div className="flex items-start gap-3">
							<div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
								<svg className="w-4.5 h-4.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
								</svg>
							</div>
							<div>
								<p className="text-sm font-semibold text-red-900">Unable to continue this action</p>
								<p className="text-sm text-red-700 mt-1">{error}</p>
							</div>
						</div>
						<button
							onClick={() => setError(null)}
							className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
						>
							Dismiss
						</button>
					</div>
				)}

				{/* Loading Indicator */}
				{loading && <LoadingSpinner size="sm" message="Refreshing admissions..." />}

				{/* Filters Panel */}
				<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						{/* Status Filter - Tabs */}
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-sm text-gray-600 mr-2">Status:</span>
							{(["All", "Pending", "Verified", "Rejected"] as const).map((status) => (
								<button
									key={status}
									onClick={() => {
										setStatusFilter(status === "All" ? "All" : status)
										setCurrentPage(1)
									}}
									className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
										statusFilter === status
											? "text-white"
											: "text-gray-600 hover:bg-gray-100"
									}`}
									style={
										statusFilter === status
											? { backgroundColor: "#004AAD" }
											: { backgroundColor: "transparent" }
									}
								>
									{status}
								</button>
							))}
						</div>

						{/* University Filter & Search */}
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							{!resolvedDataOrigin && (
								<div className="flex items-center gap-2">
									<label className="text-sm text-gray-600">Source:</label>
									<select
										value={dataOriginFilter}
										onChange={(e) => {
											setDataOriginFilter(e.target.value as "All" | "scraper" | "manual" | "university")
											setCurrentPage(1)
										}}
										className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
									>
										<option value="All">All</option>
										<option value="university">University</option>
										<option value="manual">Manual</option>
									</select>
								</div>
							)}

							<div className="flex items-center gap-2">
								<label className="text-sm text-gray-600">University:</label>
								<select
									value={universityFilter}
									onChange={(e) => {
										setUniversityFilter(e.target.value)
										setCurrentPage(1)
									}}
									className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
								>
									<option value="All">All</option>
									{universityList.map((uni) => (
										<option key={uni} value={uni}>
											{uni}
										</option>
									))}
								</select>
							</div>

							<div className="relative">
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => {
										setSearchQuery(e.target.value)
										setCurrentPage(1)
									}}
									placeholder="Search admission title..."
									className="w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<svg
									className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Verification Table */}
				<div className="bg-white rounded-lg shadow-sm p-6">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-200">
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Program Title</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">University</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Submitted Via</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Submitted On</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Remarks</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
								</tr>
							</thead>
							<tbody>
								{paginatedItems.map((item) => {
									const statusColors = getVerificationStatusColor(item.status)
									return (
										<tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
											<td className="py-4 px-4">
												<p className="font-medium" style={{ color: "#111827" }}>
													{item.admissionTitle}
												</p>
													{item.dataOrigin === "scraper" && (
														<span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
															Scraped
														</span>
													)}
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600">{item.university}</p>
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600">{item.submittedBy}</p>
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600">{item.submittedOn}</p>
											</td>
											<td className="py-4 px-4">
												<span
													className="px-2 py-1 rounded-full text-xs font-medium"
													style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
												>
													{item.status}
												</span>
											</td>
											<td className="py-4 px-4">
												<p
													className="text-sm text-gray-600 max-w-[220px] truncate"
													title={item.remarks || ""}
												>
													{item.remarks || "—"}
												</p>
											</td>
											<td className="py-4 px-4">
												<button
													onClick={() => handleReview(item)}
													className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
												>
													Review
												</button>
											</td>
										</tr>
									)
								})}
								{paginatedItems.length === 0 && (
									<tr>
										<td colSpan={7} className="py-10 text-center">
											<div className="flex flex-col items-center justify-center">
												<svg
													className="w-16 h-16 text-gray-400 mb-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2.5"
													/>
												</svg>
												<p className="text-sm font-medium text-gray-500 mb-2">No admissions found for this filter.</p>
												<button
													onClick={handleResetFilters}
													className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
													style={{ backgroundColor: "#004AAD" }}
												>
													Reset Filters
												</button>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="mt-6 flex items-center justify-between">
							<p className="text-sm text-gray-600">
								Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of{" "}
								{filteredItems.length} admissions
							</p>
							<div className="flex items-center gap-2">
								<button
									onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
									disabled={currentPage === 1}
									className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer transition-colors"
								>
									Previous
								</button>
								<span className="text-sm text-gray-600">
									Page {currentPage} of {totalPages}
								</span>
								<button
									onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
									disabled={currentPage === totalPages}
									className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer transition-colors"
								>
									Next
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Review Modal */}
				{selectedItem && (
				<div 
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
					onClick={(e) => {
						// Close modal only if clicking on the background, not the modal itself
						if (e.target === e.currentTarget) {
							closeReviewModal()
						}
					}}
				>
						<div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-lg overflow-hidden flex flex-col">
							{/* Modal Header */}
							<div className="p-6 border-b border-gray-200 flex items-center justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3">
										<h2 className="text-xl font-semibold" style={{ color: "#111827" }}>
											Review Admission
										</h2>
										{/* ✅ Current Status Badge */}
										<span
											className="px-3 py-1 rounded-full text-xs font-semibold"
											style={{
											backgroundColor: getVerificationStatusColor(selectedItem.status).bg,
											color: getVerificationStatusColor(selectedItem.status).text,
											}}
										>
											{selectedItem.status}
										</span>
									</div>
									<p className="text-sm text-gray-600 mt-1">{selectedItem.admissionTitle}</p>
								</div>
								<button
									onClick={() => {
										closeReviewModal()
									}}
									className="p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"
								>
									<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>

							{/* Modal Content - Scrollable */}
							<div className="flex-1 overflow-y-auto p-6">
								{/* Admission Metadata */}
								<div className="mb-6">
									<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
										Admission Metadata
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{[
											{ label: "Program Title", value: selectedItem.metadata?.title || selectedItem.admissionTitle },
											{ label: "University", value: selectedItem.metadata?.university || selectedItem.university },
											{ label: "Submitted Via", value: selectedItem.submittedBy },
											{ label: "Submitted On", value: formatDisplayDate(selectedItem.submittedOn, selectedItem.submittedOn || "—") },
											{ label: "Degree", value: formatInline(selectedItem.metadata?.degree) },
											{ label: "Program", value: formatInline(selectedItem.metadata?.program) },
											{ label: "Fee", value: selectedItem.metadata?.fee || "—" },
											{ label: "Deadline", value: formatDisplayDate(selectedItem.metadata?.deadline, selectedItem.metadata?.deadline || "—") },
											{ label: "Academic Year", value: formatInline(selectedItem.metadata?.academicYear) },
										].map((entry) => (
											<div key={entry.label} className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
												<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{entry.label}</p>
												<p className="text-sm font-medium text-gray-900 break-words">{entry.value}</p>
											</div>
										))}
									</div>
									<div className="mt-4">
										<p className="text-sm text-gray-500 mb-1">Current Status</p>
										<span
											className="px-2 py-1 rounded-full text-xs font-medium inline-block"
											style={{
												backgroundColor: getVerificationStatusColor(selectedItem.status).bg,
												color: getVerificationStatusColor(selectedItem.status).text,
											}}
										>
											{selectedItem.status}
										</span>
									</div>
									{selectedItem.metadata?.department && (
										<div className="mt-4">
											<p className="text-sm text-gray-500 mb-1">Department</p>
											<p className="text-sm font-medium" style={{ color: "#111827" }}>
													{formatInline(selectedItem.metadata.department)}
											</p>
										</div>
									)}
									{selectedItem.metadata?.overview && (
										<div className="mt-4">
											<p className="text-sm text-gray-500 mb-1">Overview</p>
												<div className="text-sm" style={{ color: "#111827" }}>
													{renderValue(selectedItem.metadata.overview)}
												</div>
										</div>
									)}
									{selectedItem.metadata?.eligibility && (
										<div className="mt-4">
											<p className="text-sm text-gray-500 mb-1">Eligibility</p>
												<div className="text-sm" style={{ color: "#111827" }}>
													{renderValue(selectedItem.metadata.eligibility)}
												</div>
										</div>
									)}
								</div>

								{/* Remarks */}
								{(() => {
									const remarksList = buildRemarksList(selectedItem)
									return (
										<div className="mb-6">
											<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
												Remarks
											</h3>
											{remarksList.length > 0 ? (
												<div className="space-y-3">
													{remarksList.map((entry) => (
														<div key={entry.label}>
															<p className="text-sm text-gray-500 mb-1">{entry.label}</p>
															<p className="text-sm" style={{ color: "#111827" }}>
																{String(entry.value)}
															</p>
														</div>
													))}
												</div>
											) : (
												<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
													<p className="text-sm text-gray-500">No remarks recorded yet.</p>
												</div>
											)}
										</div>
									)
								})()}

								{/* Field-Level Differences */}
								{selectedItem.diffData && selectedItem.diffData.length > 0 ? (
									<div className="mb-6">
										<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
											Field-Level Differences
										</h3>
										<div className="space-y-3">
											{selectedItem.diffData.map((diff, idx) => (
												<div key={idx} className="border border-gray-200 rounded-lg p-4">
													<div className="flex items-center justify-between gap-3 mb-3">
														<p className="text-sm font-semibold text-gray-900">{formatLabel(diff.field)}</p>
														<div className="text-xs text-gray-500 text-right">
															{(diff.changeCount || 1) > 1 ? `Updated ${diff.changeCount} times` : 'Updated once'}
															{diff.latestAt && (
																<p className="mt-0.5">Last: {formatDateValue(diff.latestAt)}</p>
															)}
														</div>
													</div>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
														<div className="rounded-lg border border-red-100 bg-red-50/50 p-3">
															<p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Old Value</p>
															<div className="text-sm text-gray-900">{renderDiffValue(diff.oldValue, diff.field)}</div>
														</div>
														<div className="rounded-lg border border-green-100 bg-green-50/50 p-3">
															<p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">New Value</p>
															<div className="text-sm text-gray-900">{renderDiffValue(diff.newValue, diff.field)}</div>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								) : (
									<div className="mb-6">
										<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
											Field-Level Differences
										</h3>
										<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
											<p className="text-sm text-gray-500">No changes detected.</p>
										</div>
									</div>
								)}

								{/* Admin Action Panel */}
								<div>
									<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
										Admin Action
									</h3>
									
									{/* ✅ Status warning if already processed */}
									{(selectedItem.verificationStatusRaw === 'verified' || 
									  selectedItem.verificationStatusRaw === 'rejected') && (
										<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
											<p className="text-sm text-blue-800">
												ℹ️ This admission is already <strong>{selectedItem.status}</strong>. 
												You can still update the status if needed.
											</p>
										</div>
									)}
									
									<div className="flex flex-wrap gap-3 mb-4">
										<button
											onClick={() => handleActionSelect("Verify")}
											disabled={selectedItem.verificationStatusRaw === 'verified'}
											className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
												actionType === "Verify"
													? "text-white"
													: "border border-gray-300 text-gray-700 hover:bg-gray-50"
											} disabled:opacity-50 disabled:cursor-not-allowed`}
											style={actionType === "Verify" ? { backgroundColor: "#10B981" } : {}}
											title={selectedItem.verificationStatusRaw === 'verified' ? 'Already verified' : 'Mark as verified'}
										>
											Mark as Verified
											{selectedItem.verificationStatusRaw === 'verified' && ' ✓'}
										</button>
										<button
											onClick={() => handleActionSelect("Reject")}
											disabled={selectedItem.verificationStatusRaw === 'rejected'}
											className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
												actionType === "Reject"
													? "text-white"
													: "border border-gray-300 text-gray-700 hover:bg-gray-50"
											} disabled:opacity-50 disabled:cursor-not-allowed`}
											style={actionType === "Reject" ? { backgroundColor: "#EF4444" } : {}}
											title={selectedItem.verificationStatusRaw === 'rejected' ? 'Already rejected' : 'Reject admission'}
										>
											Reject Admission
											{selectedItem.verificationStatusRaw === 'rejected' && ' ✓'}
										</button>
									{/*	<button
											onClick={() => handleActionSelect("Revision")}
											className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
												actionType === "Revision"
													? "text-white"
													: "border border-gray-300 text-gray-700 hover:bg-gray-50"
											}`}
											style={actionType === "Revision" ? { backgroundColor: "#2563EB" } : {}}
											title="Request revision from university"
										>
											Request Revision
										</button> */}
									</div>

									{actionType && (
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Remarks <span className="text-red-500">*</span> (minimum 10 characters)
											</label>
											<textarea
												value={remarks}
												onChange={(e) => setRemarks(e.target.value)}
												placeholder="Enter remarks for this action..."
												rows={4}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
											<p className="text-xs text-gray-500 mt-1">
												{remarks.length}/10 minimum characters {remarks.length >= 10 && "✓"}
											</p>
										</div>
									)}
								</div>
							</div>

							{/* Modal Footer */}
							<div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
								<button
									onClick={() => {
										closeReviewModal()
									}}
									className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
								>
									Cancel
								</button>
								{actionType && (
									<button
										onClick={handleSubmitAction}
										disabled={remarks.trim().length < 10}
										className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors hover:opacity-90"
										style={{ backgroundColor: "#004AAD" }}
									>
										Submit {actionType}
									</button>
								)}
							</div>
						</div>
					</div>
				)}

			</div>
		</AdminLayout>
	)
}

export default AdminVerificationCenter

