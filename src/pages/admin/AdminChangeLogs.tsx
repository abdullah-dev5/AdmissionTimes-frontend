import { useState } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import { useChangeLogFilters } from "../../hooks/useChangeLogFilters"
import { useChangeLogActions } from "../../hooks/useChangeLogActions"
import { type AdminChangeLog } from "../../data/adminData"
import { DEFAULT_ITEMS_PER_PAGE } from "../../constants/pagination"
import ChangeLogFilters from "../../components/admin/ChangeLogFilters"
import ChangeLogTable from "../../components/admin/ChangeLogTable"
import DiffViewerModal from "../../components/admin/DiffViewerModal"
import Pagination from "../../components/admin/Pagination"
import { LoadingSpinner } from "../../components/common/LoadingSpinner"

const getFriendlyErrorMessage = (raw?: string | null) => {
	const message = (raw || "").toLowerCase()
	if (!message) return "Something went wrong while loading change logs."
	if (message.includes("401") || message.includes("unauthorized")) return "Your session has expired. Please sign in again."
	if (message.includes("403") || message.includes("forbidden")) return "You do not have access to these change logs."
	if (message.includes("timeout") || message.includes("network") || message.includes("fetch")) {
		return "Connection issue detected. Please check your internet and retry."
	}
	return "We could not load change logs right now. Please try again shortly."
}

/**
 * Admin Change Logs page - View and analyze all changes made to admission records
 * Enhanced with statistics, better layout, and action handlers
 */
function AdminChangeLogs() {
	// Paged and filtered on the server; the cards count every entry (summary endpoint).
	const { filters, logs, page: currentPage, setPage: setCurrentPage, total, totalPages, summary, updateFilter, resetFilters, loading, error, admissionOptions, userOptions } =
		useChangeLogFilters()
	const { downloadChangeLog } = useChangeLogActions()
	const [selectedLog, setSelectedLog] = useState<AdminChangeLog | null>(null)

	const friendlyError = getFriendlyErrorMessage(error)
	const showInitialLoading = loading && logs.length === 0 && !summary
	const pct = (n: number) => Math.round((n / Math.max(summary?.total ?? 0, 1)) * 100)

	if (showInitialLoading) {
		return (
			<AdminLayout>
				<LoadingSpinner fullScreen message="Loading change logs..." />
			</AdminLayout>
		)
	}

	const handleFilterChange = <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
		updateFilter(key, value)
	}

	const handleReset = () => {
		resetFilters()
	}

	const handleViewDiff = (log: AdminChangeLog) => {
		setSelectedLog(log)
	}

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
		// Scroll to top when page changes
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	const handleDownloadPage = () => {
		downloadChangeLog(logs, `changelogs-page-${currentPage}-${new Date().toISOString().split("T")[0]}.json`)
	}

	return (
		<AdminLayout>
			<div className="p-6">
				{/* Header Section */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Change Logs</h1>
							<p className="text-gray-600 max-w-2xl">
								Track all modifications made to admission records. View detailed changes, filter by type or date, and export reports.
							</p>
						</div>
						{logs.length > 0 && (
							<button
								onClick={handleDownloadPage}
								className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-150 cursor-pointer flex items-center gap-2"
								title="Download the entries on this page"
							>
								Download page ({logs.length})
							</button>
						)}
					</div>
				</div>

				{/* Statistics Cards (all entries, from the server) */}
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
					<div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
						<p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Total Changes</p>
						<p className="text-2xl font-bold text-blue-900">{summary?.total ?? "—"}</p>
						<p className="text-xs text-blue-700 mt-2">All recorded changes</p>
					</div>

					<div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-4">
						<p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-2">University Edits</p>
						<p className="text-2xl font-bold text-orange-900">{summary?.by_actor.university ?? "—"}</p>
						<p className="text-xs text-orange-700 mt-2">{summary ? `${pct(summary.by_actor.university)}% of total` : ""}</p>
					</div>

					<div className="bg-purple-50 rounded-lg shadow-sm border border-purple-200 p-4">
						<p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">Admin Actions</p>
						<p className="text-2xl font-bold text-purple-900">{summary?.by_actor.admin ?? "—"}</p>
						<p className="text-xs text-purple-700 mt-2">{summary ? `${summary.reviews} verification decisions` : ""}</p>
					</div>

					<div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
						<p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">Today</p>
						<p className="text-2xl font-bold text-green-900">{summary?.today ?? "—"}</p>
						<p className="text-xs text-green-700 mt-2">Changes (Pakistan time)</p>
					</div>

					<div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
						<p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">Last 7 Days</p>
						<p className="text-2xl font-bold text-red-900">{summary?.last_7_days ?? "—"}</p>
						<p className="text-xs text-red-700 mt-2">{summary ? `${summary.by_actor.system} automated imports overall` : ""}</p>
					</div>
				</div>

				{/* Error Banner */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-3">

						<div>
							<p className="font-semibold text-red-900">Error Loading Logs</p>
							<p className="text-sm text-red-800 mt-1">{friendlyError}</p>
						</div>
					</div>
				)}

				{/* Loading Indicator */}
				{loading && <LoadingSpinner size="sm" message="Refreshing change logs..." />}

				{/* Filters Section */}
				<div className="mb-6">
					<ChangeLogFilters
						filters={filters}
						admissionOptions={admissionOptions}
						userOptions={userOptions}
						onFilterChange={handleFilterChange}
						onReset={handleReset}
					/>
				</div>

				{/* Contents Info */}
				{logs.length > 0 && (
					<div className="mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
						<span className="font-semibold">Showing {logs.length}</span>
						{" of "}
						<span className="font-semibold">{total}</span>
						{summary && total !== summary.total ? " matching" : ""} changes
						{totalPages > 1 ? ` (Page ${currentPage} of ${totalPages})` : ""}
					</div>
				)}

				{/* Change Logs Table */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
					<ChangeLogTable logs={logs} onViewDiff={handleViewDiff} />

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="border-t border-gray-200 p-4">
							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								totalItems={total}
								itemsPerPage={DEFAULT_ITEMS_PER_PAGE}
								onPageChange={handlePageChange}
							/>
						</div>
					)}
				</div>

				{/* Diff Viewer Modal */}
				{selectedLog && (
					<DiffViewerModal
						log={selectedLog}
						onClose={() => setSelectedLog(null)}
					/>
				)}
			</div>
		</AdminLayout>
	)
}

export default AdminChangeLogs
