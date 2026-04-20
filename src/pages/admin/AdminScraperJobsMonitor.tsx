import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "../../layouts/AdminLayout"
import { showInfo, showSuccess } from "../../utils/swal"
import {
	getScraperJobStatusColor,
	type ScraperJob,
} from "../../data/adminData"
import { formatDisplayDateTime } from "../../utils/dateUtils"
import {
	adminService,
	type ScraperRunDetail,
	type ScraperRunListItem,
	type ScraperRunStatus,
	type ScraperRunStatusLabel,
	type ScraperRunSummary,
} from "../../services/adminService"

const itemsPerPage = 20
const autoRefreshMs = 30_000

const formatDuration = (seconds: number): string => {
	if (!seconds || seconds <= 0) return "0s"
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	if (mins === 0) return `${secs}s`
	return `${mins}m ${secs}s`
}

const toJobStatus = (status: ScraperRunStatusLabel): ScraperJob["status"] => {
	if (status === "Running") return "Running"
	if (status === "Success") return "Success"
	if (status === "Failed") return "Failed"
	if (status === "Changes Detected") return "Changes Detected"
	return "No Changes"
}

const toUniversityLabel = (value: string | null | undefined): string => {
	const normalized = String(value || "").trim().toLowerCase()
	if (!normalized) return "Unknown University"
	if (normalized === "all") return "All Universities"
	return String(value).trim()
}

const mapRunToJob = (
	run: ScraperRunListItem,
	detail?: Pick<ScraperRunDetail, "events">,
): ScraperJob => {
	const logs = detail
		? detail.events
				.map((event) => {
					const status = event.event_status.toUpperCase()
					const title = event.source_program_title || event.source_university_name || "Unknown source"
					const reason = event.reason ? ` (${event.reason})` : ""
					return `[${formatDisplayDateTime(event.created_at)}] ${status}: ${title}${reason}`
				})
				.join("\n")
		: undefined

	const errorLog = detail
		? detail.events
				.filter((event) => event.error_detail)
				.map((event) => `[${formatDisplayDateTime(event.created_at)}] ${event.error_detail}`)
				.join("\n")
		: undefined

	return {
		id: run.id,
		jobId: run.job_id,
		university: toUniversityLabel(run.university),
		universityId: run.id,
		startedAt: run.started_at,
		finishedAt: run.finished_at || run.started_at,
		status: toJobStatus(run.status_label),
		sourceUrl: run.source_url || "#",
		duration: formatDuration(run.duration_seconds),
		schedulerTriggered: run.scheduler_triggered,
		logs,
		errorLog: errorLog || undefined,
	}
}

