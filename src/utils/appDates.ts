/**
 * Date rules shared with the mobile app (keep in sync with
 * AdmissionTimes-MobileApp/src/domain/dates.ts) and the backend contract.
 *
 * Deadlines are calendar days in Pakistan time (UTC+05:00) and close at
 * 23:59:59 that day. Formatting does not depend on the browser timezone.
 */
const APP_UTC_OFFSET_MINUTES = 5 * 60
const DAY_MS = 24 * 60 * 60 * 1000
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const toMs = (value: string | null | undefined): number | null => {
  if (!value) return null
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? null : ms
}

/** Day number (days since epoch) of an instant, counted in the app timezone. */
const appDay = (ms: number): number => Math.floor((ms + APP_UTC_OFFSET_MINUTES * 60000) / DAY_MS)

/** Date parts of an instant in the app timezone. */
const appParts = (ms: number) => {
  const shifted = new Date(ms + APP_UTC_OFFSET_MINUTES * 60000)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    hours: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
  }
}

/**
 * Calendar days until the deadline day: 0 = closes today, 1 = tomorrow.
 * -1 when the deadline has passed or there is none.
 */
export const daysUntil = (iso: string | null | undefined, now: number = Date.now()): number => {
  const ms = toMs(iso)
  if (ms === null || ms < now) return -1
  return appDay(ms) - appDay(now)
}

/** "October 12, 2026" */
export const formatDate = (iso: string | null | undefined, fallback = 'No deadline'): string => {
  const ms = toMs(iso)
  if (ms === null) return fallback
  const { year, month, day } = appParts(ms)
  return `${MONTHS[month]} ${day}, ${year}`
}

/** "Oct 12" */
export const formatShortDate = (iso: string | null | undefined, fallback = '—'): string => {
  const ms = toMs(iso)
  if (ms === null) return fallback
  const { month, day } = appParts(ms)
  return `${MONTHS[month].slice(0, 3)} ${day}`
}

/** "October 8, 2026 at 6:37 PM" */
export const formatDateTime = (iso: string | null | undefined, fallback = 'Not available'): string => {
  const ms = toMs(iso)
  if (ms === null) return fallback
  const { year, month, day, hours, minutes } = appParts(ms)
  const h12 = hours % 12 === 0 ? 12 : hours % 12
  return `${MONTHS[month]} ${day}, ${year} at ${h12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`
}

/** Stable key for grouping by deadline day. */
export const dayKey = (iso: string | null | undefined): string => {
  const ms = toMs(iso)
  if (ms === null) return 'none'
  const { year, month, day } = appParts(ms)
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** "5m ago", "3h ago", "2d ago" */
export const timeAgo = (iso: string | null | undefined, now: number = Date.now()): string => {
  const ms = toMs(iso)
  if (ms === null) return ''
  const minutes = Math.max(1, Math.floor((now - ms) / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatShortDate(iso)
}

/** "Closes today", "1 day left", "12 days left", "Deadline passed", "No deadline" */
export const daysLeftLabel = (days: number, hasDeadline: boolean): string => {
  if (!hasDeadline) return 'No deadline'
  if (days < 0) return 'Deadline passed'
  if (days === 0) return 'Closes today'
  return days === 1 ? '1 day left' : `${days} days left`
}
