import { useState, useMemo } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import { useChangeLogFilters } from "../../hooks/useChangeLogFilters"
import { useChangeLogActions } from "../../hooks/useChangeLogActions"
import { type AdminChangeLog } from "../../data/adminData"
import { DEFAULT_ITEMS_PER_PAGE } from "../../constants/pagination"
import ChangeLogFilters from "../../components/admin/ChangeLogFilters"
import ChangeLogTable from "../../components/admin/ChangeLogTable"
import DiffViewerModal from "../../components/admin/DiffViewerModal"
import Pagination from "../../components/admin/Pagination"

interface ChangeLogStats {
	total: number
	manualEdits: number
	adminEdits: number
	scraperUpdates: number
	today: number
	thisWeek: number
}

/**
 * Calculate statistics from changelog entries
 */
const calculateStats = (logs: AdminChangeLog[]): ChangeLogStats => {
	const now = new Date()
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000)

	return {
		total: logs.length,
		manualEdits: logs.filter((l) => l.changeType === "Manual Edit").length,
		adminEdits: logs.filter((l) => l.changeType === "Admin Edit").length,
		scraperUpdates: logs.filter((l) => l.changeType === "Scraper Update").length,
		today: logs.filter((l) => new Date(l.timestamp) >= todayStart).length,
		thisWeek: logs.filter((l) => new Date(l.timestamp) >= weekStart).length,
	}
}

/**
 * Admin Change Logs page - View and analyze all changes made to admission records
 * Enhanced with statistics, better layout, and action handlers
 */
function AdminChangeLogs() {
	const { filters, filteredLogs, updateFilter, resetFilters, loading, error, allLogs } = useChangeLogFilters()
	const { downloadChangeLog } = useChangeLogActions()
	const [selectedLog, setSelectedLog] = useState<AdminChangeLog | null>(null)
	const [currentPage, setCurrentPage] = useState(1)

	// Pagination
	const totalPages = Math.ceil(filteredLogs.length / DEFAULT_ITEMS_PER_PAGE)
	const paginatedLogs = useMemo(() => {
		const startIndex = (currentPage - 1) * DEFAULT_ITEMS_PER_PAGE
		return filteredLogs.slice(startIndex, startIndex + DEFAULT_ITEMS_PER_PAGE)
	}, [filteredLogs, currentPage])

	// Calculate statistics
	const allStats = calculateStats(allLogs)

	const handleFilterChange = <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
		updateFilter(key, value)
		setCurrentPage(1) // Reset to first page when filters change
	}

	const handleReset = () => {
		resetFilters()
		setCurrentPage(1)
	}

	const handleViewDiff = (log: AdminChangeLog) => {
		setSelectedLog(log)
	}

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
		// Scroll to top when page changes
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	const handleDownloadAll = () => {
		downloadChangeLog(filteredLogs, `changelogs-${new Date().toISOString().split("T")[0]}.json`)
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
						{filteredLogs.length > 0 && (
							<button
								onClick={handleDownloadAll}
								className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-150 cursor-pointer flex items-center gap-2"
								title="Download current filtered logs"
							>

								Download ({filteredLogs.length})
							</button>
						)}
					</div>
				</div>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
					<div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
						<p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Total Changes</p>
						<p className="text-2xl font-bold text-blue-900">{allStats.total}</p>
						<p className="text-xs text-blue-700 mt-2">All time</p>
					</div>

					<div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-4">
						<p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-2">Manual Edits</p>
						<p className="text-2xl font-bold text-orange-900">{allStats.manualEdits}</p>
						<p className="text-xs text-orange-700 mt-2">{Math.round((allStats.manualEdits / Math.max(allStats.total, 1)) * 100)}% of total</p>
					</div>

					<div className="bg-purple-50 rounded-lg shadow-sm border border-purple-200 p-4">
						<p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">Admin Edits</p>
						<p className="text-2xl font-bold text-purple-900">{allStats.adminEdits}</p>
						<p className="text-xs text-purple-700 mt-2">{Math.round((allStats.adminEdits / Math.max(allStats.total, 1)) * 100)}% of total</p>
					</div>

					<div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
						<p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">Today</p>
						<p className="text-2xl font-bold text-green-900">{allStats.today}</p>
						<p className="text-xs text-green-700 mt-2">Changes</p>
					</div>

					<div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
						<p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">This Week</p>
						<p className="text-2xl font-bold text-red-900">{allStats.thisWeek}</p>
						<p className="text-xs text-red-700 mt-2">Changes</p>
					</div>
				</div>

				{/* Error Banner */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-3">

						<div>
							<p className="font-semibold text-red-900">Error Loading Logs</p>
							<p className="text-sm text-red-800 mt-1">{error}</p>
						</div>
					</div>
				)}

				{/* Loading Indicator */}
				{loading && (
					<div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded-lg flex items-center gap-3">

						<p className="text-sm text-blue-800 font-medium">Loading change logs...</p>
					</div>
				)}

				{/* Filters Section */}
				<div className="mb-6">
					<ChangeLogFilters
						filters={filters}
						onFilterChange={handleFilterChange}
						onReset={handleReset}
					/>
				</div>

				{/* Contents Info */}
				{filteredLogs.length > 0 && (
					<div className="mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
						<span className="font-semibold">Showing {paginatedLogs.length}</span>
						{" of "}
						<span className="font-semibold">{filteredLogs.length}</span>
						{filteredLogs.length !== allStats.total ? " filtered" : ""} changes
						{filteredLogs.length > DEFAULT_ITEMS_PER_PAGE ? ` (Page ${currentPage} of ${totalPages})` : ""}
					</div>
				)}

				{/* Change Logs Table */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
					<ChangeLogTable logs={paginatedLogs} onViewDiff={handleViewDiff} />

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="border-t border-gray-200 p-4">
							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								totalItems={filteredLogs.length}
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
