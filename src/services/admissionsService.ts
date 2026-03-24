/**
 * Admissions Service
 * 
 * Service for managing admission/program data.
 * Handles CRUD operations, verification workflows, and PDF parsing.
 * 
 * @module services/admissionsService
 */

import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, Admission, ParsedPdfData } from '../types/api';

export const admissionsService = {
  // ============================================================
  // BACKEND API METHODS (Complex operations, admin functions)
  // ============================================================

  /**
   * List admissions via public/student endpoint (GET /admissions)
   * 
   * Returns only verified admissions visible to students.
   * Use this in student search flows instead of listDirect.
   * 
   * @param params - Filter and pagination params
   * @returns Promise resolving to paginated admissions list
   */
  listPublic: async (params?: {
    search?: string;
    degree_level?: string;
    field_of_study?: string;
    delivery_mode?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Admission>> => {
    // Backend validator caps limit at 100; enforce here to prevent 400 errors
    const safeParams = params ? { ...params, limit: Math.min(params.limit ?? 100, 100) } : undefined;
    const response = await apiClient.get('/admissions', { params: safeParams });
    return response.data;
  },

  /**
   * List admissions via admin endpoint (GET /admin/admissions)
   * 
   * Returns all admissions regardless of status (admin view).
   * Use this in admin dashboard and admin tooling.
   * 
   * @param params - Filter and pagination params
   * @returns Promise resolving to paginated admissions list
   */
  listAdmin: async (params?: {
    search?: string;
    degree_level?: string;
    verification_status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Admission>> => {
    // Backend validator caps limit at 100; enforce here to prevent 400 errors
    const safeParams = params ? { ...params, limit: Math.min(params.limit ?? 100, 100) } : undefined;
    const response = await apiClient.get('/admin/admissions', { params: safeParams });
    return response.data;
  },

  /**
   * List admissions with optional filters (university endpoint)
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to paginated admissions list
   */
  list: async (params?: {
    search?: string;
    degree_level?: string;
    verification_status?: string;
    university_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Admission>> => {
    const response = await apiClient.get('/university/admissions', { params });
    return response.data;
  },

  /**
   * Get admission by ID
   * 
   * @param id - Admission ID
   * @returns Promise resolving to admission data
   */
  getById: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.get(`/admissions/${id}`);
    return response.data;
  },

  /**
   * Create new admission
   * 
   * @param data - Admission data
   * @returns Promise resolving to created admission
   */
  create: async (data: Partial<Admission>): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.post('/university/admissions', data);
    return response.data;
  },

  /**
   * Update admission
   * 
   * @param id - Admission ID
   * @param data - Updated admission data
   * @returns Promise resolving to updated admission
   */
  update: async (id: string, data: Partial<Admission>): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.put(`/university/admissions/${id}`, data);
    return response.data;
  },

  /**
   * Delete admission
   * 
   * @param id - Admission ID
   * @returns Promise resolving to success response
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/university/admissions/${id}`);
    return response.data;
  },

  /**
   * Submit admission for verification (university action)
   * 
   * @param id - Admission ID
   * @returns Promise resolving to updated admission
   */
  submitForVerification: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.post(`/university/admissions/${id}/request-verification`, {});
    return response.data;
  },

  /**
   * Verify admission (admin action)
   * 
   * @param id - Admission ID
   * @returns Promise resolving to verified admission
   */
  verify: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.post(`/admin/admissions/${id}/verify`, {
      verification_status: 'verified',
      notes: 'Verified by admin'
    });
    return response.data;
  },

  /**
   * Reject admission (admin action)
   * 
   * @param id - Admission ID
   * @returns Promise resolving to rejected admission
   */
  reject: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.post(`/admin/admissions/${id}/verify`, {
      verification_status: 'rejected',
      notes: 'Rejected by admin',
      rejection_reason: 'Does not meet requirements'
    });
    return response.data;
  },

  /**
   * Parse PDF file to extract admission data
   * 
   * @param file - PDF file to parse
   * @param universityId - University ID associated with the PDF
   * @returns Promise resolving to parsed admission data
   */
  parsePDF: async (file: File, universityId: string): Promise<ApiResponse<ParsedPdfData>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('university_id', universityId);
    
    const response = await apiClient.post('/admissions/parse-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
