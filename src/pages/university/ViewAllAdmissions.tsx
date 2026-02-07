import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UniversityLayout from '../../layouts/UniversityLayout'
import { getStatusColor } from '../../data/universityData'
import { useUniversityData } from '../../contexts/UniversityDataContext'

type StatusFilter = 'all' | 'draft' | 'pending' | 'verified' | 'rejected' | 'disputed'

function ViewAllAdmissions() {
  const navigate = useNavigate()
  const { admissions, deleteAdmission } = useUniversityData()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  console.log('🟣 [ViewAllAdmissions] Rendered with admissions count:', admissions.length)
  console.log('🟣 [ViewAllAdmissions] Admissions:', admissions.map(a => ({ id: a.id, title: a.title, status: a.status, verification_status: a.verification_status })))

  // Filter and sort admissions
  const filteredAdmissions = useMemo(() => {
    let filtered = [...admissions]

    // Apply status filter
    if (statusFilter !== 'all') {
      const statusMap: { [key in StatusFilter]: string[] } = {
        all: [],
        draft: ['Draft'],
        pending: ['Pending Audit'],
        verified: ['Verified'],
        rejected: ['Rejected'],
        disputed: ['Disputed'],
      }
      const targetStatuses = statusMap[statusFilter] || []
      filtered = filtered.filter((adm) => targetStatuses.includes(adm.status))
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
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const result = await deleteAdmission(id)
      
      if (result.success) {
        alert('Admission deleted successfully!')
      } else {
        alert(`Failed to delete admission: ${result.error || 'Unknown error'}`)
      }
    }
  }

  const handleCreateNew = () => {
    navigate('/university/manage-admissions')
  }

  // Get counts for each status
  const statusCounts = useMemo(() => {
    return {
      all: admissions.length,
      draft: admissions.filter((a) => a.status === 'Draft').length,
      pending: admissions.filter((a) => a.status === 'Pending Audit').length,
      verified: admissions.filter((a) => a.status === 'Verified').length,
      rejected: admissions.filter((a) => a.status === 'Rejected').length,
      disputed: admissions.filter((a) => a.status === 'Disputed').length,
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
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
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                statusFilter === 'disputed'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-orange-300'
              }`}
              onClick={() => setStatusFilter('disputed')}
            >
              <div className="text-2xl font-bold text-orange-700">{statusCounts.disputed}</div>
              <div className="text-sm text-gray-600">Disputed</div>
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
                    {filteredAdmissions.map((admission) => (
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
                            {admission.deadline
                              ? new Date(admission.deadline).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '—'}
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
                            {admission.lastAction
                              ? new Date(admission.lastAction).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
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

          {/* Results Summary */}
          {filteredAdmissions.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {filteredAdmissions.length} of {admissions.length} total admission
              {admissions.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </UniversityLayout>
  )
}

export default ViewAllAdmissions
