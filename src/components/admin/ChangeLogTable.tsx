import { getChangeTypeColor, type AdminChangeLog } from "../../data/adminData"
import { formatDateTime, getRelativeTime } from "../../utils/dateUtils"
import { formatInlineValue, sanitizeActorName } from "../../utils/changelogFormatting"

interface ChangeLogTableProps {
	logs: AdminChangeLog[]
	onViewDiff: (log: AdminChangeLog) => void
}

/**
 * Gets styling for the change type badge
 * @param changeType - Type of change
 * @returns Configuration object for badge styling
 */
/**
 * Truncates summary text for table display
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis
 */
const truncateSummary = (text: string, maxLength: number = 60): string => {
	if (text.length <= maxLength) return text
	return text.substring(0, maxLength) + "..."
}

/**
 * Table component for displaying change logs with enhanced formatting
 * Shows relative time, better value formatting, and visual hierarchy
 */
export default function ChangeLogTable({ logs, onViewDiff }: ChangeLogTableProps) {
	return (
		<div className="overflow-x-auto rounded-lg border border-gray-200">
			<table className="w-full divide-y divide-gray-200">
				<thead className="bg-gray-50">
					<tr>
						<th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
							Program
						</th>
						<th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
							Modified By
						</th>
						<th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
							Change Type
						</th>
						<th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
							Summary
						</th>
						<th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
							Time
						</th>
						<th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-100">
					{logs.map((log) => {
						const typeColors = getChangeTypeColor(log.changeType)
						const relativeTime = getRelativeTime(log.timestamp)
						const absoluteTime = formatDateTime(log.timestamp)

						return (
							<tr key={log.id} className="hover:bg-gray-50 transition-colors duration-150">
								{/* Admission Title */}
								<td className="py-4 px-4">
									<p className="font-semibold text-gray-900 line-clamp-1" title={log.admissionTitle}>
										{log.admissionTitle || "—"}
									</p>
									<p className="text-xs text-gray-500 mt-1">ID: {log.admissionId}</p>
								</td>

								{/* Modified By */}
								<td className="py-4 px-4">
									<p className="text-sm text-gray-700 font-medium" title={log.modifiedBy || undefined}>
										{sanitizeActorName(log.modifiedBy)}
									</p>
								</td>

								{/* Change Type Badge */}
								<td className="py-4 px-4">
									<span
										className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150"
										style={{
											backgroundColor: typeColors.bg,
											color: typeColors.text,
											border: `1px solid ${typeColors.text}33`,
										}}
										title={log.changeType}
									>
										<span className="hidden sm:inline">{log.changeType}</span>
									</span>
								</td>

								{/* Summary with truncation */}
								<td className="py-4 px-4">
									<p
										className="text-sm text-gray-600 line-clamp-2 hover:line-clamp-none cursor-help"
										title={formatInlineValue(log.summary)}
									>
										{truncateSummary(formatInlineValue(log.summary), 60)}
									</p>
									{log.reasonForChange && (
										<p className="text-xs text-gray-500 mt-1 italic">
											Reason: {truncateSummary(log.reasonForChange, 40)}
										</p>
									)}
								</td>

								{/* Timestamp with relative time */}
								<td className="py-4 px-4">
									<p className="text-sm font-medium text-gray-900">{relativeTime}</p>
									<p className="text-xs text-gray-500 mt-1" title={absoluteTime}>
										{absoluteTime}
									</p>
								</td>

								{/* Action Button */}
								<td className="py-4 px-4 text-center">
									<button
										onClick={() => onViewDiff(log)}
										className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
										title="View detailed changes"
									>
										View Diff
									</button>
								</td>
							</tr>
						)
					})}

					{/* Empty State */}
					{logs.length === 0 && (
						<tr>
							<td colSpan={6} className="py-12 text-center">
								<p className="text-lg font-semibold text-gray-700 mb-2">No change logs found</p>
								<p className="text-sm text-gray-500 max-w-md mx-auto">
									Try adjusting your filters, changing the date range, or check back later for new changes.
								</p>
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	)
}

