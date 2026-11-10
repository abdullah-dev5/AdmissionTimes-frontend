/**
 * Student store (Zustand).
 *
 * Mirrors the mobile app's store: the catalog of verified admissions (open and
 * closed) is loaded once per user and shared by every student page; search and
 * filters work on top of it and never replace it. Save/reminder actions are
 * optimistic, rolled back on failure, and report the outcome.
 *
 * @module store/studentStore
 */

import { create } from 'zustand'
import type { StudentAdmission, StudentNotification } from '../data/studentData'
import { dashboardService } from '../services/dashboardService'
import { watchlistsService } from '../services/watchlistsService'
import { notificationsService } from '../services/notificationsService'
import { admissionsService } from '../services/admissionsService'
import { transformAdmission, transformNotification } from '../utils/transformers'
import { recommendationsService, type Recommendation } from '../services/recommendationsService'
import { RECOMMENDATION_COUNT_LIMIT, RECOMMENDATION_MIN_SCORE } from '../utils/recommendationUtils'
import { toApiError } from '../services/apiClient'

interface StudentStats {
  active_admissions: number
  saved_count: number
  upcoming_deadlines: number
  recommendations_count: number
  unread_notifications: number
  urgent_deadlines: number
}

type Notify = (msg: string) => void
type WatchEntry = { watchlistId: string; alertOptIn: boolean }

interface StudentStore {
  admissions: StudentAdmission[]
  notifications: StudentNotification[]
  loading: boolean
  error: string | null
  stats: StudentStats | null
  /** User whose catalog is loaded (the store is reset on sign-out). */
  fetchedUserId: string | null
  apiRecommendations: Recommendation[]
  recommendationsUserId: string | null
  recommendationsLoading: boolean

  /** Load the verified catalog and the user's watchlist (once per user unless forced). */
  loadCatalog: (userId: string, options?: { force?: boolean; showError?: Notify }) => Promise<void>
  fetchStats: () => Promise<void>
  fetchRecommendations: (userId: string, options?: { force?: boolean }) => Promise<void>
  toggleSaved: (id: string, options?: { showError?: Notify }) => Promise<boolean>
  /** Enable/disable deadline reminders. Resolves to true only when the API confirmed the change. */
  toggleAlert: (id: string, options?: { showError?: Notify; showSuccess?: Notify }) => Promise<boolean>
  getAdmissionById: (id: string) => StudentAdmission | undefined
  fetchNotifications: () => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  reset: () => void
}

const PAGE_SIZE = 100
const MAX_PAGES = 5

const initialState = {
  admissions: [] as StudentAdmission[],
  notifications: [] as StudentNotification[],
  loading: false,
  error: null as string | null,
  stats: null as StudentStats | null,
  fetchedUserId: null as string | null,
  apiRecommendations: [] as Recommendation[],
  recommendationsUserId: null as string | null,
  recommendationsLoading: false,
}

let catalogInFlight: Promise<void> | null = null

const withWatchState = (admission: StudentAdmission, entry: WatchEntry | undefined): StudentAdmission => ({
  ...admission,
  saved: Boolean(entry),
  alertEnabled: entry?.alertOptIn ?? false,
  watchlistId: entry?.watchlistId,
})

/** All verified admissions (students only ever receive verified ones), open and closed. */
const fetchCatalog = async () => {
  const rows = []
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await admissionsService.listPublic({ page, limit: PAGE_SIZE, include_closed: true })
    rows.push(...response.data)
    if (!response.pagination?.hasNext) break
  }
  return rows
}

