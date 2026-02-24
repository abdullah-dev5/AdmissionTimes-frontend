import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout'
import { getStatusColor, calculateDaysRemaining } from '../../data/studentData'
import { useStudentStore } from '../../store/studentStore'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData'
import { filterStudentVisibleAdmissions } from '../../utils/studentFilters'
import UpdatedBadge from '../../components/admin/UpdatedBadge'

function SearchAdmissions() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showError } = useToast()
  const toggleSaved = useStudentStore((state) => state.toggleSaved)
  const { admissions: rawAdmissions, loading } = useStudentDashboardData()
  
  // ✅ Filter admissions - HIDE rejected and disputed from students
  const admissions = useMemo(
    () => filterStudentVisibleAdmissions(rawAdmissions, true),  // Enable debug logging
    [rawAdmissions]
  )
  
  const [viewMode, setViewMode] = useState('grid')
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [universityFilter, setUniversityFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [degreeFilter, setDegreeFilter] = useState('')
  const [feeRange, setFeeRange] = useState([0, 500000])
  const [feeFilterActive, setFeeFilterActive] = useState(false)  // Track if user has set fee filter
  const [deadlineFilter, setDeadlineFilter] = useState('')
  const [programTitleFilter, setProgramTitleFilter] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('Relevance')
  const [compareIds, setCompareIds] = useState<string[]>([])

  const savedIds = useMemo(() => admissions.filter(a => a.saved).map(a => a.id), [admissions])

  // Get unique values for filters
  const universities = useMemo(() => {
    return Array.from(new Set(admissions.map(a => a.university))).sort()
  }, [admissions])

  const cities = useMemo(() => {
    return Array.from(new Set(admissions.map(a => a.city))).sort()
  }, [admissions])

  const toggleStatus = (status: string) => {
    setSelectedStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const toggleSave = (id: string) => {
    toggleSaved(id, { showError })
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setUniversityFilter('')
    setCityFilter('')
    setDegreeFilter('')
    setFeeRange([0, 500000])
    setFeeFilterActive(false)  // Reset fee filter status
    setDeadlineFilter('')
    setProgramTitleFilter('')
    setSelectedStatus([])
  }

  // Filter and sort admissions
  const filteredAdmissions = useMemo(() => {
    console.log('🔍 [Filter] Starting with', admissions.length, 'admissions');
    let filtered = [...admissions]

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(a =>
        a.university.toLowerCase().includes(query) ||
        a.program.toLowerCase().includes(query) ||
        a.degree.toLowerCase().includes(query)
      )
      console.log('🔍 [Filter] After search query:', filtered.length);
    }

    // University filter
    if (universityFilter) {
      filtered = filtered.filter(a => a.university === universityFilter)
      console.log('🔍 [Filter] After university filter:', filtered.length);
    }

    // City filter
    if (cityFilter) {
      filtered = filtered.filter(a => a.city === cityFilter)
      console.log('🔍 [Filter] After city filter:', filtered.length);
    }

    // Degree filter
    if (degreeFilter) {
      filtered = filtered.filter(a => a.degreeType === degreeFilter)
      console.log('🔍 [Filter] After degree filter:', filtered.length);
    }

    // Fee range filter - only apply if user explicitly set it
    if (feeFilterActive) {
      const beforeFeeFilter = filtered.length
      filtered = filtered.filter(a => {
        const passesFilter = a.feeNumeric >= feeRange[0] && a.feeNumeric <= feeRange[1]
        if (!passesFilter) {
          console.log(`🚫 [Fee Filter] Removing "${a.program}" - fee: ${a.feeNumeric}, range: [${feeRange[0]}, ${feeRange[1]}]`)
        }
        return passesFilter
      })
      console.log('🔍 [Filter] After fee range filter:', filtered.length, `(removed: ${beforeFeeFilter - filtered.length})`)
    } else {
      console.log('🔍 [Filter] Fee range filter skipped (not active)')
    }

    // Deadline filter
    if (deadlineFilter) {
      filtered = filtered.filter(a => a.deadline <= deadlineFilter)
      console.log('🔍 [Filter] After deadline filter:', filtered.length);
    }

    // Program title filter
    if (programTitleFilter.trim()) {
      const query = programTitleFilter.toLowerCase()
      filtered = filtered.filter(a => a.program.toLowerCase().includes(query))
      console.log('🔍 [Filter] After program title filter:', filtered.length);
    }

    // Status filter
    if (selectedStatus.length > 0) {
      filtered = filtered.filter(a => selectedStatus.includes(a.status))
      console.log('🔍 [Filter] After status filter:', filtered.length);
    }

    console.log('🔍 [Filter] Final filtered count:', filtered.length);

    // Sort
    if (sortBy === 'Deadline') {
      filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    } else if (sortBy === 'Fee (Low to High)') {
      filtered.sort((a, b) => a.feeNumeric - b.feeNumeric)
    } else if (sortBy === 'Fee (High to Low)') {
      filtered.sort((a, b) => b.feeNumeric - a.feeNumeric)
    } else if (sortBy === 'Relevance') {
      filtered.sort((a, b) => (b.matchNumeric || 0) - (a.matchNumeric || 0))
    }

    return filtered
  }, [admissions, searchQuery, universityFilter, cityFilter, degreeFilter, feeRange, feeFilterActive, deadlineFilter, programTitleFilter, selectedStatus, sortBy])

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id)
      } else if (prev.length < 4) {
        return [...prev, id]
      } else {
        alert('You can compare up to 4 programs at once. Please remove one first.')
        return prev
      }
    })
  }

  const handleCompare = () => {
    if (compareIds.length >= 2) {
      navigate(`/student/compare?ids=${compareIds.join(',')}`)
    } else {
      alert('Please select at least 2 programs to compare.')
    }
  }

  return (
    <StudentLayout>
      <div className="p-6">
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for programs, universities, or use AI search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#111827' }}
                />
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                onClick={() => {
                  // In real app, this would trigger AI search
                  alert('AI Search feature coming soon!')
                }}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90" 
                style={{ backgroundColor: '#2563EB' }}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {filtersCollapsed ? (
            <button
              onClick={() => setFiltersCollapsed(false)}
              className="h-fit px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Show Filters
            </button>
          ) : (
            <aside className="w-80 bg-white rounded-lg shadow-sm p-6 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>Filters</h2>
                <button
                  onClick={() => setFiltersCollapsed(true)}
                  className="p-1 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      University
                    </label>
                  <select
                    value={universityFilter}
                    onChange={(e) => setUniversityFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
                  >
                    <option value="">All Universities</option>
                    {universities.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      City
                    </label>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
                  >
                    <option value="">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      Degree
                    </label>
                  <select
                    value={degreeFilter}
                    onChange={(e) => setDegreeFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
                  >
                    <option value="">Any Degree</option>
                    <option value="BS">BS</option>
                    <option value="MS">MS</option>
                    <option value="PhD">PhD</option>
                    <option value="MBA">MBA</option>
                    <option value="BBA">BBA</option>
                    <option value="MD">MD</option>
                    <option value="MPhil">MPhil</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Fee Range (PKR)
                    </label>
                    <div className="px-2">
                      <input
                        type="range"
                        min="10000"
                        max="200000"
                        step="10000"
                        value={feeRange[1]}
                        onChange={(e) => {
                          setFeeRange([feeRange[0], parseInt(e.target.value)])
                          setFeeFilterActive(true)  // Mark filter as active when user changes it
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{ accentColor: '#2563EB' }}
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-600">
                        <span>10k</span>
                      <span>PKR {feeRange[1].toLocaleString()}</span>
                        <span>200k+</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    Deadline Before
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                      value={deadlineFilter}
                      onChange={(e) => setDeadlineFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Program Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Computer Science"
                    value={programTitleFilter}
                    onChange={(e) => setProgramTitleFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Status
                    </label>
                    <div className="space-y-2">
                    {['Verified', 'Pending', 'Updated'].map(status => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStatus.includes(status)}
                          onChange={() => toggleStatus(status)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">{status}</span>
                      </label>
                    ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleResetFilters}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    Reset
                    </button>
                  <button
                    onClick={handleResetFilters}
                    className="p-2 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
                    title="Reset filters"
                  >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </aside>
          )}

              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <p className="text-gray-600">Showing {filteredAdmissions.length} Admissions</p>
                {compareIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{compareIds.length} selected</span>
                    <button
                      onClick={handleCompare}
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90 flex items-center gap-2"
                      style={{ backgroundColor: '#2563EB' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      Compare ({compareIds.length})
                    </button>
                  </div>
                )}
              </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 cursor-pointer transition-colors ${
                          viewMode === 'grid' ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <svg className={`w-5 h-5 ${viewMode === 'grid' ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 cursor-pointer transition-colors ${
                          viewMode === 'list' ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <svg className={`w-5 h-5 ${viewMode === 'list' ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option>Relevance</option>
                  <option>Deadline</option>
                  <option>Fee (Low to High)</option>
                  <option>Fee (High to Low)</option>
                    </select>
                  </div>
                </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredAdmissions.map((admission) => {
                  const statusColors = getStatusColor(admission.status)
                  const isSaved = savedIds.includes(admission.id)
                  return (
                    <div key={admission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden" style={{ backgroundColor: admission.logoBg }}>
                            {admission.universityLogo ? (
                              <img src={admission.universityLogo} alt={admission.university} className="w-full h-full object-cover" />
                            ) : (
                              admission.university.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="font-semibold text-sm truncate" style={{ color: '#111827' }} title={admission.university}>{admission.university}</p>
                            {admission.universityCity && (
                              <p className="text-xs text-gray-500 truncate">{admission.universityCity}, {admission.universityCountry}</p>
                            )}
                          </div>
                        </div>
                        {/* Only show verification badge - removed duplicate status badge */}
                        {admission.verificationStatus === 'verified' ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Pending
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 truncate" style={{ color: '#111827' }} title={admission.program}>{admission.program}</h3>
                      
                      {/* ✅ Show Updated Tag if status is Updated (after admin verification) */}
                      {admission.status === 'Updated' && (
                        <div className="mb-3">
                          <UpdatedBadge size="sm" showTime={false} />
                        </div>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className={calculateDaysRemaining(admission.deadline) <= 7 ? 'text-red-600 font-medium' : 'text-gray-600'}>{admission.deadlineDisplay}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{admission.fee}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">{admission.updated}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCompare(admission.id)}
                            className={`p-2 cursor-pointer transition-colors ${
                              compareIds.includes(admission.id) ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
                            }`}
                            title={compareIds.includes(admission.id) ? 'Remove from compare' : 'Add to compare'}
                          >
                            <svg className="w-5 h-5" fill={compareIds.includes(admission.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleSave(admission.id)}
                            className={`p-2 cursor-pointer transition-colors ${
                              isSaved ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                            }`}
                            title={isSaved ? 'Remove from saved' : 'Save to watchlist'}
                          >
                            <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                          <Link
                            to={`/program/${admission.id}`}
                            className="p-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
                </div>
            ) : (
              <div className="space-y-4 mb-8">
                {filteredAdmissions.map((admission) => {
                  const statusColors = getStatusColor(admission.status)
                  const isSaved = savedIds.includes(admission.id)
                  return (
                    <div key={admission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-16 h-16 rounded flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden" style={{ backgroundColor: admission.logoBg }}>
                            {admission.universityLogo ? (
                              <img src={admission.universityLogo} alt={admission.university} className="w-full h-full object-cover" />
                            ) : (
                              admission.university.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <h3 className="font-semibold text-lg mb-1 truncate" style={{ color: '#111827' }} title={admission.program}>{admission.program}</h3>
                            <p className="text-sm text-gray-600 mb-2 truncate" title={`${admission.university} • ${admission.degree}`}>{admission.university} • {admission.degree}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                              <span className={admission.daysRemaining <= 7 ? 'text-red-600 font-medium' : ''}>{admission.deadlineDisplay}</span>
                              <span>{admission.fee}</span>
                              {/* Only show verification badge - removed duplicate status badge */}
                              {admission.verificationStatus === 'verified' ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Verified
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => toggleCompare(admission.id)}
                            className={`p-2 cursor-pointer transition-colors ${
                              compareIds.includes(admission.id) ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
                            }`}
                            title={compareIds.includes(admission.id) ? 'Remove from compare' : 'Add to compare'}
                          >
                            <svg className="w-5 h-5" fill={compareIds.includes(admission.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleSave(admission.id)}
                            className={`p-2 cursor-pointer transition-colors ${
                              isSaved ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                            }`}
                          >
                            <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                          <Link
                            to={`/program/${admission.id}`}
                            className="p-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                  </div>
                  )
                })}
                </div>
            )}

            {filteredAdmissions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No admissions found matching your criteria.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#2563EB' }}
                >
                  Reset Filters
                </button>
              </div>
            )}
              </div>
            </div>
        </div>
    </StudentLayout>
  )
}

export default SearchAdmissions
