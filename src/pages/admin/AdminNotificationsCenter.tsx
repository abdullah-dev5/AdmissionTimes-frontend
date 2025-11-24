import { useState, useMemo } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import { adminNotifications, type NotificationType } from "../../data/adminData"

function AdminNotificationsCenter() {
	const [activeTab, setActiveTab] = useState<NotificationType | "All">("All")
	const [unreadOnly, setUnreadOnly] = useState(false)

	// Filter notifications based on tab and unread filter
	const filteredNotifications = useMemo(() => {
		let filtered = [...adminNotifications]

		// Filter by type
		if (activeTab !== "All") {
			filtered = filtered.filter((notif) => notif.type === activeTab)
		}

		// Filter by unread status
		if (unreadOnly) {
			filtered = filtered.filter((notif) => notif.unread)
		}

		// Sort by timestamp (newest first)
		filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

		return filtered
	}, [activeTab, unreadOnly])

	const handleMarkAllAsRead = () => {
		// Mock API call - in production, this would be:
		// PATCH /api/admin/notifications/mark-all-read
		console.log("Marking all notifications as read")
		// In production, update the notifications state or refetch
	}

	const handleMarkAsRead = (id: number) => {
		// Mock API call - in production, this would be:
		// PATCH /api/admin/notifications/:id/read
		console.log("Marking notification as read:", id)
		// In production, update the notification state or refetch
	}

	const getNotificationIcon = (type: NotificationType) => {
		switch (type) {
			case "verification_update":
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
			case "university_upload":
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
			case "system_alert":
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
			case "scraper_alert":
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
			case "verification_update":
				return "#10B981" // Green
			case "university_upload":
				return "#2563EB" // Blue
			case "system_alert":
				return "#F59E0B" // Yellow/Orange
			case "scraper_alert":
				return "#8B5CF6" // Purple
			default:
				return "#6B7280" // Gray
		}
	}

	const unreadCount = useMemo(() => {
		return adminNotifications.filter((n) => n.unread).length
	}, [])

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

				{/* Filter Tabs and Action Controls */}
				<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						{/* Tabs */}
						<div className="flex items-center gap-2 flex-wrap">
							{(["All", "verification_update", "university_upload", "system_alert", "scraper_alert"] as const).map((tab) => {
								const tabLabel =
									tab === "All"
										? "All"
										: tab === "verification_update"
											? "Verification Updates"
											: tab === "university_upload"
												? "University Uploads"
												: tab === "system_alert"
													? "System Alerts"
													: "Scraper Alerts"
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
							const iconColor = getNotificationIconColor(notification.type)
							return (
								<div
									key={notification.id}
									className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
										notification.unread ? "border-blue-500" : "border-gray-200"
									}`}
								>
									<div className="flex items-start gap-4">
										{/* Icon */}
										<div
											className="flex-shrink-0 p-3 rounded-lg"
											style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
										>
											{getNotificationIcon(notification.type)}
										</div>

										{/* Content */}
										<div className="flex-1">
											<div className="flex items-start justify-between mb-2">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<h3
															className={`text-base font-semibold ${
																notification.unread ? "" : "text-gray-500"
															}`}
															style={notification.unread ? { color: "#111827" } : {}}
														>
															{notification.title}
														</h3>
														{notification.unread && (
															<div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2563EB" }}></div>
														)}
													</div>
													<p className="text-sm text-gray-600 mb-2">{notification.message}</p>
													<div className="flex items-center gap-4 text-xs text-gray-500">
														<span>{notification.timeAgo}</span>
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
													{notification.unread ? (
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
											{notification.unread && (
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
										? `No notifications found for ${activeTab === "verification_update" ? "Verification Updates" : activeTab === "university_upload" ? "University Uploads" : activeTab === "system_alert" ? "System Alerts" : "Scraper Alerts"}.`
										: "You're all caught up!"}
							</p>
						</div>
					)}
				</div>
			</div>
		</AdminLayout>
	)
}

export default AdminNotificationsCenter

