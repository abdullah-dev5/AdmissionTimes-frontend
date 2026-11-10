/**
 * useStudentDashboardData
 *
 * Loads the student's catalog (verified admissions + watchlist state) once per
 * user and returns it. The store de-duplicates concurrent and repeat loads, so
 * every student page can call this hook.
 *
 * @module hooks/useStudentDashboardData
 */

import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useStudentStore } from '../store/studentStore'

export function useStudentDashboardData() {
  const { user } = useAuth()
  const { showError } = useToast()
  const userId = user?.id || null

  const admissions = useStudentStore((state) => state.admissions)
  const loading = useStudentStore((state) => state.loading)
  const error = useStudentStore((state) => state.error)
  const loadCatalog = useStudentStore((state) => state.loadCatalog)

  useEffect(() => {
    if (!userId) return
    void loadCatalog(userId, { showError })
    // showError is stable for the provider's lifetime; reload only when the user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, loadCatalog])

  const refetch = () => (userId ? loadCatalog(userId, { force: true, showError }) : Promise.resolve())

  return { admissions, loading, error, refetch }
}
