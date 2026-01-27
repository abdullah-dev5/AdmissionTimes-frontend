# Frontend-Backend Merged Gap Analysis & Alignment Plan

**Created:** January 18, 2026  
**Purpose:** Comprehensive merged analysis of frontend-backend inconsistencies and alignment plan  
**Status:** Complete Analysis - Ready for Frontend-First Alignment

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Context Understanding](#project-context-understanding)
3. [API Endpoint Inconsistencies](#api-endpoint-inconsistencies)
4. [Data Structure Mismatches](#data-structure-mismatches)
5. [Feature Gaps](#feature-gaps)
6. [Frontend-First Alignment Plan](#frontend-first-alignment-plan)
7. [Backend Fixes Required](#backend-fixes-required)

---

## 📊 Executive Summary

### Current State Analysis

**Frontend:**
- ✅ 25+ pages implemented with mock data
- ✅ 50+ components built
- ✅ React Context API for state management
- ✅ TypeScript with custom types
- ❌ 0% API integration
- ❌ Missing 8 pages
- ❌ No API client layer

**Backend:**
- ✅ 51 API endpoints across 9 domains
- ✅ RESTful design with standardized responses
- ✅ PostgreSQL database
- ✅ Swagger documentation
- ⚠️ Missing some endpoints frontend expects
- ⚠️ Different endpoint paths than frontend expects

### Critical Inconsistencies Identified

1. **API Endpoint Mismatches** - Frontend expects endpoints that don't exist
2. **Data Structure Differences** - Field names and types don't match
3. **Missing Aggregated Endpoints** - Frontend expects dashboard endpoints
4. **Workflow Differences** - Status workflows differ
5. **Feature Gaps** - Features expected but not implemented

---

## 🔍 Project Context Understanding

### Frontend Architecture

**Current Structure:**
```
src/
├── components/     # UI components (admin, student, university, ai)
├── contexts/       # React Context (StudentDataContext, UniversityDataContext)
├── data/          # Mock data (studentData, universityData, adminData)
├── pages/         # Page components (student, university, admin)
├── layouts/       # Layout wrappers
├── hooks/         # Custom hooks
└── utils/         # Utility functions
```

**State Management:**
- `StudentDataContext` - Manages student admissions, notifications, saved items
- `UniversityDataContext` - Manages university admissions, change logs, audits
- Mock data from `data/` files
- Local state updates (no API calls)

**Data Flow:**
- Mock data → Context → Components
- No API integration layer
- All operations are local state updates

### Backend Architecture

**API Structure:**
- Base URL: `http://localhost:3000/api/v1`
- 9 domains with 51 endpoints
- Standardized response format
- Mock authentication (development)

**Database:**
- PostgreSQL with migrations
- 9 main tables
- Relationships defined

---

## 🌐 API Endpoint Inconsistencies

### Frontend Expected vs Backend Actual

#### ❌ Missing Endpoints (Frontend Expects, Backend Doesn't Have)

| Frontend Expects | Backend Has | Status | Impact |
|------------------|-------------|--------|--------|
| `GET /api/student/dashboard` | ❌ None | **MISSING** | 🔴 Critical - Dashboard aggregation |
| `GET /api/university/dashboard` | ❌ None | **MISSING** | 🔴 Critical - Dashboard aggregation |
| `GET /api/admissions/search` | `GET /api/v1/admissions?search=` | ⚠️ Different | 🟡 Medium - Path difference |
| `GET /api/student/deadlines` | `GET /api/v1/deadlines` | ⚠️ Different | 🟡 Medium - Path difference |
| `GET /api/student/recommendations` | ❌ None | **MISSING** | 🟡 Medium - Recommendations feature |
| `POST /api/compare` | ❌ None | **MISSING** | 🟢 Low - Optional feature |
| `GET /api/university/audits` | `GET /api/v1/admissions?verification_status=` | ⚠️ Different | 🟡 Medium - Different approach |
| `GET /api/university/scraper-logs` | ❌ None | **MISSING** | 🟢 Low - Admin feature |
| `POST /api/admissions/parse-pdf` | ❌ None | **MISSING** | 🟡 Medium - PDF upload feature |
| `GET /api/student/profile` | `GET /api/v1/users/me` | ⚠️ Different | 🟡 Medium - Path difference |

#### ✅ Backend Has, Frontend Doesn't Use

| Backend Endpoint | Frontend Status | Notes |
|------------------|----------------|-------|
| All 51 endpoints | ❌ Not Used | 0% integration |

### Endpoint Path Differences

**Frontend Documentation Expects:**
- `/api/student/*` - Student-specific endpoints
- `/api/university/*` - University-specific endpoints
- `/api/admissions/search` - Search endpoint
- `/api/compare` - Compare endpoint

**Backend Actually Has:**
- `/api/v1/admissions` - Generic admissions endpoint
- `/api/v1/deadlines` - Generic deadlines endpoint
- `/api/v1/users/me` - Current user endpoint
- No role-specific dashboard endpoints
- No search-specific endpoint (uses query params)
- No compare endpoint

---

## 📊 Data Structure Mismatches

### Admission Data Structure

#### Frontend Mock Data (`StudentAdmission`)
```typescript
{
  id: string
  university: string          // Backend: university_id (UUID)
  program: string             // Backend: title
  degree: string              // Backend: degree_level
  degreeType: 'BS' | 'MS'...  // Backend: degree_level (string)
  deadline: string            // Backend: deadline (ISO timestamp)
  deadlineDisplay: string     // Frontend calculated
  fee: string                // Backend: application_fee (number)
  feeNumeric: number          // Frontend calculated
  location: string            // Backend: location
  city: string                // Frontend extracted
  status: 'Verified' | 'Pending' | 'Updated' | 'Closed'
  programStatus: 'Open' | 'Closing Soon' | 'Closed'  // Frontend calculated
  updated: string             // Backend: updated_at
  daysRemaining: number        // Frontend calculated
  match?: string              // Frontend only (recommendations)
  matchNumeric?: number        // Frontend only (recommendations)
  logoBg: string              // Frontend only
  aiSummary?: string          // Backend: description
  officialUrl?: string        // Backend: Not in API
  alertEnabled?: boolean       // Backend: watchlist.alert_opt_in
  saved?: boolean             // Frontend state
}
```

#### Backend API Response (`Admission`)
```typescript
{
  id: string                  // UUID
  university_id: string | null
  title: string
  description: string | null
  program_type: string | null
  degree_level: string | null
  field_of_study: string | null
  duration: string | null
  tuition_fee: number | null
  currency: string | null
  application_fee: number | null
  deadline: string | null     // ISO timestamp
  start_date: string | null
  location: string | null
  campus: string | null
  delivery_mode: string | null
  requirements: Record<string, any> | null
  verification_status: 'draft' | 'pending' | 'verified' | 'rejected' | 'disputed'
  verified_at: string | null
  verified_by: string | null
  rejection_reason: string | null
  dispute_reason: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  is_active: boolean
}
```

**Key Differences:**
- Frontend uses `university` (string), backend uses `university_id` (UUID)
- Frontend uses `program`, backend uses `title`
- Frontend uses `status`, backend uses `verification_status`
- Frontend calculates `daysRemaining`, backend has separate `deadlines` table
- Frontend has `match`/`matchNumeric`, backend doesn't have recommendations endpoint
- Frontend has `saved`/`alertEnabled`, backend has separate `watchlists` table

### Notification Data Structure

#### Frontend Mock Data (`StudentNotification`)
```typescript
{
  id: string
  type: 'alert' | 'system' | 'admission'
  title: string
  description: string
  time: string
  timeAgo: string              // Frontend calculated
  read: boolean
  icon: string                 // Frontend only
  iconColor: string            // Frontend only
  admissionId?: string
}
```

#### Backend API Response (`Notification`)
```typescript
{
  id: string                   // UUID
  user_id: string | null
  user_type: 'student' | 'university' | 'admin' | 'all'
  category: 'verification' | 'deadline' | 'system' | 'update'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  related_entity_type: string | null
  related_entity_id: string | null
  is_read: boolean
  read_at: string | null
  action_url: string | null
  created_at: string
}
```

**Key Differences:**
- Frontend uses `type`, backend uses `category` + `user_type`
- Frontend uses `description`, backend uses `message`
- Frontend uses `time`/`timeAgo`, backend uses `created_at`
- Frontend has `icon`/`iconColor`, backend doesn't
- Backend has `priority`, frontend doesn't use it

---

## 🎯 Feature Gaps

### Frontend Expects, Backend Missing

1. **Dashboard Aggregation Endpoints**
   - `GET /api/student/dashboard` - Aggregated student data
   - `GET /api/university/dashboard` - Aggregated university data
   - **Impact:** Frontend expects single endpoint for dashboard data
   - **Backend Fix:** Create aggregation endpoints OR frontend makes multiple calls

2. **Recommendations Endpoint**
   - `GET /api/student/recommendations` - Personalized recommendations
   - **Impact:** Frontend calculates recommendations from admissions
   - **Backend Fix:** Create recommendations endpoint OR frontend continues calculating

3. **PDF Parsing Endpoint**
   - `POST /api/admissions/parse-pdf` - Extract data from PDF
   - **Impact:** PDF upload feature incomplete
   - **Backend Fix:** Create PDF parsing endpoint

4. **Scraper Logs Endpoint**
   - `GET /api/university/scraper-logs` - University scraper activity
   - **Impact:** Admin scraper logs page uses mock data
   - **Backend Fix:** Create scraper logs endpoint OR use existing analytics

5. **Compare Endpoint**
   - `POST /api/compare` - Server-side comparison snapshot
   - **Impact:** Optional feature, frontend can compare client-side
   - **Backend Fix:** Optional - can skip

### Backend Has, Frontend Doesn't Use

1. **All 51 Endpoints** - 0% integration
2. **Deadlines Domain** - Frontend calculates from admissions instead
3. **Watchlists Domain** - Frontend uses local `saved` flag instead
4. **User Preferences** - Frontend doesn't have preferences UI
5. **User Activity** - Frontend doesn't track activities
6. **Analytics Events** - Frontend doesn't track events

---

## 🎯 Frontend-First Alignment Plan

### Strategy: Align Frontend to Backend API

**Principle:** Frontend should adapt to backend API structure, not vice versa (initially). Backend can add missing endpoints later if needed.

### Phase 1: Frontend API Client Setup (Week 1)

**Goal:** Create API infrastructure aligned with backend

**Tasks:**
1. Create API client with correct base URL (`/api/v1`)
2. Create TypeScript types matching backend responses
3. Create service layer for all 9 domains
4. Set up environment variables
5. Configure interceptors for mock auth

**Deliverables:**
- `src/services/apiClient.ts`
- `src/types/api.ts` (matching backend types)
- `src/services/*Service.ts` (9 service files)

---

### Phase 2: Frontend Data Transformation Layer (Week 1-2)

**Goal:** Transform backend data to frontend format

**Approach:** Create adapter/transformer functions

**Example:**
```typescript
// Transform backend Admission to frontend StudentAdmission
function transformAdmission(backend: BackendAdmission): StudentAdmission {
  return {
    id: backend.id,
    university: getUniversityName(backend.university_id), // Need to fetch
    program: backend.title,
    degree: backend.degree_level || '',
    degreeType: mapDegreeType(backend.degree_level),
    deadline: backend.deadline || '',
    deadlineDisplay: formatDate(backend.deadline),
    fee: formatCurrency(backend.application_fee),
    feeNumeric: backend.application_fee || 0,
    location: backend.location || '',
    city: extractCity(backend.location),
    status: mapVerificationStatus(backend.verification_status),
    programStatus: calculateProgramStatus(backend.deadline),
    updated: backend.updated_at,
    daysRemaining: calculateDaysRemaining(backend.deadline),
    // Frontend-only fields
    logoBg: generateLogoBg(backend.university_id),
    aiSummary: backend.description,
    // State fields (from watchlist)
    saved: false, // Will be set from watchlist API
    alertEnabled: false, // Will be set from watchlist API
  };
}
```

**Tasks:**
1. Create transformer functions for each domain
2. Map backend field names to frontend field names
3. Calculate frontend-only fields (daysRemaining, programStatus, etc.)
4. Handle missing data gracefully

---

### Phase 3: Frontend Context Migration (Week 2-3)

**Goal:** Migrate contexts to use API instead of mock data

#### 3.1 StudentDataContext Migration

**Current:** Uses `sharedAdmissions` mock data  
**Target:** Uses API with transformation

**Changes:**
```typescript
// Before
const [admissions, setAdmissions] = useState(() => cloneAdmissions())

// After
const [admissions, setAdmissions] = useState<StudentAdmission[]>([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch from API
      const response = await admissionsService.list({ 
        verification_status: 'verified' 
      })
      // Transform backend data to frontend format
      const transformed = response.data.map(transformAdmission)
      setAdmissions(transformed)
    } catch (err) {
      setError('Failed to fetch')
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

**Tasks:**
1. Update `StudentDataContext` to fetch from API
2. Transform backend data to frontend format
3. Handle loading/error states
4. Update `toggleSaved` to use watchlist API
5. Update `toggleAlert` to use watchlist API

#### 3.2 UniversityDataContext Migration

**Current:** Uses `sharedAdmissions` mock data  
**Target:** Uses API with transformation

**Changes:**
- Similar to StudentDataContext
- Filter admissions by `university_id` from auth headers
- Transform backend data format

---

### Phase 4: Frontend Page Updates (Week 3-4)

**Goal:** Update all pages to use API data

#### 4.1 Dashboard Pages

**Student Dashboard:**
- **Current:** Uses context with mock data
- **Target:** 
  - ✅ **Approach B Selected:** Backend will create aggregated endpoint `/api/v1/student/dashboard`
  - **Status:** Backend specification ready - See `BACKEND_DASHBOARD_ENDPOINTS_SPEC.md`
  - **📖 See:** `DASHBOARD_DATA_AGGREGATION.md` for detailed explanation of data sources from multiple tables

**University Dashboard:**
- **Current:** Uses context with mock data
- **Target:**
  - ✅ **Approach B Selected:** Backend will create aggregated endpoint `/api/v1/university/dashboard`
  - **Status:** Backend specification ready - See `BACKEND_DASHBOARD_ENDPOINTS_SPEC.md`

#### 4.2 Search Page

**Current:** Filters mock data locally  
**Target:** Use `/api/v1/admissions` with query parameters

**Changes:**
```typescript
// Before
const filtered = admissions.filter(a => 
  a.program.toLowerCase().includes(query.toLowerCase())
)

// After
const response = await admissionsService.list({
  search: query,
  program_type: filters.programType,
  degree_level: filters.degreeLevel,
  // ... other filters
})
```

#### 4.3 Deadline Page

**Current:** Calculates deadlines from admissions  
**Target:** Use `/api/v1/deadlines` endpoint

**Changes:**
- Replace deadline calculations with API call
- Use `days_remaining`, `urgency_level` from API
- Display deadline metadata from API

---

### Phase 5: Missing Pages Implementation (Week 4-5)

**Goal:** Create missing pages using backend API

#### 5.1 Student Profile Page

**Route:** `/student/profile`  
**Backend:** `GET /api/v1/users/me`, `PUT /api/v1/users/me`

**Implementation:**
- Fetch current user from API
- Display user profile
- Update profile form
- Change password form

#### 5.2 User Preferences Page

**Route:** `/student/preferences`  
**Backend:** `GET /api/v1/users/me/preferences`, `PUT /api/v1/users/me/preferences`

**Implementation:**
- Fetch preferences from API
- Display preferences form
- Update preferences
- Apply preferences (theme, language)

#### 5.3 Recommendations Page

**Route:** `/student/recommendations`  
**Backend:** 
- Option A: Calculate from admissions (current approach)
- Option B: Request backend endpoint `/api/v1/student/recommendations`
- **Recommendation:** Start with Option A, request Option B if needed

#### 5.4 Activity Feed Page

**Route:** `/student/activity`  
**Backend:** `GET /api/v1/activity`

**Implementation:**
- Fetch activities from API
- Display activity feed
- Filter by activity type
- Link to related entities

#### 5.5 Admin User Management Page

**Route:** `/admin/users`  
**Backend:** `GET /api/v1/users`, `PATCH /api/v1/users/:id/role`

**Implementation:**
- List all users
- Filter by role/status
- Update user roles
- User detail view

---

### Phase 6: Feature Completion (Week 5-6)

**Goal:** Complete missing features

#### 6.1 PDF Upload & Parsing

**Current:** Mock PDF extraction  
**Target:** 
- Option A: Request backend endpoint `/api/v1/admissions/parse-pdf`
- Option B: Use client-side PDF parsing library
- **Recommendation:** Request backend endpoint

#### 6.2 Submit for Verification

**Current:** Not implemented  
**Target:** `PATCH /api/v1/admissions/:id/submit`

**Implementation:**
- Add submit button in ManageAdmissions
- Call submit API
- Update status to "pending"
- Show success message

#### 6.3 Dispute Functionality

**Current:** Not implemented  
**Target:** `PATCH /api/v1/admissions/:id/dispute`

**Implementation:**
- Add dispute button
- Dispute reason form
- Call dispute API
- Update status

#### 6.4 Unread Count Badge

**Current:** Not implemented  
**Target:** `GET /api/v1/notifications/unread-count`

**Implementation:**
- Create badge component
- Fetch unread count
- Display in navigation/header
- Update on notification read

---

## 🔧 Backend Fixes Required (After Frontend Alignment)

### High Priority Backend Additions

1. **Dashboard Aggregation Endpoints** (Optional but Recommended)
   - `GET /api/v1/student/dashboard` - Aggregated student data
   - `GET /api/v1/university/dashboard` - Aggregated university data
   - **Benefit:** Reduces API calls, improves performance

2. **PDF Parsing Endpoint** (Required for PDF Upload)
   - `POST /api/v1/admissions/parse-pdf` - Extract data from PDF
   - **Benefit:** Completes PDF upload feature

3. **Recommendations Endpoint** (Optional)
   - `GET /api/v1/student/recommendations` - Personalized recommendations
   - **Benefit:** Server-side recommendation engine

### Medium Priority Backend Additions

4. **Scraper Logs Endpoint** (For Admin)
   - `GET /api/v1/university/scraper-logs` - University scraper activity
   - **Alternative:** Use existing analytics endpoint

5. **Compare Endpoint** (Optional)
   - `POST /api/v1/compare` - Server-side comparison
   - **Alternative:** Frontend can compare client-side

---

## 📋 Frontend-First Implementation Checklist

### Week 1: Foundation
- [ ] Create API client (`src/services/apiClient.ts`)
- [ ] Create API types matching backend (`src/types/api.ts`)
- [ ] Create all 9 service files
- [ ] Set up environment variables
- [ ] Test API connection
- [ ] Create data transformer functions

### Week 2: Core Integration
- [ ] Migrate `StudentDataContext` to API
- [ ] Migrate `UniversityDataContext` to API
- [ ] Update Student Dashboard to use API
- [ ] Update University Dashboard to use API
- [ ] Update Search page to use API
- [ ] Update Deadline page to use API

### Week 3: Pages Integration
- [ ] Update Compare page to use API
- [ ] Update Watchlist page to use API
- [ ] Update Notifications pages to use API
- [ ] Update Manage Admissions to use API
- [ ] Update Verification Center to use API
- [ ] Update Change Logs to use API

### Week 4: Missing Pages
- [ ] Create Student Profile page
- [ ] Create User Preferences page
- [ ] Create Recommendations page (or use calculated)
- [ ] Create Activity Feed page
- [ ] Create Admin User Management page
- [ ] Update Settings pages to use API

### Week 5: Feature Completion
- [ ] Implement PDF upload (request backend endpoint)
- [ ] Implement Submit for Verification
- [ ] Implement Dispute functionality
- [ ] Implement Unread Count Badge
- [ ] Implement Event Tracking
- [ ] Complete all missing features

### Week 6: Polish & Testing
- [ ] Remove all mock data
- [ ] Test all integrations
- [ ] Fix data transformation issues
- [ ] Optimize API calls
- [ ] Performance testing
- [ ] Error handling improvements

---

## 🎯 Alignment Strategy Summary

### Frontend Adaptations Required

1. **API Path Changes**
   - Use `/api/v1/*` instead of `/api/*`
   - Remove role-specific paths, use query params instead
   - Use generic endpoints with filters

2. **Data Transformation**
   - Transform backend `Admission` to frontend `StudentAdmission`
   - Map field names (university_id → university name)
   - Calculate frontend-only fields (daysRemaining, programStatus)
   - Merge watchlist data with admissions

3. **Multiple API Calls**
   - Dashboard: Make 4+ API calls instead of 1 aggregated call
   - Combine data in frontend
   - Request aggregation endpoints later if needed

4. **Missing Features Workarounds**
   - Recommendations: Calculate from admissions (temporary)
   - Compare: Client-side comparison (no backend endpoint needed)
   - Scraper Logs: Use analytics endpoint or request new endpoint

### Backend Enhancements (Future)

1. **Dashboard Aggregation Endpoints** (Recommended)
2. **PDF Parsing Endpoint** (Required)
3. **Recommendations Endpoint** (Optional)
4. **Scraper Logs Endpoint** (Optional)

---

## ✅ Success Criteria

### Frontend Alignment Complete When:
- [ ] All pages use real API data (0% mock data)
- [ ] All data transformations work correctly
- [ ] All missing pages implemented
- [ ] All features functional with backend API
- [ ] Error handling comprehensive
- [ ] Loading states implemented
- [ ] Performance optimized

### Backend Enhancements Complete When:
- [ ] Dashboard aggregation endpoints created (if requested)
- [ ] PDF parsing endpoint created
- [ ] All requested endpoints implemented
- [ ] API documentation updated

---

**Last Updated:** January 18, 2026  
**Status:** Complete Merged Analysis ✅  
**Next Step:** Begin Frontend-First Alignment (Week 1)
