import { useEffect, useMemo, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout'
import type { StudentAdmission } from '../../data/studentData'
import { useStudentStore } from '../../store/studentStore'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData'
import { filterStudentVisibleAdmissions } from '../../utils/studentFilters'
import {
  MATCH_LABEL_MIN_SCORE,
  RECOMMENDATION_COUNT_LIMIT,
  filterEligibleRecommendations,
  mapRecommendationsToAdmissions,
} from '../../utils/recommendationUtils'
import { CLOSING_SOON_DAYS, daysLeftLabel, deadlineTone, isOpenAdmission } from '../../utils/studentPortal'

/** Rows per dashboard section (same as the mobile app). */
const SECTION_LIMIT = 3

function StatCard({ label, value, hint, to, alert }: { label: string; value: number; hint: string; to: string; alert?: boolean }) {
  return (
    <Link to={to} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${alert ? 'text-amber-600' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{hint}</p>
    </Link>
  )
}

function Section({ title, actionLabel, to, children }: { title: string; actionLabel: string; to: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <Link to={to} className="text-sm font-semibold text-blue-600 hover:underline">
          {actionLabel}
        </Link>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </section>
  )
}

function AdmissionRow({ admission, subtitle, trailing }: { admission: StudentAdmission; subtitle?: string; trailing?: ReactNode }) {
  return (
    <Link
      to={`/program/${admission.id}`}
      state={{ selectedAdmission: admission }}
      className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-gray-50"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate" title={admission.program}>
          {admission.program}
        </p>
        <p className="text-xs text-gray-500 truncate">{subtitle ?? admission.university}</p>
      </div>
      {trailing ? <div className="flex flex-col items-end gap-0.5 flex-shrink-0 text-right">{trailing}</div> : null}
    </Link>
  )
}

const Muted = ({ children }: { children: ReactNode }) => <p className="px-5 py-4 text-sm text-gray-500">{children}</p>

const getFriendlyErrorMessage = (raw?: string | null) => {
  const message = (raw || '').toLowerCase()
  if (!message) return 'We could not load your dashboard right now. Please try again.'
  if (message.includes('401') || message.includes('unauthorized')) {
    return 'Your session has expired. Please sign in again to continue.'
  }
  if (message.includes('403') || message.includes('forbidden')) {
    return 'You do not have permission to access this dashboard view.'
  }
  if (message.includes('timeout') || message.includes('network') || message.includes('fetch')) {
    return 'Connection issue detected. Please check your internet and try again.'
  }
  return 'We could not load your dashboard data at the moment. Please try again shortly.'
}

/** Student home: same cards and sections as the mobile app's dashboard. */
function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { admissions: rawAdmissions, loading, error } = useStudentDashboardData()
  const notifications = useStudentStore((state) => state.notifications)
  const apiRecommendations = useStudentStore((state) => state.apiRecommendations)
  const fetchRecommendations = useStudentStore((state) => state.fetchRecommendations)

  // Students only see verified admissions.
  const admissions = useMemo(() => filterStudentVisibleAdmissions(rawAdmissions, true), [rawAdmissions])

  const firstName = (user?.display_name?.trim() || user?.email?.split('@')[0] || 'there').split(/\s+/)[0]
  const userId = user?.id || null

  useEffect(() => {
    if (!userId) return
    void fetchRecommendations(userId)
  }, [userId, fetchRecommendations])

  const recommendations = useMemo(() => {
    const admissionById = new Map(admissions.map((admission) => [admission.id, admission]))
    return filterEligibleRecommendations(mapRecommendationsToAdmissions(apiRecommendations, admissionById)).slice(
      0,
      RECOMMENDATION_COUNT_LIMIT
    )
  }, [admissions, apiRecommendations])

  const open = useMemo(() => admissions.filter(isOpenAdmission), [admissions])
  const closingSoon = useMemo(
    () =>
      open
        .filter((a) => a.hasDeadline !== false && a.daysRemaining >= 0 && a.daysRemaining <= CLOSING_SOON_DAYS)
        .sort((a, b) => a.daysRemaining - b.daysRemaining),
    [open]
  )
  const recentlyAdded = useMemo(
    () =>
      [...open]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, SECTION_LIMIT),
    [open]
  )
  const savedCount = admissions.filter((a) => a.saved).length

  if (loading && admissions.length === 0) {
    return (
      <StudentLayout>
        <LoadingSpinner fullScreen message="Loading dashboard..." />
      </StudentLayout>
    )
  }

  if (error && admissions.length === 0) {
    return (
      <StudentLayout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto rounded-2xl border border-red-200 bg-white shadow-sm p-6">
            <h3 className="text-red-900 font-semibold mb-1">Unable to load dashboard</h3>
            <p className="text-red-700 text-sm">{getFriendlyErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="p-6 space-y-6">
        <div className="rounded-xl p-8 text-white bg-blue-600">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
          <p className="text-lg mb-6 opacity-90">Track deadlines and discover verified admissions.</p>
          <button
            type="button"
            onClick={() => navigate('/student/search')}
            className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg transition-colors hover:bg-gray-100"
          >
            Search admissions
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Open programs" value={open.length} hint="Accepting applications" to="/student/search" />
          <StatCard label="Saved" value={savedCount} hint="On your watchlist" to="/student/watchlist" />
          <StatCard
            label="Closing this week"
            value={closingSoon.length}
            hint={`Within ${CLOSING_SOON_DAYS} days`}
            to="/student/deadlines"
            alert={closingSoon.length > 0}
          />
          <StatCard label="Recommendations" value={recommendations.length} hint="Based on your saved programs" to="/student/search" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Recommended for you" actionLabel="Search" to="/student/search">
            {recommendations.length === 0 ? (
              <Muted>Save a few programs and we will suggest similar ones.</Muted>
            ) : (
              recommendations.slice(0, SECTION_LIMIT).map((admission) => (
                <AdmissionRow
                  key={admission.id}
                  admission={admission}
                  // Scores under 60 are the engine's generic fallback; its reason adds nothing.
                  subtitle={
                    admission.aiSummary && (admission.matchNumeric ?? 0) >= MATCH_LABEL_MIN_SCORE
                      ? `${admission.university} · ${admission.aiSummary}`
                      : admission.university
                  }
                  trailing={
                    admission.match ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{admission.match}</span>
                    ) : null
                  }
                />
              ))
            )}
          </Section>

          <Section title="Closing soon" actionLabel="All deadlines" to="/student/deadlines">
            {closingSoon.length === 0 ? (
              <Muted>No deadlines in the next {CLOSING_SOON_DAYS} days.</Muted>
            ) : (
              closingSoon.slice(0, SECTION_LIMIT).map((admission) => (
                <AdmissionRow
                  key={admission.id}
                  admission={admission}
                  trailing={
                    <>
                      <span className={`text-sm font-semibold ${deadlineTone(admission)}`}>{daysLeftLabel(admission)}</span>
                      <span className="text-xs text-gray-500">{admission.deadlineDisplay}</span>
                    </>
                  }
                />
              ))
            )}
          </Section>

          <Section title="Recently added" actionLabel="Search" to="/student/search">
            {recentlyAdded.length === 0 ? (
              <Muted>No open admissions right now.</Muted>
            ) : (
              recentlyAdded.map((admission) => (
                <AdmissionRow
                  key={admission.id}
                  admission={admission}
                  trailing={
                    <span className="text-xs text-gray-500">{admission.hasDeadline === false ? 'No deadline' : admission.deadlineDisplay}</span>
                  }
                />
              ))
            )}
          </Section>

          <Section title="Latest notifications" actionLabel="View all" to="/student/notifications">
            {notifications.length === 0 ? (
              <Muted>You are all caught up.</Muted>
            ) : (
              notifications.slice(0, SECTION_LIMIT).map((notification) => (
                <Link
                  key={notification.id}
                  to={notification.admissionId ? `/program/${notification.admissionId}` : '/student/notifications'}
                  className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50"
                >
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notification.read ? 'bg-gray-300' : 'bg-blue-600'}`}
                    aria-label={notification.read ? 'Read' : 'Unread'}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{notification.title}</p>
                    <p className="text-xs text-gray-500">{notification.timeAgo}</p>
                  </div>
                </Link>
              ))
            )}
          </Section>
        </div>
      </div>
    </StudentLayout>
  )
}

export default StudentDashboard
