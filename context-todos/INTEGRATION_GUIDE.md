# Frontend-Backend Integration Guide

**Created:** January 18, 2026  
**Purpose:** Step-by-step guide for integrating frontend with backend API  
**Status:** Ready for Implementation

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Environment Setup](#step-1-environment-setup)
3. [Step 2: Install Dependencies](#step-2-install-dependencies)
4. [Step 3: Create API Client](#step-3-create-api-client)
5. [Step 4: Create API Services](#step-4-create-api-services)
6. [Step 5: Update Contexts](#step-5-update-contexts)
7. [Step 6: Update Components](#step-6-update-components)
8. [Step 7: Testing](#step-7-testing)
9. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before starting integration, ensure:

- [ ] Backend server is running (`http://localhost:3000`)
- [ ] Swagger UI is accessible (`http://localhost:3000/api-docs`)
- [ ] Health check endpoint works (`http://localhost:3000/health`)
- [ ] Database is seeded with test data
- [ ] Frontend project is set up and running

---

## 🔧 Step 1: Environment Setup

### Create `.env` file

Create `.env` in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ENVIRONMENT=development
```

### Create `.env.example`

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ENVIRONMENT=development
```

### Update `.gitignore`

Ensure `.env` is in `.gitignore`:

```
.env
.env.local
.env.production
```

---

## 📦 Step 2: Install Dependencies

### Install Axios

```bash
pnpm add axios
```

### Install TypeScript types (if needed)

```bash
pnpm add -D @types/node
```

---

## 🔌 Step 3: Create API Client

### Create `src/services/apiClient.ts`

```typescript
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { [field: string]: string };
  timestamp: string;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Add auth headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get user context from localStorage (mock auth for development)
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const universityId = localStorage.getItem('universityId');

    // Add mock auth headers (development only)
    if (userId && config.headers) {
      config.headers['x-user-id'] = userId;
    }
    if (userRole && config.headers) {
      config.headers['x-user-role'] = userRole;
    }
    if (universityId && config.headers) {
      config.headers['x-university-id'] = universityId;
    }

    // Future: Add real auth token (Phase 4C)
    // const token = localStorage.getItem('authToken');
    // if (token && config.headers) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          // Validation errors
          console.error('Validation Error:', data?.errors);
          break;
        case 401:
          // Unauthorized - redirect to login (when real auth implemented)
          console.error('Unauthorized');
          // Future: Redirect to login
          break;
        case 403:
          // Forbidden
          console.error('Forbidden');
          break;
        case 404:
          // Not found
          console.error('Not Found');
          break;
        case 500:
          // Server error
          console.error('Server Error');
          break;
        default:
          console.error('Unknown Error:', status);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🛠️ Step 4: Create API Services

### Create `src/services/admissionsService.ts`

```typescript
import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse } from './apiClient';

export interface Admission {
  id: string;
  university_id: string | null;
  title: string;
  description: string | null;
  program_type: string | null;
  degree_level: string | null;
  field_of_study: string | null;
  duration: string | null;
  tuition_fee: number | null;
  currency: string | null;
  application_fee: number | null;
  deadline: string | null;
  start_date: string | null;
  location: string | null;
  campus: string | null;
  delivery_mode: string | null;
  requirements: Record<string, any> | null;
  verification_status: 'draft' | 'pending' | 'verified' | 'rejected' | 'disputed';
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  dispute_reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface AdmissionListParams {
  page?: number;
  limit?: number;
  search?: string;
  program_type?: string;
  degree_level?: string;
  field_of_study?: string;
  location?: string;
  delivery_mode?: string;
  verification_status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const admissionsService = {
  /**
   * List admissions with filters and pagination
   */
  list: async (params?: AdmissionListParams): Promise<PaginatedResponse<Admission>> => {
    const response = await apiClient.get<PaginatedResponse<Admission>>('/admissions', {
      params,
    });
    return response.data;
  },

  /**
   * Get admission by ID
   */
  getById: async (id: string): Promise<Admission> => {
    const response = await apiClient.get<ApiResponse<Admission>>(`/admissions/${id}`);
    return response.data.data;
  },

  /**
   * Create new admission
   */
  create: async (data: Partial<Admission>): Promise<Admission> => {
    const response = await apiClient.post<ApiResponse<Admission>>('/admissions', data);
    return response.data.data;
  },

  /**
   * Update admission
   */
  update: async (id: string, data: Partial<Admission>): Promise<Admission> => {
    const response = await apiClient.put<ApiResponse<Admission>>(`/admissions/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete admission
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admissions/${id}`);
  },

  /**
   * Submit admission for verification
   */
  submit: async (id: string): Promise<Admission> => {
    const response = await apiClient.patch<ApiResponse<Admission>>(`/admissions/${id}/submit`);
    return response.data.data;
  },

  /**
   * Verify admission (admin only)
   */
  verify: async (id: string): Promise<Admission> => {
    const response = await apiClient.patch<ApiResponse<Admission>>(`/admissions/${id}/verify`);
    return response.data.data;
  },

  /**
   * Reject admission (admin only)
   */
  reject: async (id: string, rejectionReason: string): Promise<Admission> => {
    const response = await apiClient.patch<ApiResponse<Admission>>(`/admissions/${id}/reject`, {
      rejection_reason: rejectionReason,
    });
    return response.data.data;
  },

  /**
   * Dispute admission (university only)
   */
  dispute: async (id: string, disputeReason: string): Promise<Admission> => {
    const response = await apiClient.patch<ApiResponse<Admission>>(`/admissions/${id}/dispute`, {
      dispute_reason: disputeReason,
    });
    return response.data.data;
  },

  /**
   * Get admission changelogs
   */
  getChangelogs: async (id: string, page = 1, limit = 20): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(`/admissions/${id}/changelogs`, {
      params: { page, limit },
    });
    return response.data;
  },
};
```

### Create `src/services/notificationsService.ts`

```typescript
import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse } from './apiClient';

export interface Notification {
  id: string;
  user_id: string | null;
  user_type: 'student' | 'university' | 'admin' | 'all';
  category: 'verification' | 'deadline' | 'system' | 'update';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  category?: string;
  priority?: string;
  is_read?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const notificationsService = {
  /**
   * List notifications
   */
  list: async (params?: NotificationListParams): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<PaginatedResponse<Notification>>('/notifications', {
      params,
    });
    return response.data;
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      '/notifications/unread-count'
    );
    return response.data.data.count;
  },

  /**
   * Get notification by ID
   */
  getById: async (id: string): Promise<Notification> => {
    const response = await apiClient.get<ApiResponse<Notification>>(`/notifications/${id}`);
    return response.data.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },
};
```

### Create `src/services/watchlistsService.ts`

```typescript
import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse } from './apiClient';
import type { Admission } from './admissionsService';

export interface Watchlist {
  id: string;
  user_id: string;
  admission_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  admission?: Admission;
}

export interface WatchlistListParams {
  page?: number;
  limit?: number;
  admission_id?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const watchlistsService = {
  /**
   * List user's watchlists
   */
  list: async (params?: WatchlistListParams): Promise<PaginatedResponse<Watchlist>> => {
    const response = await apiClient.get<PaginatedResponse<Watchlist>>('/watchlists', {
      params,
    });
    return response.data;
  },

  /**
   * Add admission to watchlist
   */
  add: async (admissionId: string, notes?: string): Promise<Watchlist> => {
    const response = await apiClient.post<ApiResponse<Watchlist>>('/watchlists', {
      admission_id: admissionId,
      notes: notes || null,
    });
    return response.data.data;
  },

  /**
   * Get watchlist item by ID
   */
  getById: async (id: string): Promise<Watchlist> => {
    const response = await apiClient.get<ApiResponse<Watchlist>>(`/watchlists/${id}`);
    return response.data.data;
  },

  /**
   * Update watchlist notes
   */
  update: async (id: string, notes: string | null): Promise<Watchlist> => {
    const response = await apiClient.patch<ApiResponse<Watchlist>>(`/watchlists/${id}`, {
      notes,
    });
    return response.data.data;
  },

  /**
   * Remove from watchlist
   */
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/watchlists/${id}`);
  },
};
```

### Create `src/services/deadlinesService.ts`

```typescript
import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse } from './apiClient';

export interface Deadline {
  id: string;
  admission_id: string;
  deadline_type: string;
  deadline_date: string;
  timezone: string;
  is_flexible: boolean;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  // Calculated fields (from API)
  days_remaining: number;
  is_overdue: boolean;
  urgency_level: 'low' | 'medium' | 'high' | 'critical' | 'expired';
}

export interface DeadlineListParams {
  page?: number;
  limit?: number;
  admission_id?: string;
  deadline_type?: string;
  is_overdue?: boolean;
  date_from?: string;
  date_to?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const deadlinesService = {
  /**
   * List deadlines
   */
  list: async (params?: DeadlineListParams): Promise<PaginatedResponse<Deadline>> => {
    const response = await apiClient.get<PaginatedResponse<Deadline>>('/deadlines', {
      params,
    });
    return response.data;
  },

  /**
   * Get upcoming deadlines
   */
  getUpcoming: async (limit = 10): Promise<Deadline[]> => {
    const response = await apiClient.get<ApiResponse<Deadline[]>>('/deadlines/upcoming', {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Get deadline by ID
   */
  getById: async (id: string): Promise<Deadline> => {
    const response = await apiClient.get<ApiResponse<Deadline>>(`/deadlines/${id}`);
    return response.data.data;
  },
};
```

---

## 🔄 Step 5: Update Contexts

### Update `src/contexts/StudentDataContext.tsx`

```typescript
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { admissionsService, type Admission } from '../services/admissionsService';
import { watchlistsService, type Watchlist } from '../services/watchlistsService';
import { notificationsService, type Notification } from '../services/notificationsService';

interface StudentDataContextValue {
  admissions: Admission[];
  notifications: Notification[];
  watchlists: Watchlist[];
  loading: boolean;
  error: string | null;
  toggleSaved: (id: string) => Promise<void>;
  toggleAlert: (id: string) => void;
  updateAdmission: (id: string, updates: Partial<Admission>) => void;
  getAdmissionById: (id: string) => Admission | undefined;
  getAdmissionsByIds: (ids: string[]) => Admission[];
  refreshAdmissions: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const StudentDataContext = createContext<StudentDataContextValue | undefined>(undefined);

export function StudentDataProvider({ children }: { children: ReactNode }) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch admissions
  const fetchAdmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await admissionsService.list({
        verification_status: 'verified',
        limit: 100,
      });
      setAdmissions(response.data);
    } catch (err) {
      setError('Failed to fetch admissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationsService.list({ limit: 50 });
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  // Fetch watchlists
  const fetchWatchlists = useCallback(async () => {
    try {
      const response = await watchlistsService.list({ limit: 100 });
      setWatchlists(response.data);
    } catch (err) {
      console.error('Failed to fetch watchlists:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAdmissions();
    fetchNotifications();
    fetchWatchlists();
  }, [fetchAdmissions, fetchNotifications, fetchWatchlists]);

  const toggleSaved = useCallback(async (id: string) => {
    try {
      const watchlistItem = watchlists.find((w) => w.admission_id === id);
      if (watchlistItem) {
        // Remove from watchlist
        await watchlistsService.remove(watchlistItem.id);
        setWatchlists((prev) => prev.filter((w) => w.id !== watchlistItem.id));
      } else {
        // Add to watchlist
        const newWatchlist = await watchlistsService.add(id);
        setWatchlists((prev) => [...prev, newWatchlist]);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
      throw err;
    }
  }, [watchlists]);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  const savedAdmissions = useMemo(() => {
    return admissions.filter((admission) =>
      watchlists.some((w) => w.admission_id === admission.id)
    );
  }, [admissions, watchlists]);

  const getAdmissionById = useCallback(
    (id: string) => {
      return admissions.find((admission) => admission.id === id);
    },
    [admissions]
  );

  const getAdmissionsByIds = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      return admissions.filter((admission) => idSet.has(admission.id));
    },
    [admissions]
  );

  const value: StudentDataContextValue = {
    admissions,
    notifications,
    watchlists,
    loading,
    error,
    toggleSaved,
    toggleAlert: () => {}, // TODO: Implement alert toggle
    updateAdmission: () => {}, // TODO: Implement update
    getAdmissionById,
    getAdmissionsByIds,
    refreshAdmissions: fetchAdmissions,
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications: fetchNotifications,
  };

  return <StudentDataContext.Provider value={value}>{children}</StudentDataContext.Provider>;
}

export function useStudentData() {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error('useStudentData must be used within a StudentDataProvider');
  }
  return context;
}
```

---

## 🧪 Step 6: Testing

### Test API Connection

Create `src/utils/testApi.ts`:

```typescript
import apiClient from '../services/apiClient';

export const testApiConnection = async () => {
  try {
    const response = await apiClient.get('/health');
    console.log('API Connection Test:', response.data);
    return true;
  } catch (error) {
    console.error('API Connection Failed:', error);
    return false;
  }
};
```

### Test in Component

```typescript
import { useEffect } from 'react';
import { testApiConnection } from '../utils/testApi';

function TestComponent() {
  useEffect(() => {
    testApiConnection();
  }, []);

  return <div>Testing API connection...</div>;
}
```

---

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - **Solution:** Backend CORS not configured yet (Phase 4C)
   - **Workaround:** Use proxy in `vite.config.ts`

2. **401 Unauthorized**
   - **Solution:** Check auth headers are set correctly
   - **Check:** localStorage has userId, userRole

3. **404 Not Found**
   - **Solution:** Check API base URL is correct
   - **Check:** Endpoint path matches backend

4. **Network Errors**
   - **Solution:** Ensure backend is running
   - **Check:** Backend URL is accessible

### Debug Tips

1. **Check Network Tab:** Inspect requests/responses
2. **Check Console:** Look for error messages
3. **Check Backend Logs:** See server-side errors
4. **Test in Swagger:** Verify endpoint works
5. **Check Environment Variables:** Ensure API URL is set

---

## ✅ Integration Checklist

- [ ] Environment variables set up
- [ ] Axios installed
- [ ] API client created
- [ ] API services created
- [ ] Contexts updated
- [ ] Components updated
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Testing completed

---

**Last Updated:** January 18, 2026  
**Status:** Ready for Implementation
