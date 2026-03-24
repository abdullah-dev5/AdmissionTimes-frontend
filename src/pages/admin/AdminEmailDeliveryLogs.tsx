import { useCallback, useEffect, useMemo, useState } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import {
  adminService,
  type EmailDeliveryLog,
  type EmailLogListResult,
} from "../../services/adminService"
import { showConfirm, showError, showSuccess } from "../../utils/swal"

function AdminEmailDeliveryLogs() {
  const [statusFilter, setStatusFilter] = useState<"failed" | "sent">("failed")
  const [logs, setLogs] = useState<EmailDeliveryLog[]>([])
  const [loading, setLoading] = useState(false)
  const [replayingId, setReplayingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<EmailLogListResult["meta"] | null>(null)

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
                          {new Date(log.created_at).toLocaleString()}
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