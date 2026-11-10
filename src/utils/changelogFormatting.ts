/**
 * Formatting utilities for changelog values and field display
 * Handles JSON parsing, object/array formatting, and human-readable output
 */

/**
 * Detects if a string is a UUID
 * @param value - String to test
 * @returns True if value is a UUID
 */
export const isUuid = (value: string): boolean => {
	return /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(value)
}

/**
 * Checks if a string looks like JSON
 * @param value - String to test
 * @returns True if value looks like JSON
 */
export const isJsonString = (value: string): boolean => {
	if (typeof value !== "string") return false
	const trimmed = value.trim()
	return (trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))
}

/**
 * Safely parses JSON string, returns original value if parse fails
 * @param value - String to parse
 * @returns Parsed object or original string
 */
export const safeJsonParse = (value: unknown): unknown => {
	if (typeof value !== "string") return value

	const trimmed = value.trim()
	if (!isJsonString(trimmed)) return value

	try {
		return JSON.parse(trimmed)
	} catch {
		return value
	}
}

/** Repeatedly unwrap JSON-encoded strings (including double-encoded payloads). */
export const parseDiffValue = (value: unknown): unknown => {
	let current = value

	for (let depth = 0; depth < 4; depth++) {
		if (current === null || current === undefined) return current
		if (current === "" || current === "—") return undefined

		if (typeof current !== "string") break

		const trimmed = current.trim()
		if (!trimmed || trimmed === "—") return undefined

		if (isJsonString(trimmed)) {
			try {
				current = JSON.parse(trimmed)
				continue
			} catch {
				return trimmed
			}
		}

		if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
			try {
				current = JSON.parse(trimmed)
				continue
			} catch {
				return trimmed.slice(1, -1)
			}
		}

		return trimmed
	}

	return current
}

const ADMISSION_RECORD_MARKERS = ["title", "description", "deadline", "location", "eligibility", "application_fee", "fee_amount"]

export const isAdmissionRecord = (value: unknown): boolean => {
	const parsed = parseDiffValue(value)
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false
	const keys = Object.keys(parsed as Record<string, unknown>)
	return ADMISSION_RECORD_MARKERS.filter((key) => keys.includes(key)).length >= 2
}

const DIFF_SKIP_KEYS = new Set(["created_at", "updated_at", "created_by", "university_id"])

const DIFF_FIELD_ORDER = [
	"title",
	"verification_status",
	"status_label",
	"status",
	"description",
	"eligibility",
	"eligibility_text",
	"deadline",
	"deadline_iso",
	"location",
	"application_fee",
	"fee_amount",
	"tuition_fee",
	"currency",
	"degree_type",
	"degree_level",
	"program_type",
	"field_of_study",
	"duration",
	"delivery_mode",
	"website_url",
	"admission_portal_link",
	"rejection_reason",
	"verification_comments",
	"admin_notes",
	"remarks",
]

const sortDiffFields = (a: string, b: string) => {
	const ai = DIFF_FIELD_ORDER.indexOf(a)
	const bi = DIFF_FIELD_ORDER.indexOf(b)
	if (ai === -1 && bi === -1) return a.localeCompare(b)
	if (ai === -1) return 1
	if (bi === -1) return -1
	return ai - bi
}

const valuesEqual = (left: unknown, right: unknown): boolean => {
	return JSON.stringify(parseDiffValue(left)) === JSON.stringify(parseDiffValue(right))
}

const toDiffString = (value: unknown): string => {
	const parsed = parseDiffValue(value)
	if (parsed === undefined || parsed === null || parsed === "") return "—"
	if (typeof parsed === "string") return parsed
	if (typeof parsed === "number" || typeof parsed === "boolean") return String(parsed)
	try {
		return JSON.stringify(parsed)
	} catch {
		return String(parsed)
	}
}

export type DiffDisplayEntry = { field: string; old: string; new: string }

/**
 * Expands changelog rows that store a full admission snapshot into per-field diffs.
 */
