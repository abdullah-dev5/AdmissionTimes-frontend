/**
 * useStudentDashboardData Hook
 * 
 * Handles data fetching for student dashboard with proper lifecycle management.
 * Uses store-level fetch tracking + ref guard to prevent infinite loops.
 * 
 * @module hooks/useStudentDashboardData
 */

import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useStudentStore } from '../store/studentStore'

/**
 * Hook that manages student dashboard data fetching
 * - Prevents concurrent fetch calls via store concurrency guard
 * - Only fetches once per user (tracked by ref + store.fetchedUserId)
 * - Uses ref guard to survive React StrictMode double-invocations
 * - Minimal dependencies to prevent infinite loops
 */
export function useStudentDashboardData() {
  const { user } = useAuth()
  const { showError } = useToast()
  
  // Ref to track which userId we've already triggered a fetch for
  // Survives StrictMode double-invocation and prevents re-fetching
  const fetchTriggeredRef = useRef<string | null>(null)
  
  // Extract primitive user ID to prevent object reference issues
  const userId = user?.id || null
  
  // Select only state values needed for rendering
  const admissions = useStudentStore((state) => state.admissions)
  const loading = useStudentStore((state) => state.loading)
  const error = useStudentStore((state) => state.error)

  useEffect(() => {
    // Only proceed if user is authenticated
    if (!userId) {
      fetchTriggeredRef.current = null
      return
    }
    
    // Ref guard: Check if we've already triggered a fetch for this user
    // This prevents re-triggering during StrictMode double-invocation
    if (fetchTriggeredRef.current === userId) {
      return
    }
    
    // Check store state at the time of effect execution
    const storeState = useStudentStore.getState()
    
    // Skip if already loading (concurrency guard in store)
    if (storeState.loading) {
      return
    }
    
    // Skip if already fetched for this user
    if (storeState.fetchedUserId === userId) {
      return
    }
    
    // Mark this user as having had a fetch triggered
    fetchTriggeredRef.current = userId
    
    console.log('📚 [useStudentDashboardData] Fetching for user:', userId)
    
    // Call searchAdmissions - pass showError via closure
    storeState.searchAdmissions(
      { limit: 100 },
      { showError, userId }
    ).catch(err => {
      console.error('[useStudentDashboardData] Error fetching admissions:', err)
    })
  }, [userId]) // Only depends on primitive string

  return { admissions, loading, error }
}
