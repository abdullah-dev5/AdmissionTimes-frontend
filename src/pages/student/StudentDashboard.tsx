import { Link } from 'react-router-dom'
import { getRecommendedPrograms } from '../../data/mockData'
import StudentLayout from '../../layouts/StudentLayout'

function StudentDashboard() {
  return (
    <StudentLayout>
      <div className="p-6">
            <div className="mb-6 rounded-lg p-8 text-white relative overflow-hidden" style={{ backgroundColor: '#2563EB' }}>
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">Welcome back, Alex!</h1>
                <p className="text-lg mb-6 opacity-90">Track your admission progress and discover new opportunities.</p>
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg cursor-pointer transition-colors hover:bg-gray-100 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Admissions
                  </button>
                  <button className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg cursor-pointer transition-colors hover:bg-white hover:text-blue-600">
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
                <p className="text-3xl font-bold mb-1" style={{ color: '#111827' }}>8</p>
                <p className="text-xs" style={{ color: '#10B981' }}>+2 this week</p>
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
                <p className="text-3xl font-bold" style={{ color: '#111827' }}>24</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                    <svg className="w-6 h-6" style={{ color: '#FACC15' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Deadlines</p>
                <p className="text-3xl font-bold mb-1" style={{ color: '#111827' }}>5</p>
                <p className="text-xs text-gray-500">In next 7 days</p>
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
                <p className="text-3xl font-bold mb-1" style={{ color: '#111827' }}>12</p>
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
                  {getRecommendedPrograms(4).map((program) => {
                    const getStatusColor = (status: string) => {
                      if (status === 'Open') return { bg: '#D1FAE5', text: '#10B981' }
                      if (status === 'Closing Soon') return { bg: '#FEF3C7', text: '#FACC15' }
                      return { bg: '#FEE2E2', text: '#EF4444' }
                    }
                    const statusColors = getStatusColor(program.status)
                    return (
                      <Link
                        to={`/program/${program.id}`}
                        key={program.id}
                        className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1 text-lg" style={{ color: '#111827' }}>{program.title}</h3>
                            <p className="text-sm text-gray-600">{program.university}</p>
                          </div>
                          <span className="text-sm font-medium px-2 py-1 rounded" style={{ color: '#10B981', backgroundColor: '#D1FAE5' }}>
                            {program.match} Match
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
                            {program.status}
                          </span>
                          <p className="text-xs text-gray-600">Deadline: {program.deadline}</p>
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
                    <button className="text-sm font-medium cursor-pointer transition-colors" style={{ color: '#2563EB' }}>View All</button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { university: 'FAST University', program: 'BS Computer Science', days: 3, color: '#EF4444' },
                      { university: 'LUMS', program: 'MBA', days: 7, color: '#FACC15' },
                      { university: 'NUST', program: 'BS Electrical Engineering', days: 14, color: '#10B981' },
                    ].map((deadline, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: deadline.color }}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1" style={{ color: '#111827' }}>{deadline.university}</p>
                          <p className="text-xs text-gray-600 mb-1">{deadline.program}</p>
                          <p className="text-xs" style={{ color: deadline.color }}>Deadline in {deadline.days} days</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold" style={{ color: '#111827' }}>Recent Activity</h2>
                    <button className="text-sm font-medium cursor-pointer transition-colors" style={{ color: '#2563EB' }}>View All</button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { action: 'Application submitted to LUMS', iconType: 'paper', time: '2 hours ago' },
                      { action: 'Saved 3 new programs', iconType: 'bookmark', time: 'Yesterday' },
                      { action: 'Deadline reminder set for NUST', iconType: 'bell', time: '3 days ago' },
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E0E7FF' }}>
                          {activity.iconType === 'paper' && (
                            <svg className="w-4 h-4" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
                    ))}
                  </div>
                </div>
              </div>
            </div>
      </div>
    </StudentLayout>
  )
}

export default StudentDashboard

