import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

function UniversitySidebar() {
	const [isCollapsed, setIsCollapsed] = useState(true)
	const [isHovered, setIsHovered] = useState(false)
	const location = useLocation()
	const navigate = useNavigate()
	const { signOut } = useAuth()

	const isExpanded = isHovered || !isCollapsed

	const navItems = [
		{
			name: "Dashboard",
			icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
			link: "/university/dashboard",
		},
		{
			name: "All Admissions",
			icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
			link: "/university/admissions",
		},
		{
			name: "Manage Admissions",
			icon: "M9 12h6m-6 4h6m-2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2.5",
			link: "/university/manage-admissions",
		},
		{
			name: "Verification Center",
			icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
			link: "/university/verification-center",
		},
		{
			name: "Change Logs",
			icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
			link: "/university/change-logs",
		},
		{
			name: "Notifications",
			icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
			link: "/university/notifications-center",
		},
		{
			name: "Settings",
			icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
			link: "/university/settings",
		},
	]

	const isActive = (link: string) => {
		return location.pathname === link
	}

	return (
		<aside
			className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-500 ease-in-out fixed left-0 top-0 h-full z-60 ${
				isExpanded ? "w-64 shadow-lg" : "w-20"
			}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className="p-7 border-b border-gray-200 flex items-center justify-between">
				{isExpanded ? (
					<button
						onClick={() => navigate("/university/dashboard")}
						className="flex items-center gap-2 cursor-pointer transition-colors hover:opacity-80"
					>
						<div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: "#2563EB" }}>
							<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
								/>
							</svg>
						</div>
						<span className="font-semibold text-lg" style={{ color: "#111827" }}>
							AdmissionTimes
						</span>
					</button>
				) : (
					<button
						onClick={() => navigate("/university/dashboard")}
						className="w-8 h-8 rounded flex items-center justify-center mx-auto cursor-pointer transition-colors hover:opacity-80"
						style={{ backgroundColor: "#2563EB" }}
					>
						<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
							/>
						</svg>
					</button>
				)}
				{isExpanded && (
					<button
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="p-1 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
				)}
			</div>
			<nav className="flex-1 p-4 overflow-y-auto">
				<ul className="space-y-1 mb-6">
					{navItems.map((item) => {
						const active = isActive(item.link)
						return (
							<li key={item.name}>
								<Link
									to={item.link}
									className={`w-full text-left rounded-lg flex items-center gap-3 cursor-pointer transition-colors ${
										active ? "text-white font-medium" : "text-gray-600 hover:bg-gray-50"
									} ${isExpanded ? "px-4 py-3" : "justify-center px-3 py-3"}`}
									style={active ? { backgroundColor: "#2563EB" } : {}}
									title={isExpanded ? "" : item.name}
								>
									<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
									</svg>
									{isExpanded && <span>{item.name}</span>}
								</Link>
							</li>
						)
					})}
					<li>
						<button
							onClick={signOut}
							className={`w-full text-left rounded-lg flex items-center gap-3 cursor-pointer transition-colors text-gray-600 hover:bg-gray-50 ${
								isExpanded ? "px-4 py-3" : "justify-center px-3 py-3"
							}`}
							title={isExpanded ? "" : "Logout"}
						>
							<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							{isExpanded && <span>Logout</span>}
						</button>
					</li>
				</ul>
			</nav>
		</aside>
	)
}

export default UniversitySidebar


