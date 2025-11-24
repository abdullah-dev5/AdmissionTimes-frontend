import { getUniqueAdmissions, getUniqueUsers, type ChangeType } from "../../data/adminData"
import type { ChangeLogFilters } from "../../hooks/useChangeLogFilters"

interface ChangeLogFiltersProps {
	filters: ChangeLogFilters
	onFilterChange: <K extends keyof ChangeLogFilters>(key: K, value: ChangeLogFilters[K]) => void
	onReset: () => void
}

/**
 * Filters component for Change Logs page
 */
export default function ChangeLogFilters({ filters, onFilterChange, onReset }: ChangeLogFiltersProps) {
	const admissions = getUniqueAdmissions()
	const users = getUniqueUsers()

	return (
		<div className="bg-white rounded-lg shadow-sm p-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
				{/* Admission Filter */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Admission</label>
					<select
						value={filters.admissionId}
						onChange={(e) => onFilterChange("admissionId", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
					>
						<option value="All">All Admissions</option>
						{admissions.map((adm) => (
							<option key={adm.id} value={adm.id}>
								{adm.title}
							</option>
						))}
					</select>
				</div>

				{/* Modified By Filter */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Modified By</label>
					<select
						value={filters.userId}
						onChange={(e) => onFilterChange("userId", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
					>
						<option value="All">All Users</option>
						{users.map((user) => (
							<option key={user} value={user}>
								{user}
							</option>
						))}
					</select>
				</div>

				{/* Change Type Filter */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Change Type</label>
					<select
						value={filters.changeType}
						onChange={(e) => onFilterChange("changeType", e.target.value as ChangeType | "All")}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
					>
						<option value="All">All Types</option>
						<option value="Manual Edit">Manual Edit</option>
						<option value="Scraper Update">Scraper Update</option>
						<option value="Admin Edit">Admin Edit</option>
					</select>
				</div>

				{/* Date From */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
					<input
						type="date"
						value={filters.dateFrom}
						onChange={(e) => onFilterChange("dateFrom", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				{/* Date To */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
					<input
						type="date"
						value={filters.dateTo}
						onChange={(e) => onFilterChange("dateTo", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			{/* Filter Actions */}
			<div className="flex items-center justify-end gap-3">
				<button
					onClick={onReset}
					className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
				>
					Reset
				</button>
			</div>
		</div>
	)
}

