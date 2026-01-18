/**
 * Admissions Service
 * 
 * Service for managing admission/program data.
 * Handles CRUD operations, verification workflows, and PDF parsing.
 * 
 * @module services/admissionsService
 */

import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, Admission } from '../types/api';

export const admissionsService = {
  /**
   * List admissions with optional filters
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
    const response = await apiClient.get('/admissions', { params });
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
    const response = await apiClient.post('/admissions', data);
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
    const response = await apiClient.put(`/admissions/${id}`, data);
    return response.data;
  },

  /**
   * Delete admission
   * 
   * @param id - Admission ID
   * @returns Promise resolving to success response
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admissions/${id}`);
    return response.data;
  },

  /**
   * Submit admission for verification (university action)
   * 
   * @param id - Admission ID
   * @returns Promise resolving to updated admission
   */
  submitForVerification: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.patch(`/admissions/${id}/submit`);
    return response.data;
  },

  /**
   * Verify admission (admin action)
   * 
   * @param id - Admission ID
   * @returns Promise resolving to verified admission
   */
  verify: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.patch(`/admissions/${id}/verify`);
    return response.data;
  },

  /**
   * Reject admission (admin action)
   * 
   * @param id - Admission ID
   * @returns Promise resolving to rejected admission
   */
  reject: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.patch(`/admissions/${id}/reject`);
    return response.data;
  },

  /**
   * Dispute rejection (university action)
   * 
   * @param id - Admission ID
   * @returns Promise resolving to admission in dispute
   */
  dispute: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.patch(`/admissions/${id}/dispute`);
    return response.data;
  },

  /**
   * Parse PDF file to extract admission data
   * 
   * @param file - PDF file to parse
   * @param universityId - University ID associated with the PDF
   * @returns Promise resolving to parsed admission data
   */
  parsePDF: async (file: File, universityId: string): Promise<ApiResponse<any>> => {
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
