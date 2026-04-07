import { useEffect } from "react"
import type { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import UniversitySidebar from "../components/university/UniversitySidebar"
import UniversityAIAssistant from "../components/ai/university/UniversityAIAssistant"
import { useUniversityDashboardData } from "../hooks/useUniversityDashboardData"
import { useUniversityStore } from "../store/universityStore"
import { useAuthStore } from "../store/authStore"
import { isRealtimeEnabled, supabase } from "../services/supabase"

const DASHBOARD_POLL_MS = Math.max(15000, Number(import.meta.env.VITE_DASHBOARD_POLL_MS || 60000))

interface UniversityLayoutProps {
	children: ReactNode
}

function UniversityLayout({ children }: UniversityLayoutProps) {
	useUniversityDashboardData()
	const location = useLocation()
	const fetchNotifications = useUniversityStore((state) => state.fetchNotifications)
	const fetchDashboardData = useUniversityStore((state) => state.fetchDashboardData)
	const user = useAuthStore((state) => state.user)

	const aiContext = (() => {
		const path = location.pathname.toLowerCase()
		if (path.includes("manage-admissions")) return "University Manage Admissions"
		if (path.includes("verification-center")) return "University Verification Center"
		if (path.includes("change-logs")) return "University Change Logs"
		if (path.includes("notifications")) return "University Notifications"
		if (path.includes("settings")) return "University Settings"
		if (path.includes("dashboard")) return "University Dashboard"
		return "University Portal"
	})()

	useEffect(() => {
		if (!user?.id || user.role !== "university") {
			return
		}

		let refreshTimeout: number | null = null
		let pollId: number | null = null
		const channelStatus: Record<string, boolean> = {
			notifications: false,
			admissions: false,
			activity: false,
			watchlists: false,
		}

		const updatePollingState = () => {
			const allSubscribed = Object.values(channelStatus).every(Boolean)

			if (allSubscribed) {
				if (pollId !== null) {
					window.clearInterval(pollId)
					pollId = null
				}
				return
			}

			if (pollId === null) {
				pollId = window.setInterval(() => {
					refresh()
				}, DASHBOARD_POLL_MS)
			}
		}

		const onChannelStatus = (key: keyof typeof channelStatus, status: string) => {
			channelStatus[key] = status === "SUBSCRIBED"
			updatePollingState()
		}

		const refresh = () => {
			fetchNotifications().catch(() => {})
			fetchDashboardData({ userId: user.id }).catch(() => {})
		}

		const refreshNotificationsOnly = () => {
			fetchNotifications().catch(() => {})
		}

		const refreshDashboardOnly = () => {
			fetchDashboardData({ userId: user.id }).catch(() => {})
		}

		const refreshDebounced = () => {
			if (refreshTimeout !== null) {
				window.clearTimeout(refreshTimeout)
			}

			refreshTimeout = window.setTimeout(() => {
				refresh()
				refreshTimeout = null
			}, 300)
		}

		const channelNamePrefix = `university-live-${user.id}`
		const channels = isRealtimeEnabled
			? [
					supabase
						.channel(`${channelNamePrefix}-notifications`)
						.on(
							"postgres_changes",
							{
								event: "INSERT",
								schema: "public",
								table: "notifications",
								filter: `recipient_id=eq.${user.id}`,
							},
							() => refreshNotificationsOnly()
						)
						.subscribe((status) => onChannelStatus("notifications", status)),
					supabase
						.channel(`${channelNamePrefix}-admissions`)
						.on(
							"postgres_changes",
							{
								event: "*",
								schema: "public",
								table: "admissions",
							},
							() => refreshDebounced()
						)
						.subscribe((status) => onChannelStatus("admissions", status)),
					supabase
						.channel(`${channelNamePrefix}-activity`)
						.on(
							"postgres_changes",
							{
								event: "INSERT",
								schema: "public",
								table: "user_activity",
								filter: "entity_type=eq.admission",
							},
							() => refreshDebounced()
						)
						.subscribe((status) => onChannelStatus("activity", status)),
					supabase
						.channel(`${channelNamePrefix}-watchlists`)
						.on(
							"postgres_changes",
							{
								event: "*",
								schema: "public",
								table: "watchlists",
							},
							() => refreshDashboardOnly()
						)
						.subscribe((status) => onChannelStatus("watchlists", status)),
			  ]
			: []

		if (!isRealtimeEnabled) {
			if (pollId === null) {
				pollId = window.setInterval(() => {
					refresh()
				}, DASHBOARD_POLL_MS)
			}
		} else {
			updatePollingState()
		}

		return () => {
			if (pollId !== null) {
				window.clearInterval(pollId)
			}
			if (refreshTimeout !== null) {
				window.clearTimeout(refreshTimeout)
			}
			if (channels.length > 0) {
				channels.forEach((channel) => {
					supabase.removeChannel(channel).catch(() => {})
				})
			}
		}
	}, [user?.id, user?.role, fetchNotifications, fetchDashboardData])

	return (
		<div className="min-h-screen" style={{ backgroundColor: "#F9FAFB" }}>
			<div className="flex h-screen overflow-hidden">
				<UniversitySidebar />
				<div className="flex-1 flex flex-col overflow-hidden ml-20">
					<main className="flex-1 overflow-y-auto">{children}</main>
				</div>
			</div>
			<UniversityAIAssistant universityName={user?.display_name || "University"} aiContext={aiContext} />
		</div>
	)
}

export default UniversityLayout