export const useStudentStore = create<StudentStore>()((set, get) => {
  const entryOf = (id: string): WatchEntry | undefined => {
    const admission = get().admissions.find((a) => a.id === id)
    return admission?.saved ? { watchlistId: admission.watchlistId ?? '', alertOptIn: Boolean(admission.alertEnabled) } : undefined
  }

  const applyEntry = (id: string, entry: WatchEntry | undefined) =>
    set((state) => ({ admissions: state.admissions.map((a) => (a.id === id ? withWatchState(a, entry) : a)) }))

  /** A program opened from a direct link may not be in the catalog yet. */
  const ensureInCatalog = async (id: string) => {
    if (get().admissions.some((a) => a.id === id)) return
    const response = await admissionsService.getById(id)
    if (response.data) set((state) => ({ admissions: [...state.admissions, transformAdmission(response.data)] }))
  }

  return {
    ...initialState,

    loadCatalog: async (userId, options) => {
      if (catalogInFlight) return catalogInFlight
      if (!options?.force && get().fetchedUserId === userId && get().admissions.length > 0) return

      const run = async () => {
        set({ loading: true, error: null })
        try {
          const [catalog, watchlists] = await Promise.all([
            fetchCatalog(),
            watchlistsService.list({ page: 1, limit: 100 }).then((r) => r.data),
          ])
          const byAdmission = new Map(watchlists.map((w) => [String(w.admission_id), w]))
          set({
            admissions: catalog.map((row) => transformAdmission(row, byAdmission.get(String(row.id)))),
            fetchedUserId: userId,
            loading: false,
            error: null,
          })
        } catch (err) {
          const message = toApiError(err).message || 'Failed to load admissions'
          set({ loading: false, error: message })
          options?.showError?.('Failed to load admissions. Please try again.')
        }
      }

      catalogInFlight = run()
      try {
        await catalogInFlight
      } finally {
        catalogInFlight = null
      }
    },

    fetchStats: async () => {
      try {
        const response = await dashboardService.getStudentDashboard()
        set({ stats: response.data.stats })
      } catch {
        // Stats are informational; keep the previous values.
      }
    },

    fetchRecommendations: async (userId, options) => {
      const { apiRecommendations, recommendationsUserId, recommendationsLoading } = get()
      if (recommendationsLoading) return
      if (!options?.force && recommendationsUserId === userId && apiRecommendations.length > 0) return

      set({ recommendationsLoading: true })
      try {
        const response = await recommendationsService.getRecommendations(RECOMMENDATION_COUNT_LIMIT, RECOMMENDATION_MIN_SCORE)
        set({
          recommendationsLoading: false,
          recommendationsUserId: userId,
          apiRecommendations: response?.data?.recommendations || [],
        })
      } catch {
        set({ recommendationsLoading: false })
      }
    },

    toggleSaved: async (id, options) => {
      const before = entryOf(id)
      const save = !before
      // Saving turns reminders on by default (same as mobile).
      applyEntry(id, save ? { watchlistId: '', alertOptIn: true } : undefined)
      try {
        if (save) {
          await ensureInCatalog(id)
          const response = await watchlistsService.add(id, true)
          applyEntry(id, { watchlistId: String(response.data.id), alertOptIn: response.data.alert_opt_in === true })
        } else if (before?.watchlistId) {
          await watchlistsService.remove(before.watchlistId)
        } else {
          await watchlistsService.removeByAdmissionId(id)
        }
        void get().fetchStats()
        return true
      } catch {
        applyEntry(id, before)
        options?.showError?.('Failed to update saved programs. Please try again.')
        return false
      }
    },

    toggleAlert: async (id, options) => {
      const before = entryOf(id)
      const enable = !before?.alertOptIn
      applyEntry(id, { watchlistId: before?.watchlistId ?? '', alertOptIn: enable })
      try {
        let entry: WatchEntry
        if (before?.watchlistId) {
          const response = await watchlistsService.update(before.watchlistId, { alert_opt_in: enable })
          entry = { watchlistId: String(response.data.id), alertOptIn: response.data.alert_opt_in === true }
        } else {
          // Not saved yet: saving with reminders on.
          await ensureInCatalog(id)
          const response = await watchlistsService.add(id, enable)
          entry = { watchlistId: String(response.data.id), alertOptIn: response.data.alert_opt_in === true }
        }
        applyEntry(id, entry)
        void get().fetchStats()
        options?.showSuccess?.(enable ? 'Reminders on. We will remind you 7, 3 and 1 day before the deadline.' : 'Reminders off.')
        return entry.alertOptIn === enable
      } catch {
        applyEntry(id, before)
        options?.showError?.('Failed to update reminders. Please try again.')
        return false
      }
    },

    getAdmissionById: (id) => get().admissions.find((a) => a.id === id),

    fetchNotifications: async () => {
      try {
        const response = await notificationsService.list({ page: 1, limit: 50 })
        set({ notifications: response.data.map(transformNotification), error: null })
      } catch (err) {
        set({ error: toApiError(err).message || 'Failed to load notifications' })
      }
    },

    // Optimistic; restored if the server rejects it (the list must match the server).
    markNotificationRead: async (id) => {
      const before = get().notifications
      set({ notifications: before.map((n) => (n.id === id ? { ...n, read: true } : n)) })
      try {
        await notificationsService.markAsRead(id)
        void get().fetchStats()
      } catch (err) {
        set({ notifications: before })
        throw err
      }
    },

    markAllNotificationsRead: async () => {
      const before = get().notifications
      set({ notifications: before.map((n) => ({ ...n, read: true })) })
      try {
        await notificationsService.markAllAsRead()
        void get().fetchStats()
      } catch (err) {
        set({ notifications: before })
        throw err
      }
    },

    reset: () => {
      catalogInFlight = null
      set({ ...initialState })
    },
  }
})

