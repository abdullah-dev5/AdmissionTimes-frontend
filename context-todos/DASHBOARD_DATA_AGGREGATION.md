# Dashboard Data Aggregation Guide

**Created:** January 18, 2026  
**Purpose:** Explain how dashboards aggregate data from multiple tables/sources  
**Status:** Architecture Documentation

---

## ✅ You Are Absolutely Correct!

**Yes, dashboards need data from multiple tables/modules.** This is a fundamental architectural requirement.

---

## 📊 Student Dashboard Data Sources

### Current Implementation (Mock Data)

The Student Dashboard currently uses data from **3 different sources**:

```typescript
const { admissions, savedAdmissions, notifications } = useStudentData()
```

### Required Data Sources (Backend Tables)

When integrated with backend, Student Dashboard needs data from **6+ different tables**:

| Data Needed | Source Table | API Endpoint | Purpose |
|------------|--------------|--------------|---------|
| **Admissions List** | `admissions` | `GET /api/v1/admissions` | Show all available programs |
| **University Info** | `universities` | (JOINed with admissions) | Display university names, cities |
| **Saved Programs** | `watchlists` | `GET /api/v1/watchlists` | Show saved/watched programs count |
| **Upcoming Deadlines** | `deadlines` | `GET /api/v1/deadlines?upcoming=true` | Show deadline countdowns |
| **Notifications** | `notifications` | `GET /api/v1/notifications` | Show recent activity/alerts |
| **Recommendations** | `recommendations` | (Calculate from admissions) | Show personalized recommendations |
| **User Profile** | `users` / `student_profiles` | `GET /api/v1/users/me` | User preferences, match scores |

### Dashboard Statistics Calculation

**Current Frontend Logic:**
```typescript
// Stats calculated from multiple sources:
const stats = {
  active: admissions.filter(...),           // From admissions table
  saved: savedAdmissions.length,            // From watchlists table
  upcoming: admissions.filter(...),         // From admissions + deadlines
  recommendations: admissions.filter(...),  // From admissions + recommendations
  urgent: admissions.filter(...)            // From admissions + deadlines
}
```

**Backend Integration Required:**
```typescript
// Need to fetch from multiple endpoints:
const [admissions] = await Promise.all([
  admissionsService.list(),              // GET /api/v1/admissions
  watchlistsService.list(),              // GET /api/v1/watchlists
  deadlinesService.getUpcoming(),        // GET /api/v1/deadlines?upcoming=true
  notificationsService.list(),          // GET /api/v1/notifications
  // Then JOIN/merge data in frontend
])
```

---

## 🏛️ University Dashboard Data Sources

### Required Data Sources

| Data Needed | Source Table | API Endpoint | Purpose |
|------------|--------------|--------------|---------|
| **My Admissions** | `admissions` | `GET /api/v1/admissions?university_id=X` | Show university's programs |
| **Verification Status** | `admissions` (verification_status) | Filter by `verification_status` | Pending/verified counts |
| **Change Logs** | `change_logs` | `GET /api/v1/change-logs` | Recent updates history |
| **Notifications** | `notifications` | `GET /api/v1/notifications?user_type=university` | University-specific alerts |
| **Audits** | `audits` | `GET /api/v1/admissions?verification_status=pending` | Verification requests |

---

## 🔄 Two Approaches to Data Aggregation

### Approach A: Multiple API Calls (Current Plan)

**How It Works:**
1. Frontend makes **multiple parallel API calls**
2. Frontend **merges/transforms** the data
3. Frontend **calculates** dashboard statistics

**Example:**
```typescript
// Student Dashboard - Multiple Calls
const fetchDashboardData = async () => {
  const [admissionsRes, watchlistsRes, deadlinesRes, notificationsRes] = 
    await Promise.all([
      fetch('/api/v1/admissions'),
      fetch('/api/v1/watchlists'),
      fetch('/api/v1/deadlines?upcoming=true'),
      fetch('/api/v1/notifications')
    ])
  
  // Merge data
  const dashboardData = {
    admissions: admissionsRes.data,
    savedCount: watchlistsRes.data.length,
    upcomingDeadlines: deadlinesRes.data,
    notifications: notificationsRes.data,
    stats: calculateStats(admissionsRes.data, watchlistsRes.data, deadlinesRes.data)
  }
}
```

**Pros:**
- ✅ Works with existing backend
- ✅ Flexible - can fetch only what's needed
- ✅ Backend stays simple (no aggregation logic)

**Cons:**
- ❌ Multiple network requests (slower)
- ❌ Frontend does aggregation logic
- ❌ More complex frontend code

---

### Approach B: Aggregated Dashboard Endpoint (Recommended Later)

**How It Works:**
1. Backend creates **single aggregation endpoint**
2. Backend **JOINs multiple tables** in SQL
3. Backend **calculates statistics** server-side
4. Frontend makes **one API call**

