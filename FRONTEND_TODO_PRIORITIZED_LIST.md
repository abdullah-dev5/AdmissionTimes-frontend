# Frontend TODO List - Prioritized by Execution Order
**Date:** January 27, 2026  
**Status:** Ready for Implementation  
**Total Time Estimate:** 30-35 hours (2.5 weeks full-time)

---

## 🎯 PHASE 1: CRITICAL PATH (72 hours total)

### Priority 1: University Dashboard Integration (30 minutes)
**Difficulty:** 🟢 Easy  
**Blocker:** No  
**Impact:** HIGH - Makes university users functional

#### Task 1.1: Update UniversityDataContext.tsx
```
File: src/contexts/UniversityDataContext.tsx

Changes needed:
☐ Add import: import { useAuth } from './AuthContext'
☐ Add import: import { dashboardService } from '../services/dashboardService'
☐ Get useAuth hook: const { isAuthenticated, user, isLoading: authLoading } = useAuth()
☐ Add state for loading/error: const [loading, setLoading] = useState(true)
☐ Update useEffect dependency array to: [isAuthenticated, user?.user_type, authLoading]
☐ Add auth guard check:
   if (authLoading) return
   if (!isAuthenticated || user?.user_type !== 'university') {
     setAdmissions([])
     return
   }
☐ Replace fetchMockData() call with dashboardService.getUniversityDashboard()
☐ Transform response: 
   - setAdmissions(response.data.recent_admissions || [])
   - setNotifications(response.data.notifications || [])
   - setChangeLogs(response.data.recent_changes || [])
☐ Add error handling with try-catch
☐ Keep fallback to mock data on error

Estimated time: 20 minutes
Test after: Sign in as university, verify dashboard loads with real data
```

#### Task 1.2: Update AdminDashboard.tsx
```
File: src/pages/admin/AdminDashboard.tsx

Changes needed:
☐ Remove import: import { adminData } from '../../data/adminData'
☐ Add imports:
   import { useEffect, useState } from 'react'
   import { dashboardService } from '../../services/dashboardService'
   import { LoadingSpinner } from '../../components/common/LoadingSpinner'
☐ Add state variables:
   const [dashboard, setDashboard] = useState(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
☐ Add useEffect:
   useEffect(() => {
     fetchDashboard()
   }, [])
☐ Add fetchDashboard function:
   const fetchDashboard = async () => {
     try {
       const response = await dashboardService.getAdminDashboard()
       setDashboard(response.data)
     } catch (err) {
       setError('Failed to load dashboard')
     } finally {
       setLoading(false)
     }
   }
☐ Replace all adminData references with dashboard properties:
   - adminData.stats → dashboard?.stats
   - adminData.pending_verifications → dashboard?.pending_verifications
   - etc.
☐ Add loading state: if (loading) return <LoadingSpinner />
☐ Add error state: if (error) return <ErrorMessage message={error} onRetry={fetchDashboard} />
☐ Update JSX to use dashboard object instead of adminData

Estimated time: 10 minutes
Test after: Sign in as admin, verify dashboard loads with real data
```

#### Task 1.3: Test All Three Dashboards
```
Test Checklist:

Student Dashboard:
☐ Sign in with email: student@test.com (or use sign-up as student)
☐ Verify dashboard loads without errors
☐ Check Network tab: GET /api/v1/student/dashboard returns 200
☐ Verify data displays (stats, admissions, notifications)
☐ Check Console: No 403 errors, no axios errors

University Dashboard:
☐ Sign in with email: university@test.com (or use sign-up as university)
☐ Verify dashboard loads without errors
☐ Check Network tab: GET /api/v1/university/dashboard returns 200
☐ Verify data displays (stats, admissions, pending verifications)
☐ Check Console: No errors

Admin Dashboard:
☐ Sign in with email: admin@test.com (or use sign-up as admin)
☐ Verify dashboard loads without errors
☐ Check Network tab: GET /api/v1/admin/dashboard returns 200
☐ Verify data displays (stats, pending verifications, recent actions)
☐ Check Console: No errors

Edge Cases:
☐ Refresh page while signed in - data persists
☐ Sign out and sign in again - data loads fresh
☐ Network offline - error message shows
☐ API down/500 error - graceful error handling shows

Estimated time: 30 minutes total
```

**Total for Phase 1: 1 hour** ⏱️

---

## 🎯 PHASE 2: CORE FEATURES INTEGRATION (10-12 hours)

### Priority 2: Notifications System (2-3 hours)
**Difficulty:** 🟡 Medium  
**Blocker:** No  
**Impact:** MEDIUM - Users can see real notifications

