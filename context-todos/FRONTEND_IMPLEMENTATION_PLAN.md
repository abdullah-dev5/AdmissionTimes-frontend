# Frontend Implementation Plan

**Created:** January 18, 2026  
**Last Updated:** January 18, 2026  
**Purpose:** Complete frontend implementation plan with all missing items, integration steps, and timeline  
**Status:** Ready for Implementation  
**Aligned With:** `BACKEND_IMPLEMENTATION_PLAN.md`

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Missing Items Inventory](#missing-items-inventory)
4. [API Integration Plan](#api-integration-plan)
5. [Missing Pages Implementation](#missing-pages-implementation)
6. [Missing Components Implementation](#missing-components-implementation)
7. [Data Transformation Strategy](#data-transformation-strategy)
8. [State Management Migration](#state-management-migration)
9. [File Structure Plan](#file-structure-plan)
10. [Implementation Phases](#implementation-phases)
11. [Code Examples](#code-examples)
12. [Testing Strategy](#testing-strategy)
13. [Dependencies & Prerequisites](#dependencies--prerequisites)

---

## 📊 Executive Summary

### Current Frontend State

- ✅ **25+ pages** implemented with mock data
- ✅ **50+ components** built and functional
- ✅ **React Context API** for state management
- ✅ **TypeScript** with custom types
- ✅ **React Router** configured
- ✅ **Tailwind CSS** styling complete
- ❌ **0% API integration** (all mock data)
- ❌ **8 pages missing**
- ❌ **15+ components missing**
- ❌ **No API client layer**
- ❌ **No data transformation layer**

### Goals

1. **100% API Integration** - Replace all mock data with API calls
2. **Complete Missing Pages** - Implement all 8 missing pages
3. **Complete Missing Components** - Build all 15+ missing components
4. **Create API Infrastructure** - API client, services, types
5. **Data Transformation** - Transform backend data to frontend format
6. **Production Ready** - Error handling, loading states, testing

### Timeline

- **Phase 1:** Weeks 1-2 (API Infrastructure & Core Integration)
- **Phase 2:** Weeks 3-4 (Missing Pages & Components)
- **Phase 3:** Weeks 5-6 (Advanced Features & Polish)

---

## 🔍 Current State Analysis

### Existing Pages (25+)

#### Student Module (6 pages)
- ✅ `/student/dashboard` - Dashboard (mock data)
- ✅ `/student/search` - Search admissions (mock data)
- ✅ `/student/compare` - Compare programs (mock data)
- ✅ `/student/watchlist` - Watchlist (mock data)
- ✅ `/student/deadlines` - Deadlines (mock data)
- ✅ `/student/notifications` - Notifications (mock data)

#### University Module (6 pages)
- ✅ `/university/dashboard` - Dashboard (mock data)
- ✅ `/university/manage-admissions` - Manage admissions (mock data)
- ✅ `/university/verification-center` - Verification center (mock data)
- ✅ `/university/change-logs` - Change logs (mock data)
- ✅ `/university/notifications-center` - Notifications (mock data)
- ⚠️ `/university/settings` - Settings (UI exists, no API integration)

#### Admin Module (6 pages)
- ✅ `/admin/dashboard` - Dashboard (mock data)
- ✅ `/admin/verification` - Verification center (mock data)
- ✅ `/admin/change-logs` - Change logs (mock data)
- ✅ `/admin/analytics` - Analytics (mock data)
- ✅ `/admin/notifications` - Notifications (mock data)
- ✅ `/admin/scraper-logs` - Scraper logs (mock data)

#### Shared Pages (7 pages)
- ✅ `/program/:id` - Program detail (mock data)
- ✅ `/` - Home page
- ✅ `/features` - Features page
- ✅ `/contact` - Contact page
- ✅ `/about` - About page
- ✅ `/login` - Login page
- ✅ `*` - 404 page

### Existing Components (50+)

- ✅ Student components (Sidebar, Header, Dashboard cards)
- ✅ University components (Sidebar, Forms, Tables)
- ✅ Admin components (Sidebar, Charts, Filters, Tables)
- ✅ AI components (Chat widgets)
- ✅ Shared components (Layouts, Cards, Buttons, Modals)
- ⚠️ PDF upload component (mentioned but incomplete)

### Existing Contexts

- ✅ `StudentDataContext` - Manages student data (mock)
- ✅ `UniversityDataContext` - Manages university data (mock)

---

## 📦 Missing Items Inventory

### 🔴 Critical Missing Pages (8)

#### Student Module (4 pages)

| Page | Route | Purpose | Backend Endpoints | Priority | Estimated Effort |
|------|-------|---------|-------------------|----------|------------------|
| **Student Profile** | `/student/profile` | View/edit student profile | `GET /api/v1/users/me`, `PUT /api/v1/users/me` | 🔴 Critical | 2-3 days |
| **User Preferences** | `/student/preferences` | Manage preferences | `GET /api/v1/users/me/preferences`, `PUT /api/v1/users/me/preferences` | 🔴 Critical | 2-3 days |
| **Recommendations** | `/student/recommendations` | Personalized recommendations | `GET /api/v1/student/dashboard` (recommendations), `GET /api/v1/student/recommendations` (if backend creates) | 🟡 Medium | 2-3 days |
| **Activity Feed** | `/student/activity` | User activity timeline | `GET /api/v1/activity` | 🟡 Medium | 2-3 days |

#### University Module (1 page)

| Page | Route | Purpose | Backend Endpoints | Priority | Estimated Effort |
|------|-------|---------|-------------------|----------|------------------|
| **University Profile** | `/university/profile` | View/edit university profile | `GET /api/v1/users/me`, `PUT /api/v1/users/me` | 🟡 Medium | 2-3 days |

#### Admin Module (2 pages)

| Page | Route | Purpose | Backend Endpoints | Priority | Estimated Effort |
|------|-------|---------|-------------------|----------|------------------|
| **User Management** | `/admin/users` | Manage users | `GET /api/v1/users`, `PATCH /api/v1/users/:id/role` | 🟡 Medium | 3-4 days |
| **Admin Settings** | `/admin/settings` | System settings | Custom endpoints (TBD) | 🟢 Low | 2-3 days |

#### Shared (1 page)

| Page | Route | Purpose | Backend Endpoints | Priority | Estimated Effort |
|------|-------|---------|-------------------|----------|------------------|
| **Notification Detail** | `/notifications/:id` | View notification details | `GET /api/v1/notifications/:id` | 🟡 Medium | 1-2 days |

---

### 🔴 Critical Missing Components (15+)

#### Core Infrastructure Components

| Component | Purpose | File Path | Priority | Estimated Effort |
|-----------|---------|-----------|----------|------------------|
| **API Client** | HTTP service layer | `src/services/apiClient.ts` | 🔴 Critical | 1-2 days |
| **API Services** | Service files (9 files) | `src/services/*Service.ts` | 🔴 Critical | 3-4 days |
| **API Types** | TypeScript types | `src/types/api.ts` | 🔴 Critical | 2-3 days |
| **Data Transformers** | Transform backend → frontend | `src/utils/transformers.ts` | 🔴 Critical | 2-3 days |
| **Error Boundary** | Global error handling | `src/components/common/ErrorBoundary.tsx` | 🔴 Critical | 1 day |
| **Toast Notifications** | Success/error messages | `src/components/common/Toast.tsx` | 🔴 Critical | 1-2 days |
| **Loading Spinner** | Reusable loading component | `src/components/common/LoadingSpinner.tsx` | 🟡 Medium | 1 day |

#### Student Module Components

| Component | Purpose | File Path | Priority | Estimated Effort |
|-----------|---------|-----------|----------|------------------|
| **ProfileForm** | Student profile form | `src/components/student/ProfileForm.tsx` | 🔴 Critical | 2-3 days |
| **PreferencesForm** | User preferences form | `src/components/student/PreferencesForm.tsx` | 🔴 Critical | 2-3 days |
| **RecommendationCard** | Recommendation display card | `src/components/student/RecommendationCard.tsx` | 🟡 Medium | 1-2 days |
| **ActivityItem** | Activity feed item | `src/components/student/ActivityItem.tsx` | 🟡 Medium | 1-2 days |
| **UnreadCountBadge** | Notification badge | `src/components/common/UnreadCountBadge.tsx` | 🟡 Medium | 1 day |
| **DeadlineDetailModal** | Deadline detail modal | `src/components/student/DeadlineDetailModal.tsx` | 🟡 Medium | 1-2 days |

#### University Module Components

| Component | Purpose | File Path | Priority | Estimated Effort |
|-----------|---------|-----------|----------|------------------|
| **PDFUploader** | PDF upload with preview | `src/components/university/PDFUploader.tsx` | 🔴 Critical | 3-4 days |
| **PDFParserResult** | Display parsed PDF data | `src/components/university/PDFParserResult.tsx` | 🔴 Critical | 2-3 days |
| **UniversityProfileForm** | University profile form | `src/components/university/UniversityProfileForm.tsx` | 🟡 Medium | 2-3 days |

#### Admin Module Components

| Component | Purpose | File Path | Priority | Estimated Effort |
|-----------|---------|-----------|----------|------------------|
| **UserTable** | User management table | `src/components/admin/UserTable.tsx` | 🟡 Medium | 2-3 days |
| **UserDetailModal** | User detail modal | `src/components/admin/UserDetailModal.tsx` | 🟡 Medium | 2-3 days |
| **RoleSelector** | Role selection dropdown | `src/components/admin/RoleSelector.tsx` | 🟡 Medium | 1 day |

#### Shared Components

| Component | Purpose | File Path | Priority | Estimated Effort |
|-----------|---------|-----------|----------|------------------|
| **NotificationDetailModal** | Notification detail modal | `src/components/common/NotificationDetailModal.tsx` | 🟡 Medium | 1-2 days |
| **ExportButton** | Export data button | `src/components/common/ExportButton.tsx` | 🟢 Low | 1-2 days |
| **FilterPanel** | Advanced filter panel | `src/components/common/FilterPanel.tsx` | 🟡 Medium | 2-3 days |
| **Pagination** | Pagination component | `src/components/common/Pagination.tsx` | 🟡 Medium | 1-2 days |

---

## 🔌 API Integration Plan

### Step 1: Create API Client Infrastructure

#### 1.1 Install Dependencies

```bash
pnpm add axios
pnpm add -D @types/node
```

#### 1.2 Create Environment Variables

**File:** `.env`

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ENVIRONMENT=development
```

**File:** `.env.example`

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ENVIRONMENT=development
```

#### 1.3 Create API Client

**File:** `src/services/apiClient.ts`

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
    // Handle errors
    if (error.response) {
      // Server responded with error
      const apiError = error.response.data;
      console.error('API Error:', apiError.message);
      // Show toast notification
      // You can dispatch to a toast context here
    } else if (error.request) {
      // Request made but no response
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

#### 1.4 Create API Types

**File:** `src/types/api.ts`

```typescript
// Base types
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

// Admission types (matching backend)
export interface Admission {
  id: string;
  university_id: string | null;
  title: string;
  degree_level: string;
  deadline: string; // ISO 8601
  application_fee: number;
  location: string;
  description: string | null;
  verification_status: 'verified' | 'pending' | 'rejected';
  status: 'active' | 'inactive' | 'closed';
  created_at: string;
  updated_at: string;
}

// Notification types
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

// Deadline types
export interface Deadline {
  id: string;
  admission_id: string;
  user_id: string;
  deadline: string; // ISO 8601
  days_remaining: number;
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
}

// Watchlist types
export interface Watchlist {
  id: string;
  user_id: string;
  admission_id: string;
  saved_at: string;
  alert_opt_in: boolean;
  notes: string | null;
}

// User types
export interface User {
  id: string;
  email: string;
  user_type: 'student' | 'university' | 'admin';
  university_id: string | null;
  created_at: string;
  updated_at: string;
}

// User Preferences types
export interface UserPreferences {
  id: string;
  user_id: string;
  notification_preferences: {
    email: boolean;
    push: boolean;
    deadline_alerts: boolean;
  };
  display_preferences: {
    theme: 'light' | 'dark';
    language: string;
  };
  search_preferences: {
    default_filters: Record<string, any>;
  };
}

// Dashboard types
export interface StudentDashboard {
  stats: {
    active_admissions: number;
    saved_count: number;
    upcoming_deadlines: number;
    recommendations_count: number;
    unread_notifications: number;
    urgent_deadlines: number;
  };
  recommended_programs: Array<Admission & {
    university_name: string;
    match_score?: number;
    match_reason?: string;
    saved: boolean;
    alert_enabled: boolean;
  }>;
  upcoming_deadlines: Array<Deadline & {
    university_name: string;
    program_title: string;
    saved: boolean;
    alert_enabled: boolean;
  }>;
  recent_notifications: Notification[];
  recent_activity: Array<{
    type: 'notification' | 'saved' | 'alert' | 'deadline';
    action: string;
    timestamp: string;
    related_entity_id?: string;
    related_entity_type?: string;
  }>;
}

// Add more types as needed...
```

#### 1.5 Create Service Files

**File:** `src/services/admissionsService.ts`

```typescript
import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, Admission } from '../types/api';

export const admissionsService = {
  // List admissions with filters
  list: async (params?: {
    search?: string;
    degree_level?: string;
    verification_status?: string;
    university_id?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Admission>> => {
    const response = await apiClient.get('/admissions', { params });
    return response.data;
  },

  // Get admission by ID
  getById: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.get(`/admissions/${id}`);
    return response.data;
  },

  // Create admission
  create: async (data: Partial<Admission>): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.post('/admissions', data);
    return response.data;
  },

  // Update admission
  update: async (id: string, data: Partial<Admission>): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.put(`/admissions/${id}`, data);
    return response.data;
  },

  // Delete admission
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admissions/${id}`);
    return response.data;
  },

  // Submit for verification
  submitForVerification: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.patch(`/admissions/${id}/submit`);
    return response.data;
  },

  // Verify (admin)
  verify: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.patch(`/admissions/${id}/verify`);
    return response.data;
  },

  // Reject (admin)
  reject: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.patch(`/admissions/${id}/reject`);
    return response.data;
  },

  // Dispute (university)
  dispute: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.patch(`/admissions/${id}/dispute`);
    return response.data;
  },

  // Parse PDF
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
```

**Create similar service files for:**
- `notificationsService.ts`
- `deadlinesService.ts`
- `watchlistsService.ts`
- `usersService.ts`
- `preferencesService.ts`
- `changelogsService.ts`
- `analyticsService.ts`
- `activityService.ts`
- `dashboardService.ts` (for aggregated endpoints)

---

### Step 2: Create Data Transformation Layer

**File:** `src/utils/transformers.ts`

```typescript
import type { Admission, Watchlist, Notification, Deadline } from '../types/api';
import type { StudentAdmission } from '../types/frontend'; // Your frontend types

// Transform backend admission to frontend format
export function transformAdmission(
  backend: Admission,
  watchlist?: Watchlist,
  universityName?: string
): StudentAdmission {
  return {
    id: backend.id,
    university: universityName || backend.university_id || 'Unknown',
    program: backend.title,
    degree: backend.degree_level,
    degreeType: mapDegreeType(backend.degree_level),
    deadline: backend.deadline,
    deadlineDisplay: formatDate(backend.deadline),
    fee: formatCurrency(backend.application_fee),
    feeNumeric: backend.application_fee,
    location: backend.location,
    city: extractCity(backend.location),
    status: mapVerificationStatus(backend.verification_status),
    programStatus: calculateProgramStatus(backend.deadline),
    updated: backend.updated_at,
    daysRemaining: calculateDaysRemaining(backend.deadline),
    saved: !!watchlist,
    alertEnabled: watchlist?.alert_opt_in || false,
    aiSummary: backend.description || undefined,
  };
}

// Helper functions
function mapVerificationStatus(status: string): 'Verified' | 'Pending' | 'Updated' | 'Closed' {
  const map: Record<string, 'Verified' | 'Pending' | 'Updated' | 'Closed'> = {
    verified: 'Verified',
    pending: 'Pending',
    rejected: 'Closed',
  };
  return map[status] || 'Pending';
}

function calculateProgramStatus(deadline: string): 'Open' | 'Closing Soon' | 'Closed' {
  const daysRemaining = calculateDaysRemaining(deadline);
  if (daysRemaining < 0) return 'Closed';
  if (daysRemaining <= 7) return 'Closing Soon';
  return 'Open';
}

function calculateDaysRemaining(deadline: string): number {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function extractCity(location: string): string {
  // Extract city from location string
  const parts = location.split(',');
  return parts[parts.length - 2]?.trim() || location;
}

function mapDegreeType(degreeLevel: string): string {
  // Map degree level to frontend format
  const map: Record<string, string> = {
    'bachelor': 'BS',
    'master': 'MS',
    'phd': 'PhD',
  };
  return map[degreeLevel.toLowerCase()] || degreeLevel;
}
```

---

### Step 3: Migrate Contexts to Use API

**File:** `src/contexts/StudentDataContext.tsx` (Updated)

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dashboardService } from '../services/dashboardService';
import { admissionsService } from '../services/admissionsService';
import { watchlistsService } from '../services/watchlistsService';
import { notificationsService } from '../services/notificationsService';
import { transformAdmission } from '../utils/transformers';
import type { StudentAdmission, StudentNotification } from '../types/frontend';

interface StudentDataContextType {
  admissions: StudentAdmission[];
  savedAdmissions: StudentAdmission[];
  notifications: StudentNotification[];
  loading: boolean;
  error: string | null;
  // ... other methods
}

const StudentDataContext = createContext<StudentDataContextType | undefined>(undefined);

export function StudentDataProvider({ children }: { children: ReactNode }) {
  const [admissions, setAdmissions] = useState<StudentAdmission[]>([]);
  const [savedAdmissions, setSavedAdmissions] = useState<StudentAdmission[]>([]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use aggregated dashboard endpoint
      const response = await dashboardService.getStudentDashboard();
      
      // Transform data
      const transformedAdmissions = response.data.recommended_programs.map(prog =>
        transformAdmission(prog, undefined, prog.university_name)
      );
      
      setAdmissions(transformedAdmissions);
      setNotifications(response.data.recent_notifications);
      // ... set other state
      
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Implement other methods (toggleSaved, toggleAlert, etc.)
  // ...

  return (
    <StudentDataContext.Provider value={{
      admissions,
      savedAdmissions,
      notifications,
      loading,
      error,
      // ... other values
    }}>
      {children}
    </StudentDataContext.Provider>
  );
}

export function useStudentData() {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error('useStudentData must be used within StudentDataProvider');
  }
  return context;
}
```

---

## 📄 Missing Pages Implementation

### Page 1: Student Profile

**File:** `src/pages/student/StudentProfile.tsx`

```typescript
import { useState, useEffect } from 'react';
import { usersService } from '../../services/usersService';
import { ProfileForm } from '../../components/student/ProfileForm';
import StudentLayout from '../../layouts/StudentLayout';

export default function StudentProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await usersService.getCurrentUser();
      setUser(response.data);
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await usersService.updateCurrentUser(data);
      // Show success toast
      await fetchProfile(); // Refresh
    } catch (err) {
      // Show error toast
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <StudentLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <ProfileForm user={user} onSave={handleSave} />
      </div>
    </StudentLayout>
  );
}
```

**Similar implementation for other missing pages...**

---

## 🧩 Missing Components Implementation

### Component 1: Error Boundary

**File:** `src/components/common/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Similar implementation for other missing components...**

---

## 📁 File Structure Plan

```
src/
├── services/
│   ├── apiClient.ts              # ✅ NEW
│   ├── dashboardService.ts        # ✅ NEW
│   ├── admissionsService.ts       # ✅ NEW
│   ├── notificationsService.ts   # ✅ NEW
│   ├── deadlinesService.ts       # ✅ NEW
│   ├── watchlistsService.ts      # ✅ NEW
│   ├── usersService.ts           # ✅ NEW
│   ├── preferencesService.ts     # ✅ NEW
│   ├── changelogsService.ts      # ✅ NEW
│   ├── analyticsService.ts       # ✅ NEW
│   └── activityService.ts        # ✅ NEW
├── types/
│   ├── api.ts                    # ✅ NEW
│   └── frontend.ts               # ✅ UPDATE
├── utils/
│   ├── transformers.ts           # ✅ NEW
│   ├── formatters.ts             # ✅ NEW
│   └── validators.ts             # ✅ NEW
├── components/
│   ├── common/
│   │   ├── ErrorBoundary.tsx     # ✅ NEW
│   │   ├── Toast.tsx              # ✅ NEW
│   │   ├── LoadingSpinner.tsx     # ✅ NEW
│   │   ├── UnreadCountBadge.tsx   # ✅ NEW
│   │   ├── NotificationDetailModal.tsx # ✅ NEW
│   │   ├── DeadlineDetailModal.tsx # ✅ NEW
│   │   ├── Pagination.tsx         # ✅ NEW
│   │   └── FilterPanel.tsx        # ✅ NEW
│   ├── student/
│   │   ├── ProfileForm.tsx        # ✅ NEW
│   │   ├── PreferencesForm.tsx    # ✅ NEW
│   │   ├── RecommendationCard.tsx # ✅ NEW
│   │   └── ActivityItem.tsx       # ✅ NEW
│   ├── university/
│   │   ├── PDFUploader.tsx        # ✅ NEW
│   │   ├── PDFParserResult.tsx    # ✅ NEW
│   │   └── UniversityProfileForm.tsx # ✅ NEW
│   └── admin/
│       ├── UserTable.tsx          # ✅ NEW
│       ├── UserDetailModal.tsx     # ✅ NEW
│       └── RoleSelector.tsx       # ✅ NEW
├── pages/
│   ├── student/
│   │   ├── StudentProfile.tsx     # ✅ NEW
│   │   ├── UserPreferences.tsx    # ✅ NEW
│   │   ├── Recommendations.tsx   # ✅ NEW
│   │   └── ActivityFeed.tsx       # ✅ NEW
│   ├── university/
│   │   └── UniversityProfile.tsx  # ✅ NEW
│   └── admin/
│       ├── AdminUserManagement.tsx # ✅ NEW
│       └── AdminSettings.tsx      # ✅ NEW
└── contexts/
    ├── StudentDataContext.tsx     # ⚠️ UPDATE
    └── UniversityDataContext.tsx  # ⚠️ UPDATE
```

---

## 🗓️ Implementation Phases

### Phase 1: API Infrastructure (Weeks 1-2)

**Week 1:**
- [ ] Install dependencies (axios)
- [ ] Create API client (`apiClient.ts`)
- [ ] Create API types (`types/api.ts`)
- [ ] Create all 9 service files
- [ ] Create data transformers (`transformers.ts`)
- [ ] Create error boundary component
- [ ] Create toast notification component
- [ ] Test API connection

**Week 2:**
- [ ] Migrate `StudentDataContext` to use API
- [ ] Migrate `UniversityDataContext` to use API
- [ ] Update `StudentDashboard` to use aggregated endpoint
- [ ] Update `UniversityDashboard` to use aggregated endpoint
- [ ] Update all existing pages to use API
- [ ] Add loading states
- [ ] Add error handling

### Phase 2: Missing Pages & Components (Weeks 3-4)

**Week 3:**
- [ ] Create Student Profile page
- [ ] Create User Preferences page
- [ ] Create Recommendations page
- [ ] Create Activity Feed page
- [ ] Create ProfileForm component
- [ ] Create PreferencesForm component
- [ ] Create RecommendationCard component
- [ ] Create ActivityItem component

**Week 4:**
- [ ] Create University Profile page
- [ ] Create Admin User Management page
- [ ] Create Admin Settings page
- [ ] Create Notification Detail modal/page
- [ ] Create UniversityProfileForm component
- [ ] Create UserTable component
- [ ] Create UserDetailModal component
- [ ] Create RoleSelector component

### Phase 3: Advanced Features & Polish (Weeks 5-6)

**Week 5:**
- [ ] Complete PDF upload feature
- [ ] Create PDFUploader component
- [ ] Create PDFParserResult component
- [ ] Implement event tracking
- [ ] Add advanced filtering
- [ ] Add pagination components
- [ ] Add search enhancements

**Week 6:**
- [ ] Remove all mock data
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation updates
- [ ] Code review and refactoring

---

## 🧪 Testing Strategy

### Unit Tests
- Test API client interceptors
- Test data transformers
- Test service functions
- Test component rendering

### Integration Tests
- Test API integration in contexts
- Test page components with API
- Test error handling flows
- Test loading states

### E2E Tests
- Test user flows (dashboard, search, etc.)
- Test form submissions
- Test API error scenarios

---

## 📦 Dependencies & Prerequisites

### Required Dependencies

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Prerequisites

1. **Backend API Running**
   - Backend server at `http://localhost:3000`
   - Dashboard endpoints implemented (see `BACKEND_IMPLEMENTATION_PLAN.md`)
   - PDF parsing endpoint implemented

2. **Environment Setup**
   - `.env` file configured
   - API base URL set

3. **Mock Authentication**
   - User ID in localStorage
   - User role in localStorage
   - University ID in localStorage (for university users)

---

## ✅ Success Criteria

### Phase 1 Complete When:
- ✅ API client created and tested
- ✅ All service files created
- ✅ Data transformers working
- ✅ Contexts migrated to API
- ✅ Dashboards using aggregated endpoints

### Phase 2 Complete When:
- ✅ All 8 missing pages created
- ✅ All 15+ missing components created
- ✅ All pages integrated with API
- ✅ All routes added

### Phase 3 Complete When:
- ✅ PDF upload complete
- ✅ All advanced features implemented
- ✅ All mock data removed
- ✅ Testing complete
- ✅ Performance optimized

---

## 🔗 Related Documents

- **Backend Plan:** See `BACKEND_IMPLEMENTATION_PLAN.md`
- **Gap Analysis:** See `COMPLETE_GAP_ANALYSIS_AND_STRATEGY.md`
- **Dashboard Spec:** See `BACKEND_DASHBOARD_ENDPOINTS_SPEC.md`
- **Integration Guide:** See `INTEGRATION_GUIDE.md`

---

**Status:** Ready for Implementation  
**Last Updated:** January 18, 2026  
**Next Review:** After Phase 1 completion
