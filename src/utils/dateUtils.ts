/**
 * Utility functions for date formatting and manipulation
 */

const DEFAULT_LOCALE = "en-US"

const parseDateSafe = (value?: string | null): Date | null => {
	if (!value) return null
	const parsed = new Date(value)
	if (Number.isNaN(parsed.getTime())) return null
	return parsed
}

export const formatDisplayDate = (
	value?: string | null,
	fallback: string = "-"
): string => {
	const parsed = parseDateSafe(value)
	if (!parsed) return value || fallback

	return parsed.toLocaleDateString(DEFAULT_LOCALE, {
		year: "numeric",
		month: "short",
		day: "numeric",
	})
}

export const formatDisplayDateLong = (
	value?: string | null,
	fallback: string = "-"
): string => {
	const parsed = parseDateSafe(value)
	if (!parsed) return value || fallback

	return parsed.toLocaleDateString(DEFAULT_LOCALE, {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	})
}

export const formatDisplayTime = (
	value?: string | null,
	fallback: string = "--:--"
): string => {
	const parsed = parseDateSafe(value)
	if (!parsed) return fallback

	return parsed.toLocaleTimeString(DEFAULT_LOCALE, {
		hour: "2-digit",
		minute: "2-digit",
	})
}

export const formatDisplayDateTime = (
	value?: string | null,
	fallback: string = "-"
): string => {
	const parsed = parseDateSafe(value)
	if (!parsed) return value || fallback

	return parsed.toLocaleString(DEFAULT_LOCALE, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	})
}

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Feb 8, 2025, 10:30 AM")
 */
export const formatDateTime = (dateString: string): string => {
	const date = new Date(dateString)
	return date.toLocaleString(DEFAULT_LOCALE, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	})
}

/**
 * Formats a date to YYYY-MM-DD format for date inputs
 * @param dateString - ISO date string
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (dateString: string): string => {
	const date = new Date(dateString)
	return date.toISOString().split("T")[0]
}

/**
 * Gets the end of day for a given date
 * @param dateString - Date string
 * @returns Date object set to end of day (23:59:59.999)
 */
export const getEndOfDay = (dateString: string): Date => {
	const date = new Date(dateString)
	date.setHours(23, 59, 59, 999)
	return date
}

/**
 * Calculates relative time from now (e.g., "2 hours ago", "1 day ago")
 * @param dateString - ISO date string
 * @returns Relative time string (e.g., "5 minutes ago", "Yesterday")
 */
export const getRelativeTime = (dateString: string): string => {
	const date = new Date(dateString)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffSecs = Math.floor(diffMs / 1000)
	const diffMins = Math.floor(diffSecs / 60)
	const diffHours = Math.floor(diffMins / 60)
	const diffDays = Math.floor(diffHours / 24)
	const diffWeeks = Math.floor(diffDays / 7)
	const diffMonths = Math.floor(diffDays / 30)

	if (diffSecs < 60) return "just now"
	if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
	if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
	if (diffDays === 1) return "yesterday"
	if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
	if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`
	if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`

	return date.toLocaleDateString(DEFAULT_LOCALE, {
		year: "numeric",
		month: "short",
		day: "numeric",
	})
}

/**
 * Formats a date with time and relative indication for display
 * @param dateString - ISO date string
 * @returns Object with formatted date and relative time
 */
export const formatDateTimeWithRelative = (dateString: string): { formatted: string; relative: string } => {
	return {
		formatted: formatDateTime(dateString),
		relative: getRelativeTime(dateString),
	}
}

/**
 * Formats a date for display with time zone info
 * @param dateString - ISO date string
 * @param timezone - Optional timezone (defaults to browser timezone)
 * @returns Formatted date string with timezone
 */
export const formatDateTimeWithTimezone = (dateString: string, timezone?: string): string => {
	const date = new Date(dateString)
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZoneName: "short",
		...(timezone && { timeZone: timezone }),
	}
	return date.toLocaleString(DEFAULT_LOCALE, options)
}

/**
 * Gets today's date in ISO format
 * @returns Today's date in YYYY-MM-DD format
 */
export const getTodayDateString = (): string => {
	const today = new Date()
	return today.toISOString().split("T")[0]
}

/**
 * Gets a date X days ago in ISO format
 * @param daysAgo - Number of days to subtract
 * @returns Date string in YYYY-MM-DD format
 */
export const getDateDaysAgo = (daysAgo: number): string => {
	const date = new Date()
	date.setDate(date.getDate() - daysAgo)
	return date.toISOString().split("T")[0]
}
