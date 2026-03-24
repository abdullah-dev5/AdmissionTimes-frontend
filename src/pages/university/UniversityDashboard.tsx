import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UniversityLayout from '../../layouts/UniversityLayout'
import { getStatusColor } from '../../data/universityData'
import { useUniversityStore } from '../../store/universityStore'
import { formatDateTime } from '../../utils/dateUtils'
import { showConfirm } from '../../utils/swal'
import { activityService } from '../../services/activityService'

const formatDateTimeSafe = (value?: string) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return formatDateTime(parsed.toISOString())
}

function UniversityDashboard() {
  const navigate = useNavigate()
  const admissions = useUniversityStore((state) => state.admissions)
  const storeStats = useUniversityStore((state) => state.stats)
  const engagementTrends = useUniversityStore((state) => state.engagementTrends)
  const deleteAdmission = useUniversityStore((state) => state.deleteAdmission)
  const [activeTab, setActiveTab] = useState('Views')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState('Soonest to Close')

  const statusBreakdown = useMemo(() => {
    const segments = [
      { label: 'Active', statuses: ['Active', 'Closing Soon'], color: '#10B981' },
      { label: 'Pending', statuses: ['Pending Audit'], color: '#F59E0B' },
      { label: 'Verified', statuses: ['Verified'], color: '#2563EB' },
      { label: 'Rejected', statuses: ['Rejected'], color: '#EF4444' },
      { label: 'Draft', statuses: ['Draft'], color: '#9CA3AF' },
      { label: 'Closed', statuses: ['Closed'], color: '#6B7280' },
    ]

    const total = admissions.length
    const items = segments.map((segment) => {
      const count = admissions.filter((a) => segment.statuses.includes(a.status)).length
      const percent = total > 0 ? (count / total) * 100 : 0
      return { ...segment, count, percent }
    })

    return { total, items: items.filter((item) => item.count > 0) }
  }, [admissions])

  // Calculate stats from admissions
  const stats = useMemo(() => {
    // Active admissions are those with is_active = true
    const active = admissions.filter(a => a.is_active === true).length
    const totalReminders =
      storeStats?.reminder_notifications ?? engagementTrends.reminders.reduce((sum, count) => sum + count, 0)
    const closingSoon = admissions.filter(a => {
      if (!a.deadline) return false
      const deadline = new Date(a.deadline)
      const now = new Date()
      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays > 0
    }).length
    const verified = storeStats?.verified_admissions ?? admissions.filter(a => a.status === 'Verified').length
    const total = storeStats?.total_admissions ?? admissions.length

    return { active, totalReminders, closingSoon, verified, total }
  }, [admissions, storeStats, engagementTrends.reminders])

  // Filter and sort admissions
  const filteredAdmissions = useMemo(() => {
    let filtered = [...admissions]
    
    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(a => a.status === statusFilter)
    }

    // Sort
    if (sortBy === 'Soonest to Close') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.deadline).getTime()
        const dateB = new Date(b.deadline).getTime()
        return dateA - dateB
      })
    } else if (sortBy === 'Latest First') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.deadline).getTime()
        const dateB = new Date(b.deadline).getTime()
        return dateB - dateA
      })
    } else if (sortBy === 'Most Views') {
      filtered.sort((a, b) => {
        const viewsA = a.views ? parseInt(a.views.replace('k', '000').replace(/[^\d]/g, '')) || 0 : 0
        const viewsB = b.views ? parseInt(b.views.replace('k', '000').replace(/[^\d]/g, '')) || 0 : 0
        return viewsB - viewsA
      })
    }

    return filtered
  }, [admissions, statusFilter, sortBy])

  // Limit to 10 most recent for dashboard display
  const recentAdmissions = useMemo(() => {
    return filteredAdmissions.slice(0, 10)
  }, [filteredAdmissions])

  const chartData = useMemo(() => {
    const fallbackLabels = ['Oct 7', 'Oct 14', 'Oct 21', 'Oct 28', 'Nov 4']
    const fallbackSeries = {
      Views: [100, 300, 200, 400, 250],
      Clicks: [90, 220, 170, 260, 210],
      Reminders: [20, 40, 30, 50, 35],
      Saved: [10, 18, 16, 25, 19],
    }

    const tabKey = activeTab as 'Views' | 'Clicks' | 'Reminders' | 'Saved'
    const hasApiData =
      engagementTrends.labels.length > 0 &&
      (
        engagementTrends.views.length > 0 ||
        engagementTrends.clicks.length > 0 ||
        engagementTrends.reminders.length > 0 ||
        engagementTrends.saves.length > 0
      )

    const labels = hasApiData ? engagementTrends.labels : fallbackLabels
    const series = hasApiData
      ? {
          Views: engagementTrends.views,
          Clicks: engagementTrends.clicks,
          Reminders: engagementTrends.reminders,
          Saved: engagementTrends.saves,
        }
      : fallbackSeries

    const values = (series[tabKey] || []).slice(0, labels.length)
    const normalizedValues = values.length === labels.length ? values : labels.map((_, index) => values[index] || 0)
    const maxValue = Math.max(...normalizedValues, 1)

    return {
      labels,
      values: normalizedValues,
      maxValue,
    }
  }, [activeTab, engagementTrends])

  const handleEdit = (id: string) => {
    activityService.track({
      activity_type: 'searched',
      entity_type: 'admission',
      entity_id: id,
      metadata: { source: 'university_dashboard', action: 'edit_click' },
    }).catch(() => {})
    navigate(`/university/manage-admissions?edit=${id}`)
  }

  const handleView = (id: string) => {
    activityService.track({
      activity_type: 'viewed',
      entity_type: 'admission',
      entity_id: id,
      metadata: { source: 'university_dashboard', action: 'view_click' },
    }).catch(() => {})
    navigate(`/university/verification-center`)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm('Delete Admission?', 'Are you sure you want to delete this admission?', 'Delete')
    if (confirmed) {
      activityService.track({
        activity_type: 'searched',
        entity_type: 'admission',
        entity_id: id,
        metadata: { source: 'university_dashboard', action: 'delete_click' },
      }).catch(() => {})
      deleteAdmission(id)
    }
  }

  return (
    <UniversityLayout>
      <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Welcome back!</h1>
                <p className="text-gray-600">Here's your admission overview for today.</p>
              </div>
              <button
                onClick={() => navigate('/university/manage-admissions')}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
                style={{ backgroundColor: '#2563EB' }}
              >
                + New Admission
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Admissions</p>
                    <p className="text-3xl font-bold" style={{ color: '#111827' }}>{stats.active}</p>
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
                    <p className="text-sm text-gray-600 mb-1">Reminders Sent</p>
                    <p className="text-3xl font-bold" style={{ color: '#111827' }}>{stats.totalReminders}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E0E7FF' }}>
                    <svg className="w-6 h-6" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a3 3 0 006 0" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Closing Soon</p>
                    <p className="text-3xl font-bold" style={{ color: '#111827' }}>{stats.closingSoon}</p>
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
                    <p className="text-3xl font-bold" style={{ color: '#111827' }}>{stats.verified}/{stats.total}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      ({stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%)
                    </p>
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
                    {['Views', 'Clicks', 'Reminders', 'Saved'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setActiveTab(tab)
                          const firstAdmissionId = admissions[0]?.id
                          if (!firstAdmissionId) return

                          activityService.track({
                            activity_type: tab === 'Views' ? 'viewed' : 'searched',
                            entity_type: 'admission',
                            entity_id: firstAdmissionId,
                            metadata: { source: 'university_dashboard', action: `${tab.toLowerCase()}_tab_click` },
                          }).catch(() => {})
                        }}
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
                  {chartData.values.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full rounded-t cursor-pointer transition-colors hover:opacity-80"
                        style={{ backgroundColor: '#2563EB', height: `${(value / chartData.maxValue) * 100}%`, minHeight: '20px' }}
                      ></div>
                      <p className="text-xs text-gray-500 mt-2">
                        {chartData.labels[index]}
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
                    {(() => {
                      const radius = 80
                      const circumference = 2 * Math.PI * radius
                      let offset = 0

                      return statusBreakdown.items.map((item) => {
                        const length = circumference * (item.count / statusBreakdown.total)
                        const segment = (
                          <circle
                            key={item.label}
                            cx="96"
                            cy="96"
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth="16"
                            strokeDasharray={`${length} ${circumference}`}
                            strokeDashoffset={`-${offset}`}
                          />
                        )
                        offset += length
                        return segment
                      })
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: '#111827' }}>{stats.total}</p>
                    <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {statusBreakdown.items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-600">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#111827' }}>
                        {item.percent.toFixed(1)}%
                      </span>
                    </div>
                  ))}
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
                    <option>Pending Audit</option>
                    <option>Verified</option>
                    <option>Rejected</option>
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
                    {recentAdmissions.map((admission) => {
                      const statusColors = getStatusColor(admission.status)
                      return (
                        <tr key={admission.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <p className="font-medium" style={{ color: '#111827' }}>{admission.title}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-600">{formatDateTimeSafe(admission.deadline)}</p>
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
                              <button 
                                onClick={() => handleEdit(admission.id)}
                                className="p-1 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleView(admission.id)}
                                className="p-1 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                                title="View Details"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDelete(admission.id)}
                                className="p-1 text-gray-600 hover:text-red-600 cursor-pointer transition-colors"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredAdmissions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                          No admissions found. Adjust filters or create a new admission.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
      </div>
    </UniversityLayout>
  )
}

export default UniversityDashboard

