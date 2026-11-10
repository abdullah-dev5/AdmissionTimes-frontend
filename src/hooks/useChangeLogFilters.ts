import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { adminService } from "../services/adminService"
import { getApiErrorMessage } from "../services/apiClient"
import { changelogsService, type ApiChangeLogEntry, type ChangeLogSummary } from "../services/changelogsService"
import type { AdminChangeLog, ChangeType } from "../data/adminData"
import { changeReason, pktDayBound } from "../utils/changelogFormatting"
import { DEFAULT_ITEMS_PER_PAGE } from "../constants/pagination"

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

type ApiChangeLog = ApiChangeLogEntry & { change_type?: ChangeType }

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
		// The backend stores moderation reasons as rejection_reason / admin_notes.
		reasonForChange: changeReason(log.metadata),
		metadata: log.metadata ?? undefined,
		action_type: log.action_type ?? undefined,
		actor_type: log.actor_type ?? undefined,
	}) as AdminChangeLog

/**
 * Change-log listing, paged and filtered on the server (it used to load the
 * newest 100 entries and page through those only). Dropdown options are built
 * from real logs returned by the API (accumulated across loads).
 */
export const useChangeLogFilters = () => {
	const [filters, setFilters] = useState<ChangeLogFilters>(DEFAULT_FILTERS)
	const [page, setPage] = useState(1)
	const [logs, setLogs] = useState<AdminChangeLog[]>([])
	const [total, setTotal] = useState(0)
	const [summary, setSummary] = useState<ChangeLogSummary | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const knownAdmissions = useRef(new Map<string, string>())
	const knownUsers = useRef(new Map<string, string>())
	const [optionsVersion, setOptionsVersion] = useState(0)

	const fetchChangeLogs = useCallback(async (active: ChangeLogFilters, pageNumber: number, isCancelled: () => boolean) => {
		setLoading(true)
		setError(null)
		try {
			const params: Record<string, string> = {}
			if (active.admissionId !== "All") params.admission_id = active.admissionId
			if (active.userId !== "All") params.changed_by = active.userId
			if (active.changeType !== "All") params.actor_type = ACTOR_BY_CHANGE_TYPE[active.changeType]
			if (active.dateFrom) params.date_from = pktDayBound(active.dateFrom, false)
			if (active.dateTo) params.date_to = pktDayBound(active.dateTo, true)

			const response = await adminService.getChangeLogs(pageNumber, DEFAULT_ITEMS_PER_PAGE, params)
			if (isCancelled()) return

			const rows: ApiChangeLog[] = Array.isArray(response.data) ? response.data : []
			rows.forEach((row) => {
				if (row.admission_id) knownAdmissions.current.set(row.admission_id, row.admission_title || row.program_title || "Unknown program")
				if (row.changed_by) knownUsers.current.set(row.changed_by, row.modified_by || "Unknown user")
			})
			setOptionsVersion((version) => version + 1)
			setLogs(rows.map(toAdminChangeLog))
			setTotal(response.pagination?.total ?? rows.length)
		} catch (err) {
			if (isCancelled()) return
			setError(getApiErrorMessage(err, "Failed to fetch change logs"))
			setLogs([])
			setTotal(0)
		} finally {
			if (!isCancelled()) setLoading(false)
		}
	}, [])

	useEffect(() => {
		let cancelled = false
		void fetchChangeLogs(filters, page, () => cancelled)
		return () => {
			cancelled = true
		}
	}, [filters, page, fetchChangeLogs])

	useEffect(() => {
		changelogsService
			.summary()
			.then(setSummary)
			.catch(() => setSummary(null))
	}, [])

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
		setPage(1)
	}

	const resetFilters = () => {
		setFilters(DEFAULT_FILTERS)
		setPage(1)
	}

	return {
		filters,
		logs,
		page,
		setPage,
		total,
		totalPages: Math.max(1, Math.ceil(total / DEFAULT_ITEMS_PER_PAGE)),
		summary,
		admissionOptions,
		userOptions,
		updateFilter,
		resetFilters,
		loading,
		error,
	}
}
