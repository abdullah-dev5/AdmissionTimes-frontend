# Frontend-Backend Alignment Report

**Date:** 2026-02-09  
**Scope:** Frontend (React web) vs Backend (Express) API alignment, student/university/admin modules  
**Backend Repo:** e:\fyp\admission-times-backend  
**Frontend Repo:** e:\fyp\admission-times-frontend

---

## 1) Executive Summary

- **Alignment is complete** for admissions, deadlines, analytics, watchlists, notifications, and users.
- **Alias routes were added** to preserve frontend compatibility without breaking existing clients.
- **Soft delete and admin verification workflows** now exist in the backend to match frontend flows.
- **Remaining note:** `/activity/me` is still not a backend route; mobile should use `/activity` filters until added.

---

## 2) Alignment Status

| Area | Status | Notes |
|---|---|---|
| Admissions | ✅ Aligned | Admin alias routes and soft delete implemented |
| Deadlines | ✅ Aligned | `/deadlines/upcoming` and `/deadlines/urgent` available |
| Analytics | ✅ Aligned | Alias routes and canonical routes supported |
| Watchlists | ✅ Aligned | Convenience endpoints added |
| Notifications | ✅ Aligned | Read, read-all, unread-count confirmed |
| Users | ✅ Aligned | Profile endpoints confirmed |
| Activity | 🟡 Partial | `/activity/me` still missing |

---

## 3) Applied Fixes

### 3.1 Admissions
- Added admin alias routes: `GET /admin/admissions`, `GET /admin/admissions/:id`, `POST /admin/admissions/:id/verify`, `DELETE /admin/admissions/:id`.
- Added soft delete: `DELETE /admissions/:id` and `DELETE /university/admissions/:id`.
- Added admin verify alias handler that accepts `verified` or `rejected` in one endpoint.

### 3.2 Deadlines
- Added `GET /deadlines/urgent` for the frontend urgent view.
- Verified `GET /deadlines/upcoming` for upcoming deadlines.

### 3.3 Analytics
- Backend supports alias routes: `/analytics/user-activity`, `/analytics/system-metrics`, `/analytics/admission-stats`.
- Frontend uses canonical routes for stats and admissions.

### 3.4 Watchlists
- Added convenience endpoints: `PATCH /watchlists/:id/toggle-alert` and `DELETE /watchlists/admission/:admissionId`.

---

## 4) Remaining Gaps

1. **Activity alias:** `GET /activity/me` is not implemented. Use `/activity` with user context or add alias.
2. **Mobile guidance:** mobile clients should use backend APIs only (avoid direct Supabase calls).

---

## 5) Mobile Readiness

- Use the same JWT and base URL as the web frontend.
- Send `Authorization: Bearer <jwt>` for all `/api/v1/*` routes.
- Avoid direct Supabase calls in mobile clients.

---

## 6) Key Files

### Backend
- `src/domain/index.ts`
- `src/domain/admissions/routes/admin-admissions.routes.ts`
- `src/domain/admissions/routes/university-admissions.routes.ts`
- `src/domain/deadlines/routes/deadlines.routes.ts`
- `src/domain/analytics/routes/analytics.routes.ts`
- `src/domain/watchlists/routes/watchlists.routes.ts`
- `src/domain/notifications/routes/notifications.routes.ts`

### Frontend
- `src/services/admissionsService.ts`
- `src/services/deadlinesService.ts`
- `src/services/analyticsService.ts`
- `src/services/watchlistsService.ts`
- `src/services/notificationsService.ts`
- `src/services/usersService.ts`

---

## 11) Final Recommendation

Use the **same backend APIs for mobile** but **normalize the naming and enums**. The simplest and safest route is to **standardize the client on backend endpoints** and avoid Supabase direct reads in mobile.

If you want, I can also:
- Generate a backend patch list for missing endpoints
- Create a mobile-ready API adapter layer for React Native
- Produce a mapping table between web frontend services and backend endpoints
