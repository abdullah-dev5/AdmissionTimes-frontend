import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UniversityLayout from '../../layouts/UniversityLayout'
import { getStatusColor, type Admission as UniversityAdmission } from '../../data/universityData'
import { useUniversityStore } from '../../store/universityStore'
import { formatDisplayDate } from '../../utils/dateUtils'
import { showConfirm, showError, showSuccess } from '../../utils/swal'
import { DEFAULT_ITEMS_PER_PAGE } from '../../constants/pagination'

type StatusFilter = 'all' | 'draft' | 'pending' | 'verified' | 'rejected'

function ViewAllAdmissions() {
  const navigate = useNavigate()
  const admissions = useUniversityStore((state) => state.admissions)
  const deleteAdmission = useUniversityStore((state) => state.deleteAdmission)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAdmission, setSelectedAdmission] = useState<UniversityAdmission | null>(null)

  // Filter and sort admissions
  const filteredAdmissions = useMemo(() => {
    let filtered = [...admissions]

    const getNormalizedStatus = (adm: (typeof admissions)[number]) => {
      const verification = (adm.verification_status || '').toLowerCase()
      if (verification === 'draft') return 'draft'
      if (verification === 'pending') return 'pending'
      if (verification === 'verified') return 'verified'
      if (verification === 'rejected') return 'rejected'

      const status = (adm.status || '').toLowerCase()
      if (status === 'draft') return 'draft'
      if (status === 'pending audit' || status === 'pending') return 'pending'
      if (status === 'verified') return 'verified'
      if (status === 'rejected') return 'rejected'
      return 'pending'
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((adm) => getNormalizedStatus(adm) === statusFilter)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (adm) =>
          adm.title.toLowerCase().includes(query) ||
          adm.department?.toLowerCase().includes(query) ||
          adm.degreeType?.toLowerCase().includes(query)
      )
    }

    // Sort by last action (most recent first)
    return filtered.sort((a, b) => (b.lastAction || '').localeCompare(a.lastAction || ''))
  }, [admissions, statusFilter, searchQuery])

  const handleEdit = (id: string) => {
    navigate(`/university/manage-admissions?edit=${id}`)
  }

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await showConfirm('Delete Admission?', `Are you sure you want to delete "${title}"?`, 'Delete')
    if (confirmed) {
      const result = await deleteAdmission(id)
      
      if (result.success) {
        await showSuccess('Admission deleted successfully!')
      } else {
        await showError(`Failed to delete admission: ${result.error || 'Unknown error'}`)
      }
    }
  }

  const handleCreateNew = () => {
    navigate('/university/manage-admissions')
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchQuery])

  const totalPages = Math.ceil(filteredAdmissions.length / DEFAULT_ITEMS_PER_PAGE)
  const paginatedAdmissions = useMemo(() => {
    const start = (currentPage - 1) * DEFAULT_ITEMS_PER_PAGE
    return filteredAdmissions.slice(start, start + DEFAULT_ITEMS_PER_PAGE)
  }, [filteredAdmissions, currentPage])

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [1]
    const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
    return Array.from(pages)
      .filter((num) => num >= 1 && num <= totalPages)
      .sort((a, b) => a - b)
  }, [currentPage, totalPages])

  // Get counts for each status
  const statusCounts = useMemo(() => {
    const getNormalizedStatus = (adm: (typeof admissions)[number]) => {
      const verification = (adm.verification_status || '').toLowerCase()
      if (verification === 'draft') return 'draft'
      if (verification === 'pending') return 'pending'
      if (verification === 'verified') return 'verified'
      if (verification === 'rejected') return 'rejected'

      const status = (adm.status || '').toLowerCase()
      if (status === 'draft') return 'draft'
      if (status === 'pending audit' || status === 'pending') return 'pending'
      if (status === 'verified') return 'verified'
      if (status === 'rejected') return 'rejected'
      return 'pending'
    }

    return {
      all: admissions.length,
      draft: admissions.filter((a) => getNormalizedStatus(a) === 'draft').length,
      pending: admissions.filter((a) => getNormalizedStatus(a) === 'pending').length,
      verified: admissions.filter((a) => getNormalizedStatus(a) === 'verified').length,
      rejected: admissions.filter((a) => getNormalizedStatus(a) === 'rejected').length,
    }
  }, [admissions])

  return (
    <UniversityLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>
                All Admissions
              </h1>
              <p className="text-gray-600">
                View and manage all admission programs posted by your university
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Admission
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                statusFilter === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
              onClick={() => setStatusFilter('all')}
            >
              <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                statusFilter === 'draft' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setStatusFilter('draft')}
            >
              <div className="text-2xl font-bold text-gray-700">{statusCounts.draft}</div>
              <div className="text-sm text-gray-600">Draft</div>
            </div>
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                statusFilter === 'pending'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200 bg-white hover:border-yellow-300'
              }`}
              onClick={() => setStatusFilter('pending')}
            >
              <div className="text-2xl font-bold text-yellow-700">{statusCounts.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                statusFilter === 'verified'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
              onClick={() => setStatusFilter('verified')}
            >
              <div className="text-2xl font-bold text-green-700">{statusCounts.verified}</div>
              <div className="text-sm text-gray-600">Verified</div>
            </div>
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                statusFilter === 'rejected' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300'
              }`}
              onClick={() => setStatusFilter('rejected')}
            >
              <div className="text-2xl font-bold text-red-700">{statusCounts.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by program title, department, or degree type..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Admissions Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredAdmissions.length === 0 ? (
              <div className="p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No admissions found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'Get started by creating your first admission program'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <button
                    onClick={handleCreateNew}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Admission
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Program Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Degree
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedAdmissions.map((admission) => (
                      <tr key={admission.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{admission.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{admission.degreeType || '—'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{admission.department || '—'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {formatDisplayDate(admission.deadline, '—')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-3 py-1 text-xs font-semibold rounded-full"
                            style={{
                              backgroundColor: getStatusColor(admission.status).bg,
                              color: getStatusColor(admission.status).text,
                            }}
                          >
                            {admission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {formatDisplayDate(admission.lastAction, '—')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedAdmission(admission)}
                              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View full details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(admission.id)}
                              className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit admission"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(admission.id, admission.title)}
                              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete admission"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {filteredAdmissions.length > 0 && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                      page === currentPage
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {filteredAdmissions.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {(currentPage - 1) * DEFAULT_ITEMS_PER_PAGE + 1}
              {' - '}
              {Math.min(currentPage * DEFAULT_ITEMS_PER_PAGE, filteredAdmissions.length)}
              {' of '}
              {filteredAdmissions.length} filtered admission
              {filteredAdmissions.length !== 1 ? 's' : ''}
              {' from '}
              {admissions.length} total
              {admissions.length !== 1 ? 's' : ''}
            </div>
          )}

          {selectedAdmission && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm">
              <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="max-h-[92vh] overflow-y-auto modal-scrollbar">
                <div className="sticky top-0 z-10 px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-blue-100 mb-1">Admission Profile</p>
                      <h2 className="text-2xl font-bold leading-tight">{selectedAdmission.title}</h2>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex px-3 py-1 text-xs font-semibold rounded-full"
                          style={{
                            backgroundColor: getStatusColor(selectedAdmission.status).bg,
                            color: getStatusColor(selectedAdmission.status).text,
                          }}
                        >
                          {selectedAdmission.status}
                        </span>
                        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-white/15 text-white border border-white/20">
                          Verification: {selectedAdmission.verification_status || '—'}
                        </span>
                        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-white/15 text-white border border-white/20">
                          Updated: {formatDisplayDate(selectedAdmission.lastAction, '—')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedAdmission(null)}
                      className="text-white/80 hover:text-white hover:bg-white/15 rounded-lg p-1.5 transition-colors"
                      aria-label="Close details modal"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6 bg-slate-50/60">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4">Academic Profile</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between gap-3">
                          <span className="text-sm text-slate-500">Degree Type</span>
                          <span className="text-sm font-medium text-slate-900 text-right">{selectedAdmission.degreeType || selectedAdmission.program_type || '—'}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-sm text-slate-500">Department / Field</span>
                          <span className="text-sm font-medium text-slate-900 text-right">{selectedAdmission.department || selectedAdmission.field_of_study || '—'}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-sm text-slate-500">Location</span>
                          <span className="text-sm font-medium text-slate-900 text-right">{selectedAdmission.location || '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4">Timeline and Fees</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between gap-3">
                          <span className="text-sm text-slate-500">Application Deadline</span>
                          <span className="text-sm font-medium text-slate-900 text-right">{formatDisplayDate(selectedAdmission.deadline, '—')}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-sm text-slate-500">Start Date</span>
                          <span className="text-sm font-medium text-slate-900 text-right">{formatDisplayDate(selectedAdmission.start_date, '—')}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-sm text-slate-500">Application Fee</span>
                          <span className="text-sm font-medium text-slate-900 text-right">{selectedAdmission.fee || selectedAdmission.tuition_fee || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Overview</h3>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedAdmission.overview || '—'}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Eligibility</h3>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedAdmission.eligibility || '—'}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Official Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs text-slate-500 mb-1">Website URL</p>
                        <p className="text-sm text-slate-900 break-all">{selectedAdmission.websiteUrl || selectedAdmission.website_url || '—'}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs text-slate-500 mb-1">Admission Portal</p>
                        <p className="text-sm text-slate-900 break-all">{selectedAdmission.admissionPortalLink || selectedAdmission.admission_portal_link || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedAdmission(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleEdit(selectedAdmission.id)
                      setSelectedAdmission(null)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Admission
                  </button>
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </UniversityLayout>
  )
}

export default ViewAllAdmissions
