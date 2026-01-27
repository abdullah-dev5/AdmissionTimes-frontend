import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { dashboardService } from "../../services/dashboardService"
import AdminLayout from "../../layouts/AdminLayout"
import {
	pendingVerifications,
	recentAdminActions,
	adminNotifications,
	scraperActivities,
	systemMetrics,
	admissionAnalytics,
	getActionColor,
	getScraperStatusColor,
} from "../../data/adminData"
import AdmissionStatusChart from "../../components/admin/AdmissionStatusChart"
import UniversityDistributionChart from "../../components/admin/UniversityDistributionChart"
import MonthlyTrendChart from "../../components/admin/MonthlyTrendChart"

// Tooltip Component
function InfoTooltip({ description }: { description: string }) {
	const [showTooltip, setShowTooltip] = useState(false)

	return (
		<div className="relative inline-block">
			<button
				type="button"
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
				onFocus={() => setShowTooltip(true)}
				onBlur={() => setShowTooltip(false)}
				className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
				aria-label="Chart information"
			>
				<svg
					className="w-4 h-4"
					style={{ color: "#6B7280" }}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</button>
			{showTooltip && (
				<div
					className="absolute z-50 left-0 mt-2 w-64 p-3 text-sm text-white rounded-lg shadow-lg"
					style={{ backgroundColor: "#1F2937" }}
					onMouseEnter={() => setShowTooltip(true)}
					onMouseLeave={() => setShowTooltip(false)}
				>
					<p className="leading-relaxed">{description}</p>
					<div
						className="absolute -top-1 left-4 w-2 h-2 rotate-45"
						style={{ backgroundColor: "#1F2937" }}
					></div>
				</div>
			)}
		</div>
	)
}

