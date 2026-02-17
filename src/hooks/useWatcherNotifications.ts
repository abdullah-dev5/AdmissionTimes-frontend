/**
 * Hook for managing watcher notifications when admissions change
 * Notifies users who have added an admission to their watchlist
 */

import { useCallback, useEffect, useState } from "react"
import type { AdminChangeLog } from "../data/adminData"

export interface WatcherNotification {
	id: string
	user_id: string
	admission_id: string
	admission_title: string
	changelog_id: string
	message: string
	change_summary: string
	changed_fields: string[]
	changed_by: string
	change_type: "Manual Edit" | "Admin Edit" | "Scraper Update"
	timestamp: string
	read: boolean
	link: string
}

/**
 * Hook for creating and managing watcher notifications
 */
export const useWatcherNotifications = () => {
	const [notifications, setNotifications] = useState<WatcherNotification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)

	/**
	 * Create notification for admission change
	 */
	const notifyWatchers = useCallback((changelog: AdminChangeLog) => {
		// Generate notification message based on change type
		const messages = {
			"Manual Edit": `${changelog.admissionTitle} was updated by ${changelog.modifiedBy}`,
			"Admin Edit": `${changelog.admissionTitle} was verified by ${changelog.modifiedBy}`,
			"Scraper Update": `${changelog.admissionTitle} was updated by automated system`,
		}

		const changedFields = changelog.diff.map((d) => d.field)

		const notification: WatcherNotification = {
			id: `notif-${changelog.id}`,
			user_id: "", // Will be set by backend
			admission_id: changelog.admissionId,
			admission_title: changelog.admissionTitle,
			changelog_id: String(changelog.id),
			message: messages[changelog.changeType],
			change_summary: changelog.summary,
			changed_fields: changedFields,
			changed_by: changelog.modifiedBy,
			change_type: changelog.changeType,
			timestamp: new Date().toISOString(),
			read: false,
			link: `/admin/change-logs?admission=${changelog.admissionId}`,
		}

		setNotifications((prev) => [notification, ...prev])
		setUnreadCount((prev) => prev + 1)

		// Log for backend integration
		console.log("📢 [Watcher Notification] New notification:", notification)

		return notification
	}, [])

	/**
	 * Mark notification as read
	 */
	const markAsRead = useCallback((notificationId: string) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
		)
		setUnreadCount((prev) => Math.max(0, prev - 1))
	}, [])

	/**
	 * Mark all notifications as read
	 */
	const markAllAsRead = useCallback(() => {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
		setUnreadCount(0)
	}, [])

	/**
	 * Dismiss notification
	 */
	const dismissNotification = useCallback((notificationId: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
		setUnreadCount((prev) => Math.max(0, prev - 1))
	}, [])

	/**
	 * Get unread notifications
	 */
	const getUnreadNotifications = useCallback(() => {
		return notifications.filter((n) => !n.read)
	}, [notifications])

	/**
	 * Send email notification (backend integration point)
	 */
	const sendEmailNotification = useCallback(async (notification: WatcherNotification) => {
		try {
			console.log("📧 [Email Notification] Sending email for:", notification)
			// TODO: Call backend email service
			// await notificationService.sendEmail(notification)
		} catch (error) {
			console.error("Failed to send email notification:", error)
		}
	}, [])

	/**
	 * Send push notification (backend integration point)
	 */
	const sendPushNotification = useCallback(async (notification: WatcherNotification) => {
		try {
			console.log("📲 [Push Notification] Sending push for:", notification)
			// TODO: Call backend push service or use Service Worker
			// if ('serviceWorker' in navigator) {
			//   const registration = await navigator.serviceWorker.ready
			//   registration.showNotification('Admission Updated', {
			//     body: notification.message,
			//     tag: notification.admission_id,
			//     requireInteraction: false,
			//   })
			// }
		} catch (error) {
			console.error("Failed to send push notification:", error)
		}
	}, [])

	return {
		notifications,
		unreadCount,
		notifyWatchers,
		markAsRead,
		markAllAsRead,
		dismissNotification,
		getUnreadNotifications,
		sendEmailNotification,
		sendPushNotification,
	}
}

/**
 * Hook to check if admission has recent changes
 */
export const useHasRecentChanges = (admissionId: string, changelogs: AdminChangeLog[]) => {
	const [hasChanges, setHasChanges] = useState(false)
	const [changeCount, setChangeCount] = useState(0)
	const [lastChangeTime, setLastChangeTime] = useState<string | null>(null)

	useEffect(() => {
		const admissionChanges = changelogs.filter((log) => log.admissionId === admissionId)

		if (admissionChanges.length > 0) {
			setHasChanges(true)
			setChangeCount(admissionChanges.length)

			// Get most recent change
			const mostRecent = admissionChanges.sort(
				(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
			)[0]

			setLastChangeTime(mostRecent.timestamp)
		} else {
			setHasChanges(false)
			setChangeCount(0)
			setLastChangeTime(null)
		}
	}, [admissionId, changelogs])

	return {
		hasChanges,
		changeCount,
		lastChangeTime,
	}
}

/**
 * Hook to get changed fields for highlighting
 */
export const useChangedFields = (admissionId: string, changelogs: AdminChangeLog[]) => {
	const [changedFields, setChangedFields] = useState<Set<string>>(new Set())

	useEffect(() => {
		const admissionChanges = changelogs.filter((log) => log.admissionId === admissionId)
		const fields = new Set<string>()

		admissionChanges.forEach((log) => {
			log.diff.forEach((change) => {
				fields.add(change.field)
			})
		})

		setChangedFields(fields)
	}, [admissionId, changelogs])

	return {
		changedFields,
		isFieldChanged: (fieldName: string) => changedFields.has(fieldName),
	}
}
