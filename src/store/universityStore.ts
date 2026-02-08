/**
 * University Data Store (Zustand)
 * 
 * Complete university module state management including admissions,
 * changeLogs, notifications, and audit operations.
 * 
 * @module store/universityStore
 */

import { create } from 'zustand'
import { dashboardService } from '../services/dashboardService'
import { admissionsService } from '../services/admissionsService'
import { transformUniversityDashboard } from '../utils/dashboardTransformers'
import { transformAdmissionToApi, transformApiAdmissionToFrontend } from '../utils/admissionUtils'
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

interface UniversityStoreState {
  // State
  admissions: Admission[]
  changeLogs: ChangeLogItem[]
  notifications: NotificationItem[]
  audits: AuditItem[]
  stats: {
    total_admissions: number
    pending_verification: number
    verified_admissions: number
    recent_changes: number
    unread_notifications: number
  } | null
  loading: boolean
  error: string | null
  fetchedUserId: string | null

  // Actions
  fetchDashboardData: (options?: { showError?: (msg: string) => void; userId?: string }) => Promise<void>
  createOrUpdateAdmission: (
    admission: Admission,
    userId?: string,
    options?: { diff?: ChangeLogItem['diff']; modifiedBy?: string; showError?: (msg: string) => void }
  ) => Promise<{ success: boolean; data?: Admission; error?: string }>
  deleteAdmission: (id: string) => Promise<{ success: boolean; error?: string }>
  getAdmissionById: (id: string) => Admission | undefined
  markNotificationRead: (id: number) => void
  markAllNotificationsRead: () => void
  refreshNotifications: () => void
  appendChangeLog: (entry: Omit<ChangeLogItem, 'id'>) => void
  reset: () => void
}

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

const deriveStats = (
  admissions: Admission[],
  changeLogs: ChangeLogItem[],
  notifications: NotificationItem[],
) => {
  const pending = admissions.filter((admission) =>
    admission.status === 'Pending Audit' || admission.verification_status === 'pending'
  ).length

  const verified = admissions.filter((admission) =>
    admission.status === 'Verified' || admission.verification_status === 'verified'
  ).length

  return {
    total_admissions: admissions.length,
    pending_verification: pending,
    verified_admissions: verified,
    recent_changes: changeLogs.length,
    unread_notifications: notifications.filter((notification) => !notification.read).length,
  }
}

const formatNow = () => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

const initialState = {
  admissions: [] as Admission[],
  changeLogs: [] as ChangeLogItem[],
  notifications: [] as NotificationItem[],
  audits: [] as AuditItem[],
  stats: null,
  loading: false,
  error: null,
  fetchedUserId: null,
}

