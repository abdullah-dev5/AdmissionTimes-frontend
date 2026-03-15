import { useEffect } from "react"
import type { ReactNode } from "react"
import AdminSidebar from "../components/admin/AdminSidebar"
import { useAuthStore } from "../store/authStore"
import { isRealtimeEnabled, supabase } from "../services/supabase"

interface AdminLayoutProps {
	children: ReactNode
}

function AdminLayout({ children }: AdminLayoutProps) {
	const user = useAuthStore((state) => state.user)

	useEffect(() => {
		if (!user?.id || user.role !== "admin") {
			return
		}

		const emitRefresh = () => {
			window.dispatchEvent(new CustomEvent("admin:notifications-updated"))
		}

		const channel = isRealtimeEnabled
			? supabase
					.channel(`admin-notifications-live-${user.id}`)
					.on(
						"postgres_changes",
						{
							event: "INSERT",
							schema: "public",
							table: "notifications",
							filter: `recipient_id=eq.${user.id}`,
						},
						() => emitRefresh()
					)
					.subscribe()
			: null

		const pollId = window.setInterval(() => {
			emitRefresh()
		}, 30000)

		return () => {
			window.clearInterval(pollId)
			if (channel) {
				supabase.removeChannel(channel).catch(() => {})
			}
		}
	}, [user?.id, user?.role])

	return (
		<div className="min-h-screen" style={{ backgroundColor: "#F9FAFB" }}>
			<div className="flex h-screen overflow-hidden">
				<AdminSidebar />
				<div className="flex-1 flex flex-col overflow-hidden ml-20">
					<main className="flex-1 overflow-y-auto">{children}</main>
				</div>
			</div>
		</div>
	)
}

export default AdminLayout

