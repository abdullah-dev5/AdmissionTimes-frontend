import { getChangeTypeColor, type AdminChangeLog } from "../../data/adminData"
import { formatDateTime } from "../../utils/dateUtils"

interface ChangeLogTableProps {
	logs: AdminChangeLog[]
	onViewDiff: (log: AdminChangeLog) => void
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
	if (!cleaned || isUuid(cleaned)) return "System"
	if (!Number.isNaN(Date.parse(cleaned))) return "System"
	return cleaned
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

/**
 * Table component for displaying change logs
 */
export default function ChangeLogTable({ logs, onViewDiff }: ChangeLogTableProps) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full">
				<thead>
					<tr className="border-b border-gray-200">
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Admission Title</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Modified By</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Summary</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Timestamp</th>
						<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
					</tr>
				</thead>
				<tbody>
					{logs.map((log) => {
						const typeColors = getChangeTypeColor(log.changeType)
						return (
							<tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
								<td className="py-4 px-4">
									<p className="font-medium" style={{ color: "#111827" }}>
										{log.admissionTitle}
									</p>
								</td>
								<td className="py-4 px-4">
									<p className="text-sm text-gray-600">{sanitizeActor(log.modifiedBy)}</p>
								</td>
								<td className="py-4 px-4">
									<span
										className="px-2 py-1 rounded-full text-xs font-medium"
										style={{ backgroundColor: typeColors.bg, color: typeColors.text }}
									>
										{log.changeType}
									</span>
								</td>
								<td className="py-4 px-4">
									<p className="text-sm text-gray-600">{formatInline(log.summary)}</p>
								</td>
								<td className="py-4 px-4">
									<p className="text-sm text-gray-600">{formatDateTime(log.timestamp)}</p>
								</td>
								<td className="py-4 px-4">
									<button
										onClick={() => onViewDiff(log)}
										className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
									>
										View Diff
									</button>
								</td>
							</tr>
						)
					})}
					{logs.length === 0 && (
						<tr>
							<td colSpan={6} className="py-10 text-center">
								<div className="flex flex-col items-center justify-center">
									<svg
										className="w-16 h-16 text-gray-400 mb-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2.5"
										/>
									</svg>
									<p className="text-lg font-medium text-gray-500 mb-2">No change logs found</p>
									<p className="text-sm text-gray-400">Try adjusting your filters or check back later.</p>
								</div>
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	)
}

