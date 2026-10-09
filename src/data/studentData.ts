// Shared student data for consistent data across all student pages

export type AdmissionStatus = 'Verified' | 'Pending' | 'Updated' | 'Closed'
export type ProgramStatus = 'Open' | 'Closing Soon' | 'Closed'
export type NotificationType = 'alert' | 'system' | 'admission'

export interface StudentAdmission {
  id: string
  university: string
  universityLogo?: string | null  // University logo URL
  universityCity?: string  // University city
  universityCountry?: string  // University country
  program: string
  /** Program description entered by the university (null for scraped listings). */
  description?: string
  degree: string
  degreeType: 'BS' | 'MS' | 'PhD' | 'MBA' | 'BBA' | 'MD' | 'MPhil'
  deadline: string // ISO date format
  deadlineDisplay: string // Human readable
  fee: string
  feeNumeric: number // For sorting
  location: string
  city: string
  status: AdmissionStatus
  verificationStatus?: 'verified' | 'pending' | 'rejected' | 'under_review'  // Raw verification status for badges
  dataOrigin?: string
  programStatus: ProgramStatus
  updated: string
  daysRemaining: number
  /** False when no deadline has been announced (daysRemaining is then meaningless). */
  hasDeadline?: boolean
  match?: string
  matchNumeric?: number
  logoBg: string
  aiSummary?: string
  eligibility?: string
  officialUrl?: string
  websiteUrl?: string
  portalUrl?: string
  /** Scraped admissions: the public announcement the data came from. */
  announcementUrl?: string
  /** university = entered by the university's rep; scraper = public listing. */
  source?: 'university' | 'scraper'
  /** Programs covered by a multi-program announcement. */
  programsOffered?: string[]
  alertEnabled?: boolean
  saved?: boolean
  watchlistId?: string  // Watchlist ID for managing saved state
}

export interface StudentNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  time: string
  timeAgo: string
  read: boolean
  icon: string
  iconColor: string
  admissionId?: string
  actionUrl?: string
}

// Helper functions
export const getStatusColor = (status: AdmissionStatus | ProgramStatus) => {
  switch (status) {
    case 'Verified':
    case 'Open':
      return { bg: '#D1FAE5', text: '#10B981' }
    case 'Pending':
    case 'Closing Soon':
      return { bg: '#FEF3C7', text: '#F59E0B' }
    case 'Updated':
      return { bg: '#DBEAFE', text: '#3B82F6' }
    case 'Closed':
      return { bg: '#FEE2E2', text: '#EF4444' }
    default:
      return { bg: '#F3F4F6', text: '#6B7280' }
  }
}




export const calculateDaysRemaining = (deadline: string): number => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

