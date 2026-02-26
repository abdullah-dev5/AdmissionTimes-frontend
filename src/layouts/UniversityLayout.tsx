import { useEffect } from "react"
import type { ReactNode } from "react"
import UniversitySidebar from "../components/university/UniversitySidebar"
import UniversityAIAssistant from "../components/ai/university/UniversityAIAssistant"
import { useUniversityDashboardData } from "../hooks/useUniversityDashboardData"
import { useUniversityStore } from "../store/universityStore"
import { useAuthStore } from "../store/authStore"
import { supabase } from "../services/supabase"

interface UniversityLayoutProps {
	children: ReactNode
}

function UniversityLayout({ children }: UniversityLayoutProps) {
	useUniversityDashboardData()
	const fetchNotifications = useUniversityStore((state) => state.fetchNotifications)
	const fetchDashboardData = useUniversityStore((state) => state.fetchDashboardData)
	const user = useAuthStore((state) => state.user)

	useEffect(() => {
		if (!user?.id || user.role !== "university") {
			return
		}

		const refresh = () => {
			fetchNotifications().catch(() => {})
			fetchDashboardData({ userId: user.id }).catch(() => {})
		}

		const channel = supabase
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

		const pollId = window.setInterval(() => {
			refresh()
		}, 30000)

		return () => {
			window.clearInterval(pollId)
			supabase.removeChannel(channel)
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
			<UniversityAIAssistant universityName="University" />
		</div>
	)
}

export default UniversityLayout


