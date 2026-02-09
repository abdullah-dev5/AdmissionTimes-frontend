# Admin Module Implementation Plan

Date: 2026-02-09
Scope: Admin module integration, mock data replacement, and backend alignment

## 1) Current State (What Exists)

### UI Pages (Frontend)
- Admin Dashboard: src/pages/admin/AdminDashboard.tsx
- Verification Center: src/pages/admin/AdminVerificationCenter.tsx
- Change Logs: src/pages/admin/AdminChangeLogs.tsx
- Notifications Center: src/pages/admin/AdminNotificationsCenter.tsx
- Analytics: src/pages/admin/AdminAnalytics.tsx
  - Note: Scraper Jobs page exists but is future scope only.

### Mock Data (Frontend)
File: src/data/adminData.ts
- systemMetrics
- pendingVerifications
- recentAdminActions
- adminNotifications
- analyticsEvents
- verificationItems
- adminChangeLogs
  - Note: Scraper mocks exist but are future scope only.

## 2) Backend Coverage (What Exists)

### Dashboard
- GET /api/v1/admin/dashboard
  - stats: pending_verifications, total_admissions, total_universities, total_students, recent_actions
  - pending_verifications, recent_actions
  - Note: Ignore scraper fields for now (future scope).

### Admissions (Admin)
- POST /api/v1/admin/admissions/:id/verify
  - Body: verification_status = verified|rejected
  - Include rejection_reason for rejected
- DELETE /api/v1/admin/admissions/:id

### Changelogs
- GET /api/v1/changelogs
- GET /api/v1/admissions/:id/changelogs

### Analytics
- GET /api/v1/analytics/user-activity
- GET /api/v1/analytics/stats

### Notifications
- GET /api/v1/notifications
- PATCH /api/v1/notifications/:id/read
- PATCH /api/v1/notifications/read-all

## 3) Backend Gaps

- No dedicated admin list endpoint for admissions with verification_status filtering.
- No standard admin payload that includes university metadata for admissions/verification rows.
- Admin dashboard stats do not expose total_users or total_alerts_sent.
- Notifications endpoint lacks an explicit admin filter in the contract.
- Analytics endpoints may be missing query filters for date ranges and event/user types.

## 4) Supabase Tables Already Present (Admin-Relevant)

From docs and architecture references, the following tables are already in scope:
- users (roles include admin; ties to universities via organization_id)
- universities (metadata, active status)
- admissions (verification_status, university_id, timestamps)
- notifications (user_id, read, created_at)
- change_logs (audit trail for admission edits)
- verification_logs (if present; admin verification history)
- watchlists
- deadlines
- analytics/preferences (two additional tables referenced in architecture)

Admin screens should primarily read from admissions, change_logs, notifications, and users/universities joins.

## 5) Data Contract Decisions Needed

Option A (Frontend adapts):
- totalUsers = total_students + total_universities
- totalAlertsSent removed from UI or replaced by analytics.stats.events

Option B (Backend adds):
- stats.total_users
- stats.total_alerts_sent

## 6) Backend Changes Needed (Detailed)

### Admin Dashboard
- Ensure stats include all counts used in UI: pending_verifications, total_admissions, total_universities, total_students.
- Decide on total_users and total_alerts_sent (add fields or compute client-side).
- Include recent_actions with actor name and timestamp (avoid raw IDs).

### Verification Center
- Add admin admissions list endpoint (or extend /api/v1/admissions) to filter by verification_status=pending.
- Include university name, degree level, and last updated fields in list response.
- Verify/reject should return updated admission and a new change_log entry.

### Change Logs
- Ensure /api/v1/changelogs returns changed_by display name, changed_at, field name, old_value/new_value, and optional diff_json.
- Add pagination (limit/offset or page/pageSize) for admin use.

### Notifications
- Add admin role filter: /api/v1/notifications?user_type=admin or role=admin.
- Ensure read/unread fields are consistent with frontend expectations.

### Analytics
- Support query params: event_type, user_type, date_from, date_to.
- Add stats response for totals if UI expects summary cards.

## 7) Frontend Changes Needed (Detailed)

### Admin Dashboard
- Replace systemMetrics, pendingVerifications, recentAdminActions mocks with /api/v1/admin/dashboard.
- Normalize counts and provide safe defaults for empty data.

### Verification Center
- Replace verificationItems mock with admin admissions list endpoint.
- Wire verify/reject action to /api/v1/admin/admissions/:id/verify.
- Render university name and human-readable dates.

### Change Logs
- Replace adminChangeLogs mock with /api/v1/changelogs.
- Map old_value/new_value into diff viewer with JSON formatting fallback.

### Notifications Center
- Replace adminNotifications mock with /api/v1/notifications?user_type=admin.
- Wire mark read/mark all to backend and update local state.

### Analytics
- Replace analyticsEvents mock with /api/v1/analytics/user-activity.
- Support filter UI to query params.

## 8) Implementation Plan

### Phase 0: Data contract cleanup (1-2 hours)
- Align AdminDashboard stats mapping with backend fields.
- Update UI card labels if needed.

### Phase 1: Admin Dashboard (3-4 hours)
- Use /api/v1/admin/dashboard as primary source.
- Map pending_verifications and recent_actions to UI.
- Remove mock fallback once stable.

### Phase 2: Verification Center (4-6 hours)
- Replace verificationItems mock with /api/v1/admissions?verification_status=pending (admin).
- Wire verify/reject actions to /api/v1/admin/admissions/:id/verify.
- Fetch admission details via /api/v1/admissions/:id for modal metadata.

### Phase 3: Change Logs (3-5 hours)
- Replace adminChangeLogs mock with /api/v1/changelogs.
- Map changed_by, changed_at, old_value, new_value to diff UI.
- Add filters via query params if supported; else client filter.

### Phase 4: Notifications Center (2-3 hours)
- Replace adminNotifications mock with /api/v1/notifications?user_type=admin.
- Wire mark read and mark all to backend endpoints.
- Compute timeAgo client-side from created_at.

### Phase 5: Admin Analytics (3-5 hours)
- Replace analyticsEvents mock with /api/v1/analytics/user-activity.
- Add stats (optional) via /api/v1/analytics/stats.
- Map filters to query params: event_type, user_type, date_from, date_to.

## 9) Suggested Order of Work

1. Admin Dashboard API wiring
2. Verification Center API wiring
3. Notifications Center API wiring
4. Change Logs API wiring
5. Admin Analytics API wiring
6. Scraper Jobs (future scope only)

## 10) Validation Checklist

- No hardcoded mock data in admin UI pages.
- All API calls return data with correct shapes.
- Verify/Reject actions update admission status.
- Notifications read state updates correctly.
- Change logs display without JSON dump.
- Analytics filters match backend query params.

## 11) Files to Update

- src/pages/admin/AdminDashboard.tsx
- src/pages/admin/AdminVerificationCenter.tsx
- src/pages/admin/AdminNotificationsCenter.tsx
- src/pages/admin/AdminChangeLogs.tsx
- src/pages/admin/AdminAnalytics.tsx
- src/pages/admin/AdminScraperJobsMonitor.tsx (future scope only)
- src/services (add admin services if needed)
- src/types/api.ts (align admin types)
