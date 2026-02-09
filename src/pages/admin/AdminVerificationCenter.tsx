import { useState, useMemo } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import {
	verificationItems,
	getUniqueUniversities,
	getVerificationStatusColor,
	type VerificationItem,
	type VerificationStatus,
} from "../../data/adminData"

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

function AdminVerificationCenter() {
	const [statusFilter, setStatusFilter] = useState<VerificationStatus | "All">("All")
	const [universityFilter, setUniversityFilter] = useState<string>("All")
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null)
	const [actionType, setActionType] = useState<"Verify" | "Reject" | "Dispute" | null>(null)
	const [remarks, setRemarks] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 10

	const universities = getUniqueUniversities()

	// Filter and search logic
	const filteredItems = useMemo(() => {
		let filtered = [...verificationItems]

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
	}, [statusFilter, universityFilter, searchQuery])

	// Pagination
	const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
	const paginatedItems = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage
		return filteredItems.slice(startIndex, startIndex + itemsPerPage)
	}, [filteredItems, currentPage])

	const handleReview = (item: VerificationItem) => {
		setSelectedItem(item)
		setActionType(null)
		setRemarks("")
	}

	const handleActionSelect = (action: "Verify" | "Reject" | "Dispute") => {
		setActionType(action)
		setRemarks("")
	}

	const handleSubmitAction = () => {
		if (!selectedItem || !actionType || remarks.trim().length < 10) {
			return
		}

		// Mock API call - in production, this would be:
		// POST /api/admin/verification/update
		// {
		//   admission_id: selectedItem.id,
		//   admin_id: currentAdminId,
		//   action_type: actionType,
		//   remarks: remarks
		// }

		console.log("Submitting verification action:", {
			admissionId: selectedItem.id,
			actionType,
			remarks,
		})

		// Close modal and refresh (in real app, refetch data)
		setSelectedItem(null)
		setActionType(null)
		setRemarks("")
		// In production, refetch verificationItems here
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

				{/* Filters Panel */}
				<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						{/* Status Filter - Tabs */}
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-sm text-gray-600 mr-2">Status:</span>
							{(["All", "Pending", "Verified", "Rejected", "Disputed"] as const).map((status) => (
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
									{universities.map((uni) => (
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
										<td colSpan={6} className="py-10 text-center">
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
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
						<div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-lg overflow-hidden flex flex-col">
							{/* Modal Header */}
							<div className="p-6 border-b border-gray-200 flex items-center justify-between">
								<div>
									<h2 className="text-xl font-semibold" style={{ color: "#111827" }}>
										Review Admission
									</h2>
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
									<div className="flex flex-wrap gap-3 mb-4">
										<button
											onClick={() => handleActionSelect("Verify")}
											className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
												actionType === "Verify"
													? "text-white"
													: "border border-gray-300 text-gray-700 hover:bg-gray-50"
											}`}
											style={actionType === "Verify" ? { backgroundColor: "#10B981" } : {}}
										>
											Verify Admission
										</button>
										<button
											onClick={() => handleActionSelect("Reject")}
											className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
												actionType === "Reject"
													? "text-white"
													: "border border-gray-300 text-gray-700 hover:bg-gray-50"
											}`}
											style={actionType === "Reject" ? { backgroundColor: "#EF4444" } : {}}
										>
											Reject Admission
										</button>
										<button
											onClick={() => handleActionSelect("Dispute")}
											className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
												actionType === "Dispute"
													? "text-white"
													: "border border-gray-300 text-gray-700 hover:bg-gray-50"
											}`}
											style={actionType === "Dispute" ? { backgroundColor: "#EA580C" } : {}}
										>
											Mark as Disputed
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
			</div>
		</AdminLayout>
	)
}

export default AdminVerificationCenter

