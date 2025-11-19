import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  sharedAdmissions,
  sharedNotifications,
  type StudentAdmission,
  type StudentNotification,
} from '../data/studentData'

interface StudentDataContextValue {
  admissions: StudentAdmission[]
  notifications: StudentNotification[]
  savedAdmissions: StudentAdmission[]
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

const cloneAdmissions = () => sharedAdmissions.map((admission) => ({ ...admission }))

const cloneNotifications = () =>
  [...sharedNotifications].map((notification) => ({ ...notification })).sort((a, b) => (a.time < b.time ? 1 : -1))

export function StudentDataProvider({ children }: { children: ReactNode }) {
  const [admissions, setAdmissions] = useState<StudentAdmission[]>(() => cloneAdmissions())
  const [notifications, setNotifications] = useState<StudentNotification[]>(() => cloneNotifications())

  const toggleSaved = useCallback((id: string) => {
    setAdmissions((prev) =>
      prev.map((admission) =>
        admission.id === id
          ? {
              ...admission,
              saved: !admission.saved,
            }
          : admission,
      ),
    )
  }, [])

  const toggleAlert = useCallback((id: string) => {
    setAdmissions((prev) =>
      prev.map((admission) =>
        admission.id === id
          ? {
              ...admission,
              alertEnabled: !admission.alertEnabled,
            }
          : admission,
      ),
    )
  }, [])

  const updateAdmission = useCallback((id: string, updates: Partial<StudentAdmission>) => {
    setAdmissions((prev) => prev.map((admission) => (admission.id === id ? { ...admission, ...updates } : admission)))
  }, [])

  const refreshAdmissions = useCallback(() => {
    setAdmissions(cloneAdmissions())
  }, [])

  const savedAdmissions = useMemo(() => admissions.filter((admission) => admission.saved), [admissions])

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

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }, [])

  const refreshNotifications = useCallback(() => {
    setNotifications(cloneNotifications())
  }, [])

  const value: StudentDataContextValue = {
    admissions,
    notifications,
    savedAdmissions,
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


