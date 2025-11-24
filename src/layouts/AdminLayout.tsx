import type { ReactNode } from "react"
import AdminSidebar from "../components/admin/AdminSidebar"

interface AdminLayoutProps {
	children: ReactNode
}

function AdminLayout({ children }: AdminLayoutProps) {
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