export const expandDiffForDisplay = (diff: DiffDisplayEntry[]): DiffDisplayEntry[] => {
	const expanded: DiffDisplayEntry[] = []

	for (const entry of diff) {
		const oldParsed = parseDiffValue(entry.old)
		const newParsed = parseDiffValue(entry.new)
		const shouldExpand =
			isAdmissionRecord(oldParsed) ||
			isAdmissionRecord(newParsed) ||
			isAdmissionRecord(entry.old) ||
			isAdmissionRecord(entry.new) ||
			/^(status|admission_update|updated|created)$/i.test(entry.field)

		if (!shouldExpand) {
			expanded.push(entry)
			continue
		}

		const oldObj =
			typeof oldParsed === "object" && oldParsed !== null && !Array.isArray(oldParsed)
				? (oldParsed as Record<string, unknown>)
				: {}
		const newObj =
			typeof newParsed === "object" && newParsed !== null && !Array.isArray(newParsed)
				? (newParsed as Record<string, unknown>)
				: {}

		if (Object.keys(oldObj).length === 0 && Object.keys(newObj).length === 0) {
			expanded.push(entry)
			continue
		}

		const keys = [...new Set([...Object.keys(oldObj), ...Object.keys(newObj)])].filter((key) => !DIFF_SKIP_KEYS.has(key)).sort(sortDiffFields)
		const entryExpansion: DiffDisplayEntry[] = []

		for (const key of keys) {
			const oldVal = oldObj[key]
			const newVal = newObj[key]
			if (valuesEqual(oldVal, newVal)) continue
			entryExpansion.push({
				field: key,
				old: toDiffString(oldVal),
				new: toDiffString(newVal),
			})
		}

		if (entryExpansion.length > 0) {
			expanded.push(...entryExpansion)
		} else {
			expanded.push(entry)
		}
	}

	return expanded.length > 0 ? expanded : diff
}

export const isDateLikeFieldName = (fieldName?: string): boolean => {
	if (!fieldName) return false
	return /(date|deadline|time|updated|created|verified|submitted|timestamp)/i.test(fieldName)
}

export const formatCellValue = (value: unknown, fieldName?: string): string => {
	const normalized = parseDiffValue(value)

	if (normalized === null || normalized === undefined || normalized === "") {
		return "—"
	}

	if (Array.isArray(normalized)) {
		return normalized.map((item) => formatCellValue(item, fieldName)).join(", ")
	}

	if (typeof normalized === "object") {
		return Object.entries(normalized as Record<string, unknown>)
			.map(([key, val]) => `${formatFieldLabel(key)}: ${formatCellValue(val, key)}`)
			.join(" · ")
	}

	if (typeof normalized === "boolean") {
		return normalized ? "Yes" : "No"
	}

	const text = String(normalized).trim()
	if (!text) return "—"

	if (isDateLikeFieldName(fieldName) && !Number.isNaN(Date.parse(text))) {
		const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
		if (dateOnly) {
			const year = Number(dateOnly[1])
			const month = Number(dateOnly[2])
			const day = Number(dateOnly[3])
			return new Date(year, month - 1, day).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			})
		}
		const parsed = new Date(text)
		if (!Number.isNaN(parsed.getTime())) {
			return parsed.toLocaleString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
			})
		}
	}

	if (/fee|tuition|amount/i.test(fieldName || "") && !Number.isNaN(Number(text))) {
		return Number(text).toLocaleString()
	}

	return text.length > 400 ? truncateText(text, 400) : text
}

/**
 * Converts a field name to human-readable format
 * @param fieldName - Field name (e.g., "field_name", "fieldName")
 * @returns Human-readable format (e.g., "Field Name")
 */
