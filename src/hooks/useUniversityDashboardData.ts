/**
 * useUniversityDashboardData Hook
 *
 * Loads university dashboard data once per authenticated university user.
 */

import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useUniversityStore } from '../store/universityStore'

export function useUniversityDashboardData() {
  const { user } = useAuth()
  const { showError } = useToast()

  const fetchTriggeredRef = useRef<string | null>(null)
  const userId = user?.id || null
  const userRole = user?.role || user?.user_type || null

  useEffect(() => {
    if (!userId || userRole !== 'university') {
      fetchTriggeredRef.current = null
      return
    }

    if (fetchTriggeredRef.current === userId) {
      return
    }

    const storeState = useUniversityStore.getState()
    if (storeState.loading) {
      return
    }

    fetchTriggeredRef.current = userId

    storeState.fetchDashboardData({ showError, userId }).catch((err) => {
      console.error('[useUniversityDashboardData] Error fetching university data:', err)
    })
  }, [userId, userRole])
}
