import { useEffect } from "react"
import type { ReactNode } from "react"
import AdminSidebar from "../components/admin/AdminSidebar"
import { useAuthStore } from "../store/authStore"
import { subscribeToNotifications } from '../services/realtime'

const ADMIN_NOTIFICATIONS_POLL_MS = Math.max(15000, Number(import.meta.env.VITE_ADMIN_NOTIFICATIONS_POLL_MS || 60000))

interface AdminLayoutProps {
	children: ReactNode
}

function AdminLayout({ children }: AdminLayoutProps) {
	const user = useAuthStore((state) => state.user)

	useEffect(() => {
		if (!user?.id || user.role !== "admin") {
			return
		}

		let pollId: number | null = null

		const emitRefresh = () => {
			window.dispatchEvent(new CustomEvent("admin:notifications-updated"))
		}

		const startPolling = () => {
			if (pollId !== null) {
				return
			}

			pollId = window.setInterval(() => {
				emitRefresh()
			}, ADMIN_NOTIFICATIONS_POLL_MS)
		}

		const stopPolling = () => {
			if (pollId !== null) {
				window.clearInterval(pollId)
				pollId = null
			}
		}

		// Shared per-user channel (see services/realtime); poll while it is not live.
		const unsubscribe = subscribeToNotifications(user.id, emitRefresh, (live) => (live ? stopPolling() : startPolling()))

		return () => {
			stopPolling()
			unsubscribe()
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

