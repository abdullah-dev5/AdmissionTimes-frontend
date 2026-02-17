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

	// Remove UUID
	let cleaned = value.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "")

	// Clean up extra spaces
	cleaned = cleaned.replace(/\s{2,}/g, " ").trim()

	// If still empty or looks like UUID, return generic label
	if (!cleaned || isUuid(cleaned)) return "System"

	// If looks like a date, return generic label
	if (!Number.isNaN(Date.parse(cleaned))) return "System"

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
