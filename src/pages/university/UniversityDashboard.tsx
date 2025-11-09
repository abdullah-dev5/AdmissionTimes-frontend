import { useState } from 'react'
import { Link } from 'react-router-dom'

function UniversityDashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [activeTab, setActiveTab] = useState('Views')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Soonest to Close')

  const admissions = [
    {
      id: '1',
      title: 'MBA Spring 2025',
      deadline: '2025-01-15',
      status: 'Active',
      views: '1.2k'
    },
    {
      id: '2',
      title: 'B.Sc. Computer Science',
      deadline: '2024-12-20',
      status: 'Closing Soon',
      views: '890'
    },
    {
      id: '3',
      title: 'Ph.D. in Physics',
      deadline: '2025-02-01',
      status: 'Draft',
      views: '150'
    },
    {
      id: '4',
      title: 'M.A. in History',
      deadline: '2024-11-30',
      status: 'Active',
      views: '640'
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return { bg: '#D1FAE5', text: '#10B981' }
      case 'Closing Soon': return { bg: '#FEF3C7', text: '#F59E0B' }
      case 'Draft': return { bg: '#DBEAFE', text: '#2563EB' }
      case 'Closed': return { bg: '#FEE2E2', text: '#EF4444' }
      default: return { bg: '#F3F4F6', text: '#6B7280' }
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <span className="font-semibold text-lg" style={{ color: '#111827' }}>AdmissionTimes</span>
            </div>
          </div>
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1 mb-6">
              {[
                { name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', link: '/university/dashboard' },
                { name: 'Manage Admissions', icon: 'M9 12h6m-6 4h6m-2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2.5', link: '/university/manage-admissions' },
                { name: 'Programs', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', link: '#' },
                { name: 'Announcements', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', link: '#' },
                { name: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', link: '#' },
                { name: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', link: '#' },
                { name: 'Logout', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1', link: '#' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.link || '#'}
                    onClick={() => setActiveNav(item.name)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors ${
                      activeNav === item.name
                        ? 'text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={activeNav === item.name ? { backgroundColor: '#2563EB' } : {}}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search admissions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#111827' }}
                />
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-6">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                View All Admissions
              </button>
              <Link
                to="/university/manage-admissions"
                className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
                style={{ backgroundColor: '#2563EB' }}
              >
                + New Admission
              </Link>
              <div className="flex items-center gap-2 ml-4 cursor-pointer">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EC4899' }}>
                  <span className="text-white font-medium">U</span>
                </div>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Welcome back!</h1>
              <p className="text-gray-600">Here's your admission overview for today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Admissions</p>
                    <p className="text-3xl font-bold" style={{ color: '#111827' }}>12</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E0E7FF' }}>
                    <svg className="w-6 h-6" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Views</p>
                    <p className="text-3xl font-bold" style={{ color: '#111827' }}>4.2k</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E0E7FF' }}>
                    <svg className="w-6 h-6" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Closing Soon</p>
                    <p className="text-3xl font-bold" style={{ color: '#111827' }}>3</p>
                    <p className="text-xs text-gray-500 mt-1">this week</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                    <svg className="w-6 h-6" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Verified Admissions</p>
                    <p className="text-3xl font-bold" style={{ color: '#111827' }}>10/12</p>
                    <p className="text-xs text-gray-500 mt-1">(83%)</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                    <svg className="w-6 h-6" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold" style={{ color: '#111827' }}>Engagement Trends</h2>
                  <div className="flex items-center gap-2">
                    {['Views', 'Clicks', 'Reminders'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 text-sm font-medium rounded cursor-pointer transition-colors ${
                          activeTab === tab
                            ? 'text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        style={activeTab === tab ? { backgroundColor: '#2563EB' } : {}}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-64 flex items-end justify-between gap-2">
                  {[100, 300, 200, 400, 250].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full rounded-t cursor-pointer transition-colors hover:opacity-80"
                        style={{ backgroundColor: '#2563EB', height: `${(height / 500) * 100}%`, minHeight: '20px' }}
                      ></div>
                      <p className="text-xs text-gray-500 mt-2">
                        {['Oct 7', 'Oct 14', 'Oct 21', 'Oct 28', 'Nov 4'][index]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#111827' }}>Admission Status</h2>
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="16"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="16"
                      strokeDasharray={`${2 * Math.PI * 80 * 0.65} ${2 * Math.PI * 80}`}
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="16"
                      strokeDasharray={`${2 * Math.PI * 80 * 0.15} ${2 * Math.PI * 80}`}
                      strokeDashoffset={`-${2 * Math.PI * 80 * 0.65}`}
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="16"
                      strokeDasharray={`${2 * Math.PI * 80 * 0.1} ${2 * Math.PI * 80}`}
                      strokeDashoffset={`-${2 * Math.PI * 80 * 0.8}`}
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="16"
                      strokeDasharray={`${2 * Math.PI * 80 * 0.1} ${2 * Math.PI * 80}`}
                      strokeDashoffset={`-${2 * Math.PI * 80 * 0.9}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold" style={{ color: '#111827' }}>12</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                      <span className="text-sm text-gray-600">Active</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#111827' }}>65.0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                      <span className="text-sm text-gray-600">Closed</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#111827' }}>15.0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2563EB' }}></div>
                      <span className="text-sm text-gray-600">Draft</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#111827' }}>10.0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6B7280' }}></div>
                      <span className="text-sm text-gray-600">Expired</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#111827' }}>10.0%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: '#111827' }}>Recent Admissions</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option>All</option>
                      <option>Active</option>
                      <option>Closing Soon</option>
                      <option>Draft</option>
                      <option>Closed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option>Soonest to Close</option>
                      <option>Latest First</option>
                      <option>Most Views</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">TITLE</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">DEADLINE</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">STATUS</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">VIEWS</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissions.map((admission) => {
                      const statusColors = getStatusColor(admission.status)
                      return (
                        <tr key={admission.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <p className="font-medium" style={{ color: '#111827' }}>{admission.title}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-600">{admission.deadline}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
                              {admission.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-600">{admission.views}</p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <button className="p-1 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button className="p-1 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button className="p-1 text-gray-600 hover:text-red-600 cursor-pointer transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default UniversityDashboard

