import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout'
import { getStatusColor, calculateDaysRemaining } from '../../data/studentData'
import { useStudentData } from '../../contexts/StudentDataContext'

function StudentDashboard() {
  const navigate = useNavigate()
  const { admissions, savedAdmissions, notifications } = useStudentData()

  // Calculate stats from shared data with dynamic calculations
  const stats = useMemo(() => {
    const upcoming = admissions.filter(a => {
      const daysRemaining = calculateDaysRemaining(a.deadline)
      return (a.programStatus === 'Open' || a.programStatus === 'Closing Soon') && daysRemaining >= 0 && daysRemaining <= 7
    }).length
    const active = admissions.filter(a => {
      const daysRemaining = calculateDaysRemaining(a.deadline)
      return (a.programStatus === 'Open' || a.programStatus === 'Closing Soon') && daysRemaining >= 0
    }).length
    const recommendations = admissions.filter(a => {
      const daysRemaining = calculateDaysRemaining(a.deadline)
      return a.matchNumeric && a.matchNumeric >= 85 && daysRemaining >= 0 && (a.programStatus === 'Open' || a.programStatus === 'Closing Soon')
    }).length
    const urgent = admissions.filter(a => {
      const daysRemaining = calculateDaysRemaining(a.deadline)
      return daysRemaining >= 0 && daysRemaining <= 7 && (a.programStatus === 'Open' || a.programStatus === 'Closing Soon')
    }).length

    return {
      active,
      saved: savedAdmissions.length,
      upcoming,
      recommendations,
      urgent,
    }
  }, [admissions, savedAdmissions])

  // Get recommended programs (high match, open status, not past deadline)
  const recommendedPrograms = useMemo(() => {
    return admissions
      .filter(a => {
        const daysRemaining = calculateDaysRemaining(a.deadline)
        return a.matchNumeric && a.matchNumeric >= 85 && daysRemaining >= 0 && (a.programStatus === 'Open' || a.programStatus === 'Closing Soon')
      })
      .sort((a, b) => (b.matchNumeric || 0) - (a.matchNumeric || 0))
      .slice(0, 4)
  }, [admissions])

  // Get upcoming deadlines for sidebar (with dynamic calculation)
  const upcomingDeadlines = useMemo(() => {
    return admissions
      .filter(a => {
        const daysRemaining = calculateDaysRemaining(a.deadline)
        return daysRemaining >= 0 && daysRemaining <= 30 && (a.programStatus === 'Open' || a.programStatus === 'Closing Soon')
      })
      .map(a => ({
        ...a,
        daysRemaining: calculateDaysRemaining(a.deadline)
      }))
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

  return (
    <StudentLayout>
      <div className="p-6">
            <div className="mb-6 rounded-lg p-8 text-white relative overflow-hidden" style={{ backgroundColor: '#2563EB' }}>
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">Welcome back, Aryan!</h1>
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
                <p className="text-xs" style={{ color: '#10B981' }}>AI-powered</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>Recommended for You</h2>
                  <p className="text-sm text-gray-600">AI-powered suggestions based on your interests.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedPrograms.map((admission) => {
                    const statusColors = getStatusColor(admission.programStatus)
                    return (
                      <Link
                        to={`/program/${admission.id}`}
                        key={admission.id}
                        className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1 text-lg" style={{ color: '#111827' }}>{admission.program}</h3>
                            <p className="text-sm text-gray-600">{admission.university}</p>
                          </div>
                          <span className="text-sm font-medium px-2 py-1 rounded" style={{ color: '#10B981', backgroundColor: '#D1FAE5' }}>
                            {admission.match} Match
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
                            {admission.programStatus}
                          </span>
                          <p className="text-xs text-gray-600">Deadline: {admission.deadlineDisplay}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
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

