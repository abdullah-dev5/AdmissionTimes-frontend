import { useEffect } from "react"
import type { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import UniversitySidebar from "../components/university/UniversitySidebar"
import UniversityAIAssistant from "../components/ai/university/UniversityAIAssistant"
import { useUniversityDashboardData } from "../hooks/useUniversityDashboardData"
import { useUniversityStore } from "../store/universityStore"
import { useAuthStore } from "../store/authStore"
import { isRealtimeEnabled, supabase } from "../services/supabase"

const DASHBOARD_POLL_MS = Math.max(5000, Number(import.meta.env.VITE_DASHBOARD_POLL_MS || 10000))

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

		const refresh = () => {
			fetchNotifications().catch(() => {})
			fetchDashboardData({ userId: user.id }).catch(() => {})
		}

		const channel = isRealtimeEnabled
			? supabase
					.channel(`university-notifications-live-${user.id}`)
					.on(
						"postgres_changes",
						{
							event: "INSERT",
							schema: "public",
							table: "notifications",
							filter: `recipient_id=eq.${user.id}`,
						},
						() => refresh()
					)
					.subscribe()
			: null

		const pollId = window.setInterval(() => {
			refresh()
		}, DASHBOARD_POLL_MS)

		return () => {
			window.clearInterval(pollId)
			if (channel) {
				supabase.removeChannel(channel).catch(() => {})
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


