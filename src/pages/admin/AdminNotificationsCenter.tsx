import { useState, useMemo, useEffect } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import { adminService } from "../../services/adminService"
import { type NotificationType } from "../../data/adminData"
import { AdminBroadcastModal } from "../../components/admin/AdminBroadcastModal"

function AdminNotificationsCenter() {
	const [activeTab, setActiveTab] = useState<NotificationType | "All">("All")
	const [unreadOnly, setUnreadOnly] = useState(false)
	const [apiNotifications, setApiNotifications] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showBroadcastModal, setShowBroadcastModal] = useState(false)

	// Fetch notifications on mount
	useEffect(() => {
		fetchNotifications()
	}, [])

	/**
	 * Fetch admin notifications from real API
	 * NOTE: This fetches from the backend API, not mock data
	 * The backend endpoint is: GET /api/v1/notifications (auto-scoped to admin role)
	 */
	const fetchNotifications = async () => {
		try {
			setLoading(true)
			setError(null)
			console.log('📡 [AdminNotificationsCenter] Fetching real notifications from API...')
			
			const response = await adminService.getNotifications(1, 100)
			console.log('✅ [AdminNotificationsCenter] API response received:', response)
			
			// Extract data from response (handle various response formats)
			let notifications: any[] = []
			if (Array.isArray(response.data)) {
				notifications = response.data
			} else if (response.data?.data && Array.isArray(response.data.data)) {
				notifications = response.data.data
			}
			
			console.log(`✅ [AdminNotificationsCenter] Extracted ${notifications.length} notifications from API response`)
			setApiNotifications(notifications)
			
			if (notifications.length === 0) {
				console.log('⚠️  [AdminNotificationsCenter] API returned 0 notifications - check if data exists in DB')
			}
		} catch (err: any) {
			console.error('❌ [AdminNotificationsCenter] Error fetching from API:', err)
			setError(`API Error: ${err.message || 'Failed to fetch notifications'}`)
			// Do not fallback to mock data - show error to user
			setApiNotifications([])
		} finally {
			setLoading(false)
		}
	}

	// Use only API data - no mock fallback
	const notificationsToUse = apiNotifications

	// Filter notifications based on tab and unread filter
	const filteredNotifications = useMemo(() => {
		let filtered = [...notificationsToUse]

		// Filter by type (if type field exists)
		if (activeTab !== "All") {
			filtered = filtered.filter((notif) => {
				// Support API and mock fields
				const notifType = notif.notification_type || notif.type
				return notifType === activeTab
			})
		}

		// Filter by unread status
		if (unreadOnly) {
			filtered = filtered.filter((notif) => {
				const isRead = typeof notif.is_read === "boolean" ? notif.is_read : !notif.unread
				return !isRead
			})
		}

		// Sort by timestamp (newest first)
		filtered.sort((a, b) => {
			const aTime = new Date(a.timestamp || a.created_at).getTime()
			const bTime = new Date(b.timestamp || b.created_at).getTime()
			return bTime - aTime
		})

		return filtered
	}, [activeTab, unreadOnly, notificationsToUse])

	const handleMarkAllAsRead = async () => {
		try {
			setError(null)
			console.log('📋 Marking all notifications as read')
			await adminService.markAllNotificationsAsRead()
			// Refresh notifications
			await fetchNotifications()
		} catch (err: any) {
			console.error('🔴 Error marking all as read:', err)
			setError(err.message || 'Failed to mark all as read')
		}
	}

	const handleMarkAsRead = async (id: string | number) => {
		try {
			setError(null)
			console.log('📖 Marking notification as read:', id)
			await adminService.markNotificationAsRead(String(id))
			// Refresh notifications
			await fetchNotifications()
		} catch (err: any) {
			console.error('🔴 Error marking as read:', err)
			setError(err.message || 'Failed to mark as read')
		}
	}

	const getNotificationIcon = (type: NotificationType) => {
		switch (type) {
			case "admission_verified":
				return (
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
				)
			case "admission_submitted":
				return (
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2.5"
						/>
					</svg>
				)
			case "system_broadcast":
				return (
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				)
			case "system_error":
				return (
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
						/>
					</svg>
				)
		}
	}

	const getNotificationIconColor = (type: NotificationType) => {
		switch (type) {
			case "admission_verified":
				return "#10B981" // Green
			case "admission_submitted":
				return "#2563EB" // Blue
			case "system_broadcast":
				return "#F59E0B" // Yellow/Orange
			case "system_error":
				return "#8B5CF6" // Purple
			default:
				return "#6B7280" // Gray
		}
	}

	const unreadCount = useMemo(() => {
		return notificationsToUse.filter((n) => {
			const isRead = typeof n.is_read === "boolean" ? n.is_read : !n.unread
			return !isRead
		}).length
	}, [notificationsToUse])

	return (
		<AdminLayout>
			<div className="p-6">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-2xl font-bold mb-2" style={{ color: "#111827" }}>
						Notifications Center
					</h1>
					<p className="text-gray-600">System alerts and verification updates.</p>
				</div>

				{/* Error Banner */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-sm text-red-800"><strong>API Error:</strong> {error}</p>
					<button
						onClick={() => setError(null)}
						className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
					>
						Dismiss
					</button>
				</div>
			)}



			{!error && apiNotifications.length > 0 && (
				<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
					<p className="text-sm text-green-800">
						<strong>✅ Real Data:</strong> Showing {apiNotifications.length} real notifications from the API.
					</p>
				</div>
			)}
				{/* Loading Indicator */}
				{loading && (
					<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<p className="text-sm text-blue-800">Loading notifications...</p>
					</div>
				)}

				{/* Filter Tabs and Action Controls */}
				<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						{/* Tabs */}
						<div className="flex items-center gap-2 flex-wrap">
							{(["All", "admission_verified", "admission_submitted", "system_broadcast", "system_error"] as const).map((tab) => {
								const tabLabel =
									tab === "All"
										? "All"
										: tab === "admission_verified"
											? "Verified Admissions"
										: tab === "admission_submitted"
											? "New Submissions"
										: tab === "system_broadcast"
											? "System Broadcasts"
										: "System Errors"
								return (
									<button
										key={tab}
										onClick={() => setActiveTab(tab)}
										className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
											activeTab === tab ? "text-white" : "text-gray-600 hover:bg-gray-100"
										}`}
										style={activeTab === tab ? { backgroundColor: "#004AAD" } : {}}
									>
										{tabLabel}
									</button>
								)
							})}
						</div>

						{/* Action Controls */}
						<div className="flex items-center gap-4">
							{/* Broadcast Button */}
							<button
								onClick={() => setShowBroadcastModal(true)}
								className="px-4 py-2 text-sm font-medium rounded-lg text-white cursor-pointer transition-colors"
								style={{ backgroundColor: "#004AAD" }}
								title="Send broadcast notification to users"
							>
								📢 Broadcast
							</button>

							{/* Refresh Button */}
							<button
								onClick={fetchNotifications}
								disabled={loading}
								className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
								title="Refresh notifications from the API"
							>
								{loading ? '⟳ Refreshing...' : '⟳ Refresh'}
							</button>

							{/* Unread Only Toggle */}
							<div className="flex items-center gap-2">
								<label className="text-sm text-gray-600 cursor-pointer" htmlFor="unread-only">
									Unread Only
								</label>
								<button
									id="unread-only"
									onClick={() => setUnreadOnly(!unreadOnly)}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
										unreadOnly ? "bg-blue-600" : "bg-gray-300"
									}`}
								>
									<span
										className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
											unreadOnly ? "translate-x-6" : "translate-x-1"
										}`}
									/>
								</button>
							</div>

							{/* Mark All as Read */}
							<button
								onClick={handleMarkAllAsRead}
								disabled={unreadCount === 0}
								className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
							>
								Mark All as Read
							</button>
						</div>
					</div>
				</div>

				{/* Notifications List */}
				<div className="space-y-4">
					{filteredNotifications.length > 0 ? (
						filteredNotifications.map((notification) => {
							const normalizedType = notification.notification_type || notification.type
							const isRead = typeof notification.is_read === "boolean" ? notification.is_read : !notification.unread
							const timeLabel =
								notification.timeAgo ||
								new Date(notification.created_at || notification.timestamp).toLocaleString()
							const iconColor = getNotificationIconColor(normalizedType)
							return (
								<div
									key={notification.id}
									className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
										!isRead ? "border-blue-500" : "border-gray-200"
									}`}
								>
									<div className="flex items-start gap-4">
										{/* Icon */}
										<div
											className="flex-shrink-0 p-3 rounded-lg"
											style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
										>
											{getNotificationIcon(normalizedType)}
										</div>

										{/* Content */}
										<div className="flex-1">
											<div className="flex items-start justify-between mb-2">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<h3
															className={`text-base font-semibold ${
																!isRead ? "" : "text-gray-500"
															}`}
															style={!isRead ? { color: "#111827" } : {}}
														>
															{notification.title}
														</h3>
														{!isRead && (
															<div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2563EB" }}></div>
														)}
													</div>
													<p className="text-sm text-gray-600 mb-2">{notification.message}</p>
													<div className="flex items-center gap-4 text-xs text-gray-500">
														<span>{timeLabel}</span>
														{notification.university && (
															<span className="flex items-center gap-1">
																<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
																	/>
																</svg>
																{notification.university}
															</span>
														)}
													</div>
												</div>

												{/* Status Badge */}
												<div className="flex-shrink-0 ml-4">
													{!isRead ? (
														<span
															className="px-2 py-1 rounded-full text-xs font-medium"
															style={{ backgroundColor: "#DBEAFE", color: "#2563EB" }}
														>
															Unread
														</span>
													) : (
														<span
															className="px-2 py-1 rounded-full text-xs font-medium"
															style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}
														>
															Read
														</span>
													)}
												</div>
											</div>

											{/* Actions */}
											{!isRead && (
												<div className="mt-4 pt-4 border-t border-gray-100">
													<button
														onClick={() => handleMarkAsRead(notification.id)}
														className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 cursor-pointer transition-colors"
													>
														Mark as Read
													</button>
												</div>
											)}
										</div>
									</div>
								</div>
							)
						})
					) : (
						/* Empty State */
						<div className="bg-white rounded-lg shadow-sm p-12 text-center">
							<svg
								className="w-16 h-16 text-gray-400 mx-auto mb-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
								/>
							</svg>
							<p className="text-lg font-medium text-gray-500 mb-2">No notifications found</p>
							<p className="text-sm text-gray-400">
								{unreadOnly
									? "You have no unread notifications."
									: activeTab !== "All"
										? `No notifications found for ${
											activeTab === "admission_verified" ? "Verified Admissions"
											: activeTab === "admission_submitted" ? "New Submissions"
											: activeTab === "system_broadcast" ? "System Broadcasts"
											: activeTab === "system_error" ? "System Errors"
											: "this category"
										}.`
										: "You're all caught up!"}
							</p>
						</div>
					)}
				</div>

				{/* Broadcast Modal */}
				{showBroadcastModal && (
					<AdminBroadcastModal
						onClose={() => setShowBroadcastModal(false)}
						onSuccess={() => {
							// Refresh notifications after successful broadcast
							fetchNotifications()
						}}
					/>
				)}
			</div>
		</AdminLayout>
	)
}

export default AdminNotificationsCenter

