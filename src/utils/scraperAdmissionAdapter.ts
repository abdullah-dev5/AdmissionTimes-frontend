const PROGRAM_COLLECTION_KEYS = [
  'programs',
  'sub_programs',
  'subPrograms',
  'program_list',
  'programList',
  'program_details',
  'programDetails',
  'variants',
  'tracks',
]

const PROGRAM_REQUIREMENT_COLLECTION_KEYS = [
  'programs_offered',
  'programs',
  'program_list',
  'programList',
  'sub_programs',
  'subPrograms',
  'tracks',
  'majors',
]

function toObjectRecord(value: unknown): Record<string, any> {
  if (!value) return {}
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, any>)
        : {}
    } catch {
      return {}
    }
  }

  return typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {}
}

function readProgramName(entry: Record<string, any>): string | null {
  const candidate =
    entry.program_name ||
    entry.program_title ||
    entry.sub_program_title ||
    entry.title ||
    entry.name ||
    entry.label

  return typeof candidate === 'string' && candidate.trim().length > 0
    ? candidate.trim()
    : null
}

function getProgramCollection(admission: Record<string, any>): any[] {
  for (const key of PROGRAM_COLLECTION_KEYS) {
    const value = admission?.[key]
    if (Array.isArray(value) && value.length > 0) {
      return value
    }
  }

  const requirements = toObjectRecord(admission?.requirements)
  for (const key of PROGRAM_REQUIREMENT_COLLECTION_KEYS) {
    const value = requirements?.[key]
    if (Array.isArray(value) && value.length > 0) {
      return value
    }
  }

  const offeredPrograms = requirements?.programs_offered
  if (typeof offeredPrograms === 'string' && offeredPrograms.trim().length > 0) {
    const programNames = offeredPrograms
      .split(',')
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0)

    if (programNames.length > 0) {
      return programNames
    }
  }

  return []
}

export function shouldHideGenericScraperAnnouncement(admission: Record<string, any>): boolean {
  const dataOrigin = String(admission?.data_origin || admission?.dataOrigin || '').toLowerCase()
  if (dataOrigin !== 'scraper') return false

  const title = String(admission?.title || admission?.admission_title || admission?.program_title || '').toLowerCase()
  const programCount = Number(
    admission?.requirements?.programs_offered_count ??
    admission?.programs_offered_count ??
    0,
  )

  if (programCount <= 1) return false

  return /(admission|admissions|programs?|undergraduate|graduate|postgraduate|round|round\s*\d+)/i.test(title)
}

export function flattenProgramAdmissions<T extends Record<string, any>>(admissions: T[]): T[] {
  return admissions.flatMap((admission) => {
    const programCollection = getProgramCollection(admission)
    if (programCollection.length === 0) {
      return [admission]
    }

    const parentId = String(admission.id || admission.admission_id || '')

    return programCollection.map((entry, index) => {
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        const normalizedEntry = { ...entry } as Record<string, any>
        const normalizedProgramName = readProgramName(normalizedEntry)
        const childId = String(
          normalizedEntry.id ||
          normalizedEntry.admission_id ||
          normalizedEntry.program_id ||
          `${parentId || 'program'}::program::${index + 1}`,
        )

        return {
          ...admission,
          ...normalizedEntry,
          id: childId,
          source_admission_id: parentId || normalizedEntry.source_admission_id || normalizedEntry.parent_admission_id || null,
          parent_admission_id: parentId || normalizedEntry.parent_admission_id || null,
          program_index: index,
          title:
            normalizedProgramName ||
            admission.title,
          program_title:
            normalizedProgramName ||
            admission.program_type ||
            admission.title,
        }
      }

      if (typeof entry === 'string') {
        return {
          ...admission,
          id: `${parentId || 'program'}::program::${index + 1}`,
          source_admission_id: parentId || null,
          parent_admission_id: parentId || null,
          program_index: index,
          title: entry,
          program_title: entry,
        }
      }

      return {
        ...admission,
        id: `${parentId || 'program'}::program::${index + 1}`,
        source_admission_id: parentId || null,
        parent_admission_id: parentId || null,
        program_index: index,
      }
    })
  })
}

export function inferScraperDegreeLabelFromTitle(title: string | null | undefined): string | null {
  if (!title) return null
  const text = String(title).toLowerCase()

  if (/\bbba\b|bachelor of business administration/.test(text)) return 'BBA'
  if (/\bmba\b|master of business administration/.test(text)) return 'MBA'
  if (/\bphd\b|doctor of philosophy|doctorate/.test(text)) return 'PhD'
  if (/\bmd\b|doctor of medicine/.test(text)) return 'MD'
  if (/\bmphil\b|master of philosophy/.test(text)) return 'MPhil'
  if (/\bbs\b|bachelor of science|\bbe\b|bachelor|undergraduate|under-graduate/.test(text)) return 'BS'
  if (/\bms\b|master of science|\bmaster\b|postgraduate|post-graduate|\bgraduate\b/.test(text)) return 'MS'

  return null
}

