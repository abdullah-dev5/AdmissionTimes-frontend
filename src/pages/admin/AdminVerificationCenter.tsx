import { useState, useMemo, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import AdminLayout from "../../layouts/AdminLayout"
import { adminService } from "../../services/adminService"
import {
	getVerificationStatusColor,
	type VerificationItem,
	type VerificationStatus,
} from "../../data/adminData"
import { useWatcherNotifications } from "../../hooks/useWatcherNotifications"
import { UpdateNotificationToast } from "../../components/admin/UpdatedBadge"

const formatLabel = (value: string) =>
	value
		.replace(/_/g, " ")
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/\b\w/g, (char) => char.toUpperCase())

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

const isUuid = (value: string) => /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(value)

const safeLabel = (value: string | null | undefined, fallback: string) => {
	if (!value) return fallback
	if (isUuid(value)) return fallback
	return value
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

function AdminVerificationCenter() {
	const navigate = useNavigate()
	const location = useLocation() as { state?: { selectedId?: string } }
	const [statusFilter, setStatusFilter] = useState<VerificationStatus | "All">("All")
	const [universityFilter, setUniversityFilter] = useState<string>("All")
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null)
	const [actionType, setActionType] = useState<"Verify" | "Reject" | "Revision" | null>(null)
	const [remarks, setRemarks] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 10

	// API state
	const [apiVerifications, setApiVerifications] = useState<any[]>([])
	const [universities, setUniversities] = useState<Map<string, any>>(new Map())
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	// ✅ Initialize watcher notifications hook
	const { notifyWatchers, notifications, dismissNotification } =
		useWatcherNotifications()

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
	}, [statusFilter])

	useEffect(() => {
		const selectedId = location.state?.selectedId
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
			const response = await adminService.getAllAdmissions(1, 100, status) // Get larger batch
			console.log('🔵 [AdminVerificationCenter] Fetched admissions:', response)
			
			// No need for direct Supabase university fetch - backend should return enriched data
			// If universities relationship is populated, use it; otherwise fall back to fields in admission
			const emptyMap = new Map<string, any>()
			setUniversities(emptyMap)
			
			// Transform API data to VerificationItem format
			const transformed = transformApiAdmissions(response, emptyMap)
			setApiVerifications(transformed)
		} catch (err: any) {
			console.error('🔴 [AdminVerificationCenter] Error fetching admissions:', err)
			setError(err.message || 'Failed to fetch admissions')
			// Will fallback to mock data
		} finally {
			setLoading(false)
		}
	}

	/**
	 * Transform API admissions to VerificationItem format with university data enrichment
	 */
	const transformApiAdmissions = (data: any, universityMap?: Map<string, any>): VerificationItem[] => {
		// Handle both paginated and non-paginated responses
		const admissions = Array.isArray(data) ? data : (data?.data || data?.pending_verifications || [])
		const statusMap: Record<string, VerificationStatus> = {
			pending: "Pending",
			verified: "Verified",
			rejected: "Rejected",
		}
		
		return admissions.map((admission: any) => {
			// Get university name from the map, or fall back to other sources
			let universityName = 'Unknown University'
			if (universityMap && admission.university_id) {
				const univData = universityMap.get(admission.university_id)
				if (univData && univData.name) {
					universityName = univData.name
				}
			}
			// Fall back to other fields if not in map
			if (universityName === 'Unknown University') {
				universityName = safeLabel(
					admission.university_name || admission.location,
					'Unknown University'
				)
			}
			
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
				id: admission.id || admission.admission_id,
				admissionTitle: admission.title || admission.program_title || 'Unknown',
				university: universityName,
				submittedBy: safeLabel(admission.submitted_by || admission.created_by, 'University'),
				submittedOn: admission.created_at 
					? new Date(admission.created_at).toISOString().split('T')[0]
					: 'N/A',
				status: statusMap[admission.verification_status] || ('Pending' as VerificationStatus),
				metadata: {
					title: admission.title || 'Unknown',
					degree: admission.degree_level || 'N/A',
					program: admission.program_type || 'N/A',
					fee: admission.application_fee ? `${admission.currency || 'PKR'} ${admission.application_fee}` : 'N/A',
					deadline: admission.deadline 
						? new Date(admission.deadline).toISOString().split('T')[0]
						: 'N/A',
					academicYear: 'N/A',
					university: universityName,
				},
			}
		})
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
		
		// Fetch changelog data for this admission
		try {
			const changelogResponse = await adminService.getChangeLogs(1, 100, {
				admission_id: item.id,
			})
			
			// Handle both paginated and non-paginated responses
			let changelogs = []
			if (Array.isArray(changelogResponse)) {
				changelogs = changelogResponse
			} else if (changelogResponse?.data) {
				changelogs = Array.isArray(changelogResponse.data) ? changelogResponse.data : []
			}
			
			// Filter for 'updated' action type only (field-level changes)
			const updatedChanges = changelogs.filter((log: any) => log.action_type === 'updated')
			
			// Transform to diffData format
			const diffData = updatedChanges.map((log: any) => {
				// Format old_value and new_value
				const formatValue = (val: any): string => {
					if (val === null || val === undefined) return ''
					if (typeof val === 'object') return JSON.stringify(val)
					return String(val)
				}
				
				return {
					field: log.field_name || 'Unknown',
					oldValue: formatValue(log.old_value),
					newValue: formatValue(log.new_value),
				}
			})
			
			// Update selected item with diff data
			setSelectedItem((prev) => prev ? { ...prev, diffData } : item)
			console.log('🔍 [AdminVerificationCenter] Changelog diff data:', diffData)
		} catch (err) {
			console.error('🔴 [AdminVerificationCenter] Error fetching changelog:', err)
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

			if (actionType === 'Verify') {
				console.log('✅ Verifying admission:', selectedItem.id)
				await adminService.verifyAdmission(selectedItem.id, {
					verification_status: 'verified',
					verification_comments: remarks,
				})
			} else if (actionType === 'Reject') {
				console.log('❌ Rejecting admission:', selectedItem.id)
				await adminService.rejectAdmission(selectedItem.id, remarks)
			} else if (actionType === 'Revision') {
				console.log('🟠 Requesting revision:', selectedItem.id)
				await adminService.requestRevision(selectedItem.id, remarks)
			}

			// ✅ Notify watchers about the change (after successful action)
			const resolvedChangeType = actionType === 'Verify' || actionType === 'Reject' || actionType === 'Revision'
				? 'Admin Edit'
				: 'Manual Edit'

			const mockChangelog: any = {
				id: `changelog-${Date.now()}`,
				admissionId: selectedItem.id,
				admissionTitle: selectedItem.admissionTitle,
				changeType: resolvedChangeType,
				modifiedBy: 'Admin', // TODO: Get actual user name from auth context
				modifiedByUserId: 'admin-user-id',
				summary: `${actionType} admission`,
				timestamp: new Date().toISOString(),
				diff: [],
				actor_type: 'admin' as const,
				action_type: resolvedChangeType,
			}
			notifyWatchers(mockChangelog)

			// Refresh the list after successful action
			await fetchAllAdmissions()

			// Close modal and reset
			setSelectedItem(null)
			setActionType(null)
			setRemarks("")
		} catch (err: any) {
			console.error('🔴 [AdminVerificationCenter] Error submitting action:', err)
			setError(err.message || 'Failed to submit action')
		} finally {
			setSubmitting(false)
		}
	}

	const handleResetFilters = () => {
		setStatusFilter("All")
		setUniversityFilter("All")
		setSearchQuery("")
		setCurrentPage(1)
	}

	return (
		<AdminLayout>
			<div className="p-6">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-2xl font-bold mb-2" style={{ color: "#111827" }}>
						Verification Center
					</h1>
					<p className="text-gray-600">Review and manage admissions requiring verification.</p>
				</div>

				{/* Error Banner */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-sm text-red-800">{error}</p>
						<button
							onClick={() => setError(null)}
							className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
						>
							Dismiss
						</button>
					</div>
				)}

				{/* Loading Indicator */}
				{loading && (
					<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<p className="text-sm text-blue-800">Loading pending admissions...</p>
					</div>
				)}

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
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Admission Title</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">University</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Submitted By</th>
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
							setSelectedItem(null)
							setActionType(null)
							setRemarks("")
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
											Current: {selectedItem.status}
										</span>
									</div>
									<p className="text-sm text-gray-600 mt-1">{selectedItem.admissionTitle}</p>
								</div>
								<button
									onClick={() => {
										setSelectedItem(null)
										setActionType(null)
										setRemarks("")
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
										<div>
											<p className="text-sm text-gray-500 mb-1">Title</p>
											<p className="text-sm font-medium" style={{ color: "#111827" }}>
												{selectedItem.metadata?.title || selectedItem.admissionTitle}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">Degree</p>
											<p className="text-sm font-medium" style={{ color: "#111827" }}>
												{formatInline(selectedItem.metadata?.degree)}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">Program</p>
											<p className="text-sm font-medium" style={{ color: "#111827" }}>
												{formatInline(selectedItem.metadata?.program)}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">Fee</p>
											<p className="text-sm font-medium" style={{ color: "#111827" }}>
												{selectedItem.metadata?.fee ? `PKR ${selectedItem.metadata.fee}` : "—"}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">Deadline</p>
											<p className="text-sm font-medium" style={{ color: "#111827" }}>
												{formatInline(selectedItem.metadata?.deadline)}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">Academic Year</p>
											<p className="text-sm font-medium" style={{ color: "#111827" }}>
												{formatInline(selectedItem.metadata?.academicYear)}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">University</p>
											<p className="text-sm font-medium" style={{ color: "#111827" }}>
												{selectedItem.metadata?.university || selectedItem.university}
											</p>
										</div>
										<div>
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
										<div className="border border-gray-200 rounded-lg overflow-hidden">
											<div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
												<div className="p-3 text-sm font-semibold text-gray-700">Field</div>
												<div className="p-3 text-sm font-semibold text-gray-700 border-l border-gray-200">Old Value</div>
												<div className="p-3 text-sm font-semibold text-gray-700 border-l border-gray-200">New Value</div>
											</div>
											{selectedItem.diffData.map((diff, idx) => (
												<div key={idx} className="grid grid-cols-3 border-b border-gray-200 last:border-b-0">
													<div className="p-3 text-sm font-medium" style={{ color: "#111827" }}>
														{diff.field}
													</div>
													<div className="p-3 text-sm border-l border-gray-200" style={{ color: "#B91C1C" }}>
														{renderValue(diff.oldValue)}
													</div>
													<div className="p-3 text-sm border-l border-gray-200" style={{ color: "#15803D" }}>
														{renderValue(diff.newValue)}
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
										<button
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
										</button>
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
										setSelectedItem(null)
										setActionType(null)
										setRemarks("")
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

				{/* ✅ Notification Toasts Container */}
				<div className="fixed bottom-4 right-4 space-y-2 max-w-sm z-50 pointer-events-none">
					{notifications.slice(0, 3).map((notif) => (
						<div key={notif.id} className="pointer-events-auto">
							<UpdateNotificationToast
								admission_title={notif.admission_title}
							message={`Admission ${notif.change_type === 'Admin Edit' ? 'verified' : 'updated'}`}
							change_type={notif.change_type}
								onDismiss={() => dismissNotification(notif.id)}
								onNavigate={() => navigate(`/admin/admissions/${notif.admission_id}`)}
							/>
						</div>
					))}
				</div>
			</div>
		</AdminLayout>
	)
}

export default AdminVerificationCenter

