import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout'
import { getStatusColor, calculateDaysRemaining } from '../../data/studentData'
import { useStudentStore } from '../../store/studentStore'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData'

// Helper function to convert match percentage to text label
function getMatchLabel(matchNumeric?: number): string {
  if (!matchNumeric) return 'Match'
  if (matchNumeric >= 90) return 'Excellent Match'
  if (matchNumeric >= 85) return 'High Match'
  if (matchNumeric >= 80) return 'Good Match'
  if (matchNumeric >= 75) return 'Fair Match'
  return 'Match'
}

const AlertToggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

const WatchlistHeader = ({
  onSearch,
  onDegreeFilter,
  onStatusFilter,
  onDeadlineFilter,
  onCompare,
  compareEnabled
}: {
  onSearch: (value: string) => void
  onDegreeFilter: (value: string) => void
  onStatusFilter: (value: string) => void
  onDeadlineFilter: (value: string) => void
  onCompare: () => void
  compareEnabled: boolean
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Saved Programs</h1>
        <button
          onClick={onCompare}
          disabled={!compareEnabled}
          className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-2 ${
            compareEnabled
              ? 'text-white hover:opacity-90'
              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
          }`}
          style={compareEnabled ? { backgroundColor: '#2563EB' } : {}}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          Compare Selected
        </button>
      </div>
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search saved programs..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            onChange={(e) => onDegreeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
          >
            <option value="">All Degrees</option>
            <option value="BS">Bachelor's</option>
            <option value="MS">Master's</option>
            <option value="PhD">PhD</option>
            <option value="MBA">MBA</option>
          </select>
          <select
            onChange={(e) => onStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
          >
            <option value="">All Status</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Updated">Updated</option>
          </select>
          <select
            onChange={(e) => onDeadlineFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
          >
            <option value="">All Deadlines</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="3months">Next 3 Months</option>
          </select>
        </div>
      </div>
    </div>
  )
}

const WatchlistStats = ({ total, alerts, upcoming }: { total: number; alerts: number; upcoming: number }) => {
  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Saved</p>
              <p className="text-2xl font-bold" style={{ color: '#111827' }}>{total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E0E7FF' }}>
              <svg className="w-6 h-6" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
              <p className="text-2xl font-bold" style={{ color: '#111827' }}>{alerts}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
              <svg className="w-6 h-6" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming Deadlines</p>
              <p className="text-2xl font-bold" style={{ color: '#111827' }}>{upcoming}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
              <svg className="w-6 h-6" style={{ color: '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const WatchlistCard = ({
  program,
  isSelected,
  onSelect,
  onAlertToggle,
  onRemove
}: {
  program: StudentAdmission
  isSelected: boolean
  onSelect: (id: string) => void
  onAlertToggle: (id: string) => void
  onRemove: (id: string) => void
}) => {
  const statusColors = getStatusColor(program.status)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(program.id)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
          />
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ backgroundColor: '#1F2937' }}>
            {program.university.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="font-semibold text-lg mb-1 truncate" style={{ color: '#111827' }} title={program.university}>{program.university}</h3>
            <p className="text-sm text-gray-600 truncate" title={program.program}>{program.program}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
            {program.status}
          </span>
          <button
            onClick={() => onRemove(program.id)}
            className="p-2 text-gray-400 hover:text-red-600 cursor-pointer transition-colors flex-shrink-0"
            title="Remove from watchlist"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <span className="text-gray-700">{program.degree}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={`font-medium ${program.daysRemaining <= 7 ? 'text-red-600' : 'text-gray-700'}`}>
            {program.deadlineDisplay} ({program.daysRemaining >= 0 ? `${program.daysRemaining} days left` : 'Deadline passed'})
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-700">{program.fee}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Alert</span>
          <AlertToggle enabled={Boolean(program.alertEnabled)} onToggle={() => onAlertToggle(program.id)} />
        </div>
        <Link
          to={`/program/${program.id}`}
          className="text-sm font-medium cursor-pointer transition-colors hover:opacity-80"
          style={{ color: '#2563EB' }}
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}

const WatchlistGrid = ({
  programs,
  selectedIds,
  onSelect,
  onAlertToggle,
  onRemove
}: {
  programs: StudentAdmission[]
  selectedIds: string[]
  onSelect: (id: string) => void
  onAlertToggle: (id: string) => void
  onRemove: (id: string) => void
}) => {
  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <WatchlistCard
            key={program.id}
            program={program}
            isSelected={selectedIds.includes(program.id)}
            onSelect={onSelect}
            onAlertToggle={onAlertToggle}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}

const AiRecommendationCarousel = ({
  recommendations,
  onSave
}: {
  recommendations: StudentAdmission[]
  onSave: (id: string) => void
}) => {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h2 className="text-xl font-semibold" style={{ color: '#111827' }}>AI Recommendations</h2>
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-[280px] flex-shrink-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-xs" style={{ backgroundColor: '#1F2937' }}>
                  {rec.university.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate" style={{ color: '#111827' }}>{rec.university}</h3>
                  <p className="text-xs text-gray-600 truncate">{rec.program}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#D1FAE5', color: '#10B981' }}>
                  {getMatchLabel(rec.matchNumeric)}
                </span>
              </div>
              <div className="space-y-2 mb-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  </svg>
                  <span>{rec.degree}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{rec.deadlineDisplay}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{rec.fee}</span>
                </div>
              </div>
              <button
                onClick={() => onSave(rec.id)}
                className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
                style={{ backgroundColor: '#2563EB' }}
              >
                Save to Watchlist
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <svg className="w-24 h-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      <h2 className="text-2xl font-semibold mb-2" style={{ color: '#111827' }}>No Saved Programs</h2>
      <p className="text-gray-600 text-center max-w-md mb-6">Start saving programs to track deadlines and manage your applications.</p>
      <Link
        to="/student/search"
        className="px-6 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
        style={{ backgroundColor: '#2563EB' }}
      >
        Browse Programs
      </Link>
    </div>
  )
}

function WatchlistPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showError, showSuccess } = useToast()
  const toggleSaved = useStudentStore((state) => state.toggleSaved)
  const toggleAlert = useStudentStore((state) => state.toggleAlert)
  const { admissions } = useStudentDashboardData()
  const [searchQuery, setSearchQuery] = useState('')
  const [degreeFilter, setDegreeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deadlineFilter, setDeadlineFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Get saved programs from shared data
  const savedPrograms = useMemo(() => {
    const saved = admissions
      .filter(a => a.saved)
      .map(a => ({
        ...a,
        daysRemaining: calculateDaysRemaining(a.deadline),
      }))
    console.log('📚 [WatchlistPage] Filtered saved programs:', saved.length);
    return saved;
  }, [admissions])

  // Get recommendations (not saved, high match)
  const recommendations = useMemo(() => {
    return admissions
      .filter(a => !a.saved && a.matchNumeric && a.matchNumeric >= 80)
      .sort((a, b) => (b.matchNumeric || 0) - (a.matchNumeric || 0))
      .slice(0, 6)
  }, [admissions])

  const handleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleAlertToggle = (id: string) => {
    toggleAlert(id, { showError, showSuccess })
  }

  const handleRemove = (id: string) => {
    if (window.confirm('Remove this program from your watchlist?')) {
      const program = savedPrograms.find(program => program.id === id)
      if (program?.alertEnabled) {
        toggleAlert(id, { showError, showSuccess })
      }
      if (program) {
        toggleSaved(id, { showError })
      }
      setSelectedIds(prev => prev.filter(i => i !== id))
    }
  }

  const handleCompare = () => {
    if (selectedIds.length >= 2 && selectedIds.length <= 4) {
      navigate(`/student/compare?ids=${selectedIds.join(',')}`)
    } else if (selectedIds.length < 2) {
      alert('Please select at least 2 programs to compare.')
    } else {
      alert('Please select a maximum of 4 programs to compare.')
    }
  }

  const handleSaveRecommendation = (id: string) => {
    const isSaved = savedPrograms.some(program => program.id === id)
    if (!isSaved) {
      toggleSaved(id, { showError })
      alert('Program saved to watchlist!')
    } else {
      alert('Program already saved to watchlist.')
    }
  }

  const filteredPrograms = useMemo(() => {
    return savedPrograms.filter(program => {
      if (searchQuery && !program.university.toLowerCase().includes(searchQuery.toLowerCase()) && !program.program.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (degreeFilter && program.degreeType !== degreeFilter) return false
      if (statusFilter && program.status !== statusFilter) return false
      if (deadlineFilter === 'week') {
        return program.daysRemaining >= 0 && program.daysRemaining <= 7
      }
      if (deadlineFilter === 'month') {
        return program.daysRemaining >= 0 && program.daysRemaining <= 30
      }
      if (deadlineFilter === '3months') {
        return program.daysRemaining >= 0 && program.daysRemaining <= 90
      }
      return true
    })
  }, [savedPrograms, searchQuery, degreeFilter, statusFilter, deadlineFilter])

  const activeAlerts = savedPrograms.filter(program => program.alertEnabled).length
  const upcomingDeadlines = savedPrograms.filter(p => p.daysRemaining <= 30 && p.daysRemaining >= 0).length

  return (
    <StudentLayout>
      <div className="flex flex-col h-full">
        <WatchlistHeader
          onSearch={setSearchQuery}
          onDegreeFilter={setDegreeFilter}
          onStatusFilter={setStatusFilter}
          onDeadlineFilter={setDeadlineFilter}
          onCompare={handleCompare}
          compareEnabled={selectedIds.length >= 2}
        />

        <div className="flex-1 overflow-y-auto">
          {savedPrograms.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <WatchlistStats
                total={savedPrograms.length}
                alerts={activeAlerts}
                upcoming={upcomingDeadlines}
              />
              <WatchlistGrid
                programs={filteredPrograms}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onAlertToggle={handleAlertToggle}
                onRemove={handleRemove}
              />
              {recommendations.length > 0 && (
                <AiRecommendationCarousel
                  recommendations={recommendations}
                  onSave={handleSaveRecommendation}
                />
              )}
            </>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}

export default WatchlistPage

