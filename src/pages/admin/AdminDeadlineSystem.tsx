import { useCallback, useEffect, useMemo, useState } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import {
  adminService,
  type ReminderDeliveryLog,
  type SchedulerHealthResult,
} from "../../services/adminService"
import { showConfirm, showError, showSuccess } from "../../utils/swal"

function AdminDeadlineSystem() {
  const [statusFilter, setStatusFilter] = useState<"sent" | "failed" | "deduped" | "all">("failed")
  const [logs, setLogs] = useState<ReminderDeliveryLog[]>([])
  const [health, setHealth] = useState<SchedulerHealthResult | null>(null)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [loadingHealth, setLoadingHealth] = useState(false)
  const [runningTrigger, setRunningTrigger] = useState(false)
  const [runningCleanup, setRunningCleanup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastTriggerResult, setLastTriggerResult] = useState<{
    targets: number
    attempted: number
    succeeded: number
    failed: number
    deduped?: number
    timestamp: string
  } | null>(null)

  const fetchHealth = useCallback(async () => {
    try {
      setLoadingHealth(true)
      const response = await adminService.getSchedulerHealth()
      setHealth(response.data || null)
    } catch (err: any) {
      setError(err?.message || "Failed to load scheduler health")
      setHealth(null)
    } finally {
      setLoadingHealth(false)
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      setLoadingLogs(true)
      setError(null)

      const response = await adminService.getReminderLogs({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 100,
      })

      setLogs(response.data || [])
    } catch (err: any) {
      setError(err?.message || "Failed to load reminder logs")
      setLogs([])
    } finally {
      setLoadingLogs(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchHealth().catch(() => {})
  }, [fetchHealth])

  useEffect(() => {
    fetchLogs().catch(() => {})
  }, [fetchLogs])

  const handleTrigger = async (forceRun: boolean) => {
    try {
      setRunningTrigger(true)
      setError(null)

      const response = await adminService.triggerDeadlineReminders([7, 3, 1], forceRun)
      const result = response.data || {
        targets: 0,
        attempted: 0,
        succeeded: 0,
        failed: 0,
        deduped: 0,
      }

      setLastTriggerResult({
        ...result,
        timestamp: new Date().toISOString(),
      })

      await showSuccess("Deadline reminder trigger completed.")
      await Promise.all([fetchHealth(), fetchLogs()])
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to trigger reminders"
      setError(message)
      await showError(message)
    } finally {
      setRunningTrigger(false)
    }
  }

  const handleCleanupManualTests = async () => {
    const confirmed = await showConfirm(
      "Cleanup Manual Test Notifications",
      "Delete all manual force-run reminder test notifications?",
      "Cleanup",
      "Cancel"
    )

    if (!confirmed) {
      return
    }

    try {
      setRunningCleanup(true)
      setError(null)

      const response = await adminService.cleanupManualReminderTestNotifications()
      const deletedCount = response.data?.deleted_count || 0

      await showSuccess(`Cleanup completed. Deleted ${deletedCount} manual test notifications.`)
      await fetchLogs()
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to cleanup manual test notifications"
      setError(message)
      await showError(message)
    } finally {
      setRunningCleanup(false)
    }
  }

  const counts = useMemo(() => {
    return {
      total: logs.length,
      sent: logs.filter((item) => item.status === "sent").length,
      failed: logs.filter((item) => item.status === "failed").length,
      deduped: logs.filter((item) => item.status === "deduped").length,
    }
  }, [logs])

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString()
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#111827" }}>
              Deadline System Monitor
            </h1>
            <p className="text-gray-600">
              Monitor scheduler health, reminder delivery logs, and trigger reminder runs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTrigger(false)}
              disabled={runningTrigger}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#2563EB" }}
            >
              Trigger (safe)
            </button>
            <button
              onClick={() => handleTrigger(true)}
              disabled={runningTrigger}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#0EA5E9" }}
            >
              Trigger (force)
            </button>
            <button
              onClick={handleCleanupManualTests}
              disabled={runningCleanup}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#F59E0B" }}
            >
              {runningCleanup ? "Cleaning..." : "Cleanup Tests"}
            </button>
            <button
              onClick={() => {
                fetchHealth().catch(() => {})
                fetchLogs().catch(() => {})
              }}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        {lastTriggerResult && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-800">
              Reminder run: targets={lastTriggerResult.targets}, attempted={lastTriggerResult.attempted}, succeeded={lastTriggerResult.succeeded}, failed={lastTriggerResult.failed}, deduped={lastTriggerResult.deduped || 0}
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              Triggered at {formatDateTime(lastTriggerResult.timestamp)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Deadline Job Status</p>
            <p className="text-xl font-semibold" style={{ color: "#111827" }}>
              {loadingHealth ? "Loading..." : (health?.deadlineReminders?.lastStatus || "idle")}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Last run: {formatDateTime(health?.deadlineReminders?.lastRunAt)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Deadline Job Runs</p>
            <p className="text-xl font-semibold" style={{ color: "#111827" }}>
              {loadingHealth ? "..." : (health?.deadlineReminders?.totalRuns || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Failures: {health?.deadlineReminders?.totalFailures || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Reminder Logs (Loaded)</p>
            <p className="text-xl font-semibold" style={{ color: "#111827" }}>{counts.total}</p>
            <p className="text-xs text-gray-500 mt-1">
              sent={counts.sent}, failed={counts.failed}, deduped={counts.deduped}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-semibold" style={{ color: "#111827" }}>Reminder Delivery Logs</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "sent" | "failed" | "deduped" | "all")}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            >
              <option value="all">All</option>
              <option value="failed">Failed</option>
              <option value="sent">Sent</option>
              <option value="deduped">Deduped</option>
            </select>
          </div>

          {loadingLogs ? (
            <p className="text-sm text-gray-600">Loading reminder logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-gray-500">No reminder logs found for this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Created</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Threshold</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Admission</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Deadline</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Notification</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 align-top">
                      <td className="py-3 px-2 text-sm text-gray-700">{formatDateTime(item.created_at)}</td>
                      <td className="py-3 px-2 text-sm">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor:
                              item.status === "failed"
                                ? "#FEE2E2"
                                : item.status === "deduped"
                                  ? "#FEF3C7"
                                  : "#DCFCE7",
                            color:
                              item.status === "failed"
                                ? "#B91C1C"
                                : item.status === "deduped"
                                  ? "#92400E"
                                  : "#166534",
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">{item.threshold_day}d</td>
                      <td className="py-3 px-2 text-sm text-gray-700 max-w-[220px] truncate" title={item.admission_title || item.admission_id || "-"}>
                        {item.admission_title || item.admission_id || "-"}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {formatDateTime(item.deadline_date || null)}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700 font-mono max-w-[180px] truncate" title={item.notification_id || "-"}>
                        {item.notification_id || "-"}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700 max-w-[320px] break-words">
                        {item.error_message || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDeadlineSystem