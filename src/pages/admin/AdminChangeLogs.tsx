import { useState, useMemo } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import { useChangeLogFilters } from "../../hooks/useChangeLogFilters"
import { type AdminChangeLog } from "../../data/adminData"
import { DEFAULT_ITEMS_PER_PAGE } from "../../constants/pagination"
import ChangeLogFilters from "../../components/admin/ChangeLogFilters"
import ChangeLogTable from "../../components/admin/ChangeLogTable"
import DiffViewerModal from "../../components/admin/DiffViewerModal"
import Pagination from "../../components/admin/Pagination"

/**
 * Admin Change Logs page - View and analyze all changes made to admission records
 */
function AdminChangeLogs() {
	const { filters, filteredLogs, updateFilter, resetFilters } = useChangeLogFilters()
	const [selectedLog, setSelectedLog] = useState<AdminChangeLog | null>(null)
	const [currentPage, setCurrentPage] = useState(1)

	// Pagination
	const totalPages = Math.ceil(filteredLogs.length / DEFAULT_ITEMS_PER_PAGE)
	const paginatedLogs = useMemo(() => {
		const startIndex = (currentPage - 1) * DEFAULT_ITEMS_PER_PAGE
		return filteredLogs.slice(startIndex, startIndex + DEFAULT_ITEMS_PER_PAGE)
	}, [filteredLogs, currentPage])

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

	return (
		<AdminLayout>
			<div className="p-6">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-2xl font-bold mb-2" style={{ color: "#111827" }}>
						Change Logs
					</h1>
					<p className="text-gray-600">Track all modifications made to admission records.</p>
				</div>

				{/* Filters Section */}
				<div className="mb-6">
					<ChangeLogFilters filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />
				</div>

				{/* Change Logs Table */}
				<div className="bg-white rounded-lg shadow-sm p-6">
					<ChangeLogTable logs={paginatedLogs} onViewDiff={handleViewDiff} />

					{/* Pagination */}
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={filteredLogs.length}
						itemsPerPage={DEFAULT_ITEMS_PER_PAGE}
						onPageChange={handlePageChange}
					/>
				</div>

				{/* Diff Viewer Modal */}
				{selectedLog && <DiffViewerModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
			</div>
		</AdminLayout>
	)
}

export default AdminChangeLogs
