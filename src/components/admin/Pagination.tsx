interface PaginationProps {
	currentPage: number
	totalPages: number
	totalItems: number
	itemsPerPage: number
	onPageChange: (page: number) => void
}

/**
 * Reusable pagination component
 */
export default function Pagination({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	onPageChange,
}: PaginationProps) {
	if (totalPages <= 1) return null

	const startItem = (currentPage - 1) * itemsPerPage + 1
	const endItem = Math.min(currentPage * itemsPerPage, totalItems)

	return (
		<div className="mt-6 flex items-center justify-between">
			<p className="text-sm text-gray-600">
				Showing {startItem} to {endItem} of {totalItems} change logs
			</p>
			<div className="flex items-center gap-2">
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer transition-colors"
					aria-label="Previous page"
				>
					Previous
				</button>
				<span className="text-sm text-gray-600">
					Page {currentPage} of {totalPages}
				</span>
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer transition-colors"
					aria-label="Next page"
				>
					Next
				</button>
			</div>
		</div>
	)
}

