import { Link, useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect, useRef } from 'react'
import StudentLayout from '../layouts/StudentLayout'
import { useStudentStore } from '../store/studentStore'
import { calculateDaysRemaining } from '../data/studentData'
import { getRelativeTime } from '../utils/dateUtils'
import { useToast } from '../contexts/ToastContext'
import { activityService } from '../services/activityService'
import { admissionsService } from '../services/admissionsService'
import type { Admission } from '../types/api'
import type { StudentAdmission } from '../data/studentData'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const toRequirementsObject = (requirements: unknown): Record<string, unknown> => {
  if (!requirements) return {}
  if (typeof requirements === 'string') {
    try {
      const parsed = JSON.parse(requirements)
      return typeof parsed === 'object' && parsed && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}
    } catch {
      return {}
    }
  }

  return typeof requirements === 'object' && !Array.isArray(requirements)
    ? requirements as Record<string, unknown>
    : {}
}

const readString = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

const readStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

interface ResolvedOfficialLinks {
  universityWebsiteUrl?: string
  admissionPortalLink?: string
  primaryUrl?: string
}

const getOfficialLinks = (admission: Admission, requirements: Record<string, unknown>): ResolvedOfficialLinks => {
  const links = toRequirementsObject(requirements.links)
  const officialLinks = [
    ...readStringArray(requirements.officialLinks),
    ...readStringArray(links.officialLinks),
  ]

  const admissionPortalLink =
    readString(requirements.admissionPortalLink) ||
    readString(requirements.admission_portal_link) ||
    readString(requirements.portalLink) ||
    readString(links.admissionPortalLink) ||
    readString(links.admission_portal_link) ||
    readString(links.portalLink) ||
    readString(admission.admission_portal_link)

  const universityWebsiteUrl =
    readString(requirements.websiteUrl) ||
    readString(requirements.website_url) ||
    readString(requirements.officialWebsite) ||
    readString(links.websiteUrl) ||
    readString(links.website_url) ||
    readString(links.officialWebsite) ||
    readString(admission.website_url)

  return {
    admissionPortalLink,
    universityWebsiteUrl,
    primaryUrl: admissionPortalLink || universityWebsiteUrl || officialLinks[0],
  }
}

const getEligibilityText = (requirements: Record<string, unknown>): string | undefined => {
  const eligibilityObj = toRequirementsObject(requirements.eligibility)
  const criteriaObj = toRequirementsObject(requirements.criteria)

  return (
    readString(requirements.eligibility) ||
    readString(eligibilityObj.text) ||
    readString(eligibilityObj.description) ||
    readString(eligibilityObj.value) ||
    readString(requirements.eligibilityCriteria) ||
    readString(requirements.eligibility_criteria) ||
    readString(requirements.generalRequirements) ||
    readString(requirements.criteria) ||
    readString(criteriaObj.text) ||
    readString(criteriaObj.description) ||
    readString(criteriaObj.value) ||
    readString(requirements.requirements)
  )
}

const mapDegreeType = (degree: string | undefined): StudentAdmission['degreeType'] => {
  const value = (degree || '').toUpperCase()
  if (value.includes('PHD')) return 'PhD'
  if (value.includes('MBA')) return 'MBA'
  if (value.includes('BBA')) return 'BBA'
  if (value.includes('MD')) return 'MD'
  if (value.includes('MPHIL')) return 'MPhil'
  if (value.includes('MS') || value.includes('MASTER')) return 'MS'
  return 'BS'
}

const getProgramStatus = (deadline: string | null | undefined): StudentAdmission['programStatus'] => {
  const days = calculateDaysRemaining(deadline || '')
  if (days < 0) return 'Closed'
  if (days <= 7) return 'Closing Soon'
  return 'Open'
}

const formatFee = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Fee not specified'
  return `PKR ${Number(value).toLocaleString()}`
}

const formatBackendRequirements = (requirements: Record<string, unknown>): string[] => {
  const hiddenKeys = new Set([
    'links',
    'officialLinks',
    'websiteUrl',
    'website_url',
    'officialWebsite',
    'admissionPortalLink',
    'admission_portal_link',
    'portalLink',
    'eligibility',
    'eligibilityCriteria',
    'eligibility_criteria',
    'generalRequirements',
    'criteria',
    'requirements',
  ])

  return Object.entries(requirements)
    .filter(([key]) => !hiddenKeys.has(key))
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        const list = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        if (list.length === 0) return ''
        return `${key.replace(/_/g, ' ')}: ${list.join(', ')}`
      }

      if (typeof value === 'object' && value !== null) {
        const nested = Object.entries(value as Record<string, unknown>)
          .filter(([, nestedValue]) => ['string', 'number', 'boolean'].includes(typeof nestedValue))
          .map(([nestedKey, nestedValue]) => `${nestedKey}: ${String(nestedValue)}`)
        return nested.length > 0 ? `${key.replace(/_/g, ' ')}: ${nested.join(', ')}` : ''
      }

      if (['string', 'number', 'boolean'].includes(typeof value)) {
        return `${key.replace(/_/g, ' ')}: ${String(value)}`
      }

      return ''
    })
    .filter((line) => line.length > 0)
    .filter((line, index, all) => all.indexOf(line) === index)
}

function ProgramDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showSuccess, showInfo, showWarning, showError } = useToast()
  const [activeTab, setActiveTab] = useState('Overview')
  const getAdmissionById = useStudentStore((state) => state.getAdmissionById)
  const admissions = useStudentStore((state) => state.admissions)
  const toggleAlert = useStudentStore((state) => state.toggleAlert)
  
  const storeProgram = id ? getAdmissionById(id) : undefined
  const storeProgramRef = useRef(storeProgram)
  const [program, setProgram] = useState<StudentAdmission | undefined>(storeProgram)
  const [requirementsLines, setRequirementsLines] = useState<string[]>([])
  const [officialLinks, setOfficialLinks] = useState<ResolvedOfficialLinks>({
    primaryUrl: storeProgram?.officialUrl,
  })
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'not-found' | 'error'>(id ? 'loading' : 'not-found')

  useEffect(() => {
    storeProgramRef.current = storeProgram
  }, [storeProgram])

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const hydrateProgram = async () => {
      try {
        let response: Awaited<ReturnType<typeof admissionsService.getById>> | null = null
        let admission: any = null

        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            response = await admissionsService.getById(id)
            admission = response.data?.data ?? response.data
            break
          } catch (requestError) {
            const status = (requestError as { response?: { status?: number } })?.response?.status
            const shouldRetry = attempt === 0 && (status === 401 || status === 403)
            if (!shouldRetry) {
              throw requestError
            }
            await delay(450)
          }
        }

        if (!admission?.id) {
          throw new Error('Admission payload is missing')
        }

        if (cancelled) return

        if (!admission?.id) {
          throw new Error('Admission payload is missing')
        }

        const requirements = toRequirementsObject(admission.requirements)
        const resolvedOfficialLinks = getOfficialLinks(admission, requirements)
        const degree = admission.degree_level || 'Degree Not Specified'
        const university =
          admission.universities?.name ||
          (admission as Admission & { university_name?: string }).university_name ||
          storeProgramRef.current?.university ||
          'University'

        const mappedProgram: StudentAdmission = {
          id: admission.id,
          university,
          universityLogo:
            admission.universities?.logo_url ||
            (admission as Admission & { university_logo_url?: string }).university_logo_url ||
            storeProgramRef.current?.universityLogo ||
            undefined,
          universityCity:
            admission.universities?.city ||
            (admission as Admission & { university_city?: string }).university_city ||
            storeProgramRef.current?.universityCity ||
            undefined,
          universityCountry:
            admission.universities?.country ||
            (admission as Admission & { university_country?: string }).university_country ||
            storeProgramRef.current?.universityCountry ||
            undefined,
          program: admission.title || storeProgramRef.current?.program || 'Untitled Program',
          degree,
          degreeType: mapDegreeType(degree),
          deadline: admission.deadline || storeProgramRef.current?.deadline || '',
          deadlineDisplay:
            admission.deadline
              ? new Date(admission.deadline).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'No deadline',
          fee: formatFee(admission.application_fee),
          feeNumeric: Number(admission.application_fee || 0),
          location: admission.location || storeProgramRef.current?.location || 'Location not specified',
          city: admission.location?.split(',')[0]?.trim() || storeProgramRef.current?.city || 'Unknown',
          status: admission.verification_status === 'verified' ? 'Verified' : admission.verification_status === 'rejected' ? 'Closed' : 'Pending',
          verificationStatus:
            admission.verification_status === 'verified'
              ? 'verified'
              : admission.verification_status === 'rejected'
              ? 'rejected'
              : 'pending',
          programStatus: getProgramStatus(admission.deadline),
          updated: admission.updated_at ? getRelativeTime(admission.updated_at) : 'Recently updated',
          daysRemaining: calculateDaysRemaining(admission.deadline || ''),
          match: storeProgramRef.current?.match,
          matchNumeric: storeProgramRef.current?.matchNumeric,
          logoBg: storeProgramRef.current?.logoBg || '#1F2937',
          aiSummary: admission.description || storeProgramRef.current?.aiSummary,
          eligibility: getEligibilityText(requirements),
          officialUrl: resolvedOfficialLinks.primaryUrl,
          alertEnabled: storeProgramRef.current?.alertEnabled || false,
          saved: storeProgramRef.current?.saved || false,
          watchlistId: storeProgramRef.current?.watchlistId,
        }

        setProgram(storeProgramRef.current ? { ...storeProgramRef.current, ...mappedProgram } : mappedProgram)
        setOfficialLinks(resolvedOfficialLinks)
        setRequirementsLines(formatBackendRequirements(requirements))
        setLoadState('ready')
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status !== 404) {
          console.warn('Failed to hydrate program details:', error)
        }
        if (!cancelled) {
          if (storeProgramRef.current) {
            setProgram(storeProgramRef.current)
            setRequirementsLines([])
            setOfficialLinks({ primaryUrl: storeProgramRef.current.officialUrl })
            setLoadState('ready')
            return
          }

          setLoadState(status === 404 ? 'not-found' : 'error')
        }
      }
    }

    hydrateProgram()

    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!program?.id) return

    activityService.trackCappedStudentEvent({
      activity_type: 'viewed',
      entity_type: 'admission',
      entity_id: program.id,
      metadata: { source: 'program_detail', action: 'page_view' },
    }).catch(() => {})
  }, [program?.id])
  
  // Get related programs (same degree type, different university, limit 3)
  const relatedPrograms = useMemo(() => {
    if (!program) return []
    return admissions
      .filter(a => a.id !== program.id && a.degreeType === program.degreeType)
      .slice(0, 3)
  }, [program, admissions])

  if (loadState === 'loading') {
    return (
      <StudentLayout>
        <div className="p-6">
          <div className="container mx-auto max-w-7xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
              <LoadingSpinner size="lg" message="Loading program details..." />
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  if (loadState === 'error') {
    return (
      <StudentLayout>
        <div className="p-6">
          <div className="container mx-auto max-w-7xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3L2 21h20L12 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>Unable to Load Program</h2>
              <p className="text-gray-600 mb-6">We could not load this program right now. Please try again.</p>
              <button
                onClick={() => navigate('/student/search')}
                className="px-5 py-2.5 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
                style={{ backgroundColor: '#2563EB' }}
              >
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  if (!program) {
    return (
      <StudentLayout>
        <div className="p-6">
          <div className="container mx-auto max-w-7xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E5E7EB' }}>
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9a4 4 0 115.656 5.656L12 17.485l-2.828-2.829A4 4 0 019.172 9z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>Program Unavailable</h2>
              <p className="text-gray-600 mb-6">This program is no longer available, unpublished, or not accessible for your account.</p>
              <button
                onClick={() => navigate('/student/watchlist')}
                className="px-5 py-2.5 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
                style={{ backgroundColor: '#2563EB' }}
              >
                Go to Watchlist
              </button>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
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
    activityService.trackCappedStudentEvent({
      activity_type: 'compared',
      entity_type: 'admission',
      entity_id: program.id,
      metadata: { source: 'program_detail', action: 'compare_click' },
    }).catch(() => {})

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

      activityService.trackCappedStudentEvent({
        activity_type: 'alert',
        entity_type: 'admission',
        entity_id: program.id,
        metadata: { source: 'program_detail', action: 'set_reminder' },
      }).catch(() => {})

      await toggleAlert(program.id)
      showSuccess('Reminder enabled. Program added to watchlist automatically.')
    } catch (error) {
      showError('Failed to update reminder settings. Please try again.')
    }
  }

  const handleApplyNow = () => {
    activityService.trackCappedStudentEvent({
      activity_type: 'searched',
      entity_type: 'admission',
      entity_id: program.id,
      metadata: { source: 'program_detail', action: 'apply_now_click' },
    }).catch(() => {})

    const applyLink = officialLinks.admissionPortalLink || officialLinks.primaryUrl || program.officialUrl
    if (applyLink && !applyLink.startsWith('/program/')) {
      window.open(applyLink, '_blank', 'noopener,noreferrer')
      return
    }

    showInfo('Admission portal link is unavailable. Please use the official links section below.')
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
      officialLinks.universityWebsiteUrl ? `University Website: ${officialLinks.universityWebsiteUrl}` : '',
      officialLinks.admissionPortalLink ? `Admission Portal: ${officialLinks.admissionPortalLink}` : '',
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
                  {['Overview', 'Eligibility', 'Important Dates'].map((tab) => (
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
                      <p className="text-gray-700">{program.eligibility || 'Please contact the university directly for specific eligibility requirements and required documents for this program.'}</p>
                    </div>
                    {requirementsLines.length > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>Saved Requirements (From Backend)</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {requirementsLines.map((line, idx) => (
                            <li key={`${line}-${idx}`}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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
                {officialLinks.universityWebsiteUrl && (
                  <a
                    href={officialLinks.universityWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#2563EB' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    University Website
                  </a>
                )}

                {officialLinks.admissionPortalLink && (
                  <a
                    href={officialLinks.admissionPortalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#10B981' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h6m0 0v6m0-6L10 16m-4-5v6h6" />
                    </svg>
                    Admission Portal Link
                  </a>
                )}

                {!officialLinks.universityWebsiteUrl && !officialLinks.admissionPortalLink && (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Official links are not available. Please contact the university directly for more information.</p>
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

