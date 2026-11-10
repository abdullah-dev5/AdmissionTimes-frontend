/**
 * useUniversityDashboardData Hook
 *
 * Loads university dashboard data once per authenticated university user.
 */

import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useUniversityStore } from '../store/universityStore'
import { createLogger } from '../utils/logger'

const log = createLogger('useUniversityDashboardData')

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
      log.error('Error fetching university data:', err)
    })
  // showError comes from a stable provider; reload only when the user changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userRole])
}
