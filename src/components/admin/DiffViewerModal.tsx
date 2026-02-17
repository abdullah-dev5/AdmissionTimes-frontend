import { useNavigate } from "react-router-dom"
import { getChangeTypeColor, type AdminChangeLog } from "../../data/adminData"
import { formatDateTime, getRelativeTime } from "../../utils/dateUtils"
import { formatFieldLabel, sanitizeActorName, safeJsonParse, formatInlineValue } from "../../utils/changelogFormatting"

interface DiffViewerModalProps {
	log: AdminChangeLog
	onClose: () => void
}

/**
 * Renders a value for display in the diff viewer modal
 * Handles arrays, objects, and primitives with nice formatting
 */
const renderValue = (value: unknown, isOldValue?: boolean) => {
	const normalized = safeJsonParse(value)

	if (normalized === null || normalized === undefined || normalized === "") {
		return <span className="text-gray-400 italic text-sm">(empty)</span>
	}

	const valueColor = isOldValue ? "#dc2626" : "#16a34a"

	// Array: render as badges
	if (Array.isArray(normalized)) {
		if (normalized.length === 0) {
			return <span className="text-gray-400 italic text-sm">(empty array)</span>
		}
		return (
			<div className="flex flex-wrap gap-2">
				{normalized.slice(0, 5).map((item, idx) => (
					<span
						key={idx}
						className="inline-block px-2 py-1 text-xs rounded-lg font-medium"
						style={{
							backgroundColor: isOldValue ? "#fee2e2" : "#dcfce7",
							color: valueColor,
							border: `1px solid ${valueColor}33`,
						}}
					>
						{formatInlineValue(item)}
					</span>
				))}
				{normalized.length > 5 && (
					<span className="inline-block px-2 py-1 text-xs rounded-lg font-medium text-gray-500 bg-gray-100">
						+{normalized.length - 5} more
					</span>
				)}
			</div>
		)
	}

	// Object: render as structured list
	if (typeof normalized === "object") {
		const entries = Object.entries(normalized as Record<string, unknown>)
		if (entries.length === 0) {
			return <span className="text-gray-400 italic text-sm">(empty object)</span>
		}

		return (
			<div className="bg-gray-50 rounded p-3 space-y-2 max-h-64 overflow-y-auto">
				{entries.slice(0, 10).map(([key, val]) => (
					<div key={key} className="flex items-start gap-2 text-sm">
						<span className="text-gray-600 font-mono text-xs min-w-max">{formatFieldLabel(key)}:</span>
						<span className="text-gray-800 break-words flex-1">{formatInlineValue(val)}</span>
					</div>
				))}
				{entries.length > 10 && (
					<p className="text-xs text-gray-500 italic">+{entries.length - 10} more fields...</p>
				)}
			</div>
		)
	}

	// Primitive: render with appropriate styling
	if (typeof normalized === "boolean") {
		return (
			<span
				className="inline-block px-2 py-1 text-xs rounded font-semibold"
				style={{
					backgroundColor: normalized ? (isOldValue ? "#fee2e2" : "#dcfce7") : "#f3f4f6",
					color: normalized ? valueColor : "#6b7280",
				}}
			>
				{normalized ? "Yes" : "No"}
			</span>
		)
	}

	// Default text with color-coding
	return (
		<span
			className="inline-block px-2 py-1 text-sm font-medium rounded break-words"
			style={{
				backgroundColor: isOldValue ? "#fee2e2" : "#dcfce7",
				color: valueColor,
			}}
		>
			{String(normalized)}
		</span>
	)
}

/**
 * Enhanced modal component for viewing changelog details with better formatting
 * Shows metadata, field-level diffs, and relative time information
 */
export default function DiffViewerModal({ log, onClose }: DiffViewerModalProps) {
	const navigate = useNavigate()
	const typeColors = getChangeTypeColor(log.changeType)
	const relativeTime = getRelativeTime(log.timestamp)
	const absoluteTime = formatDateTime(log.timestamp)

	const handleVerificationClick = () => {
		navigate(`/admin/verification`)
		onClose()
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
				{/* Modal Header */}
				<div className="px-6 py-5 border-b border-gray-200 bg-white">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h2 className="text-2xl font-bold text-gray-900">Change Details</h2>
							<p className="text-sm text-gray-600 mt-2">{log.admissionTitle}</p>
						</div>
						<button
							onClick={onClose}
							className="p-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
							aria-label="Close modal"
							title="Close (Esc)"
						>
							<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				{/* Modal Content - Scrollable */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Meta Information Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
							<p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Program</p>
							<p className="text-sm font-medium text-gray-900">{log.admissionTitle}</p>
							<p className="text-xs text-gray-500 mt-1">ID: {log.admissionId}</p>
						</div>

						<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
							<p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Modified By</p>
							<p className="text-sm font-medium text-gray-900">{sanitizeActorName(log.modifiedBy)}</p>
							{log.modifiedByUserId && (
								<p className="text-xs text-gray-500 mt-1">ID: {log.modifiedByUserId}</p>
							)}
						</div>

						<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
							<p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">When</p>
							<p className="text-sm font-semibold text-gray-900">{relativeTime}</p>
							<p className="text-xs text-gray-500 mt-1" title={absoluteTime}>
								{absoluteTime}
							</p>
						</div>

						<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
							<p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Type</p>
							<span
								className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold"
								style={{
									backgroundColor: typeColors.bg,
									color: typeColors.text,
									border: `1px solid ${typeColors.text}33`,
								}}
							>
								{/* TODO: Enable when scraper module is ready */}
								{log.changeType}
							</span>
						</div>
					</div>

					{/* Reason for Change (if provided) */}
					{log.reasonForChange && (
						<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
							<p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Reason</p>
							<p className="text-sm text-gray-900">{log.reasonForChange}</p>
						</div>
					)}

					{/* Verification Log Link */}
					{log.verificationLogId && (
						<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
							<button
								onClick={handleVerificationClick}
								className="text-sm font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
							>
								View Verification Log #{log.verificationLogId}
							</button>
						</div>
					)}

					{/* Field-Level Changes */}
					<div>
						<h3 className="text-lg font-bold text-gray-900 mb-4">
							Field-Level Changes ({log.diff.length} fields)
						</h3>

						{log.diff.length === 0 ? (
							<div className="p-6 text-center rounded-lg bg-gray-50 border border-gray-200">
								<p className="text-gray-600">No field changes recorded</p>
							</div>
						) : (
							<div className="space-y-3">
								{log.diff.map((change, idx) => (
									<div
										key={idx}
										className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
									>
										{/* Field Name Header */}
										<div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
											<p className="text-sm font-bold text-gray-900">
												{formatFieldLabel(change.field)}
											</p>
										</div>

										{/* Values Grid */}
										<div className="grid grid-cols-2 gap-4 p-4">
											{/* Old Value */}
											<div>
												<p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-3">
													Previous Value
												</p>
												<div className="max-h-48 overflow-y-auto">
													{renderValue(change.oldValue, true)}
												</div>
											</div>

											{/* New Value */}
											<div>
												<p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">
													Current Value
												</p>
												<div className="max-h-48 overflow-y-auto">
													{renderValue(change.newValue, false)}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Modal Footer */}
				<div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
					<p className="text-xs text-gray-500">
						Change ID: <span className="font-mono text-gray-700">{log.id}</span>
					</p>
					<button
						onClick={onClose}
						className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition-colors cursor-pointer"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}

