/**
 * Authentication Store (Zustand)
 * 
 * Complete authentication state management with login, signup, logout operations
 * and persistent localStorage storage.
 * 
 * @module store/authStore
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService, type SignInData, type SignUpData } from '../services/authService'
import { supabase } from '../services/supabase'
import type { User } from '../types/api'

const isAuthDebugEnabled = import.meta.env.VITE_DEBUG_AUTH === 'true'

// Re-export types for use in other modules
export type { SignInData, SignUpData }

interface AuthStoreState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions - Auth Operations
  checkAuth: (options?: { showError?: (msg: string) => void; showSuccess?: (msg: string) => void }) => Promise<void>
  signIn: (data: SignInData, options?: { showError?: (msg: string) => void; showSuccess?: (msg: string) => void; navigate?: (path: string) => void }) => Promise<void>
  signUp: (data: SignUpData, options?: { showError?: (msg: string) => void; showSuccess?: (msg: string) => void; navigate?: (path: string) => void }) => Promise<void>
  signOut: (options?: { showSuccess?: (msg: string) => void; navigate?: (path: string) => void }) => Promise<void>
  setUser: (user: User | null) => void

  // Cleanup
  reset: () => void
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      ...initialState,

      // Check Authentication
      checkAuth: async (options) => {
        try {
          set({ isLoading: true, error: null })

          const { data: { session }, error: sessionError } = await supabase.auth.getSession()

          if (sessionError) {
            throw sessionError
          }

          if (session?.access_token) {
            // Get current user from API using JWT
            const response = await authService.getCurrentUser()
            const userData = response.data

            if (isAuthDebugEnabled) console.log('🔐 [AuthStore] checkAuth - User data:', userData)
            if (userData.role !== 'student') {
              if (isAuthDebugEnabled) console.log('🔐 [AuthStore] checkAuth - university_id:', userData.university_id)
            }

            set({ user: userData, isAuthenticated: true })
          } else {
            set({ user: null, isAuthenticated: false })
          }
        } catch (error: any) {
          console.error('Auth check failed:', error)

          // If persisted refresh token is invalid/revoked, clear local session to stop retry noise.
          const message = String(error?.message || '')
          if (message.toLowerCase().includes('invalid refresh token')) {
            try {
              await supabase.auth.signOut({ scope: 'local' })
            } catch {
              // ignore cleanup failure
            }
          }

          set({ user: null, isAuthenticated: false })
          if (options?.showError) {
            options.showError('Failed to check authentication')
          }
        } finally {
          set({ isLoading: false })
        }
      },

      // Sign In
      signIn: async (data, options) => {
        try {
          set({ isLoading: true, error: null })
          const email = data.email.trim().toLowerCase()
          const password = data.password

          // Authenticate with Supabase
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            if (error.message.includes('Email not confirmed')) {
              throw new Error('Please verify your email before signing in. Check your inbox for the verification link.')
            }
            throw error
          }

          // Fetch user from backend
          const response = await authService.getCurrentUser()
          const userData = response.data

          if (isAuthDebugEnabled) console.log('🔐 [AuthStore] User data received:', userData)
          if (userData.role !== 'student') {
            if (isAuthDebugEnabled) console.log('🔐 [AuthStore] university_id:', userData.university_id)
          }
          if (isAuthDebugEnabled) console.log('🔐 [AuthStore] role:', userData.role)

          set({ user: userData, isAuthenticated: true })

          if (options?.showSuccess) {
            options.showSuccess('Signed in successfully!')
          }

          // Navigate to appropriate dashboard
          if (options?.navigate) {
            const userType = userData.role || userData.user_type
            if (userType === 'student') {
              options.navigate('/student/dashboard')
            } else if (userType === 'university') {
              options.navigate('/university/dashboard')
            } else if (userType === 'admin') {
              options.navigate('/admin/dashboard')
            }
          }
        } catch (error: any) {
          console.error('Sign in failed:', error)
          const errorMsg = error.message || error.response?.data?.message || 'Failed to sign in. Please check your credentials.'
          set({ error: errorMsg, isLoading: false })
          if (options?.showError) {
            options.showError(errorMsg)
          }
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      // Sign Up
      signUp: async (data, options) => {
        try {
          set({ isLoading: true, error: null })
          const email = data.email.trim().toLowerCase()
          const password = data.password

          // Create user in Supabase Auth
          const { data: signUpResult, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                role: data.user_type,
                university_id: data.university_id || null,
                display_name: data.display_name || null,
              },
              emailRedirectTo: `${window.location.origin}/signin`,
            },
          })

          if (error) {
            throw error
          }

          const authUserId = signUpResult.user?.id

          if (!authUserId) {
            throw new Error('Failed to create account in Supabase')
          }

          // Create user in database
          try {
            await authService.signUp({
              ...data,
              auth_user_id: authUserId,
            })
          } catch (backendError: any) {
            console.error('Database user creation failed:', backendError)
            // JWT middleware will auto-create the user
          }

          if (options?.showSuccess) {
            options.showSuccess('Account created! Please check your email to verify your account before signing in.')
          }

          // Navigate to signin page
          if (options?.navigate) {
            options.navigate('/signin')
          }
        } catch (error: any) {
          console.error('Sign up failed:', error)
          const errorMsg = error.message || error.response?.data?.message || 'Failed to create account. Please try again.'
          set({ error: errorMsg, isLoading: false })
          if (options?.showError) {
            options.showError(errorMsg)
          }
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      // Sign Out
      signOut: async (options) => {
        try {
          await supabase.auth.signOut()
        } catch (error) {
          console.error('Sign out error:', error)
          // Continue with sign out even if API call fails
        } finally {
          set({ user: null, isAuthenticated: false, error: null, isLoading: false })

          if (options?.showSuccess) {
            options.showSuccess('Signed out successfully')
          }

          if (options?.navigate) {
            options.navigate('/signin')
          }
        }
      },

      // Set User
      setUser: (user) => {
        set({ user, isAuthenticated: user !== null })
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'auth-store',
      version: 1,
    }
  )
)

// Helper functions
export function getAuthState() {
  return useAuthStore.getState()
}

export function isUserAuthenticated(): boolean {
  const { isAuthenticated } = useAuthStore.getState()
  return isAuthenticated
}

export function getCurrentUser(): User | null {
  const { user } = useAuthStore.getState()
  return user
}

export function getUserRole(): string | null {
  const { user } = useAuthStore.getState()
  return user?.user_type || null
}
