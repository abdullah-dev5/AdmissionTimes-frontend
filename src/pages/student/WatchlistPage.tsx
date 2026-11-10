import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout'
import type { StudentAdmission } from '../../data/studentData'
import { useStudentStore } from '../../store/studentStore'
import { useToast } from '../../contexts/ToastContext'
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData'
import { filterStudentVisibleAdmissions } from '../../utils/studentFilters'
import AdmissionCard from '../../components/student/AdmissionCard'
import { showConfirm } from '../../utils/swal'
import { isOpenAdmission, sortByDeadline } from '../../utils/studentPortal'

const MAX_COMPARE = 4

/** Saved programs (same structure and actions as the mobile app's Saved tab). */
function WatchlistPage() {
  const navigate = useNavigate()
  const { showError, showSuccess } = useToast()
  const toggleSaved = useStudentStore((state) => state.toggleSaved)
  const toggleAlert = useStudentStore((state) => state.toggleAlert)
  const { admissions: rawAdmissions, loading } = useStudentDashboardData()
  const admissions = useMemo(() => filterStudentVisibleAdmissions(rawAdmissions), [rawAdmissions])

  const [query, setQuery] = useState('')
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [pending, setPending] = useState<Record<string, boolean>>({})

  const saved = useMemo(() => admissions.filter((a) => a.saved), [admissions])
  const visible = useMemo(() => {
    const text = query.trim().toLowerCase()
    const filtered = text ? saved.filter((a) => a.program.toLowerCase().includes(text) || a.university.toLowerCase().includes(text)) : saved
    return sortByDeadline(filtered)
  }, [saved, query])

  const openCount = saved.filter(isOpenAdmission).length
  const remindersOn = saved.filter((a) => a.alertEnabled).length

  const toggleCompare = (id: string) =>
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_COMPARE) {
        showError(`You can compare up to ${MAX_COMPARE} programs.`)
        return prev
      }
      return [...prev, id]
    })

  const withPending = async (id: string, action: () => Promise<unknown>) => {
    setPending((p) => ({ ...p, [id]: true }))
    await action()
    setPending((p) => ({ ...p, [id]: false }))
  }

  // Deleting the saved entry also ends its reminders (one request, no race).
  const remove = async (admission: StudentAdmission) => {
    const confirmed = await showConfirm('Remove program?', `Remove "${admission.program}" from your saved programs?`, 'Remove')
    if (!confirmed) return
    setCompareIds((prev) => prev.filter((x) => x !== admission.id))
    await withPending(admission.id, () => toggleSaved(admission.id, { showError }))
  }

  return (
    <StudentLayout>
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved programs</h1>
            <p className="text-sm text-gray-600 mt-1">
              {saved.length} saved · {openCount} open · {remindersOn} with reminders
            </p>
          </div>
          {saved.length > 0 ? (
            <input
              type="search"
              placeholder="Search saved programs"
              aria-label="Search saved programs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : null}
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

        {saved.length === 0 && !loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <p className="font-semibold text-gray-900">No saved programs yet</p>
            <p className="text-sm text-gray-500 mt-1">Save programs to track their deadlines and get reminders.</p>
            <Link to="/student/search" className="inline-block mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">
              Browse admissions
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <p className="text-sm text-gray-500">No saved programs match your search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visible.map((admission) => (
              <AdmissionCard
                key={admission.id}
                admission={admission}
                onToggleCompare={() => toggleCompare(admission.id)}
                comparing={compareIds.includes(admission.id)}
                footer={
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-blue-600"
                        checked={Boolean(admission.alertEnabled)}
                        disabled={pending[admission.id] || !isOpenAdmission(admission)}
                        onChange={() => void withPending(admission.id, () => toggleAlert(admission.id, { showError, showSuccess }))}
                      />
                      Deadline reminders
                    </label>
                    <button
                      type="button"
                      onClick={() => void remove(admission)}
                      disabled={pending[admission.id]}
                      className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-50"
                      aria-label={`Remove ${admission.program} from saved`}
                    >
                      Remove
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}

export default WatchlistPage
