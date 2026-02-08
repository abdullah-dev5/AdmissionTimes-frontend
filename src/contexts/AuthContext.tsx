/**
 * Authentication Context (Minimal Wrapper)
 * 
 * Now uses Zustand store internally for all operations.
 * Provides useAuth() hook for components to access auth state and functions.
 * 
 * @module contexts/AuthContext
 */

import { createContext, useContext, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { SignInData, SignUpData } from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Minimal Auth Provider - wraps Zustand store with navigation and toast notifications
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Get auth state from Zustand store
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const storeSignIn = useAuthStore((state) => state.signIn);
  const storeSignUp = useAuthStore((state) => state.signUp);
  const storeSignOut = useAuthStore((state) => state.signOut);

  // Initialize auth on mount only
  useEffect(() => {
    checkAuth({ showError, showSuccess });
  }, []);

  // Wrap functions with useCallback to maintain stable references
  const signIn = useCallback(async (data: SignInData) => {
    await storeSignIn(data, { showError, showSuccess, navigate });
  }, [storeSignIn, showError, showSuccess, navigate]);

  const signUp = useCallback(async (data: SignUpData) => {
    await storeSignUp(data, { showError, showSuccess, navigate });
  }, [storeSignUp, showError, showSuccess, navigate]);

  const signOut = useCallback(async () => {
    await storeSignOut({ showSuccess, navigate });
  }, [storeSignOut, showSuccess, navigate]);

  const refreshUser = useCallback(async () => {
    await checkAuth({ showError });
  }, [checkAuth, showError]);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const value: AuthContextType = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  }), [user, isAuthenticated, isLoading, signIn, signUp, signOut, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context (backed by Zustand store)
 */
export function useAuth() {
  const context = useContext(AuthContext);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const signOut = useAuthStore((state) => state.signOut);

  if (!context) {
    console.warn('useAuth used without AuthProvider; falling back to store-only auth.');
    return {
      user,
      isAuthenticated,
      isLoading,
      signIn: async (data: SignInData) => signIn(data),
      signUp: async (data: SignUpData) => signUp(data),
      signOut: async () => signOut(),
      refreshUser: async () => checkAuth(),
    };
  }
  return context;
}
