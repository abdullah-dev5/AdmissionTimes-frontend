import { useEffect, useMemo, useState } from "react"
import UniversityLayout from "../../layouts/UniversityLayout"
import { type AuditItem, type AuditStatus } from "../../data/universityData"
import { useUniversityStore } from "../../store/universityStore"
import { formatDateTime } from "../../utils/dateUtils"

const STATUS_OPTIONS: Array<"All" | AuditStatus> = ["All", "Pending", "Verified", "Rejected"]

const STATUS_STYLES: Record<AuditStatus, { bg: string; text: string }> = {
	Pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
	Verified: { bg: "bg-green-100", text: "text-green-700" },
	Rejected: { bg: "bg-red-100", text: "text-red-700" },
}

const isUuid = (value: string) => /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(value)

const splitBySeparator = (value: string) => {
	const parts = value.split(/\s[•|]\s|\s-\s/)
	return parts[0] ?? value
}

const sanitizeActor = (value?: string) => {
	if (!value) return "—"
	let cleaned = splitBySeparator(value)
	cleaned = cleaned.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "")
	cleaned = cleaned.replace(/\s{2,}/g, " ").trim()
	if (!cleaned || isUuid(cleaned)) return "Admin"
	if (!Number.isNaN(Date.parse(cleaned))) return "Admin"
	if (cleaned.toLowerCase() === "system") return "Admin"
	return cleaned
}

const formatDateTimeSafe = (value: string) => {
	if (!value) return "—"
	const trimmed = splitBySeparator(value)
	const parsed = new Date(trimmed)
	if (Number.isNaN(parsed.getTime())) {
		return trimmed
	}
	return formatDateTime(parsed.toISOString())
}

const normalizeValue = (value: unknown) => {
	if (typeof value === "string") {
		const trimmed = value.trim()
		if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
			try {
				return JSON.parse(trimmed)
			} catch {
				return value
			}
		}
	}
	return value
}

const formatInline = (value: unknown): string => {
	const normalized = normalizeValue(value)
	if (normalized === null || normalized === undefined || normalized === "") {
		return "—"
	}
	if (Array.isArray(normalized)) {
		return normalized.map((item) => formatInline(item)).join(", ")
	}
	if (typeof normalized === "object") {
		return Object.entries(normalized as Record<string, unknown>)
			.map(([key, val]) => `${key.replace(/_/g, " ")}: ${formatInline(val)}`)
			.join(", ")
	}
	return String(normalized)
}

const renderValue = (value: unknown) => {
	const normalized = normalizeValue(value)
	if (normalized === null || normalized === undefined || normalized === "") {
		return <span className="text-gray-400 italic">(empty)</span>
	}
	if (Array.isArray(normalized)) {
		return (
			<div className="flex flex-wrap gap-2">
				{normalized.map((item, idx) => (
					<span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
						{formatInline(item)}
					</span>
				))}
			</div>
		)
	}
	if (typeof normalized === "object") {
		return (
			<div className="space-y-1">
				{Object.entries(normalized as Record<string, unknown>).map(([key, val]) => (
					<div key={key} className="flex items-start gap-3">
						<span className="text-xs text-gray-500 min-w-[120px]">{key.replace(/_/g, " ")}</span>
						<span className="text-sm text-gray-800 break-words">{formatInline(val)}</span>
					</div>
				))}
			</div>
		)
	}
	return <span className="text-sm text-gray-800 break-words">{String(normalized)}</span>
}

function FilterBar({
	status,
	onStatusChange,
	search,
	onSearchChange,
}: {
	status: "All" | AuditStatus
	onStatusChange: (value: "All" | AuditStatus) => void
	search: string
	onSearchChange: (value: string) => void
}) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-3">
				<label className="text-sm text-gray-600">Filter by Status</label>
				<select
					value={status}
					onChange={(e) => onStatusChange(e.target.value as "All" | AuditStatus)}
					className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					{STATUS_OPTIONS.map((opt) => (
						<option key={opt} value={opt}>
							{opt}
						</option>
					))}
				</select>
			</div>
			<div className="relative w-full sm:max-w-sm">
				<input
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					type="text"
					placeholder="Search admission title..."
					className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
		</div>
	)
}

function AuditTable({
	data,
	onView,
	onDownload,
}: {
	data: AuditItem[]
	onView: (audit: AuditItem) => void
	onDownload: (audit: AuditItem) => void
}) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full">
				<thead className="sticky top-0 bg-white">
					<tr className="border-b border-gray-200">
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Admission Title</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Verified By</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Last Action Date</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Remarks</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
					</tr>
				</thead>
				<tbody>
					{data.map((row) => {
						const styles = STATUS_STYLES[row.status]
						return (
							<tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
								<td className="py-4 px-4">
									<p className="font-medium text-gray-900">{row.title}</p>
								</td>
								<td className="py-4 px-4">
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>{row.status}</span>
								</td>
								<td className="py-4 px-4">
									<p className="text-sm text-gray-700">{sanitizeActor(row.verifiedBy)}</p>
								</td>
								<td className="py-4 px-4">
									<p className="text-sm text-gray-700">{formatDateTimeSafe(row.lastAction)}</p>
								</td>
								<td className="py-4 px-4">
									<p className="text-sm text-gray-600 truncate max-w-[240px]" title={formatInline(row.remarks || "")}
									>
										{formatInline(row.remarks || "")}
									</p>
								</td>
								<td className="py-4 px-4">
									<div className="flex items-center gap-2">
										<button
											onClick={() => onView(row)}
											className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
										>
											View Details
										</button>
										<button
											onClick={() => onDownload(row)}
											className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
										>
											Download Log
										</button>
									</div>
								</td>
							</tr>
						)
					})}
					{data.length === 0 && (
						<tr>
							<td colSpan={6} className="py-10 text-center text-sm text-gray-500">
								No audits found. Adjust filters or search terms.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	)
}

