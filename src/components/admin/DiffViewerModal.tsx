import { useNavigate } from "react-router-dom"
import { getChangeTypeColor, type AdminChangeLog } from "../../data/adminData"
import { formatDateTime } from "../../utils/dateUtils"

interface DiffViewerModalProps {
	log: AdminChangeLog
	onClose: () => void
}

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

/**
 * Modal component for viewing change log details and field-level diffs
 */
export default function DiffViewerModal({ log, onClose }: DiffViewerModalProps) {
	const navigate = useNavigate()
	const typeColors = getChangeTypeColor(log.changeType)

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-lg overflow-hidden flex flex-col">
				{/* Modal Header */}
				<div className="p-6 border-b border-gray-200 flex items-center justify-between">
					<div>
						<h2 className="text-xl font-semibold" style={{ color: "#111827" }}>
							Change Details
						</h2>
						<p className="text-sm text-gray-600 mt-1">{log.admissionTitle}</p>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"
						aria-label="Close modal"
					>
						<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Modal Content - Scrollable */}
				<div className="flex-1 overflow-y-auto p-6">
					{/* Meta Info */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
							Meta Information
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-gray-500 mb-1">Admission</p>
								<p className="text-sm font-medium" style={{ color: "#111827" }}>
									{log.admissionTitle}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500 mb-1">Modified By</p>
								<p className="text-sm font-medium" style={{ color: "#111827" }}>
									{sanitizeActor(log.modifiedBy)}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500 mb-1">Timestamp</p>
								<p className="text-sm font-medium" style={{ color: "#111827" }}>
									{formatDateTime(log.timestamp)}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500 mb-1">Change Type</p>
								<span
									className="px-2 py-1 rounded-full text-xs font-medium inline-block"
									style={{ backgroundColor: typeColors.bg, color: typeColors.text }}
								>
									{log.changeType}
								</span>
							</div>
							{log.reasonForChange && (
								<div className="md:col-span-2">
									<p className="text-sm text-gray-500 mb-1">Reason for Change</p>
									<p className="text-sm" style={{ color: "#111827" }}>
										{log.reasonForChange}
									</p>
								</div>
							)}
							{log.verificationLogId && (
								<div className="md:col-span-2">
									<button
										onClick={() => {
											navigate(`/admin/verification`)
											onClose()
										}}
										className="text-sm text-blue-600 hover:underline"
									>
										View Verification Log #{log.verificationLogId} →
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Field-Level Diff */}
					<div>
						<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
							Field-Level Changes
						</h3>
						<div className="border border-gray-200 rounded-lg overflow-hidden">
							<div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
								<div className="p-3 text-sm font-semibold text-gray-700">Field</div>
								<div className="p-3 text-sm font-semibold text-gray-700 border-l border-gray-200">Old Value</div>
								<div className="p-3 text-sm font-semibold text-gray-700 border-l border-gray-200">New Value</div>
							</div>
							{log.diff.map((change, idx) => (
								<div key={idx} className="grid grid-cols-3 border-b border-gray-200 last:border-b-0">
									<div className="p-3 text-sm font-medium" style={{ color: "#111827" }}>
										{change.field}
									</div>
									<div className="p-3 text-sm border-l border-gray-200 break-words" style={{ color: "#B91C1C" }}>
										{renderValue(change.oldValue)}
									</div>
									<div className="p-3 text-sm border-l border-gray-200 break-words" style={{ color: "#15803D" }}>
										{renderValue(change.newValue)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Modal Footer */}
				<div className="p-6 border-t border-gray-200 flex items-center justify-end">
					<button
						onClick={onClose}
						className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}

