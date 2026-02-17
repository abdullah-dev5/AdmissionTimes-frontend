import { useMemo, useState } from "react"
import UniversityLayout from "../../layouts/UniversityLayout"
import { type ChangeLogItem } from "../../data/universityData"
import { useUniversityStore } from "../../store/universityStore"
import { formatDateTime } from "../../utils/dateUtils"

const formatLabel = (value: string) =>
	value
		.replace(/_/g, " ")
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/\b\w/g, (char) => char.toUpperCase())

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
	if (!cleaned || isUuid(cleaned)) return "System"
	if (!Number.isNaN(Date.parse(cleaned))) return "System"
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
			.map(([key, val]) => `${formatLabel(key)}: ${formatInline(val)}`)
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
						<span className="text-xs text-gray-500 min-w-[120px]">{formatLabel(key)}</span>
						<span className="text-sm text-gray-800 break-words">{formatInline(val)}</span>
					</div>
				))}
			</div>
		)
	}
	return <span className="text-sm text-gray-800 break-words">{String(normalized)}</span>
}

function FilterBar({
	from,
	to,
	onFromChange,
	onToChange,
	admission,
	onAdmissionChange,
	search,
	onSearchChange,
	options,
}: {
	from: string
	to: string
	onFromChange: (v: string) => void
	onToChange: (v: string) => void
	admission: string
	onAdmissionChange: (v: string) => void
	search: string
	onSearchChange: (v: string) => void
	options: string[]
}) {
	return (
		<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
			<div className="flex flex-col sm:flex-row gap-3 sm:items-center">
				<div className="flex items-center gap-2">
					<label className="text-sm text-gray-600">From</label>
					<input
						type="date"
						value={from}
						onChange={(e) => onFromChange(e.target.value)}
						className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div className="flex items-center gap-2">
					<label className="text-sm text-gray-600">To</label>
					<input
						type="date"
						value={to}
						onChange={(e) => onToChange(e.target.value)}
						className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div className="flex items-center gap-2">
					<label className="text-sm text-gray-600">Filter by Admission</label>
					<select
						value={admission}
						onChange={(e) => onAdmissionChange(e.target.value)}
						className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						{options.map((a) => (
							<option key={a} value={a}>
								{a}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className="relative w-full md:max-w-sm">
				<input
					type="text"
					placeholder="Search by title or modifier"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
		</div>
	)
}

function ChangeTable({
	data,
	onViewDiff,
}: {
	data: ChangeLogItem[]
	onViewDiff: (item: ChangeLogItem) => void
}) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full">
				<thead className="sticky top-0 bg-white">
					<tr className="border-b border-gray-200">
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Admission Title</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Modified By</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date & Time</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Change Summary</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Remarks</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
					</tr>
				</thead>
				<tbody>
					{data.map((row) => (
						<tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
							<td className="py-4 px-4">
								<p className="font-medium text-gray-900">{row.admission}</p>
							</td>
							<td className="py-4 px-4">
								{row.status ? (
									<span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
										{row.status}
									</span>
								) : (
									<span className="text-sm text-gray-400">—</span>
								)}
							</td>
							<td className="py-4 px-4">
								<p className="text-sm text-gray-700">{sanitizeActor(row.modifiedBy)}</p>
							</td>
							<td className="py-4 px-4">
								<p className="text-sm text-gray-700">{formatDateTimeSafe(row.date)}</p>
							</td>
							<td className="py-4 px-4">
								<div className="flex flex-wrap gap-2 max-w-[260px]">
									{row.diff.map((d) => (
										<span key={d.field} className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-100">
											{d.field}
										</span>
									))}
								</div>
							</td>
							<td className="py-4 px-4">
								<p className="text-sm text-gray-600 truncate max-w-[220px]" title={formatInline(row.remarks || "")}>
									{formatInline(row.remarks || "")}
								</p>
							</td>
							<td className="py-4 px-4">
								<button
									onClick={() => onViewDiff(row)}
									className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
								>
									View Diff
								</button>
							</td>
						</tr>
					))}
					{data.length === 0 && (
						<tr>
							<td colSpan={7} className="py-10 text-center text-sm text-gray-500">
								No change logs found. Adjust filters or search terms.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	)
}

function DiffModal({ item, onClose }: { item: ChangeLogItem | null; onClose: () => void }) {
	if (!item) return null
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="bg-white w-full max-w-2xl rounded-xl shadow p-5">
				<div className="flex items-start justify-between">
					<div>
						<h3 className="text-lg font-semibold text-blue-800">Field-level Differences</h3>
						<p className="text-sm text-gray-600 mt-1">
							{item.admission} • {formatDateTimeSafe(item.date)} • {sanitizeActor(item.modifiedBy)}
						</p>
					</div>
					<button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
						<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<div className="mt-4">
					<ul className="space-y-3">
						{item.diff.map((d, idx) => (
							<li key={idx} className="border border-gray-200 rounded-lg p-3">
								<p className="text-sm font-medium text-gray-900">{d.field}</p>
								<div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
									<div className="rounded-lg border border-red-100 bg-red-50/40 p-2">
										<p className="text-xs font-semibold text-red-600 mb-1">Old</p>
										{renderValue(d.old)}
									</div>
									<div className="rounded-lg border border-green-100 bg-green-50/40 p-2">
										<p className="text-xs font-semibold text-green-600 mb-1">New</p>
										{renderValue(d.new)}
									</div>
								</div>
							</li>
						))}
					</ul>
					{item.remarks && (
						<div className="mt-4">
							<p className="text-sm text-gray-500">Remarks</p>
							<p className="text-sm text-gray-900">{renderValue(item.remarks)}</p>
						</div>
					)}
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

function ChangeLogs() {
	const changeLogs = useUniversityStore((state) => state.changeLogs)
	const admissions = useUniversityStore((state) => state.admissions)
	const [from, setFrom] = useState("")
	const [to, setTo] = useState("")
	const [admission, setAdmission] = useState("All Admissions")
	const [search, setSearch] = useState("")
	const [selected, setSelected] = useState<ChangeLogItem | null>(null)

	const mockAdmissions = useMemo(
		() => ["All Admissions", ...admissions.map((a) => a.title)],
		[admissions],
	)

	const logs = useMemo(() => {
		return [...changeLogs].sort((a, b) => (a.date < b.date ? 1 : -1))
	}, [changeLogs])

	const filtered = useMemo(() => {
		let list = logs
		if (admission !== "All Admissions") {
			list = list.filter((l) => l.admission === admission)
		}
		if (from) {
			list = list.filter((l) => l.date.slice(0, 10) >= from)
		}
		if (to) {
			list = list.filter((l) => l.date.slice(0, 10) <= to)
		}
		if (search.trim()) {
			const q = search.trim().toLowerCase()
			list = list.filter((l) => l.admission.toLowerCase().includes(q) || l.modifiedBy.toLowerCase().includes(q))
		}
		// Keep latest first
		return [...list].sort((a, b) => (a.date < b.date ? 1 : -1))
	}, [logs, admission, from, to, search])

	return (
		<UniversityLayout>
			<div className="min-h-screen bg-gray-50">
				<header className="sticky top-0 z-50 bg-white border-b border-gray-200">
					<div className="max-w-6xl mx-auto px-4 py-4">
						<h1 className="text-2xl font-bold text-gray-900">Change Logs</h1>
						<p className="text-gray-600">Track all admission modifications and audit revisions.</p>
					</div>
					</header>
					<main className="max-w-6xl mx-auto px-4 py-6">
						<div className="bg-white shadow-sm rounded-xl p-4 mb-4">
							<FilterBar
								from={from}
								to={to}
							onFromChange={setFrom}
							onToChange={setTo}
							admission={admission}
							onAdmissionChange={setAdmission}
							search={search}
							onSearchChange={setSearch}
							options={mockAdmissions}
						/>
					</div>
					<div className="bg-white shadow-sm rounded-xl p-4">
						<ChangeTable data={filtered} onViewDiff={setSelected} />
					</div>
				</main>
				<DiffModal item={selected} onClose={() => setSelected(null)} />
			</div>
		</UniversityLayout>
	)
}

export default ChangeLogs


