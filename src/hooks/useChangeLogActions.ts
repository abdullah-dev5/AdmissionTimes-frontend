/**
 * Hook for handling changelog-related actions
 * Provides utilities for exporting, copying, sharing, and analyzing changelog entries
 */

import { useCallback } from "react"
import type { AdminChangeLog } from "../data/adminData"

export interface ChangeLogActionsAPI {
	copyChangeLogId: (id: string | number) => void
	copyChangeToClipboard: (log: AdminChangeLog) => void
	exportChangeLog: (log: AdminChangeLog, format?: "json" | "csv") => void
	downloadChangeLog: (logs: AdminChangeLog[], filename?: string) => void
	generateChangelogReport: (logs: AdminChangeLog[]) => string
	getChangelogSummaryText: (log: AdminChangeLog) => string
	shareChangeLog: (log: AdminChangeLog) => void
}

/**
 * Custom hook for changelog action handlers
 * Provides functions for common changelog interactions
 */
export const useChangeLogActions = (): ChangeLogActionsAPI => {
	/**
	 * Copy changelog ID to clipboard
	 */
	const copyChangeLogId = useCallback((id: string | number) => {
		const text = String(id)
		navigator.clipboard.writeText(text).then(
			() => {
				console.log("Changelog ID copied to clipboard:", text)
			},
			() => {
				console.error("Failed to copy changelog ID")
			}
		)
	}, [])

	/**
	 * Copy entire changelog entry to clipboard as formatted text
	 */
	const copyChangeToClipboard = useCallback((log: AdminChangeLog) => {
		const text = generateChangelogReport([log])
		navigator.clipboard.writeText(text).then(
			() => {
				console.log("Changelog entry copied to clipboard")
			},
			() => {
				console.error("Failed to copy changelog entry")
			}
		)
	}, [])

	/**
	 * Export a single changelog entry
	 */
	const exportChangeLog = useCallback((log: AdminChangeLog, format: "json" | "csv" = "json") => {
		if (format === "json") {
			const dataStr = JSON.stringify(log, null, 2)
			const dataBlob = new Blob([dataStr], { type: "application/json" })
			const url = URL.createObjectURL(dataBlob)
			const link = document.createElement("a")
			link.href = url
			link.download = `changelog-${log.id}.json`
			link.click()
			URL.revokeObjectURL(url)
		} else if (format === "csv") {
			// Convert log to CSV format
			const csvContent = convertToCsv([log])
			const dataBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
			const url = URL.createObjectURL(dataBlob)
			const link = document.createElement("a")
			link.href = url
			link.download = `changelog-${log.id}.csv`
			link.click()
			URL.revokeObjectURL(url)
		}
	}, [])

	/**
	 * Download multiple changelog entries as a file
	 */
	const downloadChangeLog = useCallback((logs: AdminChangeLog[], filename?: string) => {
		const dataStr = JSON.stringify(logs, null, 2)
		const dataBlob = new Blob([dataStr], { type: "application/json" })
		const url = URL.createObjectURL(dataBlob)
		const link = document.createElement("a")
		link.href = url
		link.download = filename || `changelogs-${new Date().toISOString().split("T")[0]}.json`
		link.click()
		URL.revokeObjectURL(url)
	}, [])

	/**
	 * Generate a formatted text report for changelogs
	 */
	const generateChangelogReport = useCallback((logs: AdminChangeLog[]): string => {
		const lines: string[] = []
		lines.push(`CHANGELOG REPORT - Generated ${new Date().toLocaleString()}`)
		lines.push(`Total Entries: ${logs.length}`)
		lines.push("")

		logs.forEach((log, index) => {
			lines.push(`[${index + 1}] ${log.admissionTitle}`)
			lines.push(`    ID: ${log.id}`)
			lines.push(`    Modified By: ${log.modifiedBy}`)
			lines.push(`    Type: ${log.changeType}`)
			lines.push(`    Time: ${log.timestamp}`)
			if (log.reasonForChange) {
				lines.push(`    Reason: ${log.reasonForChange}`)
			}
			lines.push(`    Summary: ${log.summary}`)
			lines.push(`    Changes:`)
			log.diff.forEach((change) => {
				lines.push(`      - ${change.field}: "${change.oldValue}" → "${change.newValue}"`)
			})
			lines.push("")
		})

		return lines.join("\n")
	}, [])

	/**
	 * Get a human-readable summary of a changelog entry
	 */
	const getChangelogSummaryText = useCallback((log: AdminChangeLog): string => {
		const changeCount = log.diff.length
		const changedFields = log.diff.map((d) => d.field).join(", ")
		return `${log.admissionTitle} was updated by ${log.modifiedBy} (${log.changeType}). ${changeCount} field(s) changed: ${changedFields}`
	}, [])

	/**
	 * Share changelog via native share API or copy to clipboard
	 */
	const shareChangeLog = useCallback((log: AdminChangeLog) => {
		const summary = getChangelogSummaryText(log)

		if (navigator.share) {
			navigator
				.share({
					title: "Changelog Entry",
					text: summary,
					url: window.location.href,
				})
				.catch((error) => console.log("Share failed:", error))
		} else {
			// Fallback: copy to clipboard
			copyChangeToClipboard(log)
		}
	}, [getChangelogSummaryText, copyChangeToClipboard])

	return {
		copyChangeLogId,
		copyChangeToClipboard,
		exportChangeLog,
		downloadChangeLog,
		generateChangelogReport,
		getChangelogSummaryText,
		shareChangeLog,
	}
}

/**
 * Helper function to convert changelog entries to CSV format
 */
const convertToCsv = (logs: AdminChangeLog[]): string => {
	const headers = ["ID", "Admission Title", "Modified By", "Change Type", "Timestamp", "Summary", "Fields Changed"]
	const rows = logs.map((log) => [
		log.id,
		log.admissionTitle,
		log.modifiedBy,
		log.changeType,
		log.timestamp,
		log.summary,
		log.diff.map((d) => d.field).join(";"),
	])

	const csvContent = [
		headers.map((h) => `"${h}"`).join(","),
		...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
	].join("\n")

	return csvContent
}

/**
 * Hook for analytics-related changelog events
 * Tracks user interactions with changelog entries
 */
export const useChangeLogAnalytics = () => {
	const trackEvent = useCallback(
		(event: "view_changelog" | "export_changelog" | "share_changelog" | "filter_changelog", logId?: string) => {
			console.log(`Analytics Event: ${event}`, { logId, timestamp: new Date().toISOString() })
			// TODO: Implement actual analytics tracking when analytics service is ready
		},
		[]
	)

	return { trackEvent }
}
