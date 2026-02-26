import { Link, useParams, Navigate, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import StudentLayout from '../layouts/StudentLayout'
import { useStudentStore } from '../store/studentStore'
import { calculateDaysRemaining } from '../data/studentData'
import { useChangeLogFilters } from '../hooks/useChangeLogFilters'
import UpdatedBadge from '../components/admin/UpdatedBadge'
import { getRelativeTime } from '../utils/dateUtils'
import { useToast } from '../contexts/ToastContext'

function ProgramDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showSuccess, showInfo, showWarning, showError } = useToast()
  const [activeTab, setActiveTab] = useState('Overview')
  const getAdmissionById = useStudentStore((state) => state.getAdmissionById)
  const admissions = useStudentStore((state) => state.admissions)
  const toggleAlert = useStudentStore((state) => state.toggleAlert)
  
  // Get changelogs for update tracking
  const { filteredLogs } = useChangeLogFilters()
  
  const program = id ? getAdmissionById(id) : undefined
  
  // Check if admission status is Updated (after admin verification)
  const isUpdated = program?.status === 'Updated'
  
  // Get recent changes for this admission
  const recentChanges = useMemo(() => {
    if (!id) return []
    return filteredLogs
      .filter(log => log.admissionId === id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5) // Show last 5 changes
  }, [id, filteredLogs])
  
  // Get related programs (same degree type, different university, limit 3)
  const relatedPrograms = useMemo(() => {
    if (!program) return []
    return admissions
      .filter(a => a.id !== program.id && a.degreeType === program.degreeType)
      .slice(0, 3)
  }, [program, admissions])

  if (!program) {
    return <Navigate to="/student/dashboard" replace />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return { bg: '#D1FAE5', text: '#10B981' }
      case 'Closing Soon': return { bg: '#FEF3C7', text: '#FACC15' }
      case 'Closed': return { bg: '#FEE2E2', text: '#EF4444' }
      default: return { bg: '#F3F4F6', text: '#6B7280' }
    }
  }

  const statusColors = getStatusColor(program.programStatus)
  const daysRemaining = calculateDaysRemaining(program.deadline)

  const handleCompare = () => {
    const savedIds = admissions.filter((a) => a.saved).map((a) => a.id)
    const ids = Array.from(new Set([program.id, ...savedIds])).slice(0, 4)

    if (ids.length < 2) {
      showWarning('Please save at least one more program to compare.')
      navigate('/student/watchlist')
      return
    }

    navigate(`/student/compare?ids=${ids.join(',')}`)
  }

  const handleSetReminder = async () => {
    try {
      const latest = getAdmissionById(program.id)
      if (latest?.alertEnabled) {
        showInfo('Reminder is already enabled for this program.')
        return
      }

      await toggleAlert(program.id)
      showSuccess('Reminder enabled. Program added to watchlist automatically.')
    } catch (error) {
      showError('Failed to update reminder settings. Please try again.')
    }
  }

  const handleApplyNow = () => {
    if (program.officialUrl && !program.officialUrl.startsWith('/program/')) {
      window.open(program.officialUrl, '_blank', 'noopener,noreferrer')
      return
    }

    showInfo('Official application link is unavailable. Please use the Official Website section below.')
  }

  const handleDownload = () => {
    const content = [
      `Program: ${program.program}`,
      `University: ${program.university}`,
      `Degree: ${program.degree}`,
      `Location: ${program.location}`,
      `Application Fee: ${program.fee}`,
      `Deadline: ${program.deadlineDisplay}`,
      `Status: ${program.programStatus}`,
      `Last Updated: ${program.updated}`,
      program.aiSummary ? `Summary: ${program.aiSummary}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${program.program.replace(/\s+/g, '_')}_details.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <StudentLayout>
      <div className="p-6">
        <div className="container mx-auto max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2" style={{ color: '#111827' }}>{program.program}</h1>
                <p className="text-xl text-gray-600 mb-4">{program.university}</p>
              </div>
              {/* ✅ Show Updated Tag if admission status is Updated */}
              {isUpdated && (
                <div className="flex-shrink-0">
                  <UpdatedBadge
                    lastChangeTime={recentChanges[0]?.timestamp}
                    size="lg"
                    showTime={true}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-base">{program.location}</span>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
                {program.programStatus}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={handleCompare} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Compare
              </button>
              <button onClick={handleSetReminder} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Set Reminder
              </button>
              <button onClick={handleApplyNow} className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90 flex items-center gap-2" style={{ backgroundColor: '#10B981' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Apply Now
              </button>
              <button onClick={handleDownload} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
            <p className="text-xs text-gray-500">Last Updated: {program.updated}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
           {/*  <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: '#111827' }}>
                  <svg className="w-6 h-6" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI-Powered Summary
                </h2>
                <span className="text-xs text-gray-500">Powered by Gemini AI</span>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-800">Application Deadline: </span>
                    <span className="text-gray-600">{program.deadlineDisplay} {daysRemaining >= 0 ? `(${daysRemaining} days left)` : '(Deadline passed)'}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-800">Degree Type: </span>
                    <span className="text-gray-600">{program.degree}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-800">Status: </span>
                    <span className="text-gray-600">{program.status}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-800">Fee: </span>
                    <span className="text-gray-600">{program.fee}</span>
                  </div>
                </li>
              </ul>
              {program.aiSummary && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{program.aiSummary}</p>
                </div>
              )}
            </div>*/}

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8 -mb-px">
                  {['Overview', 'Eligibility', 'Important Dates', isUpdated && 'Recent Changes'].filter(Boolean).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as string)}
                      className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm cursor-pointer transition-colors relative ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab}
                      {/* Show notification dot on Recent Changes tab */}
                      {tab === 'Recent Changes' && isUpdated && (
                        <span className="absolute -top-1 -right-2 w-2 h-2 bg-orange-500 rounded-full"></span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {activeTab === 'Overview' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>Overview</h2>
                  <div className="space-y-4 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>Program Information</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {program.program} at {program.university} is a {program.degree} program located in {program.location}.
                        {program.aiSummary && (
                          <span className="block mt-2">{program.aiSummary}</span>
                        )}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Degree Type</p>
                        <p className="font-semibold text-gray-800">{program.degree}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Location</p>
                        <p className="font-semibold text-gray-800">{program.location}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Application Fee</p>
                        <p className="font-semibold text-gray-800">{program.fee}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Deadline</p>
                        <p className="font-semibold text-gray-800">{program.deadlineDisplay}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Eligibility' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>Eligibility Requirements</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>Degree Type</h3>
                      <p className="text-gray-700">{program.degree}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>General Requirements</h3>
                      <p className="text-gray-700">Please contact the university directly for specific eligibility requirements and required documents for this program.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Important Dates' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>Important Dates</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Application Deadline</span>
                      <span className="text-gray-600">{program.deadlineDisplay}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Days Remaining</span>
                      <span className={`font-semibold ${
                        daysRemaining >= 0 && daysRemaining <= 7 ? 'text-red-600' : 
                        daysRemaining >= 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {daysRemaining >= 0 ? `${daysRemaining} days` : 'Deadline passed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Last Updated</span>
                      <span className="text-gray-600">{program.updated}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Recent Changes Tab - Shows what was updated */}
              {activeTab === 'Recent Changes' && isUpdated && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold" style={{ color: '#111827' }}>What Changed</h2>
                    <span className="text-sm text-gray-500">{recentChanges.length} update{recentChanges.length > 1 ? 's' : ''}</span>
                  </div>
                  
                  {/* Summary message */}
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-900">
                      <strong>This admission was updated by the university.</strong> Admin verification required to confirm these changes.
                    </p>
                  </div>
                  
                  {/* Important fields that changed */}
                  <div className="space-y-4">
                    {recentChanges.map((change, index) => {
                      // Filter out metadata fields - only show important fields
                      const importantFields = ['title', 'program', 'degree', 'deadline', 'fee', 'location', 'status', 'requirements', 'description'];
                      const filteredDiffs = (change.diff || []).filter((d: any) => 
                        importantFields.some(field => d.field.toLowerCase().includes(field.toLowerCase()))
                      );
                      
                      if (filteredDiffs.length === 0) return null;
                      
                      return (
                        <div key={change.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-gray-700">{getRelativeTime(change.timestamp)}</span>
                            {index === 0 && (
                              <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">Latest Update</span>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {filteredDiffs.map((d: any, i: number) => (
                              <div key={i} className="p-3 bg-white rounded border border-gray-100">
                                <p className="font-semibold text-gray-700 mb-2">{d.field}</p>
                                <div className="flex gap-4 text-sm">
                                  <div className="flex-1">
                                    <p className="text-gray-500 text-xs mb-1">Before</p>
                                    <p className="text-red-600 line-through">{d.old || '—'}</p>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-gray-500 text-xs mb-1">After</p>
                                    <p className="text-green-600 font-semibold">{d.new || '—'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {recentChanges.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No important changes found</p>
                    </div>
                  )}
                </div>
              )}

      {/*  {activeTab === 'Fee Structure' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>Fee Structure</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border-2 border-blue-500 rounded-lg" style={{ backgroundColor: '#E0E7FF' }}>
                      <span className="font-semibold text-gray-800">Application Fee</span>
                      <span className="font-bold" style={{ color: '#2563EB' }}>{program.fee}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">For detailed fee structure including semester fees and total program cost, please contact the university directly or visit their official website.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Documents' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>Required Documents</h2>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 mb-4">Please contact the university directly or visit their official website for the complete list of required documents for this program.</p>
                    <p className="text-sm text-gray-600">Common documents typically required include:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 mt-2">
                      <li>Academic transcripts and certificates</li>
                      <li>CNIC/B-Form copy</li>
                      <li>Recent passport size photographs</li>
                      <li>Entry test result (if applicable)</li>
                      <li>Character certificate</li>
                    </ul>
                  </div>
                </div>
              )}*/}
            </div>
          </div>

          <div className="space-y-6">
           {/* <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>You may also be interested in...</h2>
              <div className="space-y-4">
                {relatedPrograms.map((rp) => {
                  const rpColors = getStatusColor(rp.programStatus)
                  return (
                    <Link
                      to={`/program/${rp.id}`}
                      key={rp.id}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm" style={{ color: '#111827' }}>{rp.program}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: rpColors.bg, color: rpColors.text }}>
                          {rp.programStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{rp.university}</p>
                    </Link>
                  )
                })}
              </div>
            </div> */}

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>Official Links</h2>
              <div className="space-y-3">
                {program.officialUrl ? (
                  <a
                    href={program.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#2563EB' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Visit Official Website
                  </a>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Official website link not available. Please contact the university directly for more information.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </StudentLayout>
  )
}

export default ProgramDetail