function AdminScraperJobsMonitor() {
	const navigate = useNavigate()
	const [selectedJob, setSelectedJob] = useState<ScraperJob | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [isLoading, setIsLoading] = useState(false)
	const [isDetailLoading, setIsDetailLoading] = useState(false)
	const [isActionLoading, setIsActionLoading] = useState(false)
	const [jobs, setJobs] = useState<ScraperJob[]>([])
	const [selectedRunDetail, setSelectedRunDetail] = useState<ScraperRunDetail | null>(null)
	const [totalJobs, setTotalJobs] = useState(0)
	const [statusFilter, setStatusFilter] = useState<"all" | ScraperRunStatus>("all")
	const [modeFilter, setModeFilter] = useState<"all" | "mirror" | "publish">("all")
	const [summary, setSummary] = useState<ScraperRunSummary>({
		total_jobs: 0,
		successful_jobs: 0,
		failed_jobs: 0,
		running_jobs: 0,
		last_execution: null,
	})

	const totalPages = Math.max(1, Math.ceil(totalJobs / itemsPerPage))

	const fetchSummary = async () => {
		try {
			const response = await adminService.getScraperRunSummary()
			setSummary(response.data)
		} catch (error) {
			console.error("Failed to load scraper summary", error)
		}
	}

	const fetchRuns = async (page: number, options?: { silent?: boolean }) => {
		if (!options?.silent) {
			setIsLoading(true)
		}
		try {
			const response = await adminService.getScraperRuns(page, itemsPerPage, {
				status: statusFilter === "all" ? undefined : statusFilter,
				mode: modeFilter === "all" ? undefined : modeFilter,
			})
			setJobs(response.data.map((run) => mapRunToJob(run)))
			setTotalJobs(response.pagination.total)
		} catch (error) {
			console.error("Failed to load scraper runs", error)
			setJobs([])
			setTotalJobs(0)
		} finally {
			if (!options?.silent) {
				setIsLoading(false)
			}
		}
	}

	useEffect(() => {
		void fetchSummary()
	}, [])

	useEffect(() => {
		void fetchRuns(currentPage)
	}, [currentPage, statusFilter, modeFilter])

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			void fetchSummary()
			void fetchRuns(currentPage, { silent: true })
		}, autoRefreshMs)

		return () => {
			window.clearInterval(intervalId)
		}
	}, [currentPage, statusFilter, modeFilter])

	const openJobDetail = async (job: ScraperJob) => {
		setIsDetailLoading(true)
		try {
			const response = await adminService.getScraperRunDetail(job.id)
			setSelectedRunDetail(response.data)
			setSelectedJob(mapRunToJob(response.data.run, { events: response.data.events }))
		} catch (error) {
			console.error("Failed to load scraper run details", error)
			setSelectedRunDetail(null)
			setSelectedJob(job)
		} finally {
			setIsDetailLoading(false)
		}
	}

	const handleRunAll = async () => {
		setIsActionLoading(true)
		try {
			const response = await adminService.triggerScraperRunAll(true)
			await showSuccess(
				`Manual publish replay started. Replay records: ${response.data.replayed_records}. Mode: ${response.data.ingestion.mode}.`,
			)
			await fetchSummary()
			await fetchRuns(1)
			setCurrentPage(1)
		} catch (error) {
			console.error("Failed to trigger manual scraper run", error)
			await showInfo("Failed to start manual scraper run.")
		} finally {
			setIsActionLoading(false)
		}
	}

	const handleRerun = async (runId: string) => {
		setIsActionLoading(true)
		try {
			const response = await adminService.rerunScraperRun(runId, true)
			await showSuccess(
				`Publish rerun started. Replay records: ${response.data.replayed_records}. Mode: ${response.data.ingestion.mode}.`,
			)
			await fetchSummary()
			await fetchRuns(currentPage)
		} catch (error) {
			console.error("Failed to trigger scraper rerun", error)
			await showInfo("Failed to rerun scraper job.")
		} finally {
			setIsActionLoading(false)
		}
	}

	const handleRetry = async (job: ScraperJob) => {
		await handleRerun(job.id)
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
						disabled={isActionLoading}
						className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
						style={{ backgroundColor: "#004AAD" }}
					>
						{isActionLoading ? "Running..." : "Run Publish Replay"}
					</button>
				</div>

				<div className="mb-6 bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row gap-3 md:items-end">
					<div>
						<label className="block text-sm text-gray-600 mb-1">Status</label>
						<select
							value={statusFilter}
							onChange={(e) => {
								setStatusFilter(e.target.value as "all" | ScraperRunStatus)
								setCurrentPage(1)
							}}
							className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
						>
							<option value="all">All Statuses</option>
							<option value="running">Running</option>
							<option value="completed">Completed</option>
							<option value="partial">Partial</option>
							<option value="failed">Failed</option>
						</select>
					</div>
					<div>
						<label className="block text-sm text-gray-600 mb-1">Mode</label>
						<select
							value={modeFilter}
							onChange={(e) => {
								setModeFilter(e.target.value as "all" | "mirror" | "publish")
								setCurrentPage(1)
							}}
							className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
						>
							<option value="all">All Modes</option>
							<option value="mirror">Mirror</option>
							<option value="publish">Publish</option>
						</select>
					</div>
					<p className="text-xs text-gray-500 md:ml-auto md:mb-2">
						Auto-refreshing every 30s. Manual action replays latest snapshot with publish enabled for FAST and other universities.
					</p>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<p className="text-sm text-gray-600 mb-1">Total Jobs Run</p>
								<p className="text-3xl font-bold" style={{ color: "#111827" }}>
									{summary.total_jobs}
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
									{summary.successful_jobs}
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
									{summary.failed_jobs}
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
									{summary.last_execution ? formatDisplayDateTime(summary.last_execution) : "-"}
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
								{jobs.map((job) => {
									const statusColors = getScraperJobStatusColor(job.status)
									return (
										<tr
											key={job.id}
											className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
											onClick={() => void openJobDetail(job)}
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
												{job.sourceUrl !== "#" ? (
													<a
														href={job.sourceUrl}
														target="_blank"
														rel="noopener noreferrer"
														onClick={(e) => e.stopPropagation()}
														className="text-sm text-blue-600 hover:underline truncate max-w-[200px] block"
													>
														{job.sourceUrl}
													</a>
												) : (
													<p className="text-sm text-gray-500">-</p>
												)}
											</td>
											<td className="py-4 px-4">
												<p className="text-sm text-gray-600">{job.duration}</p>
											</td>
											<td className="py-4 px-4">
												<div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
													<button
														onClick={() => void openJobDetail(job)}
														className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
													>
														View Details
													</button>
													{job.status === "Failed" && (
														<button
															onClick={() => void handleRetry(job)}
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
								{!isLoading && jobs.length === 0 && (
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
								{isLoading && (
									<tr>
										<td colSpan={8} className="py-10 text-center text-gray-500">
											Loading scraper runs...
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{totalJobs > 0 && (
						<div className="mt-6 flex items-center justify-between">
							<p className="text-sm text-gray-600">
								Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalJobs)} of {" "}
								{totalJobs} jobs
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
											{selectedJob.sourceUrl !== "#" ? (
												<a
													href={selectedJob.sourceUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm text-blue-600 hover:underline"
												>
													{selectedJob.sourceUrl}
												</a>
											) : (
												<p className="text-sm font-medium" style={{ color: "#111827" }}>
													-
												</p>
											)}
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
											{isDetailLoading ? "Loading details..." : selectedJob.logs || "No logs available."}
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

								{selectedRunDetail?.university_breakdown && selectedRunDetail.university_breakdown.length > 0 && (
									<div className="mb-6">
										<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
											University Breakdown
										</h3>
										<div className="overflow-x-auto border border-gray-200 rounded-lg">
											<table className="w-full text-sm">
												<thead className="bg-gray-50">
													<tr>
														<th className="text-left px-3 py-2 text-gray-600">University</th>
														<th className="text-right px-3 py-2 text-gray-600">Total</th>
														<th className="text-right px-3 py-2 text-gray-600">Inserted</th>
														<th className="text-right px-3 py-2 text-gray-600">Updated</th>
														<th className="text-right px-3 py-2 text-gray-600">Skipped</th>
														<th className="text-right px-3 py-2 text-gray-600">Failed</th>
													</tr>
												</thead>
												<tbody>
													{selectedRunDetail.university_breakdown.map((row) => (
														<tr key={row.source_university_name} className="border-t border-gray-100">
															<td className="px-3 py-2 text-gray-800">{row.source_university_name}</td>
															<td className="px-3 py-2 text-right text-gray-700">{row.total}</td>
															<td className="px-3 py-2 text-right text-green-700">{row.inserted}</td>
															<td className="px-3 py-2 text-right text-blue-700">{row.updated}</td>
															<td className="px-3 py-2 text-right text-amber-700">{row.skipped}</td>
															<td className="px-3 py-2 text-right text-red-700">{row.failed}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								)}

								{selectedRunDetail?.skip_reasons && selectedRunDetail.skip_reasons.length > 0 && (
									<div className="mb-6">
										<h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
											Skip Reasons
										</h3>
										<div className="space-y-2">
											{selectedRunDetail.skip_reasons.map((row, idx) => (
												<div key={`${row.source_university_name}-${idx}`} className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
													<p className="text-sm font-medium text-amber-900">
														{row.source_university_name} ({row.count})
													</p>
													<p className="text-sm text-amber-800 mt-1">{row.reason}</p>
												</div>
											))}
										</div>
									</div>
								)}

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
																setSelectedRunDetail(null)
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
									onClick={() => {
										setSelectedJob(null)
										setSelectedRunDetail(null)
									}}
									className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
								>
									Close
								</button>
								<button
									onClick={() => {
										void handleRerun(selectedJob.id)
										setSelectedJob(null)
										setSelectedRunDetail(null)
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

