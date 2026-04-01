/**
 * Recommendations Service
 * 
 * Service for fetching personalized recommendations from backend.
 * 
 * @module services/recommendationsService
 */

import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';

export interface Recommendation {
  id: string;
  user_id: string;
  admission_id: string;
  score: number; // 0-100
  reason: string;
  factors: {
    similar_users_count: number;
    avg_similarity: number;
    algorithm: string;
  };
  generated_at: string;
  expires_at: string;
  admission?: {
    id: string;
    university_id: string;
    program_name: string;
    degree_level: string;
    status: string;
    verification_status?: string;
    deadline: string | null;
  };
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  count: number;
}

export const recommendationsService = {
  /**
   * Get personalized recommendations for current user
   * 
   * @param limit - Maximum number of recommendations to return
   * @param minScore - Minimum score threshold (0-100)
   * @returns Promise resolving to recommendations
   */
  getRecommendations: async (
    limit: number = 10,
    minScore: number = 50
  ): Promise<ApiResponse<RecommendationsResponse>> => {
    const response = await apiClient.get('/recommendations', {
      params: { limit, min_score: minScore }
    });
    return response.data;
  },

  /**
   * Refresh recommendations for current user
   * Force regeneration of recommendations
   * 
   * @returns Promise resolving to generation result
   */
  refreshRecommendations: async (): Promise<ApiResponse<{ message: string; count: number }>> => {
    const response = await apiClient.post('/recommendations/refresh');
    return response.data;
  },

  /**
   * Get recommendation count for current user
   * 
   * @returns Promise resolving to count
   */
  getRecommendationCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.get('/recommendations/count');
    return response.data;
  },
};

export default recommendationsService;
