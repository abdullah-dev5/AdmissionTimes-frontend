import { useState, useMemo, useEffect } from "react"
import { adminService } from "../services/adminService"
import { type ChangeType } from "../data/adminData"

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
 * Custom hook for filtering change logs with API integration
 */
export const useChangeLogFilters = () => {
	const [filters, setFilters] = useState<ChangeLogFilters>(DEFAULT_FILTERS)
	const [apiLogs, setApiLogs] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Fetch change logs on mount and when filters change
	useEffect(() => {
		fetchChangeLogs()
	}, [filters])

	/**
	 * Fetch change logs from API with current filters
	 */
	const fetchChangeLogs = async () => {
		try {
			setLoading(true)
			setError(null)

			const filterParams: any = {}
			if (filters.admissionId !== "All") {
				filterParams.admission_id = filters.admissionId
			}
			if (filters.userId !== "All") {
				filterParams.user_id = filters.userId
			}
			if (filters.dateFrom) {
				filterParams.date_from = filters.dateFrom
			}
			if (filters.dateTo) {
				filterParams.date_to = filters.dateTo
			}

			const response = await adminService.getChangeLogs(1, 100, filterParams)

			// Handle both paginated and non-paginated responses
			const logs = Array.isArray(response.data) 
				? response.data 
				: (response.data?.data || response.data?.changelogs || [])

			// Transform API logs to match AdminChangeLog format
			const transformed = transformApiLogs(logs)
			setApiLogs(transformed)
		} catch (err: any) {
			console.error('🔴 [useChangeLogFilters] Error fetching change logs:', err)
			setError(err.message || 'Failed to fetch change logs')
			setApiLogs([])
		} finally {
			setLoading(false)
		}
	}

	/**
	 * Transform API change log format to AdminChangeLog format
	 */
	const transformApiLogs = (data: any[]): any[] => {
		return data.map((log: any) => {
			const changeType = log.change_type || 'Manual Edit'
			const actor = String(log.modified_by || log.changed_by || log.actor_type || '').trim()
			const modifiedBy = actor && actor.toLowerCase() !== 'system' ? actor : 'Admin'
			
			const summary = log.diff_summary || log.field_name || 'Unknown change'
			
			return {
				id: log.id,
				admissionId: log.admission_id,
				admissionTitle: log.admission_title || log.program_title || 'Unknown',
				modifiedBy: modifiedBy,
				modifiedByUserId: log.changed_by || 'admin',
				changeType: changeType,
				timestamp: log.changed_at_iso || log.created_at || new Date().toISOString(),
				summary: summary,
				diff: [
					{
						field: log.field_name || 'Unknown Field',
						oldValue: log.old_value ? JSON.stringify(log.old_value) : '',
						newValue: log.new_value ? JSON.stringify(log.new_value) : '',
					},
				],
				reasonForChange: log.metadata?.reason || undefined,
				metadata: log.metadata,
				action_type: log.action_type,
				actor_type: log.actor_type,
			}
		})
	}

	const filteredLogs = useMemo(() => {
		let filtered = [...apiLogs]

		// Additional client-side filtering if needed
		// Change type filter (API might not support this)
		if (filters.changeType !== "All") {
			filtered = filtered.filter((log) => {
				const logChangeType = log.changeType || log.field_name || 'Other'
				return logChangeType === filters.changeType
			})
		}

		// Sort by timestamp (newest first)
		filtered.sort((a, b) => {
			const aTime = new Date(a.timestamp).getTime()
			const bTime = new Date(b.timestamp).getTime()
			return bTime - aTime
		})

		return filtered
	}, [apiLogs, filters.changeType])

	const updateFilter = <K extends keyof ChangeLogFilters>(key: K, value: ChangeLogFilters[K]) => {
		setFilters((prev) => ({ ...prev, [key]: value }))
	}

	const resetFilters = () => {
		setFilters(DEFAULT_FILTERS)
	}

	// Get all logs (unfiltered for statistics)
	const allLogs = apiLogs

	return {
		filters,
		filteredLogs,
		allLogs,
		updateFilter,
		resetFilters,
		loading,
		error,
	}
}