#### Task 2.1: Update StudentDataContext to Include Notifications
```
File: src/contexts/StudentDataContext.tsx

Changes (additions):
☐ Add state: const [unreadCount, setUnreadCount] = useState(0)
☐ In dashboard fetch, get notifications from response
☐ Add method: markNotificationAsRead(notificationId)
   - Call notificationsService.markAsRead(notificationId)
   - Update local state to remove from unread
   - Recalculate unreadCount
☐ Add method: getAllNotifications()
   - Call notificationsService.listNotifications()
   - Return full list
☐ Calculate unreadCount based on notifications list

Estimated time: 45 minutes
```

#### Task 2.2: Create NotificationCenter Component
```
File: src/pages/student/Notifications.tsx OR new component

Changes needed:
☐ Create or update component to fetch ALL notifications (not just recent)
☐ Add pagination for notifications list
☐ Add method to mark notification as read on click
☐ Add method to delete notification
☐ Add unread badge/indicator
☐ Display notification timestamp, title, message, action
☐ Handle empty state (no notifications)
☐ Handle loading state

Estimated time: 1.5 hours
```

#### Task 2.3: Update University/Admin Notifications
```
Changes needed:
☐ Update UniversityDataContext to fetch notifications
☐ Update AdminDashboard to show notifications
☐ Both should have mark-as-read functionality
☐ Show notification unread count in header/sidebar

Estimated time: 45 minutes
```

**Total for Notifications: 3 hours** ⏱️

---

### Priority 3: Deadlines Feature (2-3 hours)
**Difficulty:** 🟡 Medium  
**Blocker:** No  
**Impact:** MEDIUM - Users see real deadlines with proper calculations

#### Task 3.1: Update Deadline Contexts
```
Changes needed:
☐ Update StudentDataContext to fetch deadlines from API:
   - Call deadlinesService.getUpcomingDeadlines()
   - Store in state
   - Calculate days_remaining
☐ Same for University and Admin dashboards
☐ Add filtering: sort by urgency, deadline date
☐ Add methods to track deadline interaction

Estimated time: 1 hour
```

#### Task 3.2: Update Deadline Pages
```
File: src/pages/student/DeadlinePage.tsx (and others)

Changes needed:
☐ Replace mock deadline data with context data
☐ Add pagination for deadline list
☐ Add filtering: by status (upcoming/overdue/passed)
☐ Add sorting: by deadline date, by urgency
☐ Show days_remaining calculation
☐ Show urgency_level color coding
☐ Add detail modal for deadline

Estimated time: 1.5 hours
```

**Total for Deadlines: 2.5 hours** ⏱️

---

### Priority 4: Watchlists Feature (2-3 hours)
**Difficulty:** 🟡 Medium  
**Blocker:** No  
**Impact:** MEDIUM - Users can save and retrieve admissions

#### Task 4.1: Implement Watchlist Context
```
File: src/contexts/StudentDataContext.tsx OR new WatchlistContext

Changes needed:
☐ Add state: const [watchlist, setWatchlist] = useState<Admission[]>([])
☐ On mount, fetch user's watchlist: watchlistsService.getWatchlist()
☐ Store in state
☐ Add method: addToWatchlist(admissionId)
   - Call watchlistsService.addToWatchlist(admissionId)
   - Update local state
   - Show toast success
☐ Add method: removeFromWatchlist(admissionId)
   - Call watchlistsService.removeFromWatchlist(admissionId)
   - Update local state
   - Show toast success
☐ Add method: isInWatchlist(admissionId)
   - Return boolean

Estimated time: 1 hour
```

#### Task 4.2: Update Watchlist Page
```
File: src/pages/student/WatchlistPage.tsx

Changes needed:
☐ Replace mock watchlist data with context data
☐ Show actual saved admissions
☐ Add remove button with confirmation
☐ Add notes field (if supported by backend)
☐ Add pagination
☐ Handle empty state
☐ Show no. of saved admissions

Estimated time: 1 hour
```

#### Task 4.3: Add Save Buttons to Admission Cards
```
Changes needed:
☐ Update all AdmissionCard components
☐ Add "Save to Watchlist" button
☐ Toggle button state based on isInWatchlist()
☐ Call addToWatchlist/removeFromWatchlist on click
☐ Show loading state while saving
☐ Show toast on success/error

Estimated time: 45 minutes
```

**Total for Watchlists: 2.75 hours** ⏱️

---

### Priority 5: Admissions Search & Pagination (2-3 hours)
**Difficulty:** 🟡 Medium  
**Blocker:** No  
**Impact:** MEDIUM - Users can search and filter admissions with real data

