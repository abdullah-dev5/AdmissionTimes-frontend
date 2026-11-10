import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout'
import { useStudentStore } from '../../store/studentStore'
import { useToast } from '../../contexts/ToastContext'
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData'
import { filterStudentVisibleAdmissions } from '../../utils/studentFilters'
import AdmissionCard from '../../components/student/AdmissionCard'
import type { ProgramStatus, StudentAdmission } from '../../data/studentData'
import { STATUS_OPTIONS, SOURCE_OPTIONS, cityOf, sortByDeadline, sourceOf, type DataSource } from '../../utils/studentPortal'

const MAX_COMPARE = 4

type SortKey = 'deadline' | 'fee-asc' | 'fee-desc'

/** Unknown fees (NaN) always last. */
const compareFees = (a: number, b: number, order: 'asc' | 'desc'): number => {
  const aKnown = Number.isFinite(a)
  const bKnown = Number.isFinite(b)
  if (!aKnown || !bKnown) return aKnown === bKnown ? 0 : aKnown ? -1 : 1
  return order === 'asc' ? a - b : b - a
}

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))

function SearchAdmissions() {
  const navigate = useNavigate()
  const { showError } = useToast()
  const toggleSaved = useStudentStore((state) => state.toggleSaved)
  const { admissions: rawAdmissions, loading } = useStudentDashboardData()
  const admissions = useMemo(() => filterStudentVisibleAdmissions(rawAdmissions), [rawAdmissions])

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ProgramStatus | ''>('')
  const [source, setSource] = useState<DataSource | ''>('')
  const [university, setUniversity] = useState('')
  const [city, setCity] = useState('')
  const [degree, setDegree] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('deadline')
  const [compareIds, setCompareIds] = useState<string[]>([])

  const universities = useMemo(() => unique(admissions.map((a) => a.university)), [admissions])
  const cities = useMemo(() => unique(admissions.map(cityOf)), [admissions])
  const degrees = useMemo(() => unique(admissions.map((a) => (a.degree && a.degree !== 'Not specified' ? a.degree : ''))), [admissions])

  const results = useMemo(() => {
    const text = query.trim().toLowerCase()
    const filtered = admissions.filter(
      (a) =>
        (!text || a.program.toLowerCase().includes(text) || a.university.toLowerCase().includes(text)) &&
        (!status || a.programStatus === status) &&
        (!source || sourceOf(a) === source) &&
        (!university || a.university === university) &&
        (!city || cityOf(a) === city) &&
        (!degree || a.degree === degree)
    )
    if (sortBy === 'deadline') return sortByDeadline(filtered)
    const order = sortBy === 'fee-asc' ? 'asc' : 'desc'
    return [...filtered].sort((a, b) => compareFees(a.feeNumeric, b.feeNumeric, order))
  }, [admissions, query, status, source, university, city, degree, sortBy])

  const activeFilters = [status, source, university, city, degree].filter(Boolean).length

  const resetFilters = () => {
    setStatus('')
    setSource('')
    setUniversity('')
    setCity('')
    setDegree('')
  }

  const toggleCompare = (id: string) =>
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_COMPARE) {
        showError(`You can compare up to ${MAX_COMPARE} programs.`)
        return prev
      }
      return [...prev, id]
    })

  const toggleSave = (admission: StudentAdmission) => void toggleSaved(admission.id, { showError })

  const select = (label: string, value: string, onChange: (v: string) => void, options: Array<{ value: string; label: string }>, allLabel: string) => (
    <label className="block">
      <span className="block mb-1 text-xs font-semibold text-gray-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <StudentLayout>
      <div className="p-6 space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-4">
          <div className="relative">
            <input
              type="search"
              placeholder="Search programs or universities"
              aria-label="Search admissions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {select('Status', status, (v) => setStatus(v as ProgramStatus | ''), STATUS_OPTIONS, 'All statuses')}
            {select('Source', source, (v) => setSource(v as DataSource | ''), SOURCE_OPTIONS, 'All sources')}
            {select('University', university, setUniversity, universities.map((u) => ({ value: u, label: u })), 'All universities')}
            {select('City', city, setCity, cities.map((c) => ({ value: c, label: c })), 'All cities')}
            {select('Degree', degree, setDegree, degrees.map((d) => ({ value: d, label: d })), 'All degrees')}
            {select(
              'Sort by',
              sortBy === 'deadline' ? '' : sortBy,
              (v) => setSortBy((v || 'deadline') as SortKey),
              [
                { value: 'fee-asc', label: 'Fee (low to high)' },
                { value: 'fee-desc', label: 'Fee (high to low)' },
              ],
              'Deadline'
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {loading && admissions.length === 0 ? 'Loading…' : `${results.length} result${results.length === 1 ? '' : 's'}`}
            </span>
            {activeFilters > 0 ? (
              <button type="button" onClick={resetFilters} className="font-semibold text-blue-600 hover:underline">
                Reset filters
              </button>
            ) : null}
          </div>
        </div>

        {compareIds.length > 0 ? (
          <div className="sticky top-0 z-10 flex items-center gap-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <span className="flex-1 text-sm font-semibold text-blue-800">
              {compareIds.length} selected{compareIds.length < 2 ? ' · pick one more' : ''}
            </span>
            <button type="button" onClick={() => setCompareIds([])} className="text-sm font-semibold text-gray-600 hover:underline">
              Clear
            </button>
            <button
              type="button"
              disabled={compareIds.length < 2}
              onClick={() => navigate(`/student/compare?ids=${compareIds.join(',')}`)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 disabled:opacity-50"
            >
              Compare
            </button>
          </div>
        ) : null}

        {results.length === 0 && !loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <p className="font-semibold text-gray-900">No admissions found</p>
            <p className="text-sm text-gray-500 mt-1">
              {query || activeFilters ? 'Try a different search or fewer filters.' : 'No verified admissions are published yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.map((admission) => (
              <AdmissionCard
                key={admission.id}
                admission={admission}
                onToggleSave={() => toggleSave(admission)}
                onToggleCompare={() => toggleCompare(admission.id)}
                comparing={compareIds.includes(admission.id)}
              />
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}

export default SearchAdmissions