export function getScraperFallbackLocation(admission: Record<string, any>): string | null {
  const parts = [admission?.university_city, admission?.university_country]
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .map((value: string) => value.trim())

  if (parts.length === 0) return null
  return parts.join(', ')
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function getRecordBlob(admission: Record<string, any>): string {
  const requirements = toObjectRecord(admission?.requirements)
  const links = toObjectRecord(requirements?.links)

  return [
    normalizeString(admission?.title),
    normalizeString(admission?.program_title),
    normalizeString(admission?.description),
    normalizeString(admission?.source_url),
    normalizeString(admission?.source_details_link),
    normalizeString(requirements?.source_details_link),
    normalizeString(requirements?.websiteUrl),
    normalizeString(requirements?.admissionPortalLink),
    normalizeString(requirements?.fee),
    normalizeString(requirements?.application_fee),
    normalizeString(links?.websiteUrl),
    normalizeString(links?.admissionPortalLink),
    normalizeString(admission?.location),
    normalizeString(requirements?.location),
    normalizeString(requirements?.campus),
  ].filter(Boolean).join(' | ')
}

function extractUrlFromText(text: string): string | undefined {
  if (!text) return undefined
  const match = text.match(/https?:\/\/[^\s)"']+/i)
  return match?.[0]
}

function parseCurrencyAmount(text: string): number | null {
  if (!text) return null

  const normalized = text.replace(/,/g, '')
  const labeledMatch = normalized.match(/(?:pkr|rs\.?|rupees?)\s*[:\-]?\s*(\d+(?:\.\d+)?)/i)
  if (labeledMatch?.[1]) return Number(labeledMatch[1])

  const anyAmountMatch = normalized.match(/\b(\d{4,7}(?:\.\d+)?)\b/)
  if (!anyAmountMatch?.[1]) return null

  const value = Number(anyAmountMatch[1])
  if (!Number.isFinite(value) || value <= 0) return null
  return value
}

function formatPkr(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function isLikelyNonLocationText(value: string): boolean {
  return /(admission|program|deadline|apply|university|institute|faculty|department)/i.test(value)
}

function getScraperUniversityLocationFallback(admission: Record<string, any>): string | null {
  const universityText = [
    normalizeString(admission?.university_name),
    normalizeString(admission?.source_university_name),
    normalizeString(admission?.university),
    normalizeString(admission?.universities?.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (!universityText) return null

  if (/(giki|gha?ulam\s+ishaq\s+khan)/i.test(universityText)) {
    return 'Topi, KPK, Pakistan'
  }

  if (/(mohammad\s+ali\s+jinnah|\bmaju\b)/i.test(universityText)) {
    return 'Karachi, Sindh, Pakistan'
  }

  if (/(national\s+university\s+of\s+technology|\bnutech\b)/i.test(universityText)) {
    return 'Islamabad, Pakistan'
  }

  if (/(\bfast\b|\bnuces\b|national\s+university\s+of\s+computer\s+and\s+emerging\s+sciences)/i.test(universityText)) {
    return 'Islamabad (Main Campus), Multiple campuses in Pakistan'
  }

  if (/(\biba\b.*sukkur|sukkur.*\biba\b|institute\s+of\s+business\s+administration\s+sukkur)/i.test(universityText)) {
    return 'Sukkur, Sindh, Pakistan'
  }

  if (/(\biba\b.*karachi|karachi.*\biba\b|institute\s+of\s+business\s+administration\s+karachi)/i.test(universityText)) {
    return 'Karachi, Sindh, Pakistan'
  }

  return null
}

export function extractScraperOfficialUrl(admission: Record<string, any>): string | undefined {
  const requirements = toObjectRecord(admission?.requirements)
  const links = toObjectRecord(requirements?.links)

  const directCandidates = [
    normalizeString(admission?.source_url),
    normalizeString(admission?.source_details_link),
    normalizeString(admission?.primary_apply_url),
    normalizeString(admission?.admission_portal_url),
    normalizeString(admission?.university_website_url),
    normalizeString(requirements?.source_details_link),
    normalizeString(requirements?.admissionPortalLink),
    normalizeString(requirements?.websiteUrl),
    normalizeString(links?.admissionPortalLink),
    normalizeString(links?.websiteUrl),
  ]

  const directUrl = directCandidates.find((candidate) => /^https?:\/\//i.test(candidate))
  if (directUrl) return directUrl

  return extractUrlFromText(getRecordBlob(admission))
}

export function extractScraperFee(admission: Record<string, any>): { feeNumeric: number | null; feeDisplay?: string } {
  const directNumericCandidates = [
    Number(admission?.fee_amount),
    Number(admission?.feeAmount),
    Number(admission?.application_fee),
  ]

  const directNumeric = directNumericCandidates.find((value) => Number.isFinite(value) && value > 0)
  if (typeof directNumeric === 'number') {
    return { feeNumeric: directNumeric, feeDisplay: formatPkr(directNumeric) }
  }

  const amount = parseCurrencyAmount(getRecordBlob(admission))
  if (!amount) return { feeNumeric: null }

  return { feeNumeric: amount, feeDisplay: formatPkr(amount) }
}

export function resolveScraperAdmissionLocation(admission: Record<string, any>): string | null {
  const requirements = toObjectRecord(admission?.requirements)
  const links = toObjectRecord(requirements?.links)

  const locationCandidates = [
    normalizeString(admission?.source_location),
    normalizeString(requirements?.source_location),
    normalizeString(admission?.campus),
    normalizeString(requirements?.campus),
    normalizeString(admission?.city),
    normalizeString(requirements?.city),
    normalizeString(admission?.location),
    normalizeString(requirements?.location),
    normalizeString(links?.location),
  ]

  const specificLocation = locationCandidates.find((candidate) => {
    if (!candidate) return false
    if (candidate.length < 3) return false
    return !isLikelyNonLocationText(candidate)
  })
  if (specificLocation) return specificLocation

  const mappedFallback = getScraperUniversityLocationFallback(admission)
  if (mappedFallback) return mappedFallback

  // Do not fallback to mapped university city/country for scraper cards.
  // It can be incorrect for multi-campus programs and causes misleading hardcoded locations.
  return null
}
