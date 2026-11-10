import { useState, useMemo } from 'react'
import AdmissionCard from '../../components/student/AdmissionCard'
import { dayKey } from '../../utils/appDates'
import StudentLayout from '../../layouts/StudentLayout'
import type { StudentAdmission } from '../../data/studentData'
import { useStudentStore } from '../../store/studentStore'
import { useToast } from '../../contexts/ToastContext'
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData'
import { filterStudentVisibleAdmissions } from '../../utils/studentFilters'
import { formatDisplayDateLong } from '../../utils/dateUtils'

const toDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Deadline day in Pakistan time (same rule as the dashboard and the mobile app). */
const normalizeDeadlineDate = (deadline?: string | null) => (deadline ? dayKey(deadline) : '')

const RANGES: Array<{ value: string; label: string }> = [
  { value: 'week', label: 'This week' },
  { value: 'month', label: '30 days' },
  { value: '3months', label: '90 days' },
  { value: '', label: 'All' },
]

const DeadlineHeader = ({
  universities,
  degrees,
  university,
  degree,
  range,
  savedOnly,
  search,
  onUniversity,
  onDegree,
  onRange,
  onSavedOnly,
  onSearch,
}: {
  universities: string[]
  degrees: string[]
  university: string
  degree: string
  range: string
  savedOnly: boolean
  search: string
  onUniversity: (value: string) => void
  onDegree: (value: string) => void
  onRange: (value: string) => void
  onSavedOnly: (value: boolean) => void
  onSearch: (value: string) => void
}) => (
  <div className="bg-white border-b border-gray-200 px-6 py-4 space-y-3">
    <h1 className="text-2xl font-bold text-gray-900">Deadlines</h1>
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        placeholder="Search program or university"
        aria-label="Search deadlines"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select value={university} onChange={(e) => onUniversity(e.target.value)} aria-label="University" className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
        <option value="">All universities</option>
        {universities.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
      <select value={degree} onChange={(e) => onDegree(e.target.value)} aria-label="Degree" className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
        <option value="">All degrees</option>
        {degrees.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <div className="flex items-center gap-1" role="group" aria-label="Time range">
        {RANGES.map((r) => (
          <button
            key={r.value || 'all'}
            type="button"
            onClick={() => onRange(r.value)}
            aria-pressed={range === r.value}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${range === r.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={savedOnly} onChange={(e) => onSavedOnly(e.target.checked)} />
        Saved only
      </label>
    </div>
  </div>
)

const DeadlineCard = ({ deadline, onAlertToggle }: { deadline: StudentAdmission & { daysRemaining: number; alertEnabled: boolean }; onAlertToggle: (id: string) => void }) => (
  <AdmissionCard
    admission={deadline}
    footer={
      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 accent-blue-600"
          checked={deadline.alertEnabled}
          disabled={deadline.programStatus === 'Closed'}
          onChange={() => onAlertToggle(deadline.id)}
        />
        Deadline reminders
      </label>
    }
  />
)

const DeadlineList = ({ deadlines, onAlertToggle }: { deadlines: (StudentAdmission & { daysRemaining: number; alertEnabled: boolean })[]; onAlertToggle: (id: string) => void }) => {
  const isClosedDeadline = (deadline: StudentAdmission & { daysRemaining: number }) =>
    deadline.programStatus === 'Closed' || deadline.daysRemaining < 0

  const openDeadlines = deadlines
    .filter((deadline) => !isClosedDeadline(deadline))
    .sort((a, b) => a.daysRemaining - b.daysRemaining)

  const closedDeadlines = deadlines
    .filter((deadline) => isClosedDeadline(deadline))
    .sort((a, b) => b.daysRemaining - a.daysRemaining)

  const groupByDate = (items: (StudentAdmission & { daysRemaining: number; alertEnabled: boolean })[]) => {
    return items.reduce((acc, deadline) => {
      const date = normalizeDeadlineDate(deadline.deadline)
      if (!date) {
        return acc
      }
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(deadline)
      return acc
    }, {} as Record<string, (StudentAdmission & { daysRemaining: number; alertEnabled: boolean })[]>)
  }

  const sortDatesAsc = (grouped: Record<string, (StudentAdmission & { daysRemaining: number; alertEnabled: boolean })[]>) => {
    return Object.keys(grouped).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })
  }

  const sortDatesDesc = (grouped: Record<string, (StudentAdmission & { daysRemaining: number; alertEnabled: boolean })[]>) => {
    return Object.keys(grouped).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime()
    })
  }

  const openGrouped = groupByDate(openDeadlines)
  const closedGrouped = groupByDate(closedDeadlines)
  const openDates = sortDatesAsc(openGrouped)
  const closedDates = sortDatesDesc(closedGrouped)

  return (
    <div className="space-y-8">
      {openDates.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>
            Upcoming Deadlines
          </h2>
          <div className="space-y-8">
            {openDates.map((date) => (
              <div key={`open-${date}`}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
                  {formatDisplayDateLong(date)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {openGrouped[date].map((deadline) => (
                    <DeadlineCard key={deadline.id} deadline={deadline} onAlertToggle={onAlertToggle} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {closedDates.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#6B7280' }}>
            Closed / Passed
          </h2>
          <div className="space-y-8">
            {closedDates.map((date) => (
              <div key={`closed-${date}`}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#6B7280' }}>
                  {formatDisplayDateLong(date)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {closedGrouped[date].map((deadline) => (
                    <DeadlineCard key={deadline.id} deadline={deadline} onAlertToggle={onAlertToggle} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <svg className="w-24 h-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h2 className="text-2xl font-semibold mb-2" style={{ color: '#111827' }}>No Deadlines Found</h2>
      <p className="text-gray-600 text-center max-w-md">Try adjusting your filters or search terms to find deadlines.</p>
    </div>
  )
}

const AiSummaryBox = ({ count }: { count: number }) => {
  return (
    <div className="mx-6 mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <svg className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div>
          <h3 className="font-semibold mb-1" style={{ color: '#111827' }}> Summary</h3>
          <p className="text-sm text-gray-700">
            {count} deadline{count !== 1 ? 's' : ''} approaching in the next 7 days. Make sure to submit your applications on time.
          </p>
        </div>
      </div>
    </div>
  )
}

const CalendarView = ({ deadlines, selectedDate, onDateSelect }: { deadlines: (StudentAdmission & { daysRemaining: number })[]; selectedDate: string | null; onDateSelect: (date: string | null) => void }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  const formatDateForComparison = (date: Date) => toDateKey(date)

  const getDeadlineCountForDate = (date: Date) => {
    const dateStr = formatDateForComparison(date)
    const count = deadlines.filter(d => {
      if (d.deadline) {
        const normalizedDeadline = normalizeDeadlineDate(d.deadline)
        return normalizedDeadline === dateStr
      }
      return false
    }).length
    return count
  }

  const getDeadlineStatusForDate = (date: Date) => {
    const dateStr = formatDateForComparison(date)
    const dateDeadlines = deadlines.filter(d => {
      if (d.deadline) {
        const normalizedDeadline = normalizeDeadlineDate(d.deadline)
        return normalizedDeadline === dateStr
      }
      return false
    })
    if (dateDeadlines.length === 0) return null

    const activeDeadlines = dateDeadlines.filter(d => d.daysRemaining >= 0)
    if (activeDeadlines.length === 0) return 'closed'
    if (activeDeadlines.some(d => d.daysRemaining <= 7)) return 'urgent'
    return 'upcoming'
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day)
    const dateStr = formatDateForComparison(date)
    if (selectedDate === dateStr) {
      onDateSelect(null)
    } else {
      onDateSelect(dateStr)
    }
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const today = new Date()
  const isToday = (day: number) => {
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>Calendar View</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium" style={{ color: '#111827', minWidth: '140px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const date = new Date(year, month, day)
          const deadlineCount = getDeadlineCountForDate(date)
          const status = getDeadlineStatusForDate(date)
          const dateStr = formatDateForComparison(date)
          const isSelected = selectedDate === dateStr

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`aspect-square rounded-lg text-sm font-medium cursor-pointer transition-colors relative ${
                isToday(day) ? 'ring-2 ring-blue-500' : ''
              } ${
                isSelected ? 'bg-blue-600 text-white' : 
                status === 'urgent' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                status === 'closed' ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' :
                status === 'upcoming' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {day}
              {deadlineCount > 0 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-0.5">
                  {deadlineCount === 1 ? (
                    <span className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-white' :
                      status === 'urgent' ? 'bg-red-600' :
                      status === 'closed' ? 'bg-gray-500' :
                      'bg-green-600'
                    }`}></span>
                  ) : deadlineCount === 2 ? (
                    <>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' :
                        status === 'urgent' ? 'bg-red-600' :
                        status === 'closed' ? 'bg-gray-500' :
                        'bg-green-600'
                      }`}></span>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' :
                        status === 'urgent' ? 'bg-red-600' :
                        status === 'closed' ? 'bg-gray-500' :
                        'bg-green-600'
                      }`}></span>
                    </>
                  ) : (
                    <>
                      <span className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' :
                        status === 'urgent' ? 'bg-red-600' :
                        status === 'closed' ? 'bg-gray-500' :
                        'bg-green-600'
                      }`}></span>
                      <span className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' :
                        status === 'urgent' ? 'bg-red-600' :
                        status === 'closed' ? 'bg-gray-500' :
                        'bg-green-600'
                      }`}></span>
                      <span className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' :
                        status === 'urgent' ? 'bg-red-600' :
                        status === 'closed' ? 'bg-gray-500' :
                        'bg-green-600'
                      }`}></span>
                    </>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-100 border border-green-600"></div>
            <span className="text-gray-600">Upcoming deadlines</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-100 border border-red-600"></div>
            <span className="text-gray-600">Urgent (within 7 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-500"></div>
            <span className="text-gray-600">Closed/Passed</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeadlinePage() {
  const { admissions: rawAdmissions } = useStudentDashboardData()
  
  // ✅ Filter admissions - HIDE rejected admissions from students
  const admissions = useMemo(
    () => filterStudentVisibleAdmissions(rawAdmissions),
    [rawAdmissions]
  )
  
  const { showError, showSuccess } = useToast()
  const toggleAlert = useStudentStore((state) => state.toggleAlert)
  const [universityFilter, setUniversityFilter] = useState('')
  const [degreeFilter, setDegreeFilter] = useState('')
  // Same default as the mobile app: the next 30 days.
  const [dateRangeFilter, setDateRangeFilter] = useState('month')
  const [savedOnly, setSavedOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const universities = useMemo(() => {
    return Array.from(new Set(admissions.map(admission => admission.university))).sort()
  }, [admissions])

  const degrees = useMemo(
    () => Array.from(new Set(admissions.map((a) => a.degree).filter((d) => d && d !== 'Not specified'))).sort(),
    [admissions]
  )

  // Programs with an announced deadline; days left and status come from the shared transform.
  const deadlines = useMemo(
    () =>
      admissions
        .filter((admission) => admission.hasDeadline !== false && Boolean(admission.deadline))
        .map((admission) => ({ ...admission, alertEnabled: Boolean(admission.alertEnabled) })),
    [admissions]
  )


  const handleAlertToggle = (id: string) => {
    toggleAlert(id, { showError, showSuccess })
  }

  const filteredDeadlines = useMemo(() => {
    return deadlines.filter(deadline => {
      if (savedOnly && !deadline.saved) return false
      if (universityFilter && deadline.university !== universityFilter) return false
      if (degreeFilter && deadline.degree !== degreeFilter) return false
      if (searchQuery && !deadline.university.toLowerCase().includes(searchQuery.toLowerCase()) && !deadline.program.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (selectedDate) {
        const normalizedDeadline = normalizeDeadlineDate(deadline.deadline)
        if (normalizedDeadline !== selectedDate) return false
      }
      if (dateRangeFilter === 'week') {
        return deadline.daysRemaining >= 0 && deadline.daysRemaining <= 7
      }
      if (dateRangeFilter === 'month') {
        return deadline.daysRemaining >= 0 && deadline.daysRemaining <= 30
      }
      if (dateRangeFilter === '3months') {
        return deadline.daysRemaining >= 0 && deadline.daysRemaining <= 90
      }
      return true
    })
  }, [deadlines, universityFilter, degreeFilter, searchQuery, selectedDate, dateRangeFilter, savedOnly])

  const approachingCount = filteredDeadlines.filter(d => d.daysRemaining >= 0 && d.daysRemaining <= 7).length

  return (
    <StudentLayout>
      <div className="flex flex-col h-full">
        <DeadlineHeader
          universities={universities}
          degrees={degrees}
          university={universityFilter}
          degree={degreeFilter}
          range={dateRangeFilter}
          savedOnly={savedOnly}
          search={searchQuery}
          onUniversity={setUniversityFilter}
          onDegree={setDegreeFilter}
          onRange={setDateRangeFilter}
          onSavedOnly={setSavedOnly}
          onSearch={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-6 px-6 py-6">
            <div className="flex-1 min-w-0">
              {filteredDeadlines.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {approachingCount > 0 && <AiSummaryBox count={approachingCount} />}
                  <DeadlineList deadlines={filteredDeadlines} onAlertToggle={handleAlertToggle} />
                </>
              )}
            </div>
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <CalendarView 
                deadlines={deadlines} 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </aside>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}

export default DeadlinePage

