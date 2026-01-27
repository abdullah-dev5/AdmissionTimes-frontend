import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { dashboardService } from '../services/dashboardService'
import {
  sharedAdmissions,
  sharedChangeLogs,
  sharedNotifications,
  type Admission,
  type AuditItem,
  type AuditStatus,
  type ChangeLogItem,
  type NotificationItem,
} from '../data/universityData'

interface UniversityDataContextValue {
  admissions: Admission[]
  changeLogs: ChangeLogItem[]
  notifications: NotificationItem[]
  audits: AuditItem[]
  createOrUpdateAdmission: (
    admission: Admission,
    options?: { diff?: ChangeLogItem['diff']; modifiedBy?: string },
  ) => void
  deleteAdmission: (id: string) => void
  getAdmissionById: (id: string) => Admission | undefined
  markNotificationRead: (id: number) => void
  markAllNotificationsRead: () => void
  refreshNotifications: () => void
  appendChangeLog: (entry: Omit<ChangeLogItem, 'id'>) => void
}

const UniversityDataContext = createContext<UniversityDataContextValue | undefined>(undefined)

const cloneAdmissions = () => sharedAdmissions.map((admission) => ({ ...admission }))

const cloneChangeLogs = () =>
  [...sharedChangeLogs].map((log) => ({
    ...log,
    diff: log.diff.map((entry) => ({ ...entry })),
  }))

const cloneNotifications = () =>
  [...sharedNotifications].map((notification) => ({ ...notification })).sort((a, b) => (a.time < b.time ? 1 : -1))

const deriveAudits = (admissions: Admission[]): AuditItem[] =>
  admissions
    .filter((admission) => ['Pending Audit', 'Verified', 'Rejected', 'Disputed'].includes(admission.status))
    .map((admission, index) => ({
      id: index + 1,
      title: admission.title,
      status: (admission.status === 'Pending Audit' ? 'Pending' : admission.status) as AuditStatus,
      verifiedBy: admission.verifiedBy,
      lastAction: admission.lastAction || '',
      remarks: admission.remarks,
    }))

const formatNow = () => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

export function UniversityDataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
  const [admissions, setAdmissions] = useState<Admission[]>(() => cloneAdmissions())
  const [changeLogs, setChangeLogs] = useState<ChangeLogItem[]>(() => cloneChangeLogs())
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => cloneNotifications())
  const [_loading, _setLoading] = useState(true)
  const [_error, _setError] = useState<string | null>(null)

  /**
   * Fetch dashboard data from API if user is authenticated
   * Falls back to mock data on error or if not authenticated
   */
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return

    // Only fetch for university users
    const userType = user?.role || user?.user_type;
    if (!isAuthenticated || userType !== 'university') {
      setAdmissions([])
      setNotifications([])
      setChangeLogs([])
      _setLoading(false)
      return
    }

    fetchDashboardData()
  }, [isAuthenticated, user?.user_type, authLoading])

  /**
   * Fetch university dashboard data from API
   */
  const fetchDashboardData = async () => {
    try {
      _setLoading(true)
      _setError(null)

      const response = await dashboardService.getUniversityDashboard()

      // Transform API response to match our data structure
      // API returns: pending_verifications, recent_notifications, recent_changes
      if (response.data.pending_verifications && Array.isArray(response.data.pending_verifications)) {
        // Cast to Admission[] - API returns extended Admission type with verification fields
        setAdmissions(response.data.pending_verifications as any)
      } else {
        setAdmissions(cloneAdmissions())
      }

      if (response.data.recent_notifications && Array.isArray(response.data.recent_notifications)) {
        // Cast to NotificationItem[] - API returns Notification type
        setNotifications(response.data.recent_notifications as any)
      } else {
        setNotifications(cloneNotifications())
      }

      if (response.data.recent_changes && Array.isArray(response.data.recent_changes)) {
        // Cast to ChangeLogItem[] - API returns ChangeLog type
        setChangeLogs(response.data.recent_changes as any)
      } else {
        setChangeLogs(cloneChangeLogs())
      }

      console.debug('[UniversityDataContext] Dashboard data fetched successfully')
    } catch (err: any) {
      console.error('[UniversityDataContext] Failed to fetch dashboard data:', err)
      _setError(err.message || 'Failed to load dashboard data')

      // Fallback to mock data
      setAdmissions(cloneAdmissions())
      setNotifications(cloneNotifications())
      setChangeLogs(cloneChangeLogs())
    } finally {
      _setLoading(false)
    }
  }

  const appendChangeLog = useCallback((entry: Omit<ChangeLogItem, 'id'>) => {
    setChangeLogs((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev.map((log) => log.id)) + 1 : 1
      const withId: ChangeLogItem = { ...entry, id: nextId }
      return [withId, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1))
    })
  }, [])

  const createOrUpdateAdmission = useCallback(
    (admission: Admission, options?: { diff?: ChangeLogItem['diff']; modifiedBy?: string }) => {
      setAdmissions((prev) => {
        const exists = prev.some((item) => item.id === admission.id)
        if (exists) {
          return prev.map((item) => (item.id === admission.id ? { ...item, ...admission } : item))
        }
        return [...prev, admission]
      })

      if (options?.diff && options.diff.length > 0) {
        appendChangeLog({
          admission: admission.title,
          modifiedBy: options.modifiedBy ?? 'Rep_01',
          date: formatNow(),
          diff: options.diff,
        })
      }
    },
    [appendChangeLog],
  )

  const deleteAdmission = useCallback((id: string) => {
    setAdmissions((prev) => prev.filter((admission) => admission.id !== id))
  }, [])

  const getAdmissionById = useCallback(
    (id: string) => {
      return admissions.find((admission) => admission.id === id)
    },
    [admissions],
  )

  const markNotificationRead = useCallback((id: number) => {
    setNotifications((prev) => prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }, [])

  const refreshNotifications = useCallback(() => {
    setNotifications(cloneNotifications())
  }, [])

  const audits = useMemo(() => deriveAudits(admissions), [admissions])

  const value: UniversityDataContextValue = {
    admissions,
    changeLogs,
    notifications,
    audits,
    createOrUpdateAdmission,
    deleteAdmission,
    getAdmissionById,
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications,
    appendChangeLog,
  }

  return <UniversityDataContext.Provider value={value}>{children}</UniversityDataContext.Provider>
}

export function useUniversityData() {
  const context = useContext(UniversityDataContext)
  if (!context) {
    throw new Error('useUniversityData must be used within a UniversityDataProvider')
  }
  return context
}


