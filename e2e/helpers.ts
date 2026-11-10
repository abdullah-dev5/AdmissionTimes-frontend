import { expect, type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

export type Role = 'student' | 'university' | 'admin'

const env = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env ${name}`)
  return value
}

export const accounts: Record<Role, { email: string; password: string }> = {
  student: { email: env('E2E_STUDENT_EMAIL'), password: env('E2E_STUDENT_PASSWORD') },
  university: { email: env('E2E_UNI_EMAIL'), password: env('E2E_UNI_PASSWORD') },
  admin: { email: env('E2E_ADMIN_EMAIL'), password: env('E2E_ADMIN_PASSWORD') },
}

export const DASHBOARD: Record<Role, string> = {
  student: '/student/dashboard',
  university: '/university/dashboard',
  admin: '/admin/dashboard',
}

/** Sign in through the real sign-in form and wait for the role dashboard. */
export async function signIn(page: Page, role: Role): Promise<void> {
  const { email, password } = accounts[role]
  await page.goto('/signin')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  await page.waitForURL(`**${DASHBOARD[role]}`, { timeout: 30_000 })
}

export interface PageProblems {
  consoleErrors: string[]
  pageErrors: string[]
  failedRequests: string[]
}

/**
 * Collect runtime problems: uncaught exceptions, console errors and API calls
 * answered with 5xx (or 4xx other than expected auth/not-found probes).
 */
export function monitor(page: Page): PageProblems {
  const problems: PageProblems = { consoleErrors: [], pageErrors: [], failedRequests: [] }

  page.on('pageerror', (error) => problems.pageErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const text = message.text()
    // Browser-level noise unrelated to the app.
    if (/favicon|Failed to load resource: the server responded with a status of 404/.test(text)) return
    problems.consoleErrors.push(text.slice(0, 300))
  })
  page.on('response', (response) => {
    const url = response.url()
    if (!url.includes('/api/v1/')) return
    const status = response.status()
    if (status >= 500 || status === 400 || status === 403 || status === 422) {
      problems.failedRequests.push(`${status} ${response.request().method()} ${url.replace(/^.*\/api\/v1/, '')}`)
    }
  })

  return problems
}

export const reset = (problems: PageProblems) => {
  problems.consoleErrors.length = 0
  problems.pageErrors.length = 0
  problems.failedRequests.length = 0
}

/** Wait until the page has settled (network idle or a short timeout). */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined)
}

export async function expectNoAppCrash(page: Page): Promise<void> {
  await expect(page.locator('body')).not.toContainText(/Something went wrong|Unexpected Application Error|Cannot read properties/i)
}

// ---------------------------------------------------------------------------
// API access for setup, assertions and cleanup (same accounts as the UI).
// ---------------------------------------------------------------------------


const API = process.env.E2E_API_URL || 'http://localhost:3000/api/v1'
const tokenCache = new Map<Role, string>()

export async function apiToken(role: Role): Promise<string> {
  const cached = tokenCache.get(role)
  if (cached) return cached
  const supabase = createClient(env('E2E_SUPABASE_URL'), env('E2E_SUPABASE_ANON_KEY'), { auth: { persistSession: false } })
  const { data, error } = await supabase.auth.signInWithPassword(accounts[role])
  if (error || !data.session) throw new Error(`API sign-in failed for ${role}: ${error?.message}`)
  tokenCache.set(role, data.session.access_token)
  return data.session.access_token
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function api(role: Role, method: string, path: string, body?: unknown): Promise<{ status: number; data: any; body: any }> {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await apiToken(role)}` },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => null)
  return { status: res.status, data: json?.data, body: json }
}

/** Dismiss a SweetAlert dialog (if one is open) after checking its text. */
export async function confirmDialog(page: Page, text?: RegExp | string): Promise<void> {
  const popup = page.locator('.swal2-popup')
  await expect(popup).toBeVisible()
  if (text) await expect(popup).toContainText(text)
  await popup.locator('.swal2-confirm').click()
  await expect(popup).toBeHidden()
}

/** Date `days` from now as YYYY-MM-DD (for <input type="date">). */
export const dateInDays = (days: number): string => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10)
