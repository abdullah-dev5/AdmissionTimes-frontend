# Student Module (Frontend)

## Scope

Student-facing web flows implemented in the frontend:

- Dashboard
- Search and filtering
- Program detail
- Watchlist
- Compare
- Deadlines
- Notifications
- Recommendations
- AI assistant

## Main Client Modules

- Pages: `src/pages/student/*`
- Data hooks: `src/hooks/useStudentDashboardData.ts`
- Store: `src/store/studentStore.ts`
- Services: admissions, watchlists, deadlines, notifications, recommendations, ai

## Backend Endpoints Used

- `GET /student/dashboard`
- `GET /admissions`
- `GET /admissions/:id`
- `GET/POST/PATCH/DELETE /watchlists*`
- `GET /deadlines`, `GET /deadlines/upcoming`, `GET /deadlines/urgent`
- `GET/PATCH /notifications*`
- `GET/POST /recommendations*`
- `POST /ai/chat`, `GET /ai/health`

## Consistency Rules

- Use service layer only for backend calls.
- Use store/context helpers for optimistic updates.
- Keep admission IDs as the shared identity across search, watchlist, compare, and detail views.
- Keep notification unread state synchronized from backend responses.

## Known Gaps

- Preference category controls are not fully exposed for all student preference dimensions.
- Contract drift risk remains if backend aliases are changed without frontend updates.

Updated: 2026-03-30
