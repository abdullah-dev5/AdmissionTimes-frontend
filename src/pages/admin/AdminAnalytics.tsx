import { useState, useMemo, useEffect } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import { adminService } from "../../services/adminService"
import { analyticsEvents } from "../../data/adminData"
import { formatDateTime } from "../../utils/dateUtils"
import { DEFAULT_ITEMS_PER_PAGE } from "../../constants/pagination"
import Pagination from "../../components/admin/Pagination"
import { LoadingSpinner } from "../../components/common/LoadingSpinner"

type AnalyticsRow = {
	id: string | number
	userId: string
	userName: string
	userRole: "Student" | "UniversityRep" | "Admin"
	eventType: string
	deviceInfo: {
		browser: string
		os: string
		deviceType: string
	}
	sessionId: string
	metadata?: Record<string, any>
	timestamp: string
}

const getFriendlyErrorMessage = (raw?: string) => {
	const message = (raw || "").toLowerCase()
	if (!message) return "Something went wrong while loading analytics. Please try again."
	if (message.includes("401") || message.includes("unauthorized")) return "Your session has expired. Please sign in again."
	if (message.includes("403") || message.includes("forbidden")) return "You do not have permission to view analytics."
	if (message.includes("404")) return "Analytics data is currently unavailable."
	if (message.includes("timeout") || message.includes("network") || message.includes("fetch")) {
		return "We could not connect right now. Check your internet and try again."
	}
	return "We could not load analytics at the moment. Please try again shortly."
}