function AuditModal({
	audit,
	onClose,
}: {
	audit: AuditItem | null
	onClose: () => void
}) {
	if (!audit) return null
	const styles = STATUS_STYLES[audit.status]
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="bg-white w-full max-w-lg rounded-xl shadow p-5">
				<div className="flex items-start justify-between">
					<div>
						<h3 className="text-lg font-semibold text-gray-900">Admission Details</h3>
						<p className="text-sm text-gray-600 mt-1">Review verification context and last action.</p>
					</div>
					<button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
						<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<div className="mt-4 space-y-3">
					<div className="flex items-center gap-2">
						<p className="text-sm text-gray-500">Title</p>
						<p className="text-sm font-medium text-gray-900">{audit.title}</p>
					</div>
					<div className="flex items-center gap-2">
						<p className="text-sm text-gray-500">Status</p>
						<span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>{audit.status}</span>
					</div>
					<div className="flex items-center gap-2">
						<p className="text-sm text-gray-500">Verified By</p>
						<p className="text-sm font-medium text-gray-900">{sanitizeActor(audit.verifiedBy)}</p>
					</div>
					<div className="flex items-center gap-2">
						<p className="text-sm text-gray-500">Last Action</p>
						<p className="text-sm font-medium text-gray-900">{formatDateTimeSafe(audit.lastAction)}</p>
					</div>
					<div>
						<p className="text-sm text-gray-500 mb-1">Remarks</p>
						<div className="text-sm text-gray-800">{renderValue(audit.remarks)}</div>
					</div>
				</div>
				<div className="mt-5 flex justify-end">
					<button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
						Close
					</button>
				</div>
			</div>
		</div>
	)
}

function Toast({ message, onHide }: { message: string; onHide: () => void }) {
	useEffect(() => {
		const t = setTimeout(onHide, 2000)
		return () => clearTimeout(t)
	}, [onHide])
	return (
		<div className="fixed bottom-4 right-4 z-50">
			<div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow">{message}</div>
		</div>
	)
}

function VerificationCenter() {
	const [status, setStatus] = useState<"All" | AuditStatus>("All")
	const [search, setSearch] = useState("")
	const [audits, setAudits] = useState<AuditItem[]>([])
	const [selected, setSelected] = useState<AuditItem | null>(null)
	const [toast, setToast] = useState<string | null>(null)
	const sharedAudits = useUniversityStore((state) => state.audits)

	useEffect(() => {
		// Simulate fetch from /api/audits
		const t = setTimeout(() => {
			setAudits(sharedAudits)
		}, 300)
		return () => clearTimeout(t)
	}, [sharedAudits])

	const filtered = useMemo(() => {
		let list = audits
		if (status !== "All") {
			list = list.filter((a) => a.status === status)
		}
		if (search.trim()) {
			const q = search.trim().toLowerCase()
			list = list.filter((a) => a.title.toLowerCase().includes(q))
		}
		return list
	}, [audits, status, search])

	const handleDownload = (audit: AuditItem) => {
		// Mock download - in real app, this would call /api/verification/log/:id
		const link = document.createElement('a')
		link.href = '#' // Replace with actual download URL
		link.download = `audit-log-${audit.id}.txt`
		link.click()
		setToast(`Log download started for "${audit.title}"`)
	}

	return (
		<UniversityLayout>
			<div className="min-h-screen bg-gray-50">
				<header className="sticky top-0 z-50 bg-white border-b border-gray-200">
					<div className="max-w-6xl mx-auto px-4 py-4">
						<h1 className="text-2xl font-bold text-gray-900">Verification Center</h1>
						<p className="text-gray-600">Track your admission reviews and audit results.</p>
					</div>
				</header>

				<main className="max-w-6xl mx-auto px-4 py-6">
					<div className="bg-white shadow rounded-xl p-4 mb-4">
						<FilterBar status={status} onStatusChange={setStatus} search={search} onSearchChange={setSearch} />
					</div>

					<div className="bg-white shadow rounded-xl p-4">
						<AuditTable data={filtered} onView={setSelected} onDownload={handleDownload} />
					</div>
				</main>

				<AuditModal audit={selected} onClose={() => setSelected(null)} />
				{toast && <Toast message={toast} onHide={() => setToast(null)} />}
			</div>
		</UniversityLayout>
	)
}

export default VerificationCenter


