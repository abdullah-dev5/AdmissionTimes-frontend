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
      } else {
        setUser(null);
      }
    } catch (error: any) {
      // Not authenticated or error
      console.error('Auth check failed:', error);
      setUser(null);
      clearUserContext();
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
      
      // Store user data
      const userData = response.data.user;
      setUser(userData);
      
      // Setup user context for API calls (pass user ID)
      setupUserContext(
        userData.user_type as 'student' | 'university' | 'admin',
        userData.id
      );
      
      // Also store university_id if present
      if (userData.university_id) {
        localStorage.setItem('universityId', userData.university_id);
      }
      
      showSuccess('Signed in successfully!');
      
      // Redirect based on user type
      if (userData.user_type === 'student') {
        navigate('/student/dashboard');
      } else if (userData.user_type === 'university') {
        navigate('/university/dashboard');
      } else if (userData.user_type === 'admin') {
        navigate('/admin/dashboard');
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
      
      // Setup user context for API calls (pass user ID)
      setupUserContext(
        userData.user_type as 'student' | 'university' | 'admin',
        userData.id
      );
      
      // Also store university_id if present
      if (userData.university_id) {
        localStorage.setItem('universityId', userData.university_id);
      }
      
      showSuccess('Account created successfully!');
      
      // Redirect based on user type
      if (userData.user_type === 'student') {
        navigate('/student/dashboard');
      } else if (userData.user_type === 'university') {
        navigate('/university/dashboard');
      } else if (userData.user_type === 'admin') {
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
