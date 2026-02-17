import { useState, useMemo, useEffect } from "react"
import { adminService } from "../services/adminService"
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
			console.log('🔵 [useChangeLogFilters] Fetched change logs:', response.data)

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
			// Will fallback to mock data
		} finally {
			setLoading(false)
		}
	}

	/**
	 * Transform API change log format to AdminChangeLog format
	 */
	const transformApiLogs = (data: any[]): any[] => {
		return data.map((log: any) => {
			// Determine change type based on actor_type (WHO made the change)
			const changeType = deriveChangeType(log.actor_type, log.action_type)
			
			// Determine who made the change
			const modifiedBy = deriveModifiedBy(log.actor_type, log.changed_by)
			
			const summary = log.diff_summary || log.field_name || 'Unknown change'
			
			return {
				id: log.id,
				admissionId: log.admission_id,
				admissionTitle: log.program_title || 'Unknown',
				modifiedBy: modifiedBy,
				modifiedByUserId: log.changed_by || 'system',
				changeType: changeType,
				timestamp: log.created_at || new Date().toISOString(),
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

	/**
	 * Derive change type based on WHO made the change (actor_type)
	 * Priority: actor_type determines the source of change
	 */
	const deriveChangeType = (actorType: string, actionType: string): ChangeType => {
		const actor = actorType?.toLowerCase() || ''
		
		// WHO made the change determines the type
		if (actor === 'university') return 'Manual Edit'  // University rep created/updated
		if (actor === 'admin') return 'Admin Edit'         // Admin verified/rejected/disputed
		if (actor === 'system') return 'Scraper Update'    // Automated scraper/system
		
		// Fallback: infer from action if actor is unknown
		const action = actionType?.toLowerCase() || ''
		if (action === 'verified' || action === 'rejected' || action === 'disputed') {
			return 'Admin Edit'
		}
		
		return 'Manual Edit'
	}

	/**
	 * Derive who modified based on actor_type and changed_by
	 */
	const deriveModifiedBy = (actorType: string, changedBy: string | null): string => {
		// If we have a specific user who made the change, use it
		if (changedBy && changedBy.trim() && !isUuid(changedBy)) {
			return changedBy
		}
		
		// Otherwise, use descriptive label based on actor type
		const actor = actorType?.toLowerCase() || ''
		if (actor === 'university') return 'University Representative'
		if (actor === 'admin') return 'Administrator'
		if (actor === 'system') return 'Automated System'
		
		return 'System'
	}

	/**
	 * Check if string is a UUID
	 */
	const isUuid = (value: string): boolean => {
		return /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(value)
	}

	const filteredLogs = useMemo(() => {
		// Use API data if available, otherwise use mock data
		let filtered = apiLogs.length > 0 ? apiLogs : adminChangeLogs

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
	const allLogs = apiLogs.length > 0 ? apiLogs : adminChangeLogs

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


