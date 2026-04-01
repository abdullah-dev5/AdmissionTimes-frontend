/**
 * Activity Service
 * 
 * Service for managing user activity and event tracking.
 * Handles fetching activity feeds and user actions.
 * 
 * @module services/activityService
 */

import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, Activity } from '../types/api';
import { useAuthStore } from '../store/authStore';

const STUDENT_EVENT_CAP_STORAGE_KEY = 'admissionTimes.student.eventCaps.v1';

type CappedStudentEventKind = 'view' | 'click';

const readCapStore = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STUDENT_EVENT_CAP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeCapStore = (value: Record<string, string>) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STUDENT_EVENT_CAP_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // no-op: localStorage errors should never block user flow
  }
};

const toCappedStudentEventKind = (
  activityType: 'viewed' | 'searched' | 'compared' | 'watchlisted' | 'saved' | 'alert' | 'deadline' | 'notification'
): CappedStudentEventKind | null => {
  if (activityType === 'viewed') return 'view';
  if (['searched', 'compared', 'alert'].includes(activityType)) return 'click';
  return null;
};

const shouldSendCappedStudentEvent = (payload: {
  activity_type: 'viewed' | 'searched' | 'compared' | 'watchlisted' | 'saved' | 'alert' | 'deadline' | 'notification';
  entity_type: string;
  entity_id: string;
}) => {
  if (payload.entity_type !== 'admission') return true;

  const authState = useAuthStore.getState();
  const user = authState.user;
  if (!user || user.role !== 'student') return true;

  const eventKind = toCappedStudentEventKind(payload.activity_type);
  if (!eventKind) return true;

  const store = readCapStore();
  const capKey = `${user.id}:${payload.entity_id}:${eventKind}`;

  if (store[capKey]) {
    return false;
  }

  store[capKey] = new Date().toISOString();
  writeCapStore(store);
  return true;
};

export const activityService = {
  /**
   * Track activity event
   *
   * @param payload - Activity tracking payload
   */
  track: async (payload: {
    activity_type: 'viewed' | 'searched' | 'compared' | 'watchlisted' | 'saved' | 'alert' | 'deadline' | 'notification';
    entity_type: string;
    entity_id: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<Activity>> => {
    const response = await apiClient.post('/activity', payload);
    return response.data;
  },

  /**
   * List activities with optional filters
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to paginated activities
   */
  list: async (params?: {
    user_id?: string;
    type?: string;
    related_entity_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Activity>> => {
    const response = await apiClient.get('/activity', { params });
    return response.data;
  },

  /**
   * Get activity by ID
   * 
   * @param id - Activity ID
   * @returns Promise resolving to activity data
   */
  getById: async (id: string): Promise<ApiResponse<Activity>> => {
    const response = await apiClient.get(`/activity/${id}`);
    return response.data;
  },

  /**
   * Get current user's activity feed
   * 
   * @param params - Query parameters for pagination
   * @returns Promise resolving to user's activities
   */
  getMyActivity: async (params?: {
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Activity>> => {
    const response = await apiClient.get('/activity/me', { params });
    return response.data;
  },

  trackCappedStudentEvent: async (payload: {
    activity_type: 'viewed' | 'searched' | 'compared' | 'watchlisted' | 'saved' | 'alert' | 'deadline' | 'notification';
    entity_type: string;
    entity_id: string;
    metadata?: Record<string, any>;
  }): Promise<void> => {
    if (!shouldSendCappedStudentEvent(payload)) {
      return;
    }

    await activityService.track(payload);
  },
};
