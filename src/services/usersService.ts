/**
 * Users Service
 * 
 * Service for managing user accounts and profiles.
 * Handles user CRUD operations, profile management, and role management.
 * 
 * @module services/usersService
 */

import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, User, StudentProfile, UniversityProfile } from '../types/api';

export const usersService = {
  /**
   * List users (admin only)
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to paginated users list
   */
  list: async (params?: {
    user_type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  /**
   * Get current user profile
   * 
   * @returns Promise resolving to current user data
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  /**
   * Get user by ID
   * 
   * @param id - User ID
   * @returns Promise resolving to user data
   */
  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Update current user profile
   * 
   * @param data - Updated user data
   * @returns Promise resolving to updated user
   */
  updateCurrentUser: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put('/users/me', data);
    return response.data;
  },

  /**
   * Get student profile
   * 
   * @param userId - User ID (optional, defaults to current user)
   * @returns Promise resolving to student profile
   */
  getStudentProfile: async (userId?: string): Promise<ApiResponse<StudentProfile>> => {
    const endpoint = userId ? `/users/${userId}/student-profile` : '/users/me/student-profile';
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  /**
   * Update student profile
   * 
   * @param data - Updated student profile data
   * @returns Promise resolving to updated profile
   */
  updateStudentProfile: async (data: Partial<StudentProfile>): Promise<ApiResponse<StudentProfile>> => {
    const response = await apiClient.put('/users/me/student-profile', data);
    return response.data;
  },

  /**
   * Get university profile
   * 
   * @param userId - User ID (optional, defaults to current user)
   * @returns Promise resolving to university profile
   */
  getUniversityProfile: async (userId?: string): Promise<ApiResponse<UniversityProfile>> => {
    const endpoint = userId ? `/users/${userId}/university-profile` : '/users/me/university-profile';
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  /**
   * Update university profile
   * 
   * @param data - Updated university profile data
   * @returns Promise resolving to updated profile
   */
  updateUniversityProfile: async (data: Partial<UniversityProfile>): Promise<ApiResponse<UniversityProfile>> => {
    const response = await apiClient.put('/users/me/university-profile', data);
    return response.data;
  },

  /**
   * Update user role (admin only)
   * 
   * @param userId - User ID
   * @param role - New role
   * @returns Promise resolving to updated user
   */
  updateRole: async (userId: string, role: 'student' | 'university' | 'admin'): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch(`/users/${userId}/role`, { role });
    return response.data;
  },
};
