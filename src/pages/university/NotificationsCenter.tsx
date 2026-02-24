import { useMemo, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import UniversityLayout from "../../layouts/UniversityLayout"
import { type NotificationItem } from "../../data/universityData"
import { useUniversityStore } from "../../store/universityStore"

type NotificationType = NotificationItem["type"]

const TABS: Array<"All" | NotificationType> = ["All", "Admin Feedback", "System Alert", "Data Update"]

const TYPE_STYLES: Record<NotificationType, { bg: string; text: string }> = {
	"Admin Feedback": { bg: "bg-blue-100", text: "text-blue-700" },
	"System Alert": { bg: "bg-gray-100", text: "text-gray-700" },
	"Data Update": { bg: "bg-orange-100", text: "text-orange-700" },
}

function timeAgo(iso: string): string {
	const now = new Date()
	const then = new Date(iso)
	const diffMs = now.getTime() - then.getTime()
	const minutes = Math.floor(diffMs / 60000)
	if (minutes < 1) return "just now"
	if (minutes < 60) return `${minutes}m ago`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `${hours}h ago`
	const days = Math.floor(hours / 24)
	return `${days}d ago`
}

function NotificationTabs({
	active,
	onChange,
	onMarkAll,
	onRefresh,
	isLoading,
}: {
	active: "All" | NotificationType
	onChange: (tab: "All" | NotificationType) => void
	onMarkAll: () => void
	onRefresh: () => void
	isLoading: boolean
}) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-wrap gap-2">
				{TABS.map((tab) => (
					<button
						key={tab}
						onClick={() => onChange(tab)}
						className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
							active === tab ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
						}`}
					>
						{tab}
					</button>
				))}
			</div>
			<div className="flex gap-2">
				<button 
					onClick={onMarkAll} 
					className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
				>
					Mark All as Read
				</button>
				<button 
					onClick={onRefresh}
					disabled={isLoading}
					className={`px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
				>
					<svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					{isLoading ? 'Refreshing...' : 'Refresh'}
				</button>
			</div>
		</div>
	)
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
	return (
		<div className="relative w-full sm:max-w-sm">
			<input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				type="text"
				placeholder="Search notifications..."
				className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</div>
	)
}

function NotificationCard({
	item,
	onMarkRead,
	onOpen,
}: {
	item: NotificationItem
	onMarkRead: (id: number | string) => void
	onOpen: (id?: string) => void
}) {
	const badge = TYPE_STYLES[item.type]
	return (
		<div
			className={`bg-white shadow-sm rounded-xl p-4 mb-3 flex items-start justify-between transition-colors ${
				item.read ? "" : "border-l-4 border-blue-500"
			}`}
		>
			<div className="flex items-start gap-3">
				<div className={`w-2 h-2 rounded-full mt-2 ${item.read ? "bg-gray-300" : "bg-blue-500"}`} />
				<div>
					<div className="flex items-center gap-2">
						<span className="font-medium text-gray-900">{item.title}</span>
						<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>{item.type}</span>
					</div>
					<p className={`text-sm mt-1 ${item.read ? "text-gray-500" : "text-gray-700"}`}>{item.message}</p>
					<p className="text-xs text-gray-500 mt-1">{timeAgo(item.time)}</p>
				</div>
			</div>
			<div className="flex items-center gap-2">
				{!item.read && (
					<button onClick={() => onMarkRead(item.id)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
						Mark as Read
					</button>
				)}
				<button
					onClick={() => onOpen(item.admissionId)}
					className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
				>
					View Admission
				</button>
			</div>
		</div>
	)
}

function NotificationsCenter() {
	const navigate = useNavigate()
	const notifications = useUniversityStore((state) => state.notifications)
	const fetchNotifications = useUniversityStore((state) => state.fetchNotifications)
	const loading = useUniversityStore((state) => state.loading)
	const markNotificationRead = useUniversityStore((state) => state.markNotificationRead)
	const markAllNotificationsRead = useUniversityStore((state) => state.markAllNotificationsRead)
	const [tab, setTab] = useState<"All" | NotificationType>("All")
	const [query, setQuery] = useState("")
	const [isUsingRealData, setIsUsingRealData] = useState(false)

	// Fetch notifications from API on mount
	useEffect(() => {
		let isMounted = true

		const initializeNotifications = async () => {
			try {
				await fetchNotifications({
					showError: (msg) => {
						if (isMounted) {
							console.warn('⚠️  Could not fetch from API:', msg)
						}
					}
				})
				if (isMounted) {
					setIsUsingRealData(true)
				}
			} catch (err) {
				if (isMounted) {
					console.error('Failed to fetch notifications:', err)
					setIsUsingRealData(false)
				}
			}
		}

		initializeNotifications()
		return () => {
			isMounted = false
		}
	}, [fetchNotifications])

	const filtered = useMemo(() => {
		let list = notifications
		if (tab !== "All") {
			list = list.filter((n) => n.type === tab)
		}
		if (query.trim()) {
			const q = query.trim().toLowerCase()
			list = list.filter((n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q))
		}
		return list
	}, [notifications, tab, query])

	const markAll = () => {
		markAllNotificationsRead()
	}

	const markRead = (id: number | string) => {
		markNotificationRead(id)
	}

	const handleRefresh = () => {
		fetchNotifications({
			showError: (msg) => {
				console.error('Failed to refresh notifications:', msg)
			}
		})
	}

	const openAdmission = (admissionId?: string) => {
		if (admissionId) {
			navigate(`/university/manage-admissions?edit=${admissionId}`)
		} else {
			navigate("/university/manage-admissions")
		}
	}

	return (
		<UniversityLayout>
			<div className="min-h-screen bg-gray-50">
				<header className="sticky top-0 z-50 bg-white border-b border-gray-200">
					<div className="max-w-5xl mx-auto px-6 py-4">
						<h1 className="text-2xl font-bold text-gray-900">Notifications Center</h1>
						<p className="text-gray-600">View and manage system and verification alerts.</p>
					</div>
				</header>
				<main className="max-w-5xl mx-auto px-6 py-6">
					{isUsingRealData && (
						<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
							<svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							<div className="flex-1">
								<p className="text-sm font-medium text-green-800">✅ Real Data</p>
								<p className="text-xs text-green-700">Notifications loaded from API</p>
							</div>
						</div>
					)}
					<div className="bg-white shadow-sm rounded-xl p-4 mb-4">
						<div className="flex flex-col gap-3">
							<NotificationTabs active={tab} onChange={setTab} onMarkAll={markAll} onRefresh={handleRefresh} isLoading={loading} />
							<SearchBar value={query} onChange={setQuery} />
						</div>
					</div>
					<div>
						{filtered.map((n) => (
							<NotificationCard key={n.id} item={n} onMarkRead={markRead} onOpen={openAdmission} />
						))}
						{filtered.length === 0 && (
							<div className="bg-white shadow-sm rounded-xl p-8 text-center text-gray-500">No notifications found.</div>
						)}
					</div>
				</main>
			</div>
		</UniversityLayout>
	)
}

export default NotificationsCenter


