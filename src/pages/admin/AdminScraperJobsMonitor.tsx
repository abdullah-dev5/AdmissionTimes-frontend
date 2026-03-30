import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "../../layouts/AdminLayout"
import { showInfo, showSuccess } from "../../utils/swal"
import {
	scraperJobs,
	scraperSummary,
	getScraperJobStatusColor,
	type ScraperJob,
} from "../../data/adminData"
import { formatDisplayDateTime } from "../../utils/dateUtils"

function AdminScraperJobsMonitor() {
	const navigate = useNavigate()
	const [selectedJob, setSelectedJob] = useState<ScraperJob | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 20

	// Pagination
	const totalPages = Math.ceil(scraperJobs.length / itemsPerPage)
	const paginatedJobs = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage
		return scraperJobs.slice(startIndex, startIndex + itemsPerPage)
	}, [currentPage])

	const handleRunAll = async () => {
		// Mock API call - in production, this would be:
		// POST /api/admin/scraper/run-all
		console.log("Running scraper for all universities")
		// Show toast: "Scraper started successfully."
		await showSuccess("Scraper started successfully.")
	}

	const handleRerun = async (universityId: string) => {
		// Mock API call - in production, this would be:
		// POST /api/admin/scraper/rerun/:universityId
		console.log("Rerunning scraper for university:", universityId)
		await showInfo("Scraper rerun initiated.")
	}

	const handleRetry = async (job: ScraperJob) => {
		// Mock API call - in production, this would be:
		// POST /api/admin/scraper/rerun/:universityId
		console.log("Retrying scraper job:", job.jobId)
		await handleRerun(job.universityId)
	}

	return (
		<AdminLayout>
			<div className="p-6">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold mb-2" style={{ color: "#111827" }}>
							Scraper Jobs Monitor
						</h1>
						<p className="text-gray-600">Track automated scraper executions and update results.</p>
					</div>
					<button
						onClick={handleRunAll}
						className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
						style={{ backgroundColor: "#004AAD" }}
					>
						Run Scraper Manually
					</button>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<p className="text-sm text-gray-600 mb-1">Total Jobs Run</p>
								<p className="text-3xl font-bold" style={{ color: "#111827" }}>
									{scraperSummary.totalJobs}
								</p>
							</div>
							<div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#E0E7FF" }}>
								<svg className="w-6 h-6" style={{ color: "#2563EB" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<p className="text-sm text-gray-600 mb-1">Successful Jobs</p>
								<p className="text-3xl font-bold" style={{ color: "#10B981" }}>
									{scraperSummary.successfulJobs}
								</p>
							</div>
							<div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#D1FAE5" }}>
								<svg className="w-6 h-6" style={{ color: "#10B981" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<p className="text-sm text-gray-600 mb-1">Failed Jobs</p>
								<p className="text-3xl font-bold" style={{ color: "#EF4444" }}>
									{scraperSummary.failedJobs}
								</p>
							</div>
							<div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FEE2E2" }}>
								<svg className="w-6 h-6" style={{ color: "#EF4444" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<p className="text-sm text-gray-600 mb-1">Last Execution</p>
								<p className="text-lg font-bold" style={{ color: "#111827" }}>
									{formatDisplayDateTime(scraperSummary.lastExecution)}
								</p>
							</div>
							<div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FEF3C7" }}>
								<svg className="w-6 h-6" style={{ color: "#F59E0B" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Scraper Jobs Table */}
				<div className="bg-white rounded-lg shadow-sm p-6">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-200">
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">University Name</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Job ID</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Started At</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Finished At</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Source URL</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Duration</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
								</tr>
							</thead>
							<tbody>
								{paginatedJobs.map((job) => {
									const statusColors = getScraperJobStatusColor(job.status)
									return (
										<tr
											key={job.id}
											className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
											onClick={() => setSelectedJob(job)}
										>
											<td className="py-4 px-4">
												<p className="font-medium" style={{ color: "#111827" }}>
													{job.university}
												</p>
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600 font-mono">{job.jobId}</p>
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600">{formatDisplayDateTime(job.startedAt)}</p>
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600">{formatDisplayDateTime(job.finishedAt)}</p>
											</td>
											<td className="py-4 px-4">
												<span
													className="px-2 py-1 rounded-full text-xs font-medium"
													style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
												>
													{job.status}
												</span>
											</td>
											<td className="py-4 px-4">
												<a
													href={job.sourceUrl}
													target="_blank"
													rel="noopener noreferrer"
													onClick={(e) => e.stopPropagation()}
													className="text-sm text-blue-600 hover:underline truncate max-w-[200px] block"
												>
													{job.sourceUrl}
												</a>
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600">{job.duration}</p>
											</td>
											<td className="py-4 px-4">
												<div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
													<button
														onClick={() => setSelectedJob(job)}
														className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
													>
														View Details
													</button>
													{job.status === "Failed" && (
														<button
															onClick={() => handleRetry(job)}
															className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
														>
															Retry
														</button>
													)}
												</div>
											</td>
										</tr>
									)
								})}
								{paginatedJobs.length === 0 && (
									<tr>
										<td colSpan={8} className="py-10 text-center">
											<div className="flex flex-col items-center justify-center">
												<svg
													className="w-16 h-16 text-gray-400 mb-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
													/>
												</svg>
												<p className="text-lg font-medium text-gray-500 mb-2">No scraper jobs recorded yet.</p>
												<p className="text-sm text-gray-400">The scheduler will run the first job soon.</p>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="mt-6 flex items-center justify-between">
							<p className="text-sm text-gray-600">
								Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, scraperJobs.length)} of{" "}
								{scraperJobs.length} jobs
							</p>
							<div className="flex items-center gap-2">
								<button
									onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
									disabled={currentPage === 1}
									className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer transition-colors"
								>
									Previous
								</button>
								<span className="text-sm text-gray-600">
									Page {currentPage} of {totalPages}
								</span>
								<button
									onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
									disabled={currentPage === totalPages}
									className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer transition-colors"
								>
									Next
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Job Details Drawer */}
				{selectedJob && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
						<div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-lg overflow-hidden flex flex-col">
							{/* Drawer Header */}
							<div className="p-6 border-b border-gray-200 flex items-center justify-between">
								<div>
									<h2 className="text-xl font-semibold" style={{ color: "#111827" }}>
										Job Details
									</h2>
									<p className="text-sm text-gray-600 mt-1">{selectedJob.jobId}</p>
								</div>
								<button
									onClick={() => setSelectedJob(null)}
									className="p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"
								>
									<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>

							{/* Drawer Content - Scrollable */}
							<div className="flex-1 overflow-y-auto p-6">
								{/* Job Metadata */}
								<div className="mb-6">
									<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
										Job Metadata
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500 mb-1">Job ID</p>
											<p className="text-sm font-medium font-mono" style={{ color: "#111827" }}>
												{selectedJob.jobId}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">University Name</p>
											<p className="text-sm font-medium" style={{ color: "#111827" }}>
												{selectedJob.university}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">Start Time</p>
											<p className="text-sm font-medium" style={{ color: "#111827" }}>
												{formatDisplayDateTime(selectedJob.startedAt)}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">End Time</p>
											<p className="text-sm font-medium" style={{ color: "#111827" }}>
												{formatDisplayDateTime(selectedJob.finishedAt)}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">Duration</p>
											<p className="text-sm font-medium" style={{ color: "#111827" }}>
												{selectedJob.duration}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">Execution Status</p>
											<span
												className="px-2 py-1 rounded-full text-xs font-medium inline-block"
												style={{
													backgroundColor: getScraperJobStatusColor(selectedJob.status).bg,
													color: getScraperJobStatusColor(selectedJob.status).text,
												}}
											>
												{selectedJob.status}
											</span>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">Source URL</p>
											<a
												href={selectedJob.sourceUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-blue-600 hover:underline"
											>
												{selectedJob.sourceUrl}
											</a>
										</div>
										<div>
											<p className="text-sm text-gray-500 mb-1">Scheduler Triggered</p>
											<p className="text-sm font-medium" style={{ color: "#111827" }}>
												{selectedJob.schedulerTriggered ? "Yes" : "No"}
											</p>
										</div>
									</div>
								</div>

								{/* Scraping Logs */}
								<div className="mb-6">
									<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
										Scraping Logs
									</h3>
									<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
										<pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto max-h-64 overflow-y-auto">
											{selectedJob.logs || "No logs available."}
										</pre>
									</div>
									{selectedJob.errorLog && (
										<div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
											<h4 className="text-sm font-semibold text-red-800 mb-2">Error Log</h4>
											<pre className="text-xs text-red-700 whitespace-pre-wrap font-mono overflow-x-auto max-h-64 overflow-y-auto">
												{selectedJob.errorLog}
											</pre>
										</div>
									)}
									{selectedJob.requestMetadata && (
										<div className="mt-4">
											<h4 className="text-sm font-semibold mb-2" style={{ color: "#111827" }}>
												Request Metadata
											</h4>
											<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
												{selectedJob.requestMetadata.statusCode && (
													<p className="text-sm text-gray-700 mb-2">
														<span className="font-medium">Status Code:</span> {selectedJob.requestMetadata.statusCode}
													</p>
												)}
												{selectedJob.requestMetadata.headers && (
													<div>
														<p className="text-sm font-medium text-gray-700 mb-2">Headers:</p>
														<pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
															{JSON.stringify(selectedJob.requestMetadata.headers, null, 2)}
														</pre>
													</div>
												)}
											</div>
										</div>
									)}
								</div>

								{/* Change Detection Section */}
								{selectedJob.changesDetected && selectedJob.changesDetected.length > 0 && (
									<div className="mb-6">
										<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
											Change Detection
										</h3>
										<div className="space-y-3">
											{selectedJob.changesDetected.map((change, idx) => (
												<div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
													<div className="flex items-start justify-between">
														<div className="flex-1">
															<p className="text-sm font-medium" style={{ color: "#111827" }}>
																{change.admissionTitle}
															</p>
															<p className="text-xs text-gray-600 mt-1">
																Modified fields: {change.fields.join(", ")}
															</p>
														</div>
														<button
															onClick={() => {
																navigate(`/admin/change-logs?admissionId=${change.admissionId}`)
																setSelectedJob(null)
															}}
															className="px-3 py-1.5 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
															style={{ backgroundColor: "#004AAD" }}
														>
															View Full Change Log →
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Drawer Footer */}
							<div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
								<button
									onClick={() => setSelectedJob(null)}
									className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
								>
									Close
								</button>
								<button
									onClick={() => {
										handleRerun(selectedJob.universityId)
										setSelectedJob(null)
									}}
									className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
									style={{ backgroundColor: "#004AAD" }}
								>
									Rerun Scraper for this University
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</AdminLayout>
	)
}

export default AdminScraperJobsMonitor

