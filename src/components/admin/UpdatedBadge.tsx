/**
 * Updated Badge Component
 * Shows simple "Updated" tag when admission status is "Updated"
 */

import { getRelativeTime } from "../../utils/dateUtils"

interface UpdatedBadgeProps {
	lastChangeTime?: string | null
	size?: "sm" | "md" | "lg"
	showTime?: boolean
}

/**
 * Component that displays a simple "Updated" tag
 * No icon, just a clean tag showing the admission has been updated
 */
export default function UpdatedBadge({
	lastChangeTime,
	size = "md",
	showTime = true,
}: UpdatedBadgeProps) {
	const sizeClasses = {
		sm: "px-2 py-1 text-xs",
		md: "px-3 py-1.5 text-sm",
		lg: "px-4 py-2 text-base",
	}

	const relativeTime = lastChangeTime ? getRelativeTime(lastChangeTime) : null

	return (
		<div
			className={`${sizeClasses[size]} rounded-full font-semibold inline-flex items-center gap-2 whitespace-nowrap bg-orange-100 text-orange-700 border border-orange-300`}
			title={lastChangeTime ? `Updated ${relativeTime}` : undefined}
		>
			<span>Updated</span>
			{showTime && relativeTime && <span className="text-xs opacity-75">{relativeTime}</span>}
		</div>
	)
}

/**
 * Summary component showing changed fields
 */
export function ChangeSummary({
	changedFields,
	maxDisplay = 3,
}: {
	changedFields: string[]
	maxDisplay?: number
}) {
	if (changedFields.length === 0) return null

	const displayed = changedFields.slice(0, maxDisplay)
	const remaining = changedFields.length - maxDisplay

	return (
		<div className="text-xs text-gray-600 mt-2">
			<span className="font-semibold">Changed fields: </span>
			<span className="font-mono">
				{displayed.join(", ")}
				{remaining > 0 && ` + ${remaining} more`}
			</span>
		</div>
	)
}

/**
 * Notification toast for admission updates
 */
export function UpdateNotificationToast({
	admission_title,
	message,
	change_type,
	onDismiss,
	onNavigate,
}: {
	admission_title: string
	message: string
	change_type: "Manual Edit" | "Admin Edit" | "Scraper Update"
	onDismiss: () => void
	onNavigate: () => void
}) {
	const typeStyles = {
		"Manual Edit": { bg: "#FFF4E6", border: "#CC6600" },
		"Admin Edit": { bg: "#F0E6FF", border: "#7700CC" },
		"Scraper Update": { bg: "#D1E7FF", border: "#0055CC" },
	} as const

	const normalizedChangeType = (() => {
		if (change_type in typeStyles) {
			return change_type
		}

		const value = String(change_type).toLowerCase()
		if (["verify", "verified", "reject", "rejected", "admin_edit", "admin edit"].includes(value)) {
			return "Admin Edit" as const
		}
		if (["scraper", "scraper_update", "scraper update", "system"].includes(value)) {
			return "Scraper Update" as const
		}
		if (["manual", "manual_edit", "manual edit"].includes(value)) {
			return "Manual Edit" as const
		}

		return "Manual Edit" as const
	})()

	const style = typeStyles[normalizedChangeType]

	return (
		<div
			className="rounded-lg shadow-lg p-4 flex items-start justify-between gap-4 border-l-4 animate-in slide-in-from-top"
			style={{
				backgroundColor: style.bg,
				borderLeftColor: style.border,
			}}
		>
			<div className="flex-1">
				<p className="font-semibold text-gray-900">{admission_title}</p>
				<p className="text-sm text-gray-700 mt-1">{message}</p>
			</div>

			<div className="flex items-center gap-2">
				<button
					onClick={onNavigate}
					className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
				>
					View
				</button>
				<button
					onClick={onDismiss}
					className="p-1.5 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-gray-600"
					title="Dismiss"
				>
					✕
				</button>
			</div>
		</div>
	)
}
