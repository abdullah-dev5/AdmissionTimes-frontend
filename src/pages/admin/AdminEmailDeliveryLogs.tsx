import { useCallback, useEffect, useMemo, useState } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import {
  adminService,
  type EmailDeliveryLog,
  type EmailLogListResult,
} from "../../services/adminService"
import { formatDisplayDateTime } from "../../utils/dateUtils"
import { showConfirm, showError, showSuccess } from "../../utils/swal"

function AdminEmailDeliveryLogs() {
  const [statusFilter, setStatusFilter] = useState<"failed" | "sent">("failed")
  const [logs, setLogs] = useState<EmailDeliveryLog[]>([])
  const [loading, setLoading] = useState(false)
  const [readinessLoading, setReadinessLoading] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [replayingId, setReplayingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<EmailLogListResult["meta"] | null>(null)
  const [emailReadiness, setEmailReadiness] = useState<{
    enabled: boolean
    ready: boolean
    lastVerifyAt: string | null
    lastVerifyError: string | null
  } | null>(null)
  const [retryResult, setRetryResult] = useState<{
    backlog: number
    backlog_failed: number
    backlog_unattempted: number
    attempted: number
    queued: number
    attempted_unattempted: number
    attempted_failed: number
    skipped_permanent: number
    blocked_by_readiness: boolean
  } | null>(null)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await adminService.getEmailDeliveryLogs({
        status: statusFilter,
        limit: 100,
      })

      const payload = response.data || { logs: [], meta: { status: null, limit: 100, count: 0 } }
      setLogs(payload.logs || [])
      setMeta(payload.meta || null)
    } catch (err: any) {
      setError(err?.message || "Failed to load email delivery logs")
      setLogs([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchLogs().catch(() => {})
  }, [fetchLogs])

  const fetchReadiness = useCallback(async () => {
    try {
      setReadinessLoading(true)
      const response = await adminService.getEmailReadiness()
      setEmailReadiness(response.data || null)
    } catch {
      setEmailReadiness(null)
    } finally {
      setReadinessLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReadiness().catch(() => {})
  }, [fetchReadiness])

  const failedCount = useMemo(
    () => logs.filter((item) => item.status === "failed").length,
    [logs]
  )

  const handleReplayByLog = async (log: EmailDeliveryLog) => {
    const confirmed = await showConfirm(
      "Replay Email",
      `Replay email for ${log.recipient_email}?`,
      "Replay",
      "Cancel"
    )

    if (!confirmed) {
      return
    }

    try {
      setReplayingId(log.id)
      await adminService.replayEmailFromLog(log.id)
      await showSuccess("Replay request sent successfully.")
      await fetchLogs()
    } catch (err: any) {
      await showError(err?.message || "Failed to replay email")
    } finally {
      setReplayingId(null)
    }
  }

  const handleReplayByNotification = async (log: EmailDeliveryLog) => {
    const confirmed = await showConfirm(
      "Replay By Notification",
      `Replay email using notification ${log.notification_id}?`,
      "Replay",
      "Cancel"
    )

    if (!confirmed) {
      return
    }

    try {
      setReplayingId(log.id)
      await adminService.replayEmailByNotificationId(log.notification_id)
      await showSuccess("Replay by notification sent successfully.")
      await fetchLogs()
    } catch (err: any) {
      await showError(err?.message || "Failed to replay email by notification")
    } finally {
      setReplayingId(null)
    }
  }

  const handleVerifyReadiness = async () => {
    try {
      setReadinessLoading(true)
      const response = await adminService.verifyEmailReadiness()
      setEmailReadiness(response.data || null)
      await showSuccess("Email readiness verification completed.")
    } catch (err: any) {
      await showError(err?.message || "Failed to verify email readiness")
    } finally {
      setReadinessLoading(false)
    }
  }

  const handleProcessRetries = async () => {
    const confirmed = await showConfirm(
      "Process Email Retries",
      "Run retry processing for failed email deliveries now?",
      "Run",
      "Cancel"
    )

    if (!confirmed) {
      return
    }

    try {
      setRetrying(true)
      const response = await adminService.processEmailRetries({
        limit: 50,
        max_failed_attempts: 6,
        min_age_seconds: 60,
        max_age_hours: 72,
      })
      const result = response.data
      setRetryResult(result)

      if (result?.blocked_by_readiness) {
        await showError("Email retries are blocked because SMTP readiness is not healthy.")
      } else {
        await showSuccess(
          `Retry run complete: attempted=${result?.attempted ?? 0}, skipped permanent=${result?.skipped_permanent ?? 0}`
        )
      }

      await fetchReadiness()
      await fetchLogs()
    } catch (err: any) {
      await showError(err?.message || "Failed to process email retries")
    } finally {
      setRetrying(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#111827" }}>
              Email Delivery Logs
            </h1>
            <p className="text-gray-600">
              Review delivery failures and replay email sends from admin tools.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "failed" | "sent")}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            >
              <option value="failed">Failed only</option>
              <option value="sent">Sent only</option>
            </select>
            <button
              onClick={() => fetchLogs()}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: "#2563EB" }}
            >
              Refresh
            </button>
            <button
              onClick={handleVerifyReadiness}
              disabled={readinessLoading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {readinessLoading ? "Checking..." : "Verify SMTP"}
            </button>
            <button
              onClick={handleProcessRetries}
              disabled={retrying}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#0F766E" }}
            >
              {retrying ? "Running..." : "Process Retries"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Loaded Records</p>
            <p className="text-2xl font-bold" style={{ color: "#111827" }}>{logs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Failed In View</p>
            <p className="text-2xl font-bold" style={{ color: "#DC2626" }}>{failedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Backend Count</p>
            <p className="text-2xl font-bold" style={{ color: "#111827" }}>{meta?.count ?? 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">SMTP Readiness</p>
            {emailReadiness ? (
              <>
                <p className="text-sm">
                  Status:{" "}
                  <span
                    className="font-semibold"
                    style={{ color: emailReadiness.ready ? "#166534" : "#B91C1C" }}
                  >
                    {emailReadiness.enabled ? (emailReadiness.ready ? "Ready" : "Not Ready") : "Disabled"}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Last verify: {emailReadiness.lastVerifyAt ? formatDisplayDateTime(emailReadiness.lastVerifyAt) : "Never"}
                </p>
                {emailReadiness.lastVerifyError && (
                  <p className="text-xs text-red-600 mt-2 break-words">{emailReadiness.lastVerifyError}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">Readiness data unavailable.</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Last Retry Run</p>
            {retryResult ? (
              <>
                <p className="text-sm text-gray-700">Backlog: {retryResult.backlog}</p>
                <p className="text-xs text-gray-500">Unattempted backlog: {retryResult.backlog_unattempted}</p>
                <p className="text-xs text-gray-500">Failed backlog: {retryResult.backlog_failed}</p>
                <p className="text-sm text-gray-700">Queued: {retryResult.queued}</p>
                <p className="text-sm text-gray-700">Attempted: {retryResult.attempted}</p>
                <p className="text-xs text-gray-500">Attempted (unattempted): {retryResult.attempted_unattempted}</p>
                <p className="text-xs text-gray-500">Attempted (failed): {retryResult.attempted_failed}</p>
                <p className="text-sm text-gray-700">Skipped permanent: {retryResult.skipped_permanent}</p>
                <p className="text-sm mt-1" style={{ color: retryResult.blocked_by_readiness ? "#B91C1C" : "#166534" }}>
                  {retryResult.blocked_by_readiness ? "Blocked by SMTP readiness" : "Processed"}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">No retry run yet in this session.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <p className="text-sm text-gray-600">Loading email logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-gray-500">No email delivery logs for this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Created</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Recipient</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Subject</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Attempt</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Error</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const isReplaying = replayingId === log.id
                    return (
                      <tr key={log.id} className="border-b border-gray-100 align-top">
                        <td className="py-3 px-2 text-sm text-gray-700">
                          {formatDisplayDateTime(log.created_at)}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-700">{log.recipient_email}</td>
                        <td className="py-3 px-2 text-sm text-gray-700 max-w-[220px] truncate" title={log.subject}>
                          {log.subject}
                        </td>
                        <td className="py-3 px-2 text-sm">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: log.status === "failed" ? "#FEE2E2" : "#DCFCE7",
                              color: log.status === "failed" ? "#B91C1C" : "#166534",
                            }}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-700">#{log.attempt_number}</td>
                        <td className="py-3 px-2 text-sm text-gray-700 max-w-[260px] break-words">
                          {log.error_message || "-"}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleReplayByLog(log)}
                              disabled={isReplaying}
                              className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Replay Log
                            </button>
                            <button
                              onClick={() => handleReplayByNotification(log)}
                              disabled={isReplaying}
                              className="px-3 py-1.5 text-xs rounded-lg text-white hover:opacity-90 disabled:opacity-50"
                              style={{ backgroundColor: "#2563EB" }}
                            >
                              Replay Notification
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminEmailDeliveryLogs