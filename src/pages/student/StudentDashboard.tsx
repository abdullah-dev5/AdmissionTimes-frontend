import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout'
import { getStatusColor } from '../../data/studentData'
import { useStudentStore } from '../../store/studentStore'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData'
import UpdatedBadge from '../../components/admin/UpdatedBadge'
import { filterStudentVisibleAdmissions } from '../../utils/studentFilters'
import { recommendationsService } from '../../services/recommendationsService'
import { transformAdmission } from '../../utils/transformers'

const RECOMMENDATION_MIN_SCORE = 50
const RECOMMENDATION_RENDER_MIN_SCORE = 70
const RECOMMENDATION_RENDER_LIMIT = 4

function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Use custom hook for data fetching (handles loading logic)
  const { admissions: rawAdmissions, loading, error } = useStudentDashboardData()
  const allAdmissions = useStudentStore((state) => state.admissions)
  const notifications = useStudentStore((state) => state.notifications)
  
  // ✅ Filter admissions - HIDE rejected admissions from students
  const admissions = useMemo(
    () => filterStudentVisibleAdmissions(rawAdmissions, true),
    [rawAdmissions]
  )
  
  // Memoize saved admissions to prevent unnecessary calculations
  const savedAdmissions = useMemo(
    () => allAdmissions.filter((a) => a.saved),
    [allAdmissions]
  )
  
  const displayName = user?.display_name?.trim() || 'Student'
  const [apiRecommendedPrograms, setApiRecommendedPrograms] = useState<typeof admissions>([])
  const recommendationFetchRef = useRef<{ userId: string | null; lastFetchedAt: number }>({ userId: null, lastFetchedAt: 0 })

  // Use API stats if complete, otherwise calculate from actual data
  // NOTE: All hooks must be called before any conditional returns
  const stats = useMemo(() => {
    // Calculate stats from actual data (source of truth)
    const upcoming = admissions.filter(a => a.daysRemaining >= 0 && a.daysRemaining <= 7).length
    
    const active = admissions.filter(a => a.daysRemaining >= 0).length
    
    const recommendationSource = apiRecommendedPrograms.length > 0 ? apiRecommendedPrograms : admissions
    const recommendations = recommendationSource.filter(a => a.matchNumeric && a.matchNumeric >= RECOMMENDATION_MIN_SCORE && a.daysRemaining >= 0).length
    
    const urgent = admissions.filter(a => a.daysRemaining >= 0 && a.daysRemaining <= 7).length

    const calculatedStats = {
      active,
      saved: savedAdmissions.length,
      upcoming,
      recommendations,
      urgent,
    }

    console.log('📊 [Dashboard Stats] Calculated from data:', calculatedStats)
    console.log('📊 [Dashboard] Total admissions:', admissions.length, 'Saved:', savedAdmissions.length)
    
    // Debug: Show which admissions are counted
    if (admissions.length > 0) {
      const openPrograms = admissions.filter(a => a.programStatus === 'Open' || a.programStatus === 'Closing Soon');
      console.log(`📊 [Dashboard] Open/ClosingSoon programs: ${openPrograms.length}/${admissions.length}`);
      
      const withValidDeadline = admissions.filter(a => a.daysRemaining >= 0);
      console.log(`📊 [Dashboard] With valid deadline (not closed): ${withValidDeadline.length}/${admissions.length}`);
    }

    return calculatedStats
  }, [admissions, apiRecommendedPrograms, savedAdmissions])

  // Get recommended programs (high match, open status, not past deadline)
  const recommendedPrograms = useMemo(() => {
    if (apiRecommendedPrograms.length > 0) {
      return apiRecommendedPrograms
        .filter(a => (a.matchNumeric || 0) > RECOMMENDATION_RENDER_MIN_SCORE)
        .sort((a, b) => (b.matchNumeric || 0) - (a.matchNumeric || 0))
        .slice(0, RECOMMENDATION_RENDER_LIMIT)
    }

    // Fallback: local heuristic when API recommendations are temporarily unavailable.
    return admissions
      .filter(a => (a.matchNumeric || 0) > RECOMMENDATION_RENDER_MIN_SCORE)
      .sort((a, b) => (b.matchNumeric || 0) - (a.matchNumeric || 0))
      .slice(0, RECOMMENDATION_RENDER_LIMIT)
  }, [admissions, apiRecommendedPrograms])

  useEffect(() => {
    const userId = user?.id || null
    if (!userId) {
      return
    }

    const now = Date.now()
    const sameUser = recommendationFetchRef.current.userId === userId
    const withinCooldown = sameUser && now - recommendationFetchRef.current.lastFetchedAt < 60_000
    if (withinCooldown) {
      return
    }

    recommendationFetchRef.current = { userId, lastFetchedAt: now }

    let isMounted = true
    const admissionById = new Map(admissions.map((admission) => [admission.id, admission]))

    recommendationsService
      .getRecommendations(10, RECOMMENDATION_MIN_SCORE)
      .then((response) => {
        const recommendations = response?.data?.recommendations || []
        const mapped = recommendations
          .map((recommendation) => {
            const base = admissionById.get(recommendation.admission_id)
            if (base) {
              return {
                ...base,
                matchNumeric: recommendation.score,
                aiSummary: recommendation.reason || base.aiSummary,
              }
            }

            const fallbackAdmission = transformAdmission({
              id: recommendation.admission?.id || recommendation.admission_id,
              university_id: recommendation.admission?.university_id || null,
              title: recommendation.admission?.program_name || 'Recommended Program',
              degree_level: recommendation.admission?.degree_level || null,
              deadline: recommendation.admission?.deadline || null,
              application_fee: null,
              location: null,
              description: recommendation.reason || null,
              verification_status: recommendation.admission?.verification_status || recommendation.admission?.status || 'verified',
              created_at: recommendation.generated_at,
              updated_at: recommendation.generated_at,
              match_score: recommendation.score,
              match_reason: recommendation.reason,
            } as any)

            return {
              ...fallbackAdmission,
              id: recommendation.admission_id,
              matchNumeric: recommendation.score,
              aiSummary: recommendation.reason || fallbackAdmission.aiSummary,
            }
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item))

        if (isMounted) {
          setApiRecommendedPrograms(mapped)
        }
      })
      .catch((err) => {
        console.warn('[StudentDashboard] Recommendations API fetch failed, using fallback scoring:', err)
      })

    return () => {
      isMounted = false
    }
  }, [user?.id, admissions])

  // Get upcoming deadlines for sidebar (with dynamic calculation)
  const upcomingDeadlines = useMemo(() => {
    return admissions
      .filter(a => a.daysRemaining >= 0 && a.daysRemaining <= 30)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 3)
  }, [admissions])

  // Get recent activities from tracked data (notifications, saved programs, alerts)
  const recentActivities = useMemo(() => {
    const activities: Array<{ action: string; iconType: 'paper' | 'bookmark' | 'bell' | 'notification'; time: string }> = []
    
    // Add recent notifications (limit to 2 most recent)
    const recentNotifications = notifications.slice(0, 2)
    recentNotifications.forEach(notif => {
      activities.push({
        action: notif.title,
        iconType: 'notification',
        time: notif.timeAgo
      })
    })
    
    // Add saved programs activity if there are saved programs
    if (savedAdmissions.length > 0) {
      activities.push({
        action: `${savedAdmissions.length} program${savedAdmissions.length > 1 ? 's' : ''} saved to watchlist`,
        iconType: 'bookmark',
        time: 'Recently'
      })
    }
    
    // Add alerts activity if there are active alerts
    const activeAlerts = admissions.filter(a => a.alertEnabled).length
    if (activeAlerts > 0) {
      activities.push({
        action: `${activeAlerts} deadline reminder${activeAlerts > 1 ? 's' : ''} active`,
        iconType: 'bell',
        time: 'Recently'
      })
    }
    
    // Return top 3 activities
    return activities.slice(0, 3)
  }, [notifications, savedAdmissions, admissions])

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

  // Show loading state (AFTER all hooks are called)
  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner fullScreen message="Loading dashboard..." />
      </StudentLayout>
    )
  }

  // Show error state (AFTER all hooks are called)
  if (error) {
    return (
      <StudentLayout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto rounded-2xl border border-red-200 bg-white shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-900 font-semibold mb-1">Unable to load dashboard</h3>
                <p className="text-red-700 text-sm">{getFriendlyErrorMessage(error)}</p>
              </div>
            </div>
            <button
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
      <div className="p-6">
            <div className="mb-6 rounded-lg p-8 text-white relative overflow-hidden" style={{ backgroundColor: '#2563EB' }}>
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">Welcome back, {displayName}!</h1>
                <p className="text-lg mb-6 opacity-90">Track your admission progress and discover new opportunities.</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => navigate('/student/search')}
                    className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg cursor-pointer transition-colors hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Admissions
                  </button>
                  <button 
                    onClick={() => navigate('/student/deadlines')}
                    className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg cursor-pointer transition-colors hover:bg-white hover:text-blue-600"
                  >
                    View Deadlines
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E0E7FF' }}>
                    <svg className="w-6 h-6" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Active Applications</p>
                <p className="text-3xl font-bold mb-1" style={{ color: '#111827' }}>{stats.active}</p>
                <p className="text-xs" style={{ color: '#10B981' }}>Open & Closing Soon</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E0E7FF' }}>
                    <svg className="w-6 h-6" style={{ color: '#6366F1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Saved Programs</p>
                <p className="text-3xl font-bold" style={{ color: '#111827' }}>{stats.saved}</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: stats.urgent > 0 ? '#FEE2E2' : '#FEF3C7' }}>
                    <svg className="w-6 h-6" style={{ color: stats.urgent > 0 ? '#EF4444' : '#FACC15' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Deadlines</p>
                <p className="text-3xl font-bold mb-1" style={{ color: '#111827' }}>{stats.upcoming}</p>
                <p className="text-xs" style={{ color: stats.urgent > 0 ? '#EF4444' : '#6B7280' }}>
                  {stats.urgent > 0 ? `${stats.urgent} urgent` : 'In next 7 days'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                    <svg className="w-6 h-6" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Recommendations</p>
                <p className="text-3xl font-bold mb-1" style={{ color: '#111827' }}>{stats.recommendations}</p>
      {/*           <p className="text-xs" style={{ color: '#10B981' }}>AI-powered</p>
          */}    </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>Recommended for You</h2>
                  <p className="text-sm text-gray-600">Smart suggestions based on students with similar interests.</p>
                </div>
                {recommendedPrograms.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
                    <div className="text-gray-400 mb-3">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No recommendations yet</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Add programs to your watchlist to get personalized recommendations!
                    </p>
                    <button 
                      onClick={() => navigate('/student/search')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Programs
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedPrograms.map((admission) => {
                      const statusColors = getStatusColor(admission.programStatus)
                      const scoreColor = 
                        (admission.matchNumeric || 0) >= 80 ? '#10B981' : 
                        (admission.matchNumeric || 0) >= 70 ? '#3B82F6' : 
                        (admission.matchNumeric || 0) >= 60 ? '#F59E0B' : '#6B7280';
                      const scoreBg = 
                        (admission.matchNumeric || 0) >= 80 ? '#D1FAE5' : 
                        (admission.matchNumeric || 0) >= 70 ? '#DBEAFE' : 
                        (admission.matchNumeric || 0) >= 60 ? '#FEF3C7' : '#F3F4F6';
                      
                      return (
                        <Link
                          to={`/program/${admission.id}`}
                          key={admission.id}
                          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md cursor-pointer transition-all relative"
                        >
                          {/* Updated Tag */}
                          {admission.status === 'Updated' && (
                            <div className="absolute top-4 right-4 z-10">
                              <UpdatedBadge size="sm" showTime={false} />
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-10 h-10 rounded flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 overflow-hidden" style={{ backgroundColor: admission.logoBg }}>
                                {admission.universityLogo ? (
                                  <img src={admission.universityLogo} alt={admission.university} className="w-full h-full object-cover" />
                                ) : (
                                  admission.university.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1 text-lg" style={{ color: '#111827' }}>{admission.program}</h3>
                                <p className="text-sm text-gray-600">{admission.university}</p>
                                {admission.dataOrigin === 'scraper' ? (
                                  <p className="text-xs text-gray-500">{admission.location}</p>
                                ) : admission.universityCity ? (
                                  <p className="text-xs text-gray-500">{admission.universityCity}, {admission.universityCountry}</p>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-sm font-bold px-2 py-1 rounded" style={{ color: scoreColor, backgroundColor: scoreBg }}>
                                {admission.matchNumeric || 0}%
                              </span>
                              {admission.match && (
                                <span className="text-xs text-gray-500">{admission.match}</span>
                              )}
                            </div>
                          </div>
                          {admission.aiSummary && (
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{admission.aiSummary}</p>
                          )}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
                                {admission.programStatus}
                              </span>
                              {admission.verificationStatus === 'pending' && (
                                <span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                  Pending
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">Deadline: {admission.deadlineDisplay}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold" style={{ color: '#111827' }}>Upcoming Deadlines</h2>
                    <button 
                      onClick={() => navigate('/student/deadlines')}
                      className="text-sm font-medium cursor-pointer transition-colors" 
                      style={{ color: '#2563EB' }}
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {upcomingDeadlines.map((admission) => {
                      const color = admission.daysRemaining <= 3 ? '#EF4444' : admission.daysRemaining <= 7 ? '#FACC15' : '#10B981'
                      return (
                        <div key={admission.id} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: color }}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1" style={{ color: '#111827' }}>{admission.university}</p>
                            <p className="text-xs text-gray-600 mb-1">{admission.program}</p>
                            <p className="text-xs" style={{ color: color }}>
                              {admission.daysRemaining < 0 ? 'Deadline passed' : `Deadline in ${admission.daysRemaining} days`}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold" style={{ color: '#111827' }}>Recent Activity</h2>
                    <button 
                      onClick={() => navigate('/student/notifications')}
                      className="text-sm font-medium cursor-pointer transition-colors" 
                      style={{ color: '#2563EB' }}
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E0E7FF' }}>
                            {activity.iconType === 'notification' && (
                              <svg className="w-4 h-4" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            )}
                            {activity.iconType === 'bookmark' && (
                              <svg className="w-4 h-4" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            )}
                            {activity.iconType === 'bell' && (
                              <svg className="w-4 h-4" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm" style={{ color: '#111827' }}>{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
      </div>
    </StudentLayout>
  )
}

export default StudentDashboard

