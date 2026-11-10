import {
	formatCellValue,
	formatFieldLabel,
	formatInlineValue,
	isDateLikeFieldName,
	parseDiffValue,
} from "../../utils/changelogFormatting"

interface DiffValueDisplayProps {
	value: unknown
	fieldName?: string
	variant?: "old" | "new"
}

const unwrapQuotedString = (value: string) => {
	const trimmed = value.trim()
	if (!trimmed.startsWith('"') || !trimmed.endsWith('"')) return trimmed
	try {
		const parsed = JSON.parse(trimmed)
		return typeof parsed === "string" ? parsed : trimmed
	} catch {
		return trimmed.slice(1, -1)
	}
}

export default function DiffValueDisplay({ value, fieldName, variant = "new" }: DiffValueDisplayProps) {
	const normalized = parseDiffValue(value)
	const bg = variant === "old" ? "bg-red-50" : "bg-green-50"
	const text = variant === "old" ? "text-red-800" : "text-green-800"
	const border = variant === "old" ? "border-red-100" : "border-green-100"

	if (normalized === null || normalized === undefined || normalized === "") {
		return <span className="text-sm text-gray-400 italic">(empty)</span>
	}

	if (Array.isArray(normalized)) {
		if (normalized.length === 0) {
			return <span className="text-sm text-gray-400 italic">(empty)</span>
		}
		return (
			<div className="flex flex-wrap gap-1.5">
				{normalized.slice(0, 8).map((item, idx) => (
					<span key={idx} className={`px-2 py-0.5 text-xs rounded-md border ${border} ${bg} ${text}`}>
						{formatInlineValue(item)}
					</span>
				))}
				{normalized.length > 8 && <span className="text-xs text-gray-500">+{normalized.length - 8} more</span>}
			</div>
		)
	}

	if (typeof normalized === "object") {
		const entries = Object.entries(normalized as Record<string, unknown>)
		if (entries.length === 0) {
			return <span className="text-sm text-gray-400 italic">(empty)</span>
		}

		return (
			<div className={`rounded-lg border ${border} ${bg} p-2 max-h-56 overflow-y-auto space-y-2`}>
				{entries.slice(0, 15).map(([key, val]) => (
					<div key={key} className="grid grid-cols-[minmax(110px,34%)_1fr] gap-2 text-sm">
						<span className="text-xs font-semibold text-gray-600">{formatFieldLabel(key)}</span>
						<span className={`${text} break-words`}>{formatCellValue(val, key)}</span>
					</div>
				))}
				{entries.length > 15 && <p className="text-xs text-gray-500 italic">+{entries.length - 15} more fields</p>}
			</div>
		)
	}

	if (typeof normalized === "boolean") {
		return (
			<span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md border ${border} ${bg} ${text}`}>
				{normalized ? "Yes" : "No"}
			</span>
		)
	}

	const cleaned = typeof normalized === "string" ? unwrapQuotedString(normalized) : String(normalized)
	const display = isDateLikeFieldName(fieldName) ? formatCellValue(cleaned, fieldName) : formatCellValue(cleaned, fieldName)

	if (!display || display === "—") {
		return <span className="text-sm text-gray-400 italic">(empty)</span>
	}

	return (
		<p className={`text-sm break-words whitespace-pre-wrap rounded-md border px-2 py-1.5 ${border} ${bg} ${text}`}>
			{display}
		</p>
	)
}
