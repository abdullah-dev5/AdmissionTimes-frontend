import { getUniqueAdmissions, getUniqueUsers, type ChangeType } from "../../data/adminData"
import type { ChangeLogFilters } from "../../hooks/useChangeLogFilters"

interface ChangeLogFiltersProps {
	filters: ChangeLogFilters
	onFilterChange: <K extends keyof ChangeLogFilters>(key: K, value: ChangeLogFilters[K]) => void
	onReset: () => void
}

/**
 * Enhanced filters component for Change Logs page
 * Provides filtering by admission, user, change type, and date range
 */
export default function ChangeLogFilters({ filters, onFilterChange, onReset }: ChangeLogFiltersProps) {
	const admissions = getUniqueAdmissions()
	const users = getUniqueUsers()

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
				{/* Admission Filter */}
				<div>
					<label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
						Program
					</label>
					<select
						value={filters.admissionId}
						onChange={(e) => onFilterChange("admissionId", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
					>
						<option value="All">All Programs</option>
						{admissions.map((adm) => (
							<option key={adm.id} value={adm.id}>
								{adm.title}
							</option>
						))}
					</select>
				</div>

				{/* Modified By Filter */}
				<div>
					<label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
						Modified By
					</label>
					<select
						value={filters.userId}
						onChange={(e) => onFilterChange("userId", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
					<label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
						Change Type
					</label>
					<select
						value={filters.changeType}
						onChange={(e) => onFilterChange("changeType", e.target.value as ChangeType | "All")}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
					>
						<option value="All">All Types</option>
						<option value="Manual Edit">Manual Edit</option>
						<option value="Admin Edit">Admin Edit</option>
						{/* TODO: Enable when scraper module is ready */}
						{/* <option value="Scraper Update">🔄 Scraper Update</option> */}
					</select>
				</div>

				{/* Date From */}
				<div>
					<label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
						From
					</label>
					<input
						type="date"
						value={filters.dateFrom}
						onChange={(e) => onFilterChange("dateFrom", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
					/>
				</div>

				{/* Date To */}
				<div>
					<label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
						To
					</label>
					<input
						type="date"
						value={filters.dateTo}
						onChange={(e) => onFilterChange("dateTo", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
					/>
				</div>
			</div>

			{/* Filter Actions */}
			<div className="flex items-center justify-between">
				<p className="text-xs text-gray-500">Use filters to narrow down specific updates.</p>
				<button
					onClick={onReset}
					className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
				>
					Reset Filters
				</button>
			</div>
		</div>
	)
}

