import { useEffect } from "react"
import type { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import UniversitySidebar from "../components/university/UniversitySidebar"
import UniversityAIAssistant from "../components/ai/university/UniversityAIAssistant"
import { useUniversityDashboardData } from "../hooks/useUniversityDashboardData"
import { useUniversityStore } from "../store/universityStore"
import { useAuthStore } from "../store/authStore"
import { isRealtimeEnabled } from "../services/supabase"
import { subscribeToNotifications } from '../services/realtime'

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

		const refreshNotifications = () => {
			fetchNotifications().catch(() => {})
		}
		const refreshDashboard = () => {
			fetchDashboardData({ userId: user.id }).catch(() => {})
		}

		// Realtime delivers this user's notifications only (the Supabase data API
		// is closed to clients; see migration 20261008000001). Dashboard data
		// (admissions, engagement) is refreshed by polling.
		const unsubscribe = subscribeToNotifications(user.id, refreshNotifications)

		const pollId = window.setInterval(() => {
			if (!isRealtimeEnabled) refreshNotifications()
			refreshDashboard()
		}, DASHBOARD_POLL_MS)

		return () => {
			window.clearInterval(pollId)
			unsubscribe()
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


