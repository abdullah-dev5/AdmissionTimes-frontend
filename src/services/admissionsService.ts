/**
 * Admissions Service
 * 
 * Service for managing admission/program data.
 * Handles CRUD operations, verification workflows, and PDF parsing.
 * 
 * Phase 1: Supports both backend API and direct Supabase queries
 * - Use _direct methods for read-only operations (faster, 1 hop)
 * - Use regular methods for complex operations (backend logic)
 * 
 * @module services/admissionsService
 */

import apiClient from './apiClient';
import { supabase } from './supabase';
import type { ApiResponse, PaginatedResponse, Admission } from '../types/api';

export const admissionsService = {
  // ============================================================
  // DIRECT SUPABASE QUERIES (Phase 1 - Fast Read Operations)
  // ============================================================

  /**
   * List admissions directly from Supabase (fast, 1 hop)
   * 
   * Phase 1: Frontend reads directly without backend hop
   * RLS policies enforce data access control
   * 
   * @param params - Filter and pagination params
   * @returns Promise resolving to paginated admissions
   */
  listDirect: async (params?: {
    search?: string;
    degree_level?: string;
    verification_status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Admission[];
    count: number;
    page: number;
    limit: number;
  }> => {
    try {
      let query = supabase.from('admissions').select('*', { count: 'exact' });

      // Apply filters
      if (params?.degree_level) {
        query = query.eq('degree_level', params.degree_level);
      }
      if (params?.verification_status) {
        query = query.eq('verification_status', params.verification_status);
      }
      if (params?.search) {
        query = query.or(
          `title.ilike.%${params.search}%,description.ilike.%${params.search}%,field_of_study.ilike.%${params.search}%`
        );
      }

      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const start = (page - 1) * limit;
      query = query.range(start, start + limit - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('❌ Failed to fetch admissions from Supabase:', error);
      throw error;
    }
  },

  /**
   * Get admission by ID directly from Supabase (Phase 1)
   * 
   * @param id - Admission ID
   * @returns Promise resolving to admission
   */
  getByIdDirect: async (id: string): Promise<Admission> => {
    try {
      const { data, error } = await supabase
        .from('admissions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('❌ Failed to fetch admission:', error);
      throw error;
    }
  },

  /**
   * Create admission directly to Supabase (Phase 1)
   * 
   * RLS policies enforce: created_by = auth.uid()
   * 
   * @param data - Admission data
   * @returns Promise resolving to created admission
   */
  createDirect: async (data: Partial<Admission>): Promise<Admission> => {
    try {
      const { data: admission, error } = await supabase
        .from('admissions')
        .insert({
          title: data.title,
          description: data.description,
          degree_level: data.degree_level,
          field_of_study: (data as any).field_of_study,
          duration: (data as any).duration,
          tuition_fee: (data as any).tuition_fee,
          currency: (data as any).currency,
          application_fee: data.application_fee,
          deadline: data.deadline,
          start_date: (data as any).start_date,
          location: data.location,
          delivery_mode: (data as any).delivery_mode,
          requirements: (data as any).requirements,
          // RLS will automatically set created_by = auth.uid()
        })
        .select()
        .single();

      if (error) throw error;
      return admission;
    } catch (error: any) {
      console.error('❌ Failed to create admission:', error);
      throw error;
    }
  },

  /**
   * Update admission directly to Supabase (Phase 1)
   * 
   * RLS policies enforce: only creator or admin can update
   * 
   * @param id - Admission ID
   * @param data - Updated data
   * @returns Promise resolving to updated admission
   */
  updateDirect: async (id: string, data: Partial<Admission>): Promise<Admission> => {
    try {
      const { data: admission, error } = await supabase
        .from('admissions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return admission;
    } catch (error: any) {
      console.error('❌ Failed to update admission:', error);
      throw error;
    }
  },

  // ============================================================
  // BACKEND API METHODS (Complex operations, admin functions)
  // ============================================================

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