function AdminDashboard() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const navigate = useNavigate()
	const { isAuthenticated, user, isLoading: authLoading } = useAuth()
	const [apiDashboard, setApiDashboard] = useState<any>(null)
	const [_loading, _setLoading] = useState(false)
	const [_error, _setError] = useState<string | null>(null)

	/**
	 * Fetch admin dashboard from API if authenticated
	 * Falls back to mock data on error
	 */
	useEffect(() => {
		// Wait for auth to finish loading
		if (authLoading) return

		// Only fetch for admin users
		const userType = user?.role || user?.user_type;
		if (!isAuthenticated || userType !== 'admin') {
			return
		}

		fetchDashboard()
	}, [isAuthenticated, user?.user_type, authLoading])

	/**
	 * Fetch dashboard data from API
	 */
	const fetchDashboard = async () => {
		try {
			_setLoading(true)
			_setError(null)

			const response = await dashboardService.getAdminDashboard()
			setApiDashboard(response.data)

			console.debug('[AdminDashboard] Dashboard data fetched successfully')
		} catch (err: any) {
			console.error('[AdminDashboard] Failed to fetch dashboard data:', err)
			_setError(err.message || 'Failed to load dashboard data')
			// Will use mock data instead
		} finally {
			_setLoading(false)
		}
	}

	// Use API data if available, otherwise use mock data
	const displayPendingVerifications = (apiDashboard?.pending_verifications || pendingVerifications).slice(0, 5)
	const displayRecentActions = (apiDashboard?.recent_actions || recentAdminActions).slice(0, 5)
	const displayNotifications = (apiDashboard?.notifications || adminNotifications).slice(0, 4)
	const displayScraperActivities = (apiDashboard?.scraper_activity || scraperActivities).slice(0, 4)
	const metrics = apiDashboard?.stats || systemMetrics
	const analytics = apiDashboard?.analytics || admissionAnalytics

	return (
		<AdminLayout>
			<div className="p-6">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold mb-2" style={{ color: "#111827" }}>
							Admin Dashboard
						</h1>
						<p className="text-gray-600">System overview and pending verification tasks.</p>
					</div>
					<button
						onClick={() => navigate("/admin/verification")}
						className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
						style={{ backgroundColor: "#2563EB" }}
					>
						Go to Verification Center
					</button>
				</div>

				{/* System Metrics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					{/* Total Users */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<p className="text-sm text-gray-600 mb-1">Total Users</p>
								<p className="text-3xl font-bold" style={{ color: "#111827" }}>
									{metrics.totalUsers.toLocaleString()}
								</p>
							</div>
							<div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#DBEAFE" }}>
								<svg className="w-6 h-6" style={{ color: "#2563EB" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
									/>
								</svg>
							</div>
						</div>
					</div>

					{/* Total Admissions */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<p className="text-sm text-gray-600 mb-1">Total Admissions</p>
								<p className="text-3xl font-bold" style={{ color: "#111827" }}>
									{metrics.totalAdmissions.toLocaleString()}
								</p>
							</div>
							<div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#D1FAE5" }}>
								<svg className="w-6 h-6" style={{ color: "#10B981" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
						</div>
					</div>

					{/* Total Alerts Sent */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<p className="text-sm text-gray-600 mb-1">Total Alerts Sent</p>
								<p className="text-3xl font-bold" style={{ color: "#111827" }}>
									{metrics.totalAlertsSent.toLocaleString()}
								</p>
							</div>
							<div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FEF3C7" }}>
								<svg className="w-6 h-6" style={{ color: "#F59E0B" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* AI Summary Section 
				{metrics.aiSummary && (
					<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
						<h2 className="text-xl font-semibold mb-4" style={{ color: "#111827" }}>
							 System Insights
						</h2>
						<p className="text-gray-700 leading-relaxed">{metrics.aiSummary}</p>
					</div>
				)}
*/}
				{/* Admission Analytics Section */}
				<div className="mb-6">
					<h2 className="text-xl font-semibold mb-4" style={{ color: "#111827" }}>
						Admission Analytics
					</h2>

					{/* Active Charts - Displayed in Row */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
						{/* Status Breakdown Chart */}
						<div className="bg-white rounded-lg shadow-sm p-6">
							<div className="flex items-center mb-4">
								<h3 className="text-lg font-semibold" style={{ color: "#111827" }}>
									Status Breakdown
								</h3>
								<InfoTooltip
									description="This chart displays the distribution of admission records across different verification statuses (e.g., Pending, Approved, Rejected, Under Review). It helps administrators quickly identify how many admissions are in each status category, enabling better workload management and prioritization of verification tasks."
								/>
							</div>
							<AdmissionStatusChart data={analytics.statusBreakdown} />
						</div>

						{/* University Distribution */}
						<div className="bg-white rounded-lg shadow-sm p-6">
							<div className="flex items-center mb-4">
								<h3 className="text-lg font-semibold" style={{ color: "#111827" }}>
									University Distribution
								</h3>
								<InfoTooltip
									description="This chart shows the number of admission records contributed by each university in the system. It provides insights into which universities are most active in posting admissions, helping identify top contributors and potential areas for outreach or support."
								/>
							</div>
							<UniversityDistributionChart data={analytics.universityDistribution} />
						</div>
					</div>

					{/* Monthly Trend Chart */}
					<div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
						<div className="bg-white rounded-lg shadow-sm p-6">
							<div className="flex items-center mb-4">
								<h3 className="text-lg font-semibold" style={{ color: "#111827" }}>
									Monthly Admission Trend
								</h3>
								<InfoTooltip
									description="This chart visualizes the trend of new admission postings over time, typically displayed month by month. It helps administrators identify seasonal patterns, growth trends, and peak periods in admission submissions. This information is valuable for resource planning, understanding user engagement cycles, and predicting future workload."
								/>
							</div>
							<MonthlyTrendChart data={analytics.monthlyTrend} />
						</div>
					</div>

					{/* Commented Charts - Wrapped in Div */}
					<div style={{ display: "none" }}>
						{/* Degree Type Distribution 
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
								Degree Type Distribution
							</h3>
							Placeholder for DegreeTypeChart - import not needed
						</div>*/}

						{/* Top Admissions Table 
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
								Top Admissions by Views
							</h3>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-gray-200">
											<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rank</th>
											<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Admission Title</th>
											<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">University</th>
											<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Views</th>
											<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
										</tr>
									</thead>
									<tbody>
										{analytics.topAdmissions.map((admission: any, index) => {
											// const statusColors = getVerificationStatusColor(admission.status)
											return (
												<tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
													<td className="py-4 px-4">
														<div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: "#2563EB" }}>
															{index + 1}
														</div>
													</td>
													<td className="py-4 px-4">
														<p className="font-medium" style={{ color: "#111827" }}>
															{admission.title}
														</p>
													</td>
													<td className="py-4 px-4">
														<p className="text-sm text-gray-600">{admission.university}</p>
													</td>
													<td className="py-4 px-4">
														<p className="text-sm font-medium text-gray-700">{admission.views}</p>
													</td>
													<td className="py-4 px-4">
														<span
															className="px-2 py-1 rounded-full text-xs font-medium"
															style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
														>
															{admission.status}
														</span>
													</td>
												</tr>
											)
										})}
									</tbody>
								</table>
							</div>
						</div>*/}
					</div>
				</div>

				{/* Section 1: Pending Verifications */}
				<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold" style={{ color: "#111827" }}>
							Admissions Awaiting Verification
						</h2>
						<button
							onClick={() => navigate("/admin/verification")}
							className="text-sm font-medium cursor-pointer transition-colors"
							style={{ color: "#2563EB" }}
						>
							View All
						</button>
					</div>
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
								{displayPendingVerifications.map((verification: any) => (
									<tr key={verification.id} className="border-b border-gray-100 hover:bg-gray-50">
										<td className="py-4 px-4">
											<p className="font-medium" style={{ color: "#111827" }}>
												{verification.admissionTitle}
											</p>
										</td>
										<td className="py-4 px-4">
											<p className="text-sm text-gray-600">{verification.university}</p>
										</td>
										<td className="py-4 px-4">
											<p className="text-sm text-gray-600">{verification.submittedBy}</p>
										</td>
										<td className="py-4 px-4">
											<p className="text-sm text-gray-600">{verification.submittedOn}</p>
										</td>
										<td className="py-4 px-4">
											<span
												className="px-2 py-1 rounded-full text-xs font-medium"
												style={{ backgroundColor: "#FEF3C7", color: "#F59E0B" }}
											>
												{verification.status}
											</span>
										</td>
										<td className="py-4 px-4">
											<button
												onClick={() => navigate(`/admin/verification/${verification.id}`)}
												className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
											>
												Verify
											</button>
										</td>
									</tr>
								))}
								{displayPendingVerifications.length === 0 && (
									<tr>
										<td colSpan={6} className="py-10 text-center text-sm text-gray-500">
											No pending verifications.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Section 2: Recent Actions Log */}
				<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold" style={{ color: "#111827" }}>
							Recent Admin Actions
						</h2>
						<button
							onClick={() => navigate("/admin/change-logs")}
							className="text-sm font-medium cursor-pointer transition-colors"
							style={{ color: "#2563EB" }}
						>
							View Full Log
						</button>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-200">
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Admission</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Admin</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Timestamp</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Remarks</th>
								</tr>
							</thead>
							<tbody>
								{displayRecentActions.map((action: any) => {
									const actionColors = getActionColor(action.action)
									return (
										<tr key={action.id} className="border-b border-gray-100 hover:bg-gray-50">
											<td className="py-4 px-4">
												<p className="font-medium" style={{ color: "#111827" }}>
													{action.admission}
												</p>
											</td>
											<td className="py-4 px-4">
												<span
													className="px-2 py-1 rounded-full text-xs font-medium"
													style={{ backgroundColor: actionColors.bg, color: actionColors.text }}
												>
													{action.action}
												</span>
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600">{action.admin}</p>
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600">{action.timestamp}</p>
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600 truncate max-w-[200px]" title={action.remarks}>
													{action.remarks}
												</p>
											</td>
										</tr>
									)
								})}
								{displayRecentActions.length === 0 && (
									<tr>
										<td colSpan={5} className="py-10 text-center text-sm text-gray-500">
											No recent actions.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Section 3 & 4: Notifications and Scraper Activity (Side by Side) */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					{/* Notifications Preview */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold" style={{ color: "#111827" }}>
								Latest Notifications
							</h2>
							<button
								onClick={() => navigate("/admin/notifications")}
								className="text-sm font-medium cursor-pointer transition-colors"
								style={{ color: "#2563EB" }}
							>
								Open Notifications
							</button>
						</div>
						<div className="space-y-4">
							{displayNotifications.map((notification: any) => (
								<div
									key={notification.id}
									className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
									onClick={() => navigate("/admin/notifications")}
								>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<p className={`text-sm font-medium ${notification.unread ? "" : "text-gray-500"}`} style={{ color: notification.unread ? "#111827" : undefined }}>
												{notification.title}
											</p>
											{notification.unread && (
												<div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2563EB" }}></div>
											)}
										</div>
										<p className="text-xs text-gray-500">{notification.type}</p>
										<p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
									</div>
								</div>
							))}
							{displayNotifications.length === 0 && (
								<div className="text-center py-4">
									<p className="text-sm text-gray-500">No notifications.</p>
								</div>
							)}
						</div>
					</div>

					{/* Scraper Activity Snapshot */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold" style={{ color: "#111827" }}>
								Recent Scraper Activity
							</h2>
							<button
								onClick={() => navigate("/admin/scraper-logs")}
								className="text-sm font-medium cursor-pointer transition-colors"
								style={{ color: "#2563EB" }}
							>
								Open Scraper Logs
							</button>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-gray-200">
										<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">University</th>
										<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Last Run</th>
										<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
										<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Changes Detected</th>
									</tr>
								</thead>
								<tbody>
									{displayScraperActivities.map((activity: any) => {
										const statusColors = getScraperStatusColor(activity.status)
										return (
											<tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
												<td className="py-4 px-4">
													<p className="font-medium text-sm" style={{ color: "#111827" }}>
														{activity.university}
													</p>
												</td>
												<td className="py-4 px-4">
													<p className="text-sm text-gray-600">{activity.lastRun}</p>
												</td>
												<td className="py-4 px-4">
													<span
														className="px-2 py-1 rounded-full text-xs font-medium"
														style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
													>
														{activity.status}
													</span>
												</td>
												<td className="py-4 px-4">
													<p className="text-sm text-gray-600">{activity.changesDetected}</p>
												</td>
											</tr>
										)
									})}
									{displayScraperActivities.length === 0 && (
										<tr>
											<td colSpan={4} className="py-10 text-center text-sm text-gray-500">
												No scraper activity.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	)
}

export default AdminDashboard

