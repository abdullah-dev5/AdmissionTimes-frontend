/**
 * Authentication Context
 * 
 * Manages authentication state and provides auth methods throughout the app.
 * Handles sign in, sign up, sign out, and user session management.
 * 
 * @module contexts/AuthContext
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type SignInData, type SignUpData } from '../services/authService';
import { supabase } from '../services/supabase';
import { useToast } from './ToastContext';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication functionality
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Check if user is already authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check if user is authenticated
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (session?.access_token) {
        // Get current user from API using JWT
        const response = await authService.getCurrentUser();
        setUser(response.data);

        // Sync with Zustand store
        useAuthStore.getState().login(response.data);
      } else {
        setUser(null);
        useAuthStore.getState().logout();
      }
    } catch (error: any) {
      // Not authenticated or error
      console.error('Auth check failed:', error);
      setUser(null);
      useAuthStore.getState().logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign in user
   */
  const signIn = useCallback(async (data: SignInData) => {
    try {
      setIsLoading(true);
      const email = data.email.trim().toLowerCase();
      const password = data.password;

      // Step 1: Authenticate with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
        }
        throw error;
      }

      // Step 2: Fetch user from backend (ensures user exists in database via auto-sync)
      const response = await authService.getCurrentUser();
      const userData = response.data;

      setUser(userData);
      useAuthStore.getState().login(userData);

      showSuccess('Signed in successfully!');

      // Step 3: Navigate to appropriate dashboard
      const userType = userData.role || userData.user_type;
      if (userType === 'student') {
        navigate('/student/dashboard');
      } else if (userType === 'university') {
        navigate('/university/dashboard');
      } else if (userType === 'admin') {
        navigate('/admin/dashboard');
      } else {
        console.warn('[AuthContext] Unknown user type, cannot navigate:', userType);
      }
    } catch (error: any) {
      console.error('Sign in failed:', error);
      const errorMessage = 
        error.message || 
        error.response?.data?.message || 
        'Failed to sign in. Please check your credentials.';
      showError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, showSuccess, showError]);

  /**
   * Sign up new user
   */
  const signUp = useCallback(async (data: SignUpData) => {
    try {
      setIsLoading(true);
      const email = data.email.trim().toLowerCase();
      const password = data.password;

      // Step 1: Create user in Supabase Auth
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
      });

      if (error) {
        throw error;
      }

      const authUserId = signUpResult.user?.id;

      if (!authUserId) {
        throw new Error('Failed to create account in Supabase');
      }

      // Step 2: Create user in database
      try {
        await authService.signUp({
          ...data,
          auth_user_id: authUserId,
        });
      } catch (backendError: any) {
        console.error('Database user creation failed:', backendError);
        // If database creation fails, we should ideally delete the Supabase user
        // For now, log the error and continue - the JWT middleware will auto-create the user
      }

      // Step 3: Show email verification message
      // Supabase automatically sends verification email
      showSuccess(
        'Account created! Please check your email to verify your account before signing in.'
      );

      // Navigate to signin page instead of dashboard
      navigate('/signin');
    } catch (error: any) {
      console.error('Sign up failed:', error);
      const errorMessage = 
        error.message || 
        error.response?.data?.message || 
        'Failed to create account. Please try again.';
      showError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, showSuccess, showError]);

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      // Continue with sign out even if API call fails
    } finally {
      // Clear local state
      setUser(null);
      
      // Also clear Zustand store
      useAuthStore.getState().logout();
      
      showSuccess('Signed out successfully');
      navigate('/signin');
    }
  }, [navigate, showSuccess]);

  /**
   * Refresh current user data
   */
  const refreshUser = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 * 
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