function AdminAnalytics() {
	const [userFilter, setUserFilter] = useState<string>("All")
	const [eventTypeFilter, setEventTypeFilter] = useState<string | "All">("All")
	const [roleFilter, setRoleFilter] = useState<"All" | "Student" | "UniversityRep" | "Admin">("All")
	const [dateFrom, setDateFrom] = useState("")
	const [dateTo, setDateTo] = useState("")
	const [currentPage, setCurrentPage] = useState(1)

	// API state
	const [apiAnalytics, setApiAnalytics] = useState<AnalyticsRow[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Fetch analytics on mount and when filters change
	useEffect(() => {
		fetchAnalytics()
	}, [userFilter, eventTypeFilter, roleFilter, dateFrom, dateTo])

	/**
	 * Fetch analytics data from API
	 */
	const fetchAnalytics = async () => {
		try {
			setLoading(true)
			setError(null)

			const filters: {
				event_type?: string
				user_type?: string
				date_from?: string
				date_to?: string
			} = {}
			if (eventTypeFilter !== "All") {
				filters.event_type = eventTypeFilter
			}
			if (roleFilter !== "All") {
				const roleMap = { "Student": "student", "UniversityRep": "university", "Admin": "admin" }
				filters.user_type = roleMap[roleFilter]
			}
			if (dateFrom) {
				filters.date_from = dateFrom
			}
			if (dateTo) {
				filters.date_to = dateTo
			}

			const response = await adminService.getAnalytics(filters)

			// Handle both paginated and non-paginated responses
			const events = Array.isArray(response.data)
				? response.data
				: (response.data?.data || response.data?.events || [])

			// Transform API events to match AnalyticsEvent format
			const transformed = transformApiEvents(events)
			setApiAnalytics(transformed)
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to fetch analytics data"
			setError(getFriendlyErrorMessage(message))
			// Will fallback to mock data
		} finally {
			setLoading(false)
		}
	}

	/**
	 * Transform API event format to AnalyticsEvent format
	 */
	const transformApiEvents = (data: Record<string, any>[]): AnalyticsRow[] => {
		return data.map((event) => {
			const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {}
			const deviceInfoRaw = metadata.deviceInfo && typeof metadata.deviceInfo === "object"
				? metadata.deviceInfo
				: {}

			return {
				id: event.id,
				userId: String(event.user_id || metadata.userId || "-"),
				userName: String(event.user_name || metadata.userName || "Unknown"),
				userRole: mapRoleToDisplay(String(event.user_type || event.role || metadata.userRole || "student")),
				eventType: String(event.event_type || event.type || "page_view"),
				deviceInfo: {
					browser: String(deviceInfoRaw.browser || metadata.browser || "-"),
					os: String(deviceInfoRaw.os || metadata.os || "-"),
					deviceType: String(deviceInfoRaw.deviceType || metadata.deviceType || "unknown"),
				},
				sessionId: String(event.session_id || metadata.sessionId || "-"),
				metadata,
				timestamp: event.created_at || event.timestamp || new Date().toISOString(),
			}
		})
	}

	/**
	 * Map user_type from API to display role
	 */
	const mapRoleToDisplay = (role: string): "Admin" | "Student" | "UniversityRep" => {
		const roleMap: Record<string, "Admin" | "Student" | "UniversityRep"> = {
			'admin': 'Admin',
			'student': 'Student',
			'university': 'UniversityRep',
			'university_rep': 'UniversityRep',
		}
		return roleMap[role.toLowerCase()] || 'Student'
	}

	// Use API data if available, otherwise use mock data
	const analyticsToUse: AnalyticsRow[] = apiAnalytics.length > 0
		? apiAnalytics
		: analyticsEvents

	const users = useMemo(() => {
		const uniqueUsers = new Set<string>()
		analyticsToUse.forEach(event => uniqueUsers.add(event.userName))
		return Array.from(uniqueUsers).sort()
	}, [analyticsToUse])

	const eventTypes = useMemo(() => {
		const uniqueTypes = new Set<string>()
		analyticsToUse.forEach(event => uniqueTypes.add(event.eventType))
		return Array.from(uniqueTypes).sort()
	}, [analyticsToUse])

	// Filter analytics events (client-side for user filter)
	const filteredEvents = useMemo(() => {
		let filtered = [...analyticsToUse]

		// User filter (client-side since API might not support it)
		if (userFilter !== "All") {
			filtered = filtered.filter((event) => event.userName === userFilter)
		}

		if (eventTypeFilter !== "All") {
			filtered = filtered.filter((event) => event.eventType === eventTypeFilter)
		}

		if (roleFilter !== "All") {
			filtered = filtered.filter((event) => event.userRole === roleFilter)
		}

		if (dateFrom) {
			const fromDate = new Date(dateFrom)
			filtered = filtered.filter((event) => new Date(event.timestamp) >= fromDate)
		}

		if (dateTo) {
			const toDate = new Date(dateTo)
			toDate.setHours(23, 59, 59, 999)
			filtered = filtered.filter((event) => new Date(event.timestamp) <= toDate)
		}

		// Sort by timestamp (newest first)
		filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

		return filtered
	}, [analyticsToUse, userFilter, eventTypeFilter, roleFilter, dateFrom, dateTo])

	// Pagination
	const totalPages = Math.ceil(filteredEvents.length / DEFAULT_ITEMS_PER_PAGE)

	useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages)
		}
	}, [currentPage, totalPages])

	const paginatedEvents = useMemo(() => {
		const startIndex = (currentPage - 1) * DEFAULT_ITEMS_PER_PAGE
		return filteredEvents.slice(startIndex, startIndex + DEFAULT_ITEMS_PER_PAGE)
	}, [filteredEvents, currentPage])

	const handleResetFilters = () => {
		setUserFilter("All")
		setEventTypeFilter("All")
		setRoleFilter("All")
		setDateFrom("")
		setDateTo("")
		setCurrentPage(1)
	}

	const getEventTypeColor = (type: string) => {
		switch (type) {
			case "page_view":
				return { bg: "#DBEAFE", text: "#2563EB" }
			case "search":
				return { bg: "#D1FAE5", text: "#10B981" }
			case "admission_view":
				return { bg: "#FEF3C7", text: "#F59E0B" }
			case "download":
				return { bg: "#E9D5FF", text: "#9333EA" }
			case "click":
				return { bg: "#FCE7F3", text: "#EC4899" }
			default:
				return { bg: "#F3F4F6", text: "#6B7280" }
		}
	}

	const getRoleColor = (role: string) => {
		switch (role) {
			case "Admin":
				return { bg: "#DBEAFE", text: "#2563EB" }
			case "UniversityRep":
				return { bg: "#FEF3C7", text: "#F59E0B" }
			case "Student":
				return { bg: "#D1FAE5", text: "#10B981" }
			default:
				return { bg: "#F3F4F6", text: "#6B7280" }
		}
	}

	const showInitialLoading = loading && apiAnalytics.length === 0

	if (showInitialLoading) {
		return (
			<AdminLayout>
				<LoadingSpinner fullScreen message="Loading analytics..." />
			</AdminLayout>
		)
	}

	return (
		<AdminLayout>
			<div className="p-6">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-2xl font-bold mb-2" style={{ color: "#111827" }}>
						User Activity Analytics
					</h1>
					<p className="text-gray-600">Track and analyze user activity across the platform.</p>
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
								<p className="text-sm font-semibold text-red-900">Unable to load analytics</p>
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
				{loading && <LoadingSpinner size="sm" message="Refreshing analytics..." />}

				{/* Filters Section */}
				<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
						{/* User Filter */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">User</label>
							<select
								value={userFilter}
								onChange={(e) => {
									setUserFilter(e.target.value)
									setCurrentPage(1)
								}}
								className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
							>
								<option value="All">All Users</option>
								{users.map((user) => (
									<option key={user} value={user}>
										{user}
									</option>
								))}
							</select>
						</div>

						{/* Event Type Filter */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
							<select
								value={eventTypeFilter}
								onChange={(e) => {
									setEventTypeFilter(e.target.value as string | "All")
									setCurrentPage(1)
								}}
								className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
							>
								<option value="All">All Types</option>
								{eventTypes.map((type) => (
									<option key={type} value={type}>
										{type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
									</option>
								))}
							</select>
						</div>

						{/* Role Filter */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
							<select
								value={roleFilter}
								onChange={(e) => {
									setRoleFilter(e.target.value as "All" | "Student" | "UniversityRep" | "Admin")
									setCurrentPage(1)
								}}
								className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
							>
								<option value="All">All Roles</option>
								<option value="Student">Student</option>
								<option value="UniversityRep">University Rep</option>
								<option value="Admin">Admin</option>
							</select>
						</div>

						{/* Date From */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
							<input
								type="date"
								value={dateFrom}
								onChange={(e) => {
									setDateFrom(e.target.value)
									setCurrentPage(1)
								}}
								className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						{/* Date To */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
							<input
								type="date"
								value={dateTo}
								onChange={(e) => {
									setDateTo(e.target.value)
									setCurrentPage(1)
								}}
								className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					{/* Filter Actions */}
					<div className="flex items-center justify-end gap-3">
						<button
							onClick={handleResetFilters}
							className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
						>
							Reset
						</button>
					</div>
				</div>

				{/* Analytics Events Table */}
				<div className="bg-white rounded-lg shadow-sm p-6">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-200">
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Event Type</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Device Info</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Session ID</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Timestamp</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Metadata</th>
								</tr>
							</thead>
							<tbody>
								{paginatedEvents.map((event) => {
									const eventColors = getEventTypeColor(event.eventType)
									const roleColors = getRoleColor(event.userRole)
									return (
										<tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
											<td className="py-4 px-4">
												<p className="font-medium" style={{ color: "#111827" }}>
													{event.userName}
												</p>
												<p className="text-xs text-gray-500">{event.userId}</p>
											</td>
											<td className="py-4 px-4">
												<span
													className="px-2 py-1 rounded-full text-xs font-medium"
													style={{ backgroundColor: roleColors.bg, color: roleColors.text }}
												>
													{event.userRole}
												</span>
											</td>
											<td className="py-4 px-4">
												<span
													className="px-2 py-1 rounded-full text-xs font-medium"
													style={{ backgroundColor: eventColors.bg, color: eventColors.text }}
												>
													{event.eventType.replace("_", " ")}
												</span>
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600">
													{event.deviceInfo.browser} / {event.deviceInfo.os}
												</p>
												<p className="text-xs text-gray-500 capitalize">{event.deviceInfo.deviceType}</p>
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600 font-mono">{event.sessionId}</p>
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600">{formatDateTime(event.timestamp)}</p>
											</td>
											<td className="py-4 px-4">
												{event.metadata ? (
													<details className="cursor-pointer">
														<summary className="text-sm text-blue-600 hover:underline">View</summary>
														<pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-w-xs">
															{JSON.stringify(event.metadata, null, 2)}
														</pre>
													</details>
												) : (
													<span className="text-sm text-gray-400">—</span>
												)}
											</td>
										</tr>
									)
								})}
								{paginatedEvents.length === 0 && (
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
														d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
													/>
												</svg>
												<p className="text-lg font-medium text-gray-500 mb-2">No analytics events found</p>
												<p className="text-sm text-gray-400">Try adjusting your filters or check back later.</p>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={filteredEvents.length}
						itemsPerPage={DEFAULT_ITEMS_PER_PAGE}
						onPageChange={(page) => {
							setCurrentPage(page)
							window.scrollTo({ top: 0, behavior: "smooth" })
						}}
					/>
				</div>
			</div>
		</AdminLayout>
	)
}

export default AdminAnalytics