#### Task 5.1: Update Admissions List Service
```
File: src/services/admissionsService.ts

Changes needed:
☐ Implement listAdmissions(params) with:
   - page, limit, search, status, university_id, etc.
   - Return paginated response with metadata
☐ Implement getAdmission(id)
☐ Ensure type safety with AdmissionListParams type

Estimated time: 30 minutes
```

#### Task 5.2: Update Search Admissions Page
```
File: src/pages/student/SearchAdmissions.tsx

Changes needed:
☐ Replace mock data with admissionsService.listAdmissions()
☐ Implement pagination: pass page/limit params
☐ Implement search: pass search param
☐ Implement filtering: pass filter params (status, university, etc.)
☐ Show total count and pagination info
☐ Add pagination controls (prev/next/page numbers)
☐ Add loading state while fetching
☐ Add error state with retry button
☐ Update URL query params (optional: for shareable links)

Estimated time: 1.5 hours
```

#### Task 5.3: Update Compare Page
```
File: src/pages/student/ComparePage.tsx

Changes needed:
☐ Fetch full admission details for selected admissions
☐ Replace mock data with actual API response
☐ Show all fields from backend response
☐ Handle missing admissions gracefully

Estimated time: 45 minutes
```

**Total for Search & Pagination: 2.75 hours** ⏱️

**Total for Phase 2: 11 hours** ⏱️

---

## 🎯 PHASE 3: ADDITIONAL FEATURES (8-10 hours)

### Priority 6: User Profile & Preferences (2-3 hours)
**Difficulty:** 🟡 Medium  
**Blocker:** No  
**Impact:** LOW - Nice to have

#### Task 6.1: Create User Profile Page
```
File: src/pages/student/StudentProfile.tsx (NEW)

Changes needed:
☐ Create new page at /student/profile
☐ Fetch user data: usersService.getCurrentUser()
☐ Display user fields: name, email, phone, university (if uni), etc.
☐ Add edit form
☐ Submit updates: usersService.updateProfile(data)
☐ Show success/error toast
☐ Add loading state

Same for /university/profile and /admin/profile (if needed)

Estimated time: 1.5 hours
```

#### Task 6.2: Create Preferences Page
```
File: src/pages/student/PreferencesPage.tsx (NEW)

Changes needed:
☐ Create new page at /student/preferences
☐ Fetch preferences: preferencesService.getPreferences()
☐ Display preference fields (toggles, selects, etc.)
☐ Submit changes: preferencesService.updatePreferences(data)
☐ Show success/error toast
☐ Add loading state

Estimated time: 1 hour
```

**Total for User/Preferences: 2.5 hours** ⏱️

---

### Priority 7: PDF Upload Integration (2 hours)
**Difficulty:** 🟡 Medium  
**Blocker:** No  
**Impact:** MEDIUM - Universities can upload PDF for data extraction

#### Task 7.1: Create PDFUploadModal Component
```
File: src/components/university/PDFUploadModal.tsx (NEW)

Changes needed:
☐ Create modal with file input
☐ Validate file: must be PDF, < 5MB
☐ Show selected file name and size
☐ Add upload button
☐ Call admissionsService.parsePDF(file)
☐ Show upload progress
☐ Display parsed data (extracted fields)
☐ Allow user to edit extracted fields
☐ Submit button to create admission
☐ Handle errors (invalid PDF, parsing failed, etc.)

Estimated time: 1.5 hours
```

#### Task 7.2: Integrate into ManageAdmissions
```
File: src/pages/university/ManageAdmissions.tsx

Changes needed:
☐ Add "Upload PDF" button
☐ Open PDFUploadModal on click
☐ Handle returned data
☐ Pre-fill form with extracted data
☐ Allow user to verify/edit before creating

Estimated time: 30 minutes
```

**Total for PDF Upload: 2 hours** ⏱️

---

### Priority 8: Changelogs Feature (1-2 hours)
**Difficulty:** 🟡 Medium  
**Blocker:** No  
**Impact:** LOW - Admin/University audit trail

#### Task 8.1: Update Changelog Pages
```
Changes needed:
☐ Replace mock changelog data with API calls
☐ Call changelogsService.getChangelogs()
☐ Display changelog list with pagination
☐ Add filters: by admission, by user, by date range
☐ Show who made change, what changed, when
☐ Add detail view with before/after comparison
☐ Add search by admission or user

Estimated time: 1.5 hours
```

**Total for Changelogs: 1.5 hours** ⏱️

---

### Priority 9: Additional Pages (1-2 hours)
**Difficulty:** 🟡 Medium  
**Blocker:** No  
**Impact:** LOW - Nice to have pages

