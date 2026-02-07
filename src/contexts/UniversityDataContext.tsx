import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { dashboardService } from '../services/dashboardService'
import { admissionsService } from '../services/admissionsService'
import { transformUniversityDashboard } from '../utils/dashboardTransformers'
import { transformAdmissionToApi } from '../utils/admissionUtils'
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
  ) => Promise<{ success: boolean; data?: Admission; error?: string }>
  deleteAdmission: (id: string) => Promise<{ success: boolean; error?: string }>
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
    const userRole = user?.role || user?.user_type
    if (!isAuthenticated || userRole !== 'university') {
      setAdmissions([])
      setNotifications([])
      setChangeLogs([])
      _setLoading(false)
      return
    }

    fetchDashboardData()
  }, [isAuthenticated, user?.role, user?.user_type, authLoading])

  /**
   * Fetch university dashboard data from API
   */
  const fetchDashboardData = async () => {
    try {
      _setLoading(true)
      _setError(null)

      const response = await dashboardService.getUniversityDashboard()
      
      console.log('🟢 [UniversityDataContext] Dashboard API response:', response)
      console.log('🟢 [UniversityDataContext] Response data:', response?.data)
      
      // Transform backend API response to frontend data structure
      if (response?.data) {
        const transformed = transformUniversityDashboard(response.data)
        
        console.log('🟢 [UniversityDataContext] Transformed admissions count:', transformed.admissions.length)
        console.log('🟢 [UniversityDataContext] About to set admissions state with:', transformed.admissions)
        
        setAdmissions(transformed.admissions.length > 0 ? transformed.admissions : cloneAdmissions())
        setNotifications(transformed.notifications.length > 0 ? transformed.notifications : cloneNotifications())
        setChangeLogs(transformed.changeLogs.length > 0 ? transformed.changeLogs : cloneChangeLogs())
        
        console.log('🟢 [UniversityDataContext] ✅ State updated successfully')
        console.debug('[UniversityDataContext] Dashboard data fetched and transformed successfully')
      } else {
        // Fallback to mock data if response is empty
        setAdmissions(cloneAdmissions())
        setNotifications(cloneNotifications())
        setChangeLogs(cloneChangeLogs())
        console.warn('[UniversityDataContext] No data in response, using fallback mock data')
      }
    } catch (err: any) {
      console.error('[UniversityDataContext] Failed to fetch dashboard data:', err)
      _setError(err.message || 'Failed to load dashboard data')

      // Fallback to mock data on error
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
    async (admission: Admission, options?: { diff?: ChangeLogItem['diff']; modifiedBy?: string }) => {
      console.log('🟢 [UniversityDataContext] Creating/Updating admission:', admission.id, admission.title)
      console.log('🟢 [UniversityDataContext] Admission verification_status:', admission.verification_status)
      
      try {
        // Get university_id from authenticated user (backend returns this field)
        console.log('🟢 [UniversityDataContext] Current user:', user)
        console.log('🟢 [UniversityDataContext] user.organization_id:', user?.organization_id)
        console.log('🟢 [UniversityDataContext] user.university_id:', user?.university_id)
        console.log('🟢 [UniversityDataContext] user.id:', user?.id)
        
        // Priority: university_id (from backend) → organization_id → user_id
        const universityId = user?.university_id || user?.organization_id || user?.id
        
        if (!universityId) {
          console.error('🔴 [UniversityDataContext] No organization_id/university_id found in user session')
          throw new Error('University ID not found. Please ensure you are logged in as a university user.')
        }
        
        console.log('🟢 [UniversityDataContext] ✅ Using university_id:', universityId)

        // Transform frontend admission format to backend API format
        const apiPayload = transformAdmissionToApi(admission, universityId)
        console.log('🟢 [UniversityDataContext] API payload:', apiPayload)
        console.log('🟢 [UniversityDataContext] API payload.university_id:', apiPayload.university_id)
        console.log('🟢 [UniversityDataContext] API payload.verification_status:', apiPayload.verification_status)
        
        // Determine if creating new or updating existing
        const isUpdate = admission.id && !admission.id.startsWith('adm-')
        
        let savedAdmission: Admission
        if (isUpdate) {
          console.log('🟢 [UniversityDataContext] Updating admission via Supabase:', admission.id)
          // Use direct Supabase update (Phase 1 - bypasses backend)
          savedAdmission = await admissionsService.updateDirect(admission.id, apiPayload)
        } else {
          console.log('🟢 [UniversityDataContext] Creating new admission via Supabase')
          // Use direct Supabase create (Phase 1 - bypasses backend)
          savedAdmission = await admissionsService.createDirect(apiPayload)
        }

        console.log('🟢 [UniversityDataContext] ✅ Supabase operation successful:', savedAdmission)
        console.log('🟢 [UniversityDataContext] ✅ Saved verification_status:', savedAdmission?.verification_status)

        // Update local state with the saved admission
        setAdmissions((prev) => {
          const exists = prev.some((item) => item.id === savedAdmission.id)
          if (exists) {
            console.log('🟢 [UniversityDataContext] Updating existing admission in state')
            const updated = prev.map((item) => (item.id === savedAdmission.id ? savedAdmission : item))
            console.log('🟢 [UniversityDataContext] Updated admissions count:', updated.length)
            return updated
          }
          console.log('🟢 [UniversityDataContext] Adding new admission to state')
          const added = [...prev, savedAdmission]
          console.log('🟢 [UniversityDataContext] New admissions count:', added.length)
          return added
        })

        // Create changelog entry if there are changes
        if (options?.diff && options.diff.length > 0) {
          console.log('[UniversityDataContext] Appending changelog with', options.diff.length, 'changes')
          appendChangeLog({
            admission: savedAdmission.title,
            modifiedBy: options.modifiedBy ?? 'Rep_01',
            date: formatNow(),
            diff: options.diff,
          })
        }

        return { success: true, data: savedAdmission }
      } catch (error: any) {
        console.error('[UniversityDataContext] Failed to save admission:', error)
        
        // Show user-friendly error message
        const errorMessage = error.response?.data?.error || error.message || 'Failed to save admission'
        alert(`Error: ${errorMessage}`)
        
        return { success: false, error: errorMessage }
      }
    },
    [appendChangeLog, user],
  )

  const deleteAdmission = useCallback(async (id: string) => {
    console.log('🟢 [UniversityDataContext] Deleting admission:', id)
    
    try {
      // Use direct Supabase delete (Phase 1 - bypasses backend)
      // RLS policy ensures only university owner or admin can delete
      await admissionsService.deleteDirect(id)
      console.log('🟢 [UniversityDataContext] Delete successful')
      
      // Update local state only after successful deletion
      setAdmissions((prev) => prev.filter((admission) => admission.id !== id))
      console.log('🟢 [UniversityDataContext] Admission deleted successfully from local state')
      
      return { success: true }
    } catch (error: any) {
      console.error('🔴 [UniversityDataContext] Failed to delete admission:', error)
      
      const errorMessage = error.message || 'Failed to delete admission'
      return { success: false, error: errorMessage }
    }
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


