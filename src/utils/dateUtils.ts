/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Feb 8, 2025, 10:30 AM")
 */
export const formatDateTime = (dateString: string): string => {
	const date = new Date(dateString)
	return date.toLocaleString("en-US", {
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

