import { useState, useMemo } from "react"
import { adminChangeLogs, type ChangeType } from "../data/adminData"

export interface ChangeLogFilters {
	admissionId: string
	userId: string
	changeType: ChangeType | "All"
	dateFrom: string
	dateTo: string
}

const DEFAULT_FILTERS: ChangeLogFilters = {
	admissionId: "All",
	userId: "All",
	changeType: "All",
	dateFrom: "",
	dateTo: "",
}

/**
 * Custom hook for filtering change logs
 */
export const useChangeLogFilters = () => {
	const [filters, setFilters] = useState<ChangeLogFilters>(DEFAULT_FILTERS)

	const filteredLogs = useMemo(() => {
		let filtered = [...adminChangeLogs]

		// Admission filter
		if (filters.admissionId !== "All") {
			filtered = filtered.filter((log) => log.admissionId === filters.admissionId)
		}

		// User filter
		if (filters.userId !== "All") {
			filtered = filtered.filter((log) => log.modifiedBy === filters.userId)
		}

		// Change type filter
		if (filters.changeType !== "All") {
			filtered = filtered.filter((log) => log.changeType === filters.changeType)
		}

		// Date range filter
		if (filters.dateFrom) {
			const fromDate = new Date(filters.dateFrom)
			filtered = filtered.filter((log) => new Date(log.timestamp) >= fromDate)
		}
		if (filters.dateTo) {
			const toDate = new Date(filters.dateTo)
			toDate.setHours(23, 59, 59, 999) // End of day
			filtered = filtered.filter((log) => new Date(log.timestamp) <= toDate)
		}

		// Sort by timestamp (newest first)
		filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

		return filtered
	}, [filters])

	const updateFilter = <K extends keyof ChangeLogFilters>(key: K, value: ChangeLogFilters[K]) => {
		setFilters((prev) => ({ ...prev, [key]: value }))
	}

	const resetFilters = () => {
		setFilters(DEFAULT_FILTERS)
	}

	return {
		filters,
		filteredLogs,
		updateFilter,
		resetFilters,
	}
}

