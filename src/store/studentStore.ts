import { create } from 'zustand'
import type { StudentAdmission, StudentNotification } from '../data/studentData'
import { dashboardService } from '../services/dashboardService'
import { watchlistsService } from '../services/watchlistsService'
import { notificationsService } from '../services/notificationsService'
import { admissionsService } from '../services/admissionsService'
import { transformAdmission, transformNotification } from '../utils/transformers'
import { buildSearchParams } from '../utils/studentUtils'

interface StudentStats {
  active_admissions: number
  saved_count: number
  upcoming_deadlines: number
  recommendations_count: number
  unread_notifications: number
  urgent_deadlines: number
}

interface StudentStore {
  // State
  admissions: StudentAdmission[]
  notifications: StudentNotification[]
  loading: boolean
  error: string | null
  stats: StudentStats | null
  fetchedUserId: string | null  // Track which user's data is loaded
  
  // Computed
  savedAdmissions: () => StudentAdmission[]
  
  // Actions
  setAdmissions: (admissions: StudentAdmission[]) => void
  setNotifications: (notifications: StudentNotification[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setStats: (stats: StudentStats | null) => void
  
  // API Actions
  fetchStats: () => Promise<void>
  fetchDashboardData: (options?: { showError?: (msg: string) => void }) => Promise<void>
  toggleSaved: (id: string, options?: { showError?: (msg: string) => void }) => Promise<void>
  toggleAlert: (id: string, options?: { showError?: (msg: string) => void; showSuccess?: (msg: string) => void }) => Promise<void>
  updateAdmission: (id: string, updates: Partial<StudentAdmission>) => void
  getAdmissionById: (id: string) => StudentAdmission | undefined
  getAdmissionsByIds: (ids: string[]) => StudentAdmission[]
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  searchAdmissions: (filters?: {
    search?: string
    country?: string
    city?: string
    degreeLevel?: string
    fieldOfStudy?: string
    minFee?: number
    maxFee?: number
    deadline?: string
    deliveryMode?: string
    page?: number
    limit?: number
  }, options?: { showError?: (msg: string) => void, userId?: string }) => Promise<StudentAdmission[]>
  
  // Cleanup
  reset: () => void
}

const initialState = {
  admissions: [],
  notifications: [],
  loading: false,
  error: null,
  stats: null,
  fetchedUserId: null,
}

export const useStudentStore = create<StudentStore>()(
  (set, get) => ({
      // Initial State
      ...initialState,
      
      // Computed - returns filtered array that should be selected with shallow equality
      savedAdmissions: () => get().admissions.filter((admission) => admission.saved),
      
      // Basic Setters
      setAdmissions: (admissions) => set({ admissions }),
      setNotifications: (notifications) => set({ notifications }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setStats: (stats) => set({ stats }),
      
      // Fetch Stats
      fetchStats: async () => {
        try {
          const response = await dashboardService.getStudentDashboard()
          console.log('📊 [fetchStats] Updated stats:', response.data.stats)
          set({ stats: response.data.stats })
        } catch (err: any) {
          console.error('Failed to fetch stats:', err)
          // Don't throw, just log the error
        }
      },
      
      // Fetch Dashboard Data
      fetchDashboardData: async (options) => {
        // Set loading state at start
        set({ loading: true, error: null })
        
        try {
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
                created_at: '',
                updated_at: '',
              },
              prog.saved
                ? {
                    id: '',
                    user_id: '',
                    admission_id: prog.id,
                    created_at: '',
                    updated_at: '',
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
          
          // Single state update on success
          set({
            admissions: transformedAdmissions,
            notifications: transformedNotifications,
            stats: response.data.stats,
            loading: false,
            error: null,
          })
        } catch (err: any) {
          console.error('Failed to fetch dashboard data:', err)
          const errorMsg = err.message || 'Failed to fetch dashboard data'
          
          // Single state update on error
          set({ 
            error: errorMsg,
            loading: false,
          })
          
          if (options?.showError) {
            options.showError('Failed to load dashboard data. Please try again.')
          }
        }
      },
      
      // Toggle Saved
      toggleSaved: async (id, options) => {
        const { admissions } = get()
        const admission = admissions.find((a) => a.id === id)
        if (!admission) return
        
        const wasSaved = admission.saved
        
        // Optimistic update
        set({
          admissions: admissions.map((a) =>
            a.id === id
              ? {
                  ...a,
                  saved: !wasSaved,
                  alertEnabled: !wasSaved ? a.alertEnabled : false,
                  watchlistId: !wasSaved ? a.watchlistId : undefined,
                }
              : a
          ),
        })
        
        try {
          if (wasSaved) {
            // Remove from watchlist
            if (admission.watchlistId) {
              await watchlistsService.remove(admission.watchlistId)
              console.log('✅ Removed from watchlist (also disabled alerts):', admission.watchlistId)
            } else {
              await watchlistsService.removeByAdmissionId(id)
              console.log('✅ Removed from watchlist (also disabled alerts) by admission ID:', id)
            }
          } else {
            // Add to watchlist
            const response = await watchlistsService.add(id, admission.alertEnabled || false)
            console.log('✅ Added to watchlist:', id, 'with alert:', admission.alertEnabled || false, 'Response:', response)
            
            // Update watchlist ID
            if (response.data?.id) {
              set({
                admissions: get().admissions.map((a) =>
                  a.id === id ? { ...a, watchlistId: response.data.id } : a
                ),
              })
              console.log('✅ Stored watchlist ID:', response.data.id)
            } else {
              console.warn('⚠️ No watchlist ID in response:', response)
            }
          }
          
          console.log('✅ Watchlist updated successfully')
          
          // Update stats
          await get().fetchStats()
        } catch (err: any) {
          console.error('Failed to toggle saved:', err)
          
          // Rollback
          set({
            admissions: admissions.map((a) =>
              a.id === id
                ? {
                    ...a,
                    saved: wasSaved,
                    alertEnabled: wasSaved ? a.alertEnabled : false,
                    watchlistId: wasSaved ? a.watchlistId : undefined,
                  }
                : a
            ),
          })
          
          const errorMessage =
            err.response?.status === 500 &&
            err.response?.data?.message?.includes('foreign key constraint')
              ? 'User account not found. Please ensure you are logged in with a valid user account.'
              : err.response?.data?.message || 'Failed to update saved programs. Please try again.'
          
          if (options?.showError) {
            options.showError(errorMessage)
          }
        }
      },
      
      // Toggle Alert
      toggleAlert: async (id, options) => {
        const { admissions } = get()
        const admission = admissions.find((a) => a.id === id)
        if (!admission) return
        
        const wasAlertEnabled = admission.alertEnabled
        const wasSaved = admission.saved
        
        console.log('🔔 [toggleAlert] Current state:', { id, wasAlertEnabled, wasSaved, watchlistId: admission.watchlistId })
        
        // If not saved and enabling alert, add to saved first
        if (!wasSaved && !wasAlertEnabled) {
          // Optimistic update
          set({
            admissions: admissions.map((a) =>
              a.id === id
                ? {
                    ...a,
                    saved: true,
                    alertEnabled: true,
                  }
                : a
            ),
          })
          
          try {
            const response = await watchlistsService.add(id, true)
            console.log('✅ Added to watchlist with alert enabled:', id, 'Response:', response)
            
            if (response.data?.id) {
              set({
                admissions: get().admissions.map((a) =>
                  a.id === id ? { ...a, watchlistId: response.data.id } : a
                ),
              })
              console.log('✅ Stored watchlist ID:', response.data.id)
            }
            
            if (options?.showSuccess) {
              options.showSuccess('Alert enabled! Program automatically added to your saved list.')
            }
          } catch (err: any) {
            console.error('Failed to enable alert:', err)
            
            // Rollback
            set({
              admissions: admissions.map((a) =>
                a.id === id
                  ? {
                      ...a,
                      saved: false,
                      alertEnabled: false,
                    }
                  : a
              ),
            })
            
            if (options?.showError) {
              options.showError('Failed to enable alert. Please try again.')
            }
          }
        } else if (wasSaved) {
          // Already saved, just toggle alert
          set({
            admissions: admissions.map((a) =>
              a.id === id
                ? {
                    ...a,
                    alertEnabled: !wasAlertEnabled,
                  }
                : a
            ),
          })
          
          try {
            if (admission.watchlistId) {
              const newAlertValue = !wasAlertEnabled
              console.log('🔔 Toggling alert for watchlist ID:', admission.watchlistId)
              console.log('📤 Sending to backend:', { alert_opt_in: newAlertValue })
              
              const response = await watchlistsService.update(admission.watchlistId, {
                alert_opt_in: newAlertValue
              } as any)
              
              console.log('📥 Received from backend:', response.data)
              console.log('⚠️ Backend alert_opt_in value:', response.data?.alert_opt_in)
              console.log('✅ Alert toggled successfully')
              
              await get().fetchStats()
            } else {
              console.warn('⚠️ No watchlist ID found, trying to find by admission ID')
              
              const watchlistsResponse = await watchlistsService.list()
              const userWatchlists = Array.isArray(watchlistsResponse.data) 
                ? watchlistsResponse.data 
                : []
              
              const watchlist = userWatchlists.find((w: any) => w.admission_id === id)
              
              if (watchlist?.id) {
                console.log('✅ Found watchlist ID:', watchlist.id)
                
                set({
                  admissions: get().admissions.map((a) =>
                    a.id === id ? { ...a, watchlistId: watchlist.id } : a
                  ),
                })
                
                const newAlertValue = !wasAlertEnabled
                console.log('📤 Sending to backend:', { alert_opt_in: newAlertValue })
                
                const response = await watchlistsService.update(watchlist.id, {
                  alert_opt_in: newAlertValue
                } as any)
                
                console.log('📥 Received from backend:', response.data)
                console.log('⚠️ Backend alert_opt_in value:', response.data?.alert_opt_in)
                console.log('✅ Alert toggled successfully')
                
                await get().fetchStats()
              } else {
                throw new Error('Watchlist not found for this admission')
              }
            }
          } catch (err: any) {
            console.error('Failed to toggle alert:', err)
            
            // Rollback
            set({
              admissions: admissions.map((a) =>
                a.id === id
                  ? {
                      ...a,
                      alertEnabled: wasAlertEnabled,
                    }
                  : a
              ),
            })
            
            if (options?.showError) {
              options.showError('Failed to update alert settings. Please try again.')
            }
          }
        }
      },
      
      // Update Admission
      updateAdmission: (id, updates) => {
        set({
          admissions: get().admissions.map((admission) =>
            admission.id === id ? { ...admission, ...updates } : admission
          ),
        })
      },
      
      // Get Admission By ID
      getAdmissionById: (id) => {
        return get().admissions.find((admission) => admission.id === id)
      },
      
      // Get Admissions By IDs
      getAdmissionsByIds: (ids) => {
        const idSet = new Set(ids)
        return get().admissions.filter((admission) => idSet.has(admission.id))
      },
      
      // Mark Notification Read
      markNotificationRead: async (id) => {
        try {
          await notificationsService.markAsRead(id)
          set({
            notifications: get().notifications.map((notification) =>
              notification.id === id ? { ...notification, read: true } : notification
            ),
          })
        } catch (err: any) {
          console.error('Failed to mark notification as read:', err)
          // Update locally anyway
          set({
            notifications: get().notifications.map((notification) =>
              notification.id === id ? { ...notification, read: true } : notification
            ),
          })
        }
      },
      
      // Mark All Notifications Read
      markAllNotificationsRead: async () => {
        try {
          await notificationsService.markAllAsRead()
          set({
            notifications: get().notifications.map((notification) => ({
              ...notification,
              read: true,
            })),
          })
        } catch (err: any) {
          console.error('Failed to mark all notifications as read:', err)
          // Update locally anyway
          set({
            notifications: get().notifications.map((notification) => ({
              ...notification,
              read: true,
            })),
          })
        }
      },
      
      // Search Admissions
      searchAdmissions: async (filters, options) => {
        // Prevent concurrent calls
        if (get().loading) {
          console.warn('⚠️ [searchAdmissions] Already loading, skipping concurrent call')
          return []
        }
        
        // Set loading state once at the start
        set({ loading: true, error: null })
        
        try {
          console.log('🔍 [searchAdmissions] Starting search with filters:', filters)
          
          const params = buildSearchParams({
            ...filters,
            limit: filters?.limit || 1000,
          })
          
          console.log('🔍 [searchAdmissions] Built params:', params)
          
          // Parallel fetch
          const [result, watchlistsResponse] = await Promise.all([
            admissionsService.listDirect(params),
            options?.userId ? watchlistsService.list().catch(err => {
              console.warn('⚠️ Failed to fetch watchlists:', err)
              return { data: [] }
            }) : Promise.resolve({ data: [] })
          ])
          
          console.log(`✅ Fetched ${result.data.length} admissions out of ${result.count} total`)
          
          if (result.data.length === 0) {
            console.warn('⚠️ No admissions found. Check if database has data.')
          }
          
          let userWatchlists: any[] = []
          if (watchlistsResponse.data) {
            userWatchlists = Array.isArray(watchlistsResponse.data) 
              ? watchlistsResponse.data 
              : []
          }
          
          console.log('📚 [searchAdmissions] Fetched', userWatchlists.length, 'watchlists for user')
          if (userWatchlists.length > 0) {
            console.log('📚 [searchAdmissions] Watchlist admission IDs:', userWatchlists.map(w => w.admission_id))
          }
          
          // Transform with watchlist data
          const transformed = result.data.map(admission => {
            const watchlist = userWatchlists.find(w => w.admission_id === admission.id)
            if (watchlist) {
              console.log(`✅ [searchAdmissions] Matched watchlist for admission: ${admission.id} (${admission.title})`)
            }
            return transformAdmission(admission, watchlist)
          })
          
          console.log('📚 [searchAdmissions] Transformed admissions with saved status:', transformed.filter(a => a.saved).length, '/', transformed.length)
          
          const withDeadline = transformed.filter(a => a.deadline).length
          const withMatchNumeric = transformed.filter(a => a.matchNumeric).length
          const withStatus = transformed.filter(a => a.programStatus).length
          console.log(`📊 [searchAdmissions] Data completeness - deadline: ${withDeadline}/${transformed.length}, matchNumeric: ${withMatchNumeric}/${transformed.length}, programStatus: ${withStatus}/${transformed.length}`)
          
          // Single state update: batch everything together
          set({
            admissions: transformed,
            fetchedUserId: options?.userId || null,
            loading: false,
            error: null,
          })
          
          return transformed
        } catch (err: any) {
          console.error('Failed to search admissions:', err)
          const errorMsg = err.message || 'Failed to search admissions'
          
          // Single state update on error
          set({ 
            error: errorMsg,
            loading: false,
          })
          
          if (options?.showError) {
            options.showError('Failed to search admissions')
          }
          
          return []
        }
      },
      
      // Reset
      reset: () => set(initialState),
    })
)
