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
import { setupUserContext, clearUserContext } from '../utils/setupUserContext';
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
      const userId = localStorage.getItem('userId');
      
      if (userId) {
        // Try to get current user from API
        const response = await authService.getCurrentUser();
        setUser(response.data);
        
        // Also sync with Zustand store
        useAuthStore.getState().login(response.data);
      } else {
        setUser(null);
      }
    } catch (error: any) {
      // Not authenticated or error
      console.error('Auth check failed:', error);
      setUser(null);
      clearUserContext();
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
      const response = await authService.signIn(data);
      
      console.log('[AuthContext] Sign-in response:', response);
      
      // Store user data
      const userData = response.data.user;
      console.log('[AuthContext] User data from response:', userData);
      
      setUser(userData);
      
      // Also sync with Zustand store (for API client interceptor)
      useAuthStore.getState().login(userData);
      console.log('[AuthContext] Zustand store updated');
      
      // Setup user context for API calls (pass user ID)
      setupUserContext(
        (userData.role || userData.user_type) as 'student' | 'university' | 'admin',
        userData.id
      );
      console.log('[AuthContext] User context setup complete');
      
      // Also store university_id if present
      if (userData.university_id) {
        localStorage.setItem('universityId', userData.university_id);
      }
      
      showSuccess('Signed in successfully!');
      
      const userType = userData.role || userData.user_type;
      console.log('[AuthContext] Checking user type for navigation:', userType);
      
      // Redirect based on user type
      if (userType === 'student') {
        console.log('[AuthContext] Navigating to /student/dashboard');
        navigate('/student/dashboard');
      } else if (userType === 'university') {
        console.log('[AuthContext] Navigating to /university/dashboard');
        navigate('/university/dashboard');
      } else if (userType === 'admin') {
        console.log('[AuthContext] Navigating to /admin/dashboard');
        navigate('/admin/dashboard');
      } else {
        console.warn('[AuthContext] Unknown user type, cannot navigate:', userType);
      }
    } catch (error: any) {
      console.error('Sign in failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to sign in. Please check your credentials.';
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
      const response = await authService.signUp(data);
      
      // Store user data
      const userData = response.data.user;
      setUser(userData);
      
      // Also sync with Zustand store (for API client interceptor)
      useAuthStore.getState().login(userData);
      
      const userType = userData.role || userData.user_type;
      
      // Setup user context for API calls (pass user ID)
      setupUserContext(
        userType as 'student' | 'university' | 'admin',
        userData.id
      );
      
      // Also store university_id if present
      if (userData.university_id) {
        localStorage.setItem('universityId', userData.university_id);
      }
      
      showSuccess('Account created successfully!');
      
      // Redirect based on user type
      if (userType === 'student') {
        navigate('/student/dashboard');
      } else if (userType === 'university') {
        navigate('/university/dashboard');
      } else if (userType === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      console.error('Sign up failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create account. Please try again.';
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
      await authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      // Continue with sign out even if API call fails
    } finally {
      // Clear local state
      setUser(null);
      clearUserContext();
      
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
