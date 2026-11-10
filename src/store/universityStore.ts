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
import { notificationsService } from '../services/notificationsService'
import { transformUniversityDashboard } from '../utils/dashboardTransformers'
import { transformAdmissionToApi, transformApiAdmissionToFrontend } from '../utils/admissionUtils'
import {
  type Admission,
  type AuditItem,
  type AuditStatus,
  type ChangeLogItem,
  type NotificationItem,
} from '../data/universityData'
import { toApiError } from '../services/apiClient'

const isDashboardDebugEnabled = import.meta.env.VITE_DEBUG_DASHBOARD === 'true'

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
    reminder_notifications?: number
  } | null
  engagementTrends: {
    labels: string[]
    views: number[]
    clicks: number[]
    reminders: number[]
    saves: number[]
  }
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
  fetchNotifications: (options?: { page?: number; limit?: number; showError?: (msg: string) => void }) => Promise<void>
  markNotificationRead: (id: number | string) => void
  markAllNotificationsRead: () => void
  refreshNotifications: () => void
  reset: () => void
}

const deriveAudits = (admissions: Admission[]): AuditItem[] =>
  admissions
    .filter((admission) => ['Pending Audit', 'Verified', 'Rejected'].includes(admission.status))
    .map((admission, index) => ({
      id: index + 1,
      title: admission.title,
      status: (admission.status === 'Pending Audit' ? 'Pending' : admission.status) as AuditStatus,
      verifiedBy: admission.verifiedBy,
      lastAction: admission.lastAction || '',
      remarks:
        admission.rejection_reason ||
        admission.verification_comments ||
        admission.admin_notes ||
        admission.remarks ||
        '',
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


const initialState = {
  admissions: [] as Admission[],
  changeLogs: [] as ChangeLogItem[],
  notifications: [] as NotificationItem[],
  audits: [] as AuditItem[],
  stats: null,
  engagementTrends: {
    labels: [],
    views: [],
    clicks: [],
    reminders: [],
    saves: [],
  },
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


      if (response?.data) {
        const transformed = transformUniversityDashboard(response.data)
        const admissions = transformed.admissions
        const notifications = transformed.notifications
        const changeLogs = transformed.changeLogs
        const engagementTrends = transformed.engagementTrends
        const audits = deriveAudits(admissions)
        const stats = response.data.stats || deriveStats(admissions, changeLogs, notifications)


        set({
          admissions,
          notifications,
          changeLogs,
          audits,
          stats,
          engagementTrends,
          fetchedUserId: options?.userId || null,
        })

        if (isDashboardDebugEnabled) console.log('🟢 [UniversityStore] ✅ State updated successfully')
      } else {
        const admissions: Admission[] = []
        const notifications: NotificationItem[] = []
        const changeLogs: ChangeLogItem[] = []
        set({
          admissions,
          notifications,
          changeLogs,
          engagementTrends: {
            labels: [],
            views: [],
            clicks: [],
            reminders: [],
            saves: [],
          },
          audits: deriveAudits(admissions),
          stats: deriveStats(admissions, changeLogs, notifications),
          fetchedUserId: options?.userId || null,
        })
        console.warn('[UniversityStore] No data in response, showing empty dashboard state')
      }
    } catch (err) {
      console.error('[UniversityStore] Failed to fetch dashboard data:', err)
      const errorMsg = toApiError(err).message || 'Failed to load dashboard data'
      set({
        error: errorMsg,
        admissions: [],
        notifications: [],
        changeLogs: [],
        engagementTrends: {
          labels: [],
          views: [],
          clicks: [],
          reminders: [],
          saves: [],
        },
        audits: [],
        stats: deriveStats([], [], []),
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

    try {
      const universityId = userId

      if (!universityId) {
        throw new Error('Your account is not linked to a university. Please contact an administrator.')
      }


      const apiPayload = transformAdmissionToApi(admission, universityId)

      const isUpdate = admission.id && !admission.id.startsWith('adm-')

      let savedAdmission: Admission
      if (isUpdate) {
        const updatePayload = {
          ...apiPayload,
        }
        const apiResponse = await admissionsService.update(admission.id, updatePayload)
        savedAdmission = transformApiAdmissionToFrontend(apiResponse.data)
      } else {
        const apiResponse = await admissionsService.create(apiPayload)
        savedAdmission = transformApiAdmissionToFrontend(apiResponse.data)
      }


      set((state) => {
        const exists = state.admissions.some((item) => item.id === savedAdmission.id)
        let newAdmissions: Admission[]

        if (exists) {
          newAdmissions = state.admissions.map((item) => (item.id === savedAdmission.id ? savedAdmission : item))
        } else {
          newAdmissions = [...state.admissions, savedAdmission]
        }

        return {
          admissions: newAdmissions,
          audits: deriveAudits(newAdmissions),
          stats: deriveStats(newAdmissions, state.changeLogs, state.notifications),
        }
      })


      return { success: true, data: savedAdmission }
    } catch (error) {
      console.error('[UniversityStore] Failed to save admission:', error)

      // Extract error message from response
      let errorMessage = 'Failed to save admission'
      
      const apiError = toApiError(error).response?.data
      if (apiError) {
        // First try to use the message field
        if (apiError.message) {
          errorMessage = apiError.message
          // If it's a validation error, add field details
          if (apiError.errors && typeof apiError.errors === 'object') {
            const fieldErrors = Object.entries(apiError.errors)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join(', ')
            errorMessage = `${apiError.message} - ${fieldErrors}`
          }
        } else if (apiError.error) {
          errorMessage = apiError.error
        }
      } else {
        const message = toApiError(error).message
        if (message && message !== 'Object') errorMessage = message
      }

      set({ error: errorMessage })

      if (options?.showError) {
        options.showError(`Error: ${errorMessage}`)
      }

      return { success: false, error: errorMessage }
    }
  },

  // Delete Admission
  deleteAdmission: async (id) => {

    try {
      await admissionsService.delete(id)

      set((state) => {
        const newAdmissions = state.admissions.filter((admission) => admission.id !== id)
        return {
          admissions: newAdmissions,
          audits: deriveAudits(newAdmissions),
          stats: deriveStats(newAdmissions, state.changeLogs, state.notifications),
        }
      })


      return { success: true }
    } catch (error) {
      console.error('🔴 [UniversityStore] Failed to delete admission:', error)

      const errorMessage = toApiError(error).message || 'Failed to delete admission'
      set({ error: errorMessage })

      return { success: false, error: errorMessage }
    }
  },

  // Get Admission By ID
  getAdmissionById: (id) => {
    return get().admissions.find((admission) => admission.id === id)
  },

  // Fetch Notifications from API
  fetchNotifications: async (options?: { page?: number; limit?: number; showError?: (msg: string) => void }) => {
    try {
      const response = await notificationsService.list({
        role_type: 'university',
        page: options?.page || 1,
        limit: options?.limit || 50,
      })
      
      if (response.data && Array.isArray(response.data)) {
        // Convert API notifications to NotificationItem format
        // Preserve backend notification IDs so read actions can be persisted
        const transformedNotifications: NotificationItem[] = response.data.map((notif) => ({
          id: notif.id,
          title: notif.title || 'Notification',
          message: notif.message || '',
          type: notif.notification_type === 'system_broadcast' ? 'System Alert' : 'Admin Feedback',
          time: notif.created_at,
          read: Boolean(notif.is_read),
          // The admission comes from the link (e.g. /university/manage-admissions?edit=<id>).
          admissionId: /[?&](?:edit|admission)=([0-9a-f-]{36})/i.exec(notif.action_url || '')?.[1]
            || (notif.related_entity_type === 'admission' ? notif.related_entity_id || undefined : undefined),
        }))
        
        set({
          notifications: transformedNotifications,
          stats: deriveStats(get().admissions, get().changeLogs, transformedNotifications),
        })
      }
    } catch (err) {
      console.error('❌ Failed to fetch notifications:', err)
      options?.showError?.('Failed to load notifications')
    }
  },

  // Optimistic; restored if the server rejects it (the list must match the server).
  markNotificationRead: (id: number | string) => {
    const before = get().notifications
    const apply = (notifications: NotificationItem[]) =>
      set((state) => ({ notifications, stats: deriveStats(state.admissions, state.changeLogs, notifications) }))
    apply(before.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)))
    void notificationsService.markAsRead(String(id)).catch(() => apply(before))
  },

  markAllNotificationsRead: () => {
    const before = get().notifications
    const apply = (notifications: NotificationItem[]) =>
      set((state) => ({ notifications, stats: deriveStats(state.admissions, state.changeLogs, notifications) }))
    apply(before.map((notification) => ({ ...notification, read: true })))
    void notificationsService.markAllAsRead().catch(() => apply(before))
  },

  // Refresh Notifications
  refreshNotifications: () => {
    void get().fetchNotifications({ page: 1, limit: 50 })
  },


  // Reset
  reset: () => set(initialState),
}))