export const formatFieldLabel = (fieldName: string): string => {
	return fieldName
		.replace(/_/g, " ")
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Formats a single value for display (inline, no complex structures)
 * @param value - Value to format
 * @returns Formatted string
 */
export const formatInlineValue = (value: unknown): string => {
	const normalized = safeJsonParse(value)

	if (normalized === null || normalized === undefined || normalized === "") {
		return "—"
	}

	// Array: join elements
	if (Array.isArray(normalized)) {
		return normalized.map((item) => formatInlineValue(item)).join(", ")
	}

	// Object: flatten to key: value pairs
	if (typeof normalized === "object") {
		return Object.entries(normalized as Record<string, unknown>)
			.map(([key, val]) => `${formatFieldLabel(key)}: ${formatInlineValue(val)}`)
			.join(", ")
	}

	// String/Number/Boolean
	if (typeof normalized === "boolean") {
		return normalized ? "Yes" : "No"
	}

	return String(normalized)
}

/**
 * Renders a value for display in UI (handles complex structures)
 * @param value - Value to render
 * @returns Rendered representation (for use in React components)
 */
export const formatValueForDisplay = (value: unknown): { type: "empty" | "text" | "array" | "object"; display: string | string[] | Record<string, string> } => {
	const normalized = safeJsonParse(value)

	if (normalized === null || normalized === undefined || normalized === "") {
		return { type: "empty", display: "" }
	}

	// Array
	if (Array.isArray(normalized)) {
		return {
			type: "array",
			display: normalized.map((item) => formatInlineValue(item)),
		}
	}

	// Object
	if (typeof normalized === "object") {
		const entries: Record<string, string> = {}
		for (const [key, val] of Object.entries(normalized as Record<string, unknown>)) {
			entries[formatFieldLabel(key)] = formatInlineValue(val)
		}
		return { type: "object", display: entries }
	}

	// Primitive
	if (typeof normalized === "boolean") {
		return { type: "text", display: normalized ? "Yes" : "No" }
	}

	return { type: "text", display: String(normalized) }
}

/**
 * Truncates text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
	if (text.length <= maxLength) return text
	return text.substring(0, maxLength) + "..."
}

/**
 * Highlights the difference between old and new values
 * Returns a visual representation of what changed
 * @param oldValue - Previous value
 * @param newValue - New value
 * @returns Object with highlighting info
 */
export const highlightDifference = (oldValue: unknown, newValue: unknown): { hasChange: boolean; type: "added" | "removed" | "modified" | "none" } => {
	const oldStr = formatInlineValue(oldValue)
	const newStr = formatInlineValue(newValue)

	if (oldStr === "—" && newStr !== "—") {
		return { hasChange: true, type: "added" }
	}
	if (oldStr !== "—" && newStr === "—") {
		return { hasChange: true, type: "removed" }
	}
	if (oldStr !== newStr) {
		return { hasChange: true, type: "modified" }
	}

	return { hasChange: false, type: "none" }
}

/**
 * Sanitizes actor/user information for display
 * @param value - Actor value (UUID, email, name, etc.)
 * @returns Clean display name
 */
export const sanitizeActorName = (value?: string): string => {
	if (!value) return "—"
	if (value.trim().toLowerCase() === "system") return "Admin"

	// Remove UUID
	let cleaned = value.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "")

	// Clean up extra spaces
	cleaned = cleaned.replace(/\s{2,}/g, " ").trim()

	// If still empty or looks like UUID, return generic label
	if (!cleaned || isUuid(cleaned)) return "Admin"

	// If looks like a date, return generic label
	if (!Number.isNaN(Date.parse(cleaned))) return "Admin"
	if (cleaned.toLowerCase() === "system") return "Admin"

	return cleaned
}

/**
 * Converts a value to appropriate display format with metadata
 * Useful for changelog diff display
 */
export const formatChangeValue = (
	value: unknown,
	context?: {
		fieldName?: string
		maxLength?: number
	}
): {
	display: string
	type: "empty" | "text" | "url" | "date" | "number" | "boolean"
	icon?: string
	description?: string
} => {
	const formatted = formatInlineValue(value)

	if (formatted === "—") {
		return { display: "No value", type: "empty" }
	}

	// Detect URLs
	if (typeof value === "string" && value.startsWith("http")) {
		return { display: truncateText(value, 50), type: "url", icon: "🔗" }
	}

	// Detect dates
	if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
		const date = new Date(value)
		return { display: date.toLocaleDateString("en-US"), type: "date", icon: "📅" }
	}

	// Detect numbers
	if (typeof value === "number") {
		return { display: value.toLocaleString(), type: "number", icon: "🔢" }
	}

	// Detect booleans
	if (typeof value === "boolean") {
		return { display: value ? "Enabled" : "Disabled", type: "boolean", icon: value ? "✓" : "✗" }
	}

	// Default text
	return { display: truncateText(formatted, context?.maxLength ?? 100), type: "text" }
}
