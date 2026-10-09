import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { adminService } from "../services/adminService"
import { getApiErrorMessage } from "../services/apiClient"
import type { AdminChangeLog, ChangeType } from "../data/adminData"

export interface ChangeLogFilters {
	admissionId: string
	userId: string
	changeType: ChangeType | "All"
	dateFrom: string
	dateTo: string
}

export interface FilterOption {
	value: string
	label: string
}

const DEFAULT_FILTERS: ChangeLogFilters = {
	admissionId: "All",
	userId: "All",
	changeType: "All",
	dateFrom: "",
	dateTo: "",
}

/** Server-side actor filter for each change type shown in the UI. */
const ACTOR_BY_CHANGE_TYPE: Record<ChangeType, string> = {
	"Admin Edit": "admin",
	"Manual Edit": "university",
	"Scraper Update": "system",
}

const FETCH_LIMIT = 100

interface ApiChangeLog {
	id: string
	admission_id: string
	admission_title?: string | null
	program_title?: string | null
	changed_by?: string | null
	modified_by?: string | null
	change_type?: ChangeType
	actor_type?: string
	action_type?: string
	field_name?: string | null
	old_value?: unknown
	new_value?: unknown
	diff_summary?: string | null
	changed_at_iso?: string | null
	created_at?: string
	metadata?: Record<string, unknown> | null
}

const stringify = (value: unknown): string => {
	if (value === null || value === undefined) return ""
	return typeof value === "string" ? value : JSON.stringify(value)
}

const toAdminChangeLog = (log: ApiChangeLog): AdminChangeLog =>
	({
		id: log.id,
		admissionId: log.admission_id,
		admissionTitle: log.admission_title || log.program_title || "Unknown program",
		modifiedBy: log.modified_by || "System",
		modifiedByUserId: log.changed_by || "",
		changeType: log.change_type || "Manual Edit",
		timestamp: log.changed_at_iso || log.created_at || "",
		summary: log.diff_summary || log.field_name || "Change recorded",
		diff: [
			{
				field: log.field_name || "record",
				oldValue: stringify(log.old_value),
				newValue: stringify(log.new_value),
			},
		],
		reasonForChange: typeof log.metadata?.reason === "string" ? log.metadata.reason : undefined,
		metadata: log.metadata ?? undefined,
		action_type: log.action_type,
		actor_type: log.actor_type,
	}) as AdminChangeLog

/**
 * Change-log listing with server-side filters. Dropdown options are built from
 * real logs returned by the API (accumulated across loads), never mock data.
 */
export const useChangeLogFilters = () => {
	const [filters, setFilters] = useState<ChangeLogFilters>(DEFAULT_FILTERS)
	const [logs, setLogs] = useState<AdminChangeLog[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const knownAdmissions = useRef(new Map<string, string>())
	const knownUsers = useRef(new Map<string, string>())
	const [optionsVersion, setOptionsVersion] = useState(0)

	const fetchChangeLogs = useCallback(async (active: ChangeLogFilters, isCancelled: () => boolean) => {
		setLoading(true)
		setError(null)
		try {
			const params: Record<string, string> = {}
			if (active.admissionId !== "All") params.admission_id = active.admissionId
			if (active.userId !== "All") params.changed_by = active.userId
			if (active.changeType !== "All") params.actor_type = ACTOR_BY_CHANGE_TYPE[active.changeType]
			if (active.dateFrom) params.date_from = `${active.dateFrom}T00:00:00`
			// Inclusive end date: the whole selected day.
			if (active.dateTo) params.date_to = `${active.dateTo}T23:59:59.999`

			const response = await adminService.getChangeLogs(1, FETCH_LIMIT, params)
			if (isCancelled()) return

			const rows: ApiChangeLog[] = Array.isArray(response.data) ? response.data : []
			rows.forEach((row) => {
				if (row.admission_id) knownAdmissions.current.set(row.admission_id, row.admission_title || row.program_title || "Unknown program")
				if (row.changed_by) knownUsers.current.set(row.changed_by, row.modified_by || "Unknown user")
			})
			setOptionsVersion((version) => version + 1)
			setLogs(rows.map(toAdminChangeLog))
		} catch (err) {
			if (isCancelled()) return
			setError(getApiErrorMessage(err, "Failed to fetch change logs"))
			setLogs([])
		} finally {
			if (!isCancelled()) setLoading(false)
		}
	}, [])

	useEffect(() => {
		let cancelled = false
		void fetchChangeLogs(filters, () => cancelled)
		return () => {
			cancelled = true
		}
	}, [filters, fetchChangeLogs])

	const filteredLogs = useMemo(
		() => [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
		[logs]
	)

	const admissionOptions: FilterOption[] = useMemo(
		() =>
			Array.from(knownAdmissions.current, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label)),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[optionsVersion]
	)

	const userOptions: FilterOption[] = useMemo(
		() =>
			Array.from(knownUsers.current, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label)),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[optionsVersion]
	)

	const updateFilter = <K extends keyof ChangeLogFilters>(key: K, value: ChangeLogFilters[K]) => {
		setFilters((prev) => ({ ...prev, [key]: value }))
	}

	const resetFilters = () => setFilters(DEFAULT_FILTERS)

	return {
		filters,
		filteredLogs,
		allLogs: logs,
		admissionOptions,
		userOptions,
		updateFilter,
		resetFilters,
		loading,
		error,
	}
}