export const useUniversityStore = create<UniversityStoreState>((set, get) => ({
  // Initial State
  ...initialState,

  // Fetch Dashboard Data
  fetchDashboardData: async (options) => {
    try {
      set({ loading: true, error: null })

      const response = await dashboardService.getUniversityDashboard()

      console.log('🟢 [UniversityStore] Dashboard API response:', response)
      console.log('🟢 [UniversityStore] Response data:', response?.data)

      if (response?.data) {
        const transformed = transformUniversityDashboard(response.data)
        const admissions = transformed.admissions.length > 0 ? transformed.admissions : cloneAdmissions()
        const notifications = transformed.notifications.length > 0 ? transformed.notifications : cloneNotifications()
        const changeLogs = transformed.changeLogs.length > 0 ? transformed.changeLogs : cloneChangeLogs()
        const audits = deriveAudits(admissions)
        const stats = response.data.stats || deriveStats(admissions, changeLogs, notifications)

        console.log('🟢 [UniversityStore] Transformed admissions count:', transformed.admissions.length)
        console.log('🟢 [UniversityStore] About to set admissions state with:', transformed.admissions)

        set({
          admissions,
          notifications,
          changeLogs,
          audits,
          stats,
          fetchedUserId: options?.userId || null,
        })

        console.log('🟢 [UniversityStore] ✅ State updated successfully')
      } else {
        const admissions = cloneAdmissions()
        const notifications = cloneNotifications()
        const changeLogs = cloneChangeLogs()
        set({
          admissions,
          notifications,
          changeLogs,
          audits: deriveAudits(admissions),
          stats: deriveStats(admissions, changeLogs, notifications),
          fetchedUserId: options?.userId || null,
        })
        console.warn('[UniversityStore] No data in response, using fallback mock data')
      }
    } catch (err: any) {
      console.error('[UniversityStore] Failed to fetch dashboard data:', err)
      const errorMsg = err.message || 'Failed to load dashboard data'
      set({ error: errorMsg })

      // Fallback to mock data on error
      const admissions = cloneAdmissions()
      const notifications = cloneNotifications()
      const changeLogs = cloneChangeLogs()
      set({
        admissions,
        notifications,
        changeLogs,
        audits: deriveAudits(admissions),
        stats: deriveStats(admissions, changeLogs, notifications),
      })

      if (options?.showError) {
        options.showError(errorMsg)
      }
    } finally {
      set({ loading: false })
    }
  },

  // Create or Update Admission
  createOrUpdateAdmission: async (admission, userId, options) => {
    console.log('🟢 [UniversityStore] Creating/Updating admission:', admission.id, admission.title)
    console.log('🟢 [UniversityStore] Admission verification_status:', admission.verification_status)

    try {
      const universityId = userId

      if (!universityId) {
        console.error('🔴 [UniversityStore] No university ID found')
        throw new Error('University ID not found. Please ensure you are logged in as a university user.')
      }

      console.log('🟢 [UniversityStore] ✅ Using university_id:', universityId)

      const apiPayload = transformAdmissionToApi(admission, universityId)
      console.log('🟢 [UniversityStore] API payload:', apiPayload)
      console.log('🟢 [UniversityStore] API payload.university_id:', apiPayload.university_id)
      console.log('🟢 [UniversityStore] API payload.verification_status:', apiPayload.verification_status)

      const isUpdate = admission.id && !admission.id.startsWith('adm-')

      let savedAdmission: Admission
      if (isUpdate) {
        console.log('🟢 [UniversityStore] Updating admission via Supabase:', admission.id)
        const apiResult = await admissionsService.updateDirect(admission.id, apiPayload)
        savedAdmission = transformApiAdmissionToFrontend(apiResult)
      } else {
        console.log('🟢 [UniversityStore] Creating new admission via Supabase')
        const apiResult = await admissionsService.createDirect(apiPayload)
        savedAdmission = transformApiAdmissionToFrontend(apiResult)
      }

      console.log('🟢 [UniversityStore] ✅ Supabase operation successful:', savedAdmission)
      console.log('🟢 [UniversityStore] ✅ Saved verification_status:', savedAdmission?.verification_status)

      set((state) => {
        const exists = state.admissions.some((item) => item.id === savedAdmission.id)
        let newAdmissions: Admission[]

        if (exists) {
          console.log('🟢 [UniversityStore] Updating existing admission in state')
          newAdmissions = state.admissions.map((item) => (item.id === savedAdmission.id ? savedAdmission : item))
          console.log('🟢 [UniversityStore] Updated admissions count:', newAdmissions.length)
        } else {
          console.log('🟢 [UniversityStore] Adding new admission to state')
          newAdmissions = [...state.admissions, savedAdmission]
          console.log('🟢 [UniversityStore] New admissions count:', newAdmissions.length)
        }

        return {
          admissions: newAdmissions,
          audits: deriveAudits(newAdmissions),
          stats: deriveStats(newAdmissions, state.changeLogs, state.notifications),
        }
      })

      // Create changelog entry if there are changes
      if (options?.diff && options.diff.length > 0) {
        console.log('[UniversityStore] Appending changelog with', options.diff.length, 'changes')
        get().appendChangeLog({
          admission: savedAdmission.title,
          modifiedBy: options.modifiedBy ?? 'Rep_01',
          date: formatNow(),
          diff: options.diff,
        })
      }

      return { success: true, data: savedAdmission }
    } catch (error: any) {
      console.error('[UniversityStore] Failed to save admission:', error)

      const errorMessage = error.response?.data?.error || error.message || 'Failed to save admission'
      set({ error: errorMessage })

      if (options?.showError) {
        options.showError(`Error: ${errorMessage}`)
      }

      return { success: false, error: errorMessage }
    }
  },

  // Delete Admission
  deleteAdmission: async (id) => {
    console.log('🟢 [UniversityStore] Deleting admission:', id)

    try {
      await admissionsService.deleteDirect(id)
      console.log('🟢 [UniversityStore] Delete successful')

      set((state) => {
        const newAdmissions = state.admissions.filter((admission) => admission.id !== id)
        return {
          admissions: newAdmissions,
          audits: deriveAudits(newAdmissions),
          stats: deriveStats(newAdmissions, state.changeLogs, state.notifications),
        }
      })

      console.log('🟢 [UniversityStore] Admission deleted successfully from local state')

      return { success: true }
    } catch (error: any) {
      console.error('🔴 [UniversityStore] Failed to delete admission:', error)

      const errorMessage = error.message || 'Failed to delete admission'
      set({ error: errorMessage })

      return { success: false, error: errorMessage }
    }
  },

  // Get Admission By ID
  getAdmissionById: (id) => {
    return get().admissions.find((admission) => admission.id === id)
  },

  // Mark Notification Read
  markNotificationRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
      return {
        notifications,
        stats: deriveStats(state.admissions, state.changeLogs, notifications),
      }
    })
  },

  // Mark All Notifications Read
  markAllNotificationsRead: () => {
    set((state) => {
      const notifications = state.notifications.map((notification) => ({ ...notification, read: true }))
      return {
        notifications,
        stats: deriveStats(state.admissions, state.changeLogs, notifications),
      }
    })
  },

  // Refresh Notifications
  refreshNotifications: () => {
    set((state) => {
      const notifications = cloneNotifications()
      return {
        notifications,
        stats: deriveStats(state.admissions, state.changeLogs, notifications),
      }
    })
  },

  // Append Change Log
  appendChangeLog: (entry) => {
    set((state) => {
      const nextId = state.changeLogs.length > 0 ? Math.max(...state.changeLogs.map((log) => log.id)) + 1 : 1
      const withId: ChangeLogItem = { ...entry, id: nextId }
      const changeLogs = [withId, ...state.changeLogs].sort((a, b) => (a.date < b.date ? 1 : -1))
      return {
        changeLogs,
        stats: deriveStats(state.admissions, changeLogs, state.notifications),
      }
    })
  },

  // Reset
  reset: () => set(initialState),
}))
