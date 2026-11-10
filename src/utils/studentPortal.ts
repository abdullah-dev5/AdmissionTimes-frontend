/**
 * Student portal definitions shared by every student page. Keep in sync with the
 * mobile app (AdmissionTimes-MobileApp/src/domain/*) so both portals use the
 * same labels, filters and rules.
 */

import type { NotificationType, ProgramStatus, StudentAdmission } from '../data/studentData'

export type DataSource = 'university' | 'scraper'

/** "Closing soon" / "Closing this week" window, in calendar days. */
export const CLOSING_SOON_DAYS = 7

export const SOURCE_LABEL: Record<DataSource, string> = {
  university: 'From university',
  scraper: 'Public listing',
}

export const SOURCE_HINT: Record<DataSource, string> = {
  university: 'Entered and maintained by the university, then reviewed by AdmissionTimes.',
  scraper: "Collected automatically from the university's public announcement and reviewed by AdmissionTimes. Check the official announcement for full details.",
}

export const sourceOf = (admission: Pick<StudentAdmission, 'source' | 'dataOrigin'>): DataSource =>
  admission.source ?? (admission.dataOrigin === 'scraper' ? 'scraper' : 'university')

/** Status filter options (students only ever see verified programs). */
export const STATUS_OPTIONS: Array<{ value: ProgramStatus; label: string }> = [
  { value: 'Open', label: 'Open' },
  { value: 'Closing Soon', label: 'Closing soon' },
  { value: 'Closed', label: 'Closed' },
]

export const SOURCE_OPTIONS: Array<{ value: DataSource; label: string }> = [
  { value: 'university', label: SOURCE_LABEL.university },
  { value: 'scraper', label: SOURCE_LABEL.scraper },
]

/** Notification tabs, same as the mobile app. */
export type NotificationTab = 'all' | 'unread' | NotificationType

export const NOTIFICATION_TABS: Array<{ value: NotificationTab; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'alert', label: 'Deadlines' },
  { value: 'admission', label: 'Program updates' },
  { value: 'system', label: 'Announcements' },
]

/** "Closes today", "1 day left", "12 days left", "Deadline passed", "No deadline". */
export const daysLeftLabel = (admission: Pick<StudentAdmission, 'daysRemaining' | 'hasDeadline'>): string => {
  if (admission.hasDeadline === false) return 'No deadline'
  if (admission.daysRemaining < 0) return 'Deadline passed'
  if (admission.daysRemaining === 0) return 'Closes today'
  return admission.daysRemaining === 1 ? '1 day left' : `${admission.daysRemaining} days left`
}

export const isOpenAdmission = (admission: Pick<StudentAdmission, 'programStatus'>) => admission.programStatus !== 'Closed'

/** Open programs first (soonest deadline first), then closed ones (most recent first). */
export const sortByDeadline = <T extends Pick<StudentAdmission, 'programStatus' | 'deadline'>>(items: T[]): T[] => {
  const key = (a: T) => (a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER)
  const open = items.filter(isOpenAdmission).sort((a, b) => key(a) - key(b))
  const closed = items.filter((a) => !isOpenAdmission(a)).sort((a, b) => key(b) - key(a))
  return [...open, ...closed]
}

/** University city for location display and filters (program location text is free-form). */
export const cityOf = (admission: Pick<StudentAdmission, 'universityCity' | 'city'>): string =>
  admission.universityCity || admission.city || ''

/** Deadline text color: red within 3 days, amber within 7, muted when passed. */
export const deadlineTone = (admission: Pick<StudentAdmission, 'daysRemaining' | 'hasDeadline'>): string => {
  if (admission.hasDeadline === false || admission.daysRemaining < 0) return 'text-gray-500'
  if (admission.daysRemaining <= 3) return 'text-red-700'
  if (admission.daysRemaining <= 7) return 'text-amber-700'
  return 'text-gray-700'
}
