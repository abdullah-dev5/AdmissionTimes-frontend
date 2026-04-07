import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import UniversityLayout from '../../layouts/UniversityLayout'
import { getStatusColor, type Admission } from '../../data/universityData'
import { useUniversityStore } from '../../store/universityStore'
import { useAuth } from '../../contexts/AuthContext'
import { formatDateForInput, sanitizeAdmission } from '../../utils/admissionUtils'
import { formatDisplayDate } from '../../utils/dateUtils'
import { admissionsService } from '../../services/admissionsService'
import { showConfirm, showError, showSuccess, showWarning } from '../../utils/swal'

function ManageAdmissions() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditMode = !!editId

  const { user } = useAuth()
  const universityId = user?.university_id || user?.id || null
  const admissions = useUniversityStore((state) => state.admissions)
  const getAdmissionById = useUniversityStore((state) => state.getAdmissionById)
  const createOrUpdateAdmission = useUniversityStore((state) => state.createOrUpdateAdmission)
  const deleteAdmission = useUniversityStore((state) => state.deleteAdmission)
  const existingAdmission = editId ? getAdmissionById(editId) : null

  // Determine if we need to change status to pending on edit
  const requiresStatusReset = useMemo(() => {
    if (!existingAdmission) return false
    // If admission is verified or rejected, editing should reset to pending
    return ['verified', 'rejected'].includes(existingAdmission.verification_status || '')
  }, [existingAdmission])

  const [formData, setFormData] = useState({
    // REQUIRED: Program Title
    programTitle: existingAdmission?.title || '',
    
    // OPTIONAL: Program Details (no defaults - leave empty if not provided)
    degreeType: existingAdmission?.degreeType || 'BS',
    department: existingAdmission?.department || '',
    academicYear: existingAdmission?.academicYear || '',
    
    // OPTIONAL: Application Details (no defaults)
    applicationDeadline: formatDateForInput(existingAdmission?.deadline) || '',
    fee: existingAdmission?.fee || '',
    
    // OPTIONAL: Descriptions (no defaults)
    overview: existingAdmission?.overview || '',
    eligibility: existingAdmission?.eligibility || '',

    // OPTIONAL: Official links
    websiteUrl: existingAdmission?.websiteUrl || '',
    admissionPortalLink: existingAdmission?.admissionPortalLink || '',
  })

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractionStatus, setExtractionStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hydratedAdmissionIdRef = useRef<string | null>(null)

  const buildFormFromAdmission = (admission: Admission) => {
    const sanitized = sanitizeAdmission(admission)
    return {
      programTitle: sanitized.title,
      degreeType: sanitized.degreeType || 'BS',
      department: sanitized.department || '',
      academicYear: sanitized.academicYear || '',
      applicationDeadline: formatDateForInput(sanitized.deadline) || '',
      fee: sanitized.fee || '',
      overview: sanitized.overview || '',
      eligibility: sanitized.eligibility || '',
      websiteUrl: sanitized.websiteUrl || '',
      admissionPortalLink: sanitized.admissionPortalLink || '',
    }
  }

  useEffect(() => {
    // Reset hydration tracker when switching to create mode.
    if (!isEditMode || !editId) {
      hydratedAdmissionIdRef.current = null
      return
    }

    if (!existingAdmission?.id) return

    // Hydrate once per edited admission id to avoid wiping user input on background refreshes.
    if (hydratedAdmissionIdRef.current === existingAdmission.id) return

    setFormData(buildFormFromAdmission(existingAdmission))
    hydratedAdmissionIdRef.current = existingAdmission.id
  }, [isEditMode, editId, existingAdmission])

  const extractDataFromPDF = async (file: File): Promise<Partial<typeof formData>> => {
    if (!universityId) {
      throw new Error('University ID not found. Please re-login and try again.')
    }

    const response = await admissionsService.parsePDF(file, universityId)
    const parsed = response.data

    return {
      programTitle: parsed.title || '',
      degreeType: parsed.degree_level || 'BS',
      department: parsed.field_of_study || parsed.location || '',
      academicYear: '',
      applicationDeadline: formatDateForInput(parsed.deadline) || '',
      fee: typeof parsed.application_fee === 'number' ? String(parsed.application_fee) : '',
      overview: parsed.summary_text || parsed.description || '',
      eligibility: parsed.eligibility || '',
      websiteUrl: '',
      admissionPortalLink: '',
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setExtractionStatus(null)
  }

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      await showWarning('Please upload a PDF file only.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      await showWarning('File size must be less than 10MB.')
      return
    }

    setUploadedFile(file)
    setIsProcessing(true)
    setExtractionStatus('Processing PDF and extracting information...')

    try {
      const extractedData = await extractDataFromPDF(file)
      setFormData((prev) => ({
        ...prev,
        ...extractedData,
      }))

      setExtractionStatus('AI-assisted extraction completed. Please review and edit as needed.')

      setTimeout(() => {
        setExtractionStatus(null)
      }, 5000)
    } catch (error) {
      setExtractionStatus('Error processing PDF. Please fill the form manually.')
      console.error('PDF extraction error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const buildAdmissionPayload = (statusOverride?: Admission['status']): Admission => {
    const now = new Date()
    const lastAction = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(
      now.getHours(),
    ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    return {
      id: existingAdmission?.id ?? `adm-${Date.now()}`,
      title: formData.programTitle,
      deadline: formData.applicationDeadline,
      status: statusOverride ?? existingAdmission?.status ?? 'Pending Audit',
      views: existingAdmission?.views ?? '0',
      verifiedBy: existingAdmission?.verifiedBy,
      lastAction,
      remarks: existingAdmission?.remarks ?? 'Awaiting admin review',
      degreeType: formData.degreeType,
      department: formData.department,
      academicYear: formData.academicYear,
      fee: formData.fee,
      overview: formData.overview,
      eligibility: formData.eligibility,
      websiteUrl: formData.websiteUrl,
      admissionPortalLink: formData.admissionPortalLink,
    }
  }

  const computeDiff = (previous: Admission | null, next: Admission) => {
    if (!previous) {
      return [
        { field: 'Title', old: '—', new: next.title },
        { field: 'Deadline', old: '—', new: next.deadline },
        { field: 'Status', old: '—', new: next.status },
      ]
    }

    const fieldMap: Array<{ key: keyof Admission; label: string }> = [
      { key: 'title', label: 'Title' },
      { key: 'deadline', label: 'Deadline' },
      { key: 'fee', label: 'Fee' },
      { key: 'department', label: 'Department' },
      { key: 'degreeType', label: 'Degree Type' },
      { key: 'academicYear', label: 'Academic Year' },
      { key: 'overview', label: 'Overview' },
      { key: 'eligibility', label: 'Eligibility' },
      { key: 'websiteUrl', label: 'Website URL' },
      { key: 'admissionPortalLink', label: 'Portal Link' },
      { key: 'status', label: 'Status' },
    ]

    return fieldMap
      .filter(({ key }) => (previous[key] || '') !== (next[key] || ''))
      .map(({ key, label }) => ({
        field: label,
        old: (previous[key] as string) || '—',
        new: (next[key] as string) || '—',
      }))
  }

  const handleSaveDraft = async () => {
    if (!universityId) {
      await showError('University ID not found. Please re-login and try again.')
      return
    }

    const draft = buildAdmissionPayload('Draft')
    // Always set verification_status to 'draft' when saving as draft
    const draftWithStatus = {
      ...draft,
      verification_status: 'draft' as const,
    }
    
    console.log('🟡 [ManageAdmissions] Saving draft:', draftWithStatus)
    console.log('🟡 [ManageAdmissions] Draft verification_status:', draftWithStatus.verification_status)
    const result = await createOrUpdateAdmission(
      draftWithStatus,
      universityId,
      { diff: computeDiff(existingAdmission ?? null, draftWithStatus), modifiedBy: 'Rep_01' }
    )
    
    if (result?.success) {
      await showSuccess('Draft saved successfully!')
    }
    // Error alert is shown by context
  }

  const handlePublish = async () => {
    // Only title is truly required - all other fields are optional
    if (!formData.programTitle || !formData.programTitle.trim()) {
      await showWarning('Program Title is required')
      return
    }

    if (!universityId) {
      await showError('University ID not found. Please re-login and try again.')
      return
    }

    // Build the payload and set verification_status to 'pending'
    const payload = buildAdmissionPayload('Pending Audit')
    const payloadWithStatus = {
      ...payload,
      verification_status: 'pending' as const,
    }
    const diff = computeDiff(existingAdmission ?? null, payloadWithStatus)

    console.log('🟡 [ManageAdmissions] Publishing admission:', payloadWithStatus)
    console.log('🟡 [ManageAdmissions] Publish verification_status:', payloadWithStatus.verification_status)
    console.log('🟡 [ManageAdmissions] Changes:', diff)
    
    // Show appropriate message based on whether editing verified/rejected admission
    let successMessage = ''
    if (isEditMode) {
      if (requiresStatusReset) {
        successMessage = `Admission "${formData.programTitle}" updated! Status changed to "Pending Audit" for re-verification.`
      } else {
        successMessage = `Admission "${formData.programTitle}" updated and submitted for review!`
      }
    } else {
      successMessage = `Admission "${formData.programTitle}" created and submitted for review!`
    }
    
    const result = await createOrUpdateAdmission(
      payloadWithStatus,
      universityId,
      { diff, modifiedBy: 'Rep_01' }
    )

    if (result?.success) {
      await showSuccess(successMessage)
      navigate('/university/admissions')
    }
    // Error alert is shown by context
  }

  const recentAdmissions = useMemo(() => {
    return [...admissions]
      .sort((a, b) => (b.lastAction || '').localeCompare(a.lastAction || ''))
      .slice(0, 5)
  }, [admissions])

  const handleEditRecent = (id: string) => {
    navigate(`/university/manage-admissions?edit=${id}`)
  }

  const handleDeleteRecent = async (id: string) => {
    const confirmed = await showConfirm('Delete Admission?', 'Are you sure you want to delete this admission?', 'Delete')
    if (confirmed) {
      deleteAdmission(id)
      await showSuccess('Admission deleted!')
    }
  }

  const sanitizeVerifier = (value?: string) => {
    if (!value) return ''
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidPattern.test(value) ? '' : value
  }

  const formatDeadlineDisplay = (value?: string) => {
    return formatDisplayDate(value, '—')
  }

  return (
    <UniversityLayout>
      <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>
                  {isEditMode ? 'Edit Admission' : 'Upload or Manage Admissions'}
                </h1>
                <p className="text-gray-600">
                  {isEditMode 
                    ? 'Update admission details. Changes will require re-verification.' 
                    : 'Add new admissions or update existing listings. Records are auto-published as Pending Audit.'}
                </p>
              </div>

              {/* Alert banner for verified/rejected admissions that will reset to pending */}
              {requiresStatusReset && (
                <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Status Will Change on Save</p>
                      <p className="text-sm text-blue-700 mt-1">
                        This admission is currently <strong>{existingAdmission?.verification_status || 'verified'}</strong>. 
                        When you save changes, the status will automatically change to <strong>"Pending Audit"</strong> for re-verification by admins.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload PDF/Brochure (Optional)</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Upload a brochure PDF to auto-extract and prefill admission details.
                        </p>

                        {!uploadedFile ? (
                          <div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf"
                              onChange={handleFileUpload}
                              disabled={isProcessing}
                              className="hidden"
                            />
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: '#2563EB' }}
                              >
                                {isProcessing ? 'Processing...' : 'Choose PDF File'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                                <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button
                              onClick={handleRemoveFile}
                              disabled={isProcessing}
                              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        )}

                        {isProcessing && (
                          <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Extracting information from PDF...</span>
                          </div>
                        )}

                        {extractionStatus && !isProcessing && (
                          <div className={`mt-4 p-3 rounded-lg text-sm ${
                            extractionStatus.includes('Error')
                              ? 'bg-red-50 text-red-700'
                              : 'bg-green-50 text-green-700'
                          }`}>
                            {extractionStatus}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-900">AI Summary Generated</p>
                        <p className="text-xs text-blue-700">automatically after submission.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-900">All published admissions</p>
                        <p className="text-xs text-blue-700">are set to 'Pending Audit' by default.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>Basic Details</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Program Title <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={formData.programTitle}
                          onChange={(e) => setFormData({ ...formData, programTitle: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Degree Type</label>
                          <select
                            value={formData.degreeType}
                            onChange={(e) => setFormData({ ...formData, degreeType: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="BS">BS</option>
                            <option value="MS">MS</option>
                            <option value="PhD">PhD</option>
                            <option value="MBA">MBA</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Department/Discipline</label>
                          <input
                            type="text"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                          <input
                            type="text"
                            value={formData.academicYear}
                            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                          <div className="relative">
                            <input
                              type="date"
                              value={formData.applicationDeadline}
                              onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <svg className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Fee</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs</span>
                            <input
                              type="text"
                              value={formData.fee}
                              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>Program Information</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Overview</label>
                      <textarea
                        value={formData.overview}
                        onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                        placeholder="Provide a brief summary of the program..."
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>Eligibility</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility Criteria</label>
                      <textarea
                        value={formData.eligibility}
                        onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                        placeholder="List the eligibility criteria..."
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>Official Links</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">University Website URL</label>
                        <input
                          type="url"
                          value={formData.websiteUrl}
                          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admission Portal Link</label>
                        <input
                          type="url"
                          value={formData.admissionPortalLink}
                          onChange={(e) => setFormData({ ...formData, admissionPortalLink: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>System Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <input
                          type="text"
                          value="Pending Audit"
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
                        <input
                          type="text"
                          value="Blank until admin review"
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">AI Summary Preview</label>
                        <textarea
                          value="AI-generated summary will appear here after publishing..."
                          disabled
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-6">
                    <Link
                      to="/university/dashboard"
                      className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
                    >
                      Cancel / Back
                    </Link>
                    <button 
                      onClick={handleSaveDraft}
                      className="px-6 py-2 text-sm font-medium border rounded-lg transition-colors text-blue-600 border-blue-600 hover:bg-blue-50 cursor-pointer"
                    >
                      Save as Draft
                    </button>
                    <button 
                      onClick={handlePublish}
                      className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: '#2563EB' }}
                    >
                      {isEditMode ? 'Update & Publish' : 'Publish Admission'}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>Recent Admissions</h2>
                    <div className="space-y-4">
                      {recentAdmissions.map((admission) => {
                        const statusColors = getStatusColor(admission.status)
                        return (
                          <div key={admission.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-sm" style={{ color: '#111827' }}>{admission.title}</h3>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleEditRecent(admission.id)}
                                  className="p-1 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleDeleteRecent(admission.id)}
                                  className="p-1 text-gray-600 hover:text-red-600 cursor-pointer transition-colors"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">Deadline: {formatDeadlineDisplay(admission.deadline)}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors.bg }}></div>
                              <span className="text-xs font-medium" style={{ color: statusColors.text }}>{admission.status}</span>
                            </div>
                            {sanitizeVerifier(admission.verifiedBy) && (
                              <span className="text-xs font-medium text-green-600">
                                Verified by {sanitizeVerifier(admission.verifiedBy)}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
      </div>
    </UniversityLayout>
  )
}

export default ManageAdmissions

