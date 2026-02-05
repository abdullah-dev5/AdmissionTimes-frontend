/**
 * Authentication Service
 * 
 * Service for handling user authentication (sign in, sign up).
 * Basic authentication without JWT for now.
 * 
 * @module services/authService
 */

import apiClient from './apiClient';
import type { ApiResponse, User } from '../types/api';

export interface SignUpData {
  email: string;
  password: string;
  user_type: 'student' | 'university' | 'admin';
  display_name?: string;
  university_id?: string; // Required for university users
  auth_user_id?: string; // Supabase Auth UUID
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export const authService = {
  /**
   * Sign up a new user
   * 
   * @param data - Sign up data
   * @returns Promise resolving to user data
   */
  signUp: async (data: SignUpData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  /**
   * Sign in an existing user
   * 
   * @param data - Sign in data (email, password)
   * @returns Promise resolving to user data
   */
  signIn: async (data: SignInData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/signin', data);
    return response.data;
  },

  /**
   * Sign out current user
   * 
   * @returns Promise resolving to success response
   */
  signOut: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/auth/signout');
    return response.data;
  },

  /**
   * Get current authenticated user
   * 
   * @returns Promise resolving to current user data
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
