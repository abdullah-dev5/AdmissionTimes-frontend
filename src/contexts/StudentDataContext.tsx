import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  sharedAdmissions,
  sharedNotifications,
  type StudentAdmission,
  type StudentNotification,
} from '../data/studentData'
import { dashboardService } from '../services/dashboardService'
import { watchlistsService } from '../services/watchlistsService'
import { notificationsService } from '../services/notificationsService'
import { transformAdmission, transformNotification } from '../utils/transformers'
import { useToast } from './ToastContext'
import { useAuth } from './AuthContext'

interface StudentDataContextValue {
  admissions: StudentAdmission[]
  notifications: StudentNotification[]
  savedAdmissions: StudentAdmission[]
  loading: boolean
  error: string | null
  stats: {
    active_admissions: number
    saved_count: number
    upcoming_deadlines: number
    recommendations_count: number
    unread_notifications: number
    urgent_deadlines: number
  } | null
  toggleSaved: (id: string) => void
  toggleAlert: (id: string) => void
  updateAdmission: (id: string, updates: Partial<StudentAdmission>) => void
  getAdmissionById: (id: string) => StudentAdmission | undefined
  getAdmissionsByIds: (ids: string[]) => StudentAdmission[]
  refreshAdmissions: () => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  refreshNotifications: () => void
}

const StudentDataContext = createContext<StudentDataContextValue | undefined>(undefined)

// Fallback to mock data if API fails
const cloneAdmissions = () => sharedAdmissions.map((admission) => ({ ...admission }))

const cloneNotifications = () =>
  [...sharedNotifications].map((notification) => ({ ...notification })).sort((a, b) => (a.time < b.time ? 1 : -1))

export function StudentDataProvider({ children }: { children: ReactNode }) {
  const [admissions, setAdmissions] = useState<StudentAdmission[]>([])
  const [notifications, setNotifications] = useState<StudentNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<StudentDataContextValue['stats']>(null)
  const { showError } = useToast()
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()

  // Fetch dashboard data only when authenticated
  useEffect(() => {
    // Don't fetch if auth is still loading
    if (authLoading) {
      return
    }

    // Only fetch if user is authenticated and is a student
    const userType = user?.role || user?.user_type;
    if (isAuthenticated && userType === 'student') {
      fetchDashboardData()
    } else {
      // Clear data and set as not loading if not authenticated
      setAdmissions([])
      setNotifications([])
      setLoading(false)
    }
  }, [isAuthenticated, user?.role, user?.user_type, authLoading])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch dashboard data from API
      const response = await dashboardService.getStudentDashboard()

      // Transform recommended programs to StudentAdmission format
      const transformedAdmissions = response.data.recommended_programs.map((prog) =>
        transformAdmission(
          {
            id: prog.id,
            university_id: prog.university_id,
            title: prog.title,
            degree_level: prog.degree_level,
            deadline: prog.deadline,
            application_fee: prog.application_fee,
            location: prog.location,
            description: null,
            verification_status: prog.verification_status,
            status: 'active',
            created_at: '',
            updated_at: '',
          },
          prog.saved
            ? {
                id: '',
                user_id: '',
                admission_id: prog.id,
                saved_at: '',
                alert_opt_in: prog.alert_enabled,
                notes: null,
              }
            : undefined,
          prog.university_name
        )
      )

      // Transform notifications
      const transformedNotifications = response.data.recent_notifications.map((notif) =>
        transformNotification(notif)
      )

      setAdmissions(transformedAdmissions)
      setNotifications(transformedNotifications)
      setStats(response.data.stats)
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err.message || 'Failed to fetch dashboard data')
      
      // Fallback to mock data on error
      setAdmissions(cloneAdmissions())
      setNotifications(cloneNotifications())
      
      showError('Failed to load dashboard data. Using offline data.')
    } finally {
      setLoading(false)
    }
  }, [showError])

  const toggleSaved = useCallback(async (id: string) => {
    const admission = admissions.find((a) => a.id === id)
    if (!admission) return

    // Optimistic update - update UI immediately
    const wasSaved = admission.saved
    setAdmissions((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              saved: !wasSaved,
              alertEnabled: !wasSaved ? a.alertEnabled : false,
            }
          : a
      )
    )

    try {
      if (wasSaved) {
        // Remove from watchlist
        await watchlistsService.removeByAdmissionId(id)
      } else {
        // Add to watchlist
        await watchlistsService.add(id, admission.alertEnabled || false)
      }
    } catch (err: any) {
      console.error('Failed to toggle saved:', err)
      
      // Rollback optimistic update
      setAdmissions((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                saved: wasSaved,
                alertEnabled: wasSaved ? a.alertEnabled : false,
              }
            : a
        )
      )

      // Show user-friendly error message
      const errorMessage =
        err.response?.status === 500 &&
        err.response?.data?.message?.includes('foreign key constraint')
          ? 'User account not found. Please ensure you are logged in with a valid user account.'
          : err.response?.data?.message || 'Failed to update saved programs. Please try again.'
      
      showError(errorMessage)
    }
  }, [admissions, showError])

  const toggleAlert = useCallback(async (id: string) => {
    const admission = admissions.find((a) => a.id === id)
    if (!admission || !admission.saved) return

    try {
      // Find watchlist ID (would need to fetch watchlists or store ID)
      // For now, update locally and sync later
      setAdmissions((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                alertEnabled: !a.alertEnabled,
              }
            : a
        )
      )
      // TODO: Update watchlist alert_opt_in via API
    } catch (err: any) {
      console.error('Failed to toggle alert:', err)
      showError('Failed to update alert settings')
    }
  }, [admissions, showError])

  const updateAdmission = useCallback((id: string, updates: Partial<StudentAdmission>) => {
    setAdmissions((prev) => prev.map((admission) => (admission.id === id ? { ...admission, ...updates } : admission)))
  }, [])

  const refreshAdmissions = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const getAdmissionById = useCallback(
    (id: string) => {
      return admissions.find((admission) => admission.id === id)
    },
    [admissions],
  )

  const getAdmissionsByIds = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids)
      return admissions.filter((admission) => idSet.has(admission.id))
    },
    [admissions],
  )

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await notificationsService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
      )
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err)
      // Update locally anyway
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
      )
    }
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead()
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    } catch (err: any) {
      console.error('Failed to mark all notifications as read:', err)
      // Update locally anyway
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    }
  }, [])

  const refreshNotifications = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const savedAdmissions = useMemo(() => admissions.filter((admission) => admission.saved), [admissions])

  const value: StudentDataContextValue = {
    admissions,
    notifications,
    savedAdmissions,
    loading,
    error,
    stats,
    toggleSaved,
    toggleAlert,
    updateAdmission,
    getAdmissionById,
    getAdmissionsByIds,
    refreshAdmissions,
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications,
  }

  return <StudentDataContext.Provider value={value}>{children}</StudentDataContext.Provider>
}

export function useStudentData() {
  const context = useContext(StudentDataContext)
  if (!context) {
    throw new Error('useStudentData must be used within a StudentDataProvider')
  }
  return context
}


