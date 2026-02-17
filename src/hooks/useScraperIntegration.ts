/**
 * Scraper Integration Hook
 * Manages scraper-based changelog creation with actor_type='system'
 */

import { useCallback, useState } from "react"

export interface ScraperChangeEvent {
	admission_id: string
	field_name: string
	old_value: any
	new_value: any
	diff_summary: string
	scraped_at: string
	source_url?: string
	metadata?: Record<string, any>
}

export interface ScraperJob {
	id: string
	name: string
	status: "pending" | "running" | "completed" | "failed"
	university_id: string
	started_at: string
	completed_at?: string
	changes_detected: number
	changes_logged: number
	error?: string
}

/**
 * Hook for managing scraper integration with changelog system
 */
export const useScraperIntegration = () => {
	const [jobs, setJobs] = useState<ScraperJob[]>([])
	const [isRunning, setIsRunning] = useState(false)
	const [changeEvents, setChangeEvents] = useState<ScraperChangeEvent[]>([])

	/**
	 * Create a scraper job
	 */
	const createScraperJob = useCallback((name: string, universityId: string): ScraperJob => {
		const job: ScraperJob = {
			id: `scraper-${Date.now()}`,
			name,
			status: "pending",
			university_id: universityId,
			started_at: new Date().toISOString(),
			changes_detected: 0,
			changes_logged: 0,
		}

		setJobs((prev) => [job, ...prev])
		console.log("🔄 [Scraper] Job created:", job)

		return job
	}, [])

	/**
	 * Update scraper job status
	 */
	const updateJobStatus = useCallback(
		(jobId: string, status: ScraperJob["status"], data?: Partial<ScraperJob>) => {
			setJobs((prev) =>
				prev.map((job) =>
					job.id === jobId
						? {
								...job,
								status,
								completed_at:
									status === "completed" || status === "failed"
										? new Date().toISOString()
										: job.completed_at,
								...data,
						  }
						: job
				)
			)

			console.log(`🔄 [Scraper] Job ${jobId} status changed to ${status}`)
		},
		[]
	)

	/**
	 * Log a scraper change event
	 * Creates a changelog entry with actor_type='system'
	 */
	const logScraperChange = useCallback((event: ScraperChangeEvent, jobId: string) => {
		// This would be called by the scraper when it detects changes
		const changelog = {
			id: `changelog-${Date.now()}`,
			admission_id: event.admission_id,
			actor_type: "system" as const, // Key: Scraper sets actor_type='system'
			changed_by: "scraper",
			action_type: "updated",
			field_name: event.field_name,
			old_value: event.old_value,
			new_value: event.new_value,
			diff_summary: event.diff_summary,
			metadata: {
				scraper_job_id: jobId,
				source_url: event.source_url,
				...event.metadata,
			},
			created_at: new Date().toISOString(),
		}

		setChangeEvents((prev) => [event, ...prev])

		// Update job stats
		setJobs((prev) =>
			prev.map((job) =>
				job.id === jobId
					? {
							...job,
							changes_detected: job.changes_detected + 1,
							changes_logged: job.changes_logged + 1,
					  }
					: job
			)
		)

		console.log("📝 [Scraper Changelog] Entry created:", changelog)

		return changelog
	}, [])

	/**
	 * Start scraper job
	 */
	const startScraperJob = useCallback(async (jobId: string) => {
		try {
			setIsRunning(true)
			updateJobStatus(jobId, "running")

			console.log(`🚀 [Scraper] Starting job: ${jobId}`)

			// TODO: Call backend scraper API
			// Example:
			// const response = await scraperService.startJob(jobId)
			// Handle response and log changes

			// Simulate completion
			await new Promise((resolve) => setTimeout(resolve, 2000))

			updateJobStatus(jobId, "completed")
			console.log(`✅ [Scraper] Job ${jobId} completed`)
		} catch (error) {
			console.error(`❌ [Scraper] Job ${jobId} failed:`, error)
			updateJobStatus(jobId, "failed", {
				error: String(error),
			})
		} finally {
			setIsRunning(false)
		}
	}, [updateJobStatus])

	/**
	 * Get scraper statistics
	 */
	const getScraperStats = useCallback(() => {
		return {
			totalJobs: jobs.length,
			runningJobs: jobs.filter((j) => j.status === "running").length,
			completedJobs: jobs.filter((j) => j.status === "completed").length,
			failedJobs: jobs.filter((j) => j.status === "failed").length,
			totalChangesDetected: jobs.reduce((sum, j) => sum + j.changes_detected, 0),
			totalChangesLogged: jobs.reduce((sum, j) => sum + j.changes_logged, 0),
		}
	}, [jobs])

	/**
	 * Check if scraper is enabled
	 * TODO: This should come from backend feature flags
	 */
	const isScraperEnabled = useCallback(() => {
		// Replace with actual feature flag check
		const SCRAPER_ENABLED = process.env.REACT_APP_SCRAPER_ENABLED === "true"
		console.log(`🔄 [Scraper] Enabled: ${SCRAPER_ENABLED}`)
		return SCRAPER_ENABLED
	}, [])

	return {
		jobs,
		isRunning,
		changeEvents,
		createScraperJob,
		updateJobStatus,
		logScraperChange,
		startScraperJob,
		getScraperStats,
		isScraperEnabled,
	}
}

/**
 * Hook to track changelog entries from scraper
 */
export const useScraperChangelogs = () => {
	const [scraperChangelogs, setScraperChangelogs] = useState<any[]>([])

	/**
	 * Filter changelogs to only scraper updates
	 */
	const getScraperChangelogs = useCallback((allChangelogs: any[]) => {
		return allChangelogs.filter((log) => log.actor_type === "system")
	}, [])

	return {
		scraperChangelogs,
		setScraperChangelogs,
		getScraperChangelogs,
	}
}
