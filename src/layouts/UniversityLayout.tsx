import type { ReactNode } from "react"
import UniversitySidebar from "../components/university/UniversitySidebar"
import UniversityAIAssistant from "../components/ai/university/UniversityAIAssistant"
import { useUniversityDashboardData } from "../hooks/useUniversityDashboardData"

interface UniversityLayoutProps {
	children: ReactNode
}

function UniversityLayout({ children }: UniversityLayoutProps) {
	useUniversityDashboardData()

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