#### Task 9.1: Create Missing Pages
```
Missing pages to create:
☐ /admin/users - User management table
   - List all users
   - Show user details (name, email, role, university)
   - Add change role functionality
   - Add delete user functionality

☐ /student/recommendations - Detailed recommendations page
   - Fetch from GET /student/recommendations
   - Show all recommendations with scores
   - Show match reasons
   - Add to watchlist from here
   - Show scoring breakdown

Estimated time: 2 hours
```

**Total for Additional Pages: 2 hours** ⏱️

---

### Priority 10: Error Handling & Loading States (1-2 hours)
**Difficulty:** 🟢 Easy  
**Blocker:** No  
**Impact:** HIGH - Better UX

#### Task 10.1: Add Comprehensive Error Handling
```
Changes across all components:
☐ Add error state to all pages
☐ Show error message with retry button
☐ Add error boundary for crash recovery
☐ Add timeout handling (requests taking too long)
☐ Add network error detection
☐ Log errors for debugging

Estimated time: 1 hour
```

#### Task 10.2: Add Loading States
```
Changes across all components:
☐ Show skeleton loaders while fetching
☐ Show spinner for modal operations
☐ Disable buttons while loading
☐ Show "Loading..." text
☐ Prevent double-submission

Estimated time: 1 hour
```

**Total for Error Handling: 2 hours** ⏱️

**Total for Phase 3: 10 hours** ⏱️

---

## Summary & Execution Plan

### Timeline

**Week 1 (5 days):**
- **Day 1-2:** Phase 1 - Critical Dashboard Integration (2 hours)
- **Day 3-5:** Phase 2 - Core Features (11 hours)
- **Total:** 13 hours

**Week 2 (5 days):**
- **Day 1-3:** Phase 2 continued + Phase 3 start (10 hours)
- **Day 4-5:** Phase 3 continued + Testing (10 hours)
- **Total:** 20 hours

**Week 3 (3 days):**
- **Day 1-3:** Phase 3 continued + Polish (5 hours)
- **Total:** 5 hours

### Overall Priority Order

1. ✅ **DONE:** Authentication & Student Dashboard
2. 🔴 **NOW:** University Dashboard (30 min)
3. 🔴 **NOW:** Admin Dashboard (20 min)
4. 🟡 **NEXT:** Notifications (2-3 hours)
5. 🟡 **NEXT:** Deadlines (2-3 hours)
6. 🟡 **NEXT:** Watchlists (2-3 hours)
7. 🟡 **THEN:** Search & Pagination (2-3 hours)
8. 🟢 **THEN:** User/Preferences (2-3 hours)
9. 🟢 **THEN:** PDF Upload (2 hours)
10. 🟢 **THEN:** Changelogs (1-2 hours)
11. 🟢 **THEN:** Other Pages (2 hours)
12. 🟢 **FINALLY:** Error Handling (2 hours)

### Total Time Estimates

| Phase | Tasks | Hours | Priority |
|-------|-------|-------|----------|
| **Phase 1** | Dashboard Integration | 1 | 🔴 CRITICAL |
| **Phase 2** | Core Features | 11 | 🟡 HIGH |
| **Phase 3** | Additional Features | 10 | 🟢 MEDIUM |
| **Phase 4** | Polish & Testing | 5 | 🟢 LOW |
| **TOTAL** | All Phases | **27-35 hours** | - |

### Success Criteria

**After Phase 1 (Tomorrow):**
- ✅ All three dashboards load with real API data
- ✅ No 403 errors
- ✅ Navigation works for all roles

**After Phase 2 (End of Week 1):**
- ✅ Notifications working
- ✅ Deadlines working
- ✅ Watchlists working
- ✅ Search with pagination working

**After Phase 3 (End of Week 2):**
- ✅ User profiles working
- ✅ Preferences working
- ✅ PDF upload working
- ✅ Changelogs working

**After Phase 4 (End of Week 3):**
- ✅ Comprehensive error handling
- ✅ Loading states everywhere
- ✅ No console errors
- ✅ Ready for production

---

## Notes

- **Testing:** Test each feature with real backend after completion
- **Mock Data Fallback:** Keep mock data as fallback for development
- **Error Messages:** Show user-friendly messages, log detailed errors
- **Loading States:** Always show something while fetching
- **Code Quality:** Follow existing patterns and SOLID principles
- **Type Safety:** Keep TypeScript strict mode happy
- **Git Commits:** Commit after each priority completes

---

**Prepared:** January 27, 2026  
**Status:** Ready for implementation  
**Next Step:** Start with Priority 1 (30 min task)