**Example:**
```typescript
// Backend Endpoint: GET /api/v1/student/dashboard
// Backend SQL:
SELECT 
  COUNT(DISTINCT a.id) as active_admissions,
  COUNT(DISTINCT w.id) as saved_count,
  COUNT(DISTINCT d.id) as upcoming_deadlines,
  COUNT(DISTINCT n.id) as unread_notifications
FROM admissions a
LEFT JOIN watchlists w ON w.admission_id = a.id AND w.student_id = $1
LEFT JOIN deadlines d ON d.admission_id = a.id AND d.days_remaining <= 7
LEFT JOIN notifications n ON n.user_id = $1 AND n.is_read = false
WHERE a.status = 'verified'

// Frontend - Single Call
const dashboardData = await fetch('/api/v1/student/dashboard')
```

**Pros:**
- ✅ Single network request (faster)
- ✅ Backend handles aggregation (more efficient)
- ✅ Simpler frontend code
- ✅ Better performance (SQL JOINs vs multiple queries)

**Cons:**
- ❌ Requires backend changes
- ❌ Less flexible (can't customize what's fetched)
- ❌ More complex backend code

---

## 📋 Implementation Plan

### Phase 1: Start with Approach A (Multiple Calls)

**Why?**
- Backend already has all individual endpoints
- No backend changes needed
- Can start integration immediately

**Tasks:**
1. Create API client service layer
2. Create dashboard service that makes multiple calls
3. Create data merger/transformer functions
4. Update StudentDashboard to use aggregated data

**Code Structure:**
```
src/
├── services/
│   ├── dashboardService.ts      // Aggregates multiple API calls
│   ├── admissionsService.ts
│   ├── watchlistsService.ts
│   ├── deadlinesService.ts
│   └── notificationsService.ts
└── utils/
    └── dataTransformers.ts      // Merge/transform data
```

### Phase 2: Request Approach B (Aggregated Endpoint)

**After frontend is working:**
- Request backend team to create `/api/v1/student/dashboard`
- Request backend team to create `/api/v1/university/dashboard`
- Migrate frontend to use aggregated endpoints
- Performance improvement!

---

## 🔍 Data Flow Diagram

### Current (Mock Data)
```
Mock Data Files
    ├── studentData.ts (admissions)
    ├── studentData.ts (savedAdmissions)
    └── studentData.ts (notifications)
         ↓
StudentDataContext
         ↓
StudentDashboard (calculates stats)
```

### Phase 1 (Multiple API Calls)
```
Backend Tables:
    ├── admissions table
    ├── watchlists table
    ├── deadlines table
    └── notifications table
         ↓
Multiple API Calls (parallel)
    ├── GET /api/v1/admissions
    ├── GET /api/v1/watchlists
    ├── GET /api/v1/deadlines
    └── GET /api/v1/notifications
         ↓
Frontend Data Merger
         ↓
StudentDashboard (displays aggregated data)
```

### Phase 2 (Aggregated Endpoint)
```
Backend Tables:
    ├── admissions table
    ├── watchlists table
    ├── deadlines table
    └── notifications table
         ↓
Backend SQL JOIN + Aggregation
         ↓
GET /api/v1/student/dashboard (single call)
         ↓
StudentDashboard (displays pre-aggregated data)
```

---

## 📝 Key Takeaways

1. **✅ You are correct:** Dashboards need data from multiple tables
2. **Current situation:** Backend has separate endpoints, no aggregation
3. **Solution:** Start with multiple API calls, request aggregation later
4. **Data sources:** Student Dashboard needs 6+ tables, University Dashboard needs 5+ tables
5. **Performance:** Aggregated endpoint will be faster, but multiple calls work fine for now

---

## 🎯 Decision: Approach B Selected

**✅ We are implementing Approach B - Aggregated Dashboard Endpoints**

### Implementation Plan

1. **Backend Team:** Implement aggregated endpoints (see `BACKEND_DASHBOARD_ENDPOINTS_SPEC.md`)
   - `GET /api/v1/student/dashboard`
   - `GET /api/v1/university/dashboard`
   - `GET /api/v1/admin/dashboard` (optional)

2. **Frontend Team:** Wait for backend endpoints, then integrate
   - Create dashboard service to call aggregated endpoints
   - Update StudentDashboard to use single API call
   - Update UniversityDashboard to use single API call
   - Remove multiple API call logic

### Benefits of Approach B

- ✅ **Single API call** - Faster, simpler
- ✅ **Backend handles aggregation** - More efficient SQL JOINs
- ✅ **Better performance** - Reduced network overhead
- ✅ **Easier caching** - Single endpoint to cache
- ✅ **Simpler frontend code** - No data merging logic needed

---

## 📋 Next Steps

1. **Backend Team:** Review `BACKEND_DASHBOARD_ENDPOINTS_SPEC.md` and implement endpoints
2. **Frontend Team:** Prepare integration code (wait for backend)
3. **Testing:** Test aggregated endpoints once backend is ready
4. **Integration:** Update frontend to use aggregated endpoints

---

**See `BACKEND_DASHBOARD_ENDPOINTS_SPEC.md` for complete backend specification.**  
**See `MERGED_GAP_ANALYSIS.md` for complete alignment plan.**
