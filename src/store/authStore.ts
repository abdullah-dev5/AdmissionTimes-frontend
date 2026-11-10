/**
 * Authentication Store (Zustand)
 *
 * Supabase Auth owns the session (tokens are stored by the Supabase client).
 * This store holds the application profile from GET /auth/me — the backend is
 * the source of truth for role and university, never token metadata.
 *
 * Only non-sensitive profile fields are persisted (no email, no tokens), and
 * `isLoading` is never persisted so a reload always re-validates the session.
 *
 * @module store/authStore
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isAxiosError } from 'axios'
import { authService, type SignInData, type SignUpData } from '../services/authService'
import { supabase } from '../services/supabase'
import { resetUserScopedStores } from './resetStores'
import { closeRealtime } from '../services/realtime'
import type { User } from '../types/api'

export type { SignInData, SignUpData }

type Notify = (msg: string) => void

interface AuthStoreState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  checkAuth: (options?: { showError?: Notify; showSuccess?: Notify }) => Promise<void>
  signIn: (data: SignInData, options?: { showError?: Notify; showSuccess?: Notify; navigate?: (path: string) => void }) => Promise<void>
  signUp: (data: SignUpData, options?: { showError?: Notify; showSuccess?: Notify; navigate?: (path: string) => void }) => Promise<void>
  signOut: (options?: { showSuccess?: Notify; navigate?: (path: string) => void }) => Promise<void>
  /** Clear local auth + user-scoped data without calling Supabase (e.g. after a 401). */
  clearSession: () => void
  setUser: (user: User | null) => void
  reset: () => void
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

const DASHBOARD_BY_ROLE: Record<string, string> = {
  student: '/student/dashboard',
  university: '/university/dashboard',
  admin: '/admin/dashboard',
}

export const dashboardPathFor = (user: Pick<User, 'role'> | null | undefined): string =>
  DASHBOARD_BY_ROLE[user?.role ?? ''] ?? '/'

const errorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) return error.response?.data?.message || error.message || fallback
  if (error instanceof Error) return error.message || fallback
  return fallback
}

/** 401/403 from /auth/me means the session is unusable; anything else is transient. */
const isAuthRejection = (error: unknown): boolean =>
  isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      checkAuth: async (options) => {
        set({ isLoading: true, error: null })
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) throw sessionError

          if (!session?.access_token) {
            get().clearSession()
            return
          }

          const response = await authService.getCurrentUser()
          set({ user: response.data, isAuthenticated: true })
        } catch (error) {
          const message = errorMessage(error, 'Failed to check authentication')

          if (isAuthRejection(error) || message.toLowerCase().includes('refresh token')) {
            await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined)
            get().clearSession()
            if (isAxiosError(error) && error.response?.status === 403) options?.showError?.(message)
            return
          }

          // Network/server problem: keep the last known profile so the user is
          // not logged out by a transient backend outage.
          set({ error: message })
          options?.showError?.('Could not reach the server. Some data may be out of date.')
        } finally {
          set({ isLoading: false })
        }
      },

      signIn: async (data, options) => {
        set({ isLoading: true, error: null })
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email: data.email.trim().toLowerCase(),
            password: data.password,
          })

          if (error) {
            throw new Error(
              error.message.includes('Email not confirmed')
                ? 'Please verify your email before signing in. Check your inbox for the verification link.'
                : error.message
            )
          }

          // Never show data cached for a previous account on this browser.
          resetUserScopedStores()

          const response = await authService.getCurrentUser()
          set({ user: response.data, isAuthenticated: true })

          options?.showSuccess?.('Signed in successfully!')
          options?.navigate?.(dashboardPathFor(response.data))
        } catch (error) {
          const message = errorMessage(error, 'Failed to sign in. Please check your credentials.')
          set({ error: message })
          options?.showError?.(message)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      signUp: async (data, options) => {
        set({ isLoading: true, error: null })
        try {
          const email = data.email.trim().toLowerCase()
          const displayName = data.display_name?.trim() || undefined

          // Role is NOT sent as metadata: the backend assigns it (students only
          // via self-signup) and ignores token metadata for authorization.
          const { data: signUpResult, error } = await supabase.auth.signUp({
            email,
            password: data.password,
            options: {
              data: { display_name: displayName ?? null },
              emailRedirectTo: `${window.location.origin}/signin`,
            },
          })
          if (error) throw error

          const authUserId = signUpResult.user?.id
          if (!authUserId) throw new Error('Failed to create account')

          try {
            await authService.signUp({ email, display_name: displayName, auth_user_id: authUserId })
          } catch (profileError) {
            // The profile is also provisioned on first sign-in, so this is not fatal.
            console.warn('Profile creation deferred to first sign-in:', errorMessage(profileError, 'unknown error'))
          }

          options?.showSuccess?.('Account created! Please check your email to verify your account before signing in.')
          options?.navigate?.('/signin')
        } catch (error) {
          const message = errorMessage(error, 'Failed to create account. Please try again.')
          set({ error: message })
          options?.showError?.(message)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      signOut: async (options) => {
        try {
          await supabase.auth.signOut()
        } catch (error) {
          console.warn('Supabase sign-out failed; clearing local session anyway:', error)
        } finally {
          get().clearSession()
          options?.showSuccess?.('Signed out successfully')
          options?.navigate?.('/signin')
        }
      },

      clearSession: () => {
        closeRealtime()
        resetUserScopedStores()
        set({ user: null, isAuthenticated: false, error: null, isLoading: false })
      },

      setUser: (user) => set({ user, isAuthenticated: user !== null }),

      reset: () => set(initialState),
    }),
    {
      name: 'auth-store',
      version: 2,
      // Persist only what is needed to render the shell; never tokens or email.
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user
          ? {
              id: state.user.id,
              role: state.user.role,
              display_name: state.user.display_name,
              university_id: state.user.university_id ?? null,
            }
          : null,
      }),
      migrate: () => ({ user: null, isAuthenticated: false }),
    }
  )
)

export function getAuthState() {
  return useAuthStore.getState()
}

export function isUserAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated
}

export function getCurrentUser(): User | null {
  return useAuthStore.getState().user
}

export function getUserRole(): string | null {
  return useAuthStore.getState().user?.role ?? null
}
