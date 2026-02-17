import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout'
import { getStatusColor, calculateDaysRemaining, type StudentAdmission } from '../../data/studentData'
import { useStudentStore } from '../../store/studentStore'
import { useToast } from '../../contexts/ToastContext'
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData'
import { filterStudentVisibleAdmissions } from '../../utils/studentFilters'
import UpdatedBadge from '../../components/admin/UpdatedBadge'

const DeadlineHeader = ({ 
  onUniversityFilter, 
  onDegreeFilter, 
  onDateRangeFilter,
  onSearch,
  searchValue,
  universities
}: { 
  onUniversityFilter: (value: string) => void
  onDegreeFilter: (value: string) => void
  onDateRangeFilter: (value: string) => void
  onSearch: (value: string) => void
  searchValue: string
  universities: string[]
}) => {
  return (
    <div className="bg-white flex flex-col border-b border-gray-200 px-6 py-3">
      <div className="mb-3">
        <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Upcoming Deadlines</h1>
      </div>
      <div className="flex flex-row  gap-3 items-center justify-between">
      <div className="w-200 px-4 py-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for program or university name..."
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <select
          onChange={(e) => onUniversityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
        >
          <option value="">All Universities</option>
          {universities.map(uni => (
            <option key={uni} value={uni}>{uni}</option>
          ))}
        </select>
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
          onChange={(e) => onDateRangeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
        >
          <option value="">All Dates</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="3months">Next 3 Months</option>
        </select>
      </div>
    </div>
    </div>
  )
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

const DeadlineCard = ({ deadline, onAlertToggle }: { deadline: StudentAdmission & { daysRemaining: number; alertEnabled: boolean }; onAlertToggle: (id: string) => void }) => {
  const statusColors = getStatusColor(deadline.status)
  const isClosed = deadline.programStatus === 'Closed' || deadline.daysRemaining < 0

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${isClosed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ backgroundColor: '#1F2937' }}>
            {deadline.university.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="font-semibold text-lg mb-1 truncate" style={{ color: '#111827' }} title={deadline.university}>{deadline.university}</h3>
            <p className="text-sm text-gray-600 truncate" title={deadline.program}>{deadline.program}</p>
          </div>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 whitespace-nowrap" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
          {deadline.programStatus}
        </span>
      </div>
      
      {/* ✅ Show Updated Tag if status is Updated (after admin verification) */}
      {deadline.status === 'Updated' && (
        <div className="mb-4">
          <UpdatedBadge size="sm" showTime={false} />
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <span className="text-gray-700">{deadline.degree}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={`font-medium ${isClosed ? 'text-gray-500' : 'text-red-600'}`}>{deadline.deadlineDisplay}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`font-medium ${isClosed ? 'text-gray-500' : deadline.daysRemaining <= 7 ? 'text-red-600' : 'text-gray-700'}`}>
            {deadline.daysRemaining < 0 ? 'Deadline Passed' : `${deadline.daysRemaining} days left`}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Alert</span>
          <AlertToggle enabled={deadline.alertEnabled} onToggle={() => onAlertToggle(deadline.id)} />
        </div>
        <Link
          to={`/program/${deadline.id}`}
          className="text-sm font-medium cursor-pointer transition-colors hover:opacity-80"
          style={{ color: '#2563EB' }}
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}

const DeadlineList = ({ deadlines, onAlertToggle }: { deadlines: (StudentAdmission & { daysRemaining: number; alertEnabled: boolean })[]; onAlertToggle: (id: string) => void }) => {
  const groupedDeadlines = deadlines.reduce((acc, deadline) => {
    const date = deadline.deadline
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(deadline)
    return acc
  }, {} as Record<string, (StudentAdmission & { daysRemaining: number; alertEnabled: boolean })[]>)

  const sortedDates = Object.keys(groupedDeadlines).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => (
        <div key={date}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>
            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedDeadlines[date].map((deadline) => (
              <DeadlineCard key={deadline.id} deadline={deadline} onAlertToggle={onAlertToggle} />
            ))}
          </div>
        </div>
      ))}
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
  
  // Debug: Log deadlines passed to calendar
  useEffect(() => {
    if (deadlines.length > 0) {
      console.log('📅 [CalendarView] Received deadlines:', deadlines.length)
      console.log('📅 [CalendarView] Sample deadlines:', deadlines.slice(0, 2).map(d => d.deadline))
    }
  }, [deadlines])
  
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

  const formatDateForComparison = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const normalizeDeadlineDate = (deadline: string) => {
    // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss" formats
    if (!deadline) return ''
    // Extract just the date part (first 10 characters: YYYY-MM-DD)
    return deadline.substring(0, 10)
  }

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
    if (dateDeadlines.some(d => d.status === 'Closed' || d.daysRemaining < 0)) return 'closed'
    if (dateDeadlines.some(d => d.daysRemaining <= 7)) return 'urgent'
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
  
  // ✅ Filter admissions - HIDE rejected and disputed from students
  const admissions = useMemo(
    () => filterStudentVisibleAdmissions(rawAdmissions),
    [rawAdmissions]
  )
  
  const { showError, showSuccess } = useToast()
  const toggleAlert = useStudentStore((state) => state.toggleAlert)
  const [universityFilter, setUniversityFilter] = useState('')
  const [degreeFilter, setDegreeFilter] = useState('')
  const [dateRangeFilter, setDateRangeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const universities = useMemo(() => {
    return Array.from(new Set(admissions.map(admission => admission.university))).sort()
  }, [admissions])

  // Convert shared admissions to deadline format with calculated days remaining
  const deadlines = useMemo(() => {
    return admissions.map(admission => ({
      ...admission,
      daysRemaining: calculateDaysRemaining(admission.deadline),
      alertEnabled: Boolean(admission.alertEnabled),
    }))
  }, [admissions])

  // Debug: Log deadline dates format
  useEffect(() => {
    if (deadlines.length > 0) {
      console.log('📅 [DeadlinePage] Sample deadline dates:', deadlines.slice(0, 3).map(d => ({
        program: d.program,
        deadline: d.deadline,
        daysRemaining: d.daysRemaining
      })))
      console.log('📅 [DeadlinePage] Total deadlines with dates:', deadlines.filter(d => d.deadline).length)
    }
  }, [deadlines])

  const handleAlertToggle = (id: string) => {
    toggleAlert(id, { showError, showSuccess })
  }

  const filteredDeadlines = useMemo(() => {
    return deadlines.filter(deadline => {
      if (universityFilter && !deadline.university.includes(universityFilter)) return false
      if (degreeFilter && deadline.degreeType !== degreeFilter) return false
      if (searchQuery && !deadline.university.toLowerCase().includes(searchQuery.toLowerCase()) && !deadline.program.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (selectedDate) {
        // Normalize both dates for comparison (handle ISO format)
        const normalizedDeadline = deadline.deadline ? deadline.deadline.substring(0, 10) : ''
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
  }, [deadlines, universityFilter, degreeFilter, searchQuery, selectedDate, dateRangeFilter])

  const approachingCount = filteredDeadlines.filter(d => d.daysRemaining >= 0 && d.daysRemaining <= 7).length

  return (
    <StudentLayout>
      <div className="flex flex-col h-full">
        <DeadlineHeader
          onUniversityFilter={setUniversityFilter}
          onDegreeFilter={setDegreeFilter}
          onDateRangeFilter={setDateRangeFilter}
          onSearch={setSearchQuery}
          searchValue={searchQuery}
          universities={universities}
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

