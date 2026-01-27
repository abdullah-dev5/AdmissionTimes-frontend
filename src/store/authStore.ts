/**
 * Authentication Store (Zustand)
 * 
 * Complements the React Context-based auth with persistent state management.
 * Used by API client to inject auth headers.
 * 
 * @module store/authStore
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/api'

interface AuthStoreState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  setUser: (user: User | null) => void
}

/**
 * Zustand auth store with localStorage persistence
 * 
 * This store is used by:
 * 1. API client interceptor (to inject auth headers)
 * 2. Components that need quick access to user info
 * 3. Backup to AuthContext for critical auth flows
 * 
 * Persists to localStorage so headers are available even on page refresh
 * before AuthContext initializes.
 */
export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      /**
       * Login: store user and mark as authenticated
       */
      login: (user: User) =>
        set({
          user,
          isAuthenticated: true,
        }),

      /**
       * Logout: clear user and mark as not authenticated
       */
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      /**
       * Set user: flexible user update
       */
      setUser: (user: User | null) =>
        set({
          user,
          isAuthenticated: user !== null,
        }),
    }),
    {
      name: 'auth-store', // localStorage key
      version: 1,
    }
  )
)

/**
 * Helper function to get auth state synchronously
 * Used by API client interceptor before state is fully initialized
 * 
 * @returns {object} Current user and authentication status
 */
export function getAuthState() {
  return useAuthStore.getState()
}

/**
 * Helper function to check if user is authenticated
 * 
 * @returns {boolean} True if user exists and is authenticated
 */
export function isUserAuthenticated(): boolean {
  const { isAuthenticated } = useAuthStore.getState()
  return isAuthenticated
}

/**
 * Helper function to get current user synchronously
 * 
 * @returns {User | null} Current user or null
 */
export function getCurrentUser(): User | null {
  const { user } = useAuthStore.getState()
  return user
}

/**
 * Helper function to get user role
 * 
 * @returns {string | null} User's role (student/university/admin) or null
 */
export function getUserRole(): string | null {
  const { user } = useAuthStore.getState()
  return user?.user_type || null
}
