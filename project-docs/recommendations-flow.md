# Recommendations Generation Flow (Frontend)

Last updated: 2026-04-12

## Scope

This document explains how recommendations are generated and shown in the frontend.

- Primary path: backend-generated recommendations shown on student dashboard.
- Secondary path: local heuristic fallback when backend recommendations are unavailable.
- Additional UI path: watchlist page uses a local highlight list (not backend `/recommendations`).

## Main Flow (Student Dashboard)

1. Dashboard loads admissions data via `useStudentDashboardData`.
2. A separate effect in `StudentDashboard` calls `recommendationsService.getRecommendations(10, 50)`.
3. Frontend sends `GET /recommendations?limit=10&min_score=50`.
4. Backend returns recommendation rows with `score`, `reason`, timestamps, and optional nested `admission`.
5. Frontend maps each recommendation:
   - If admission already exists in local admissions map, enrich that record with API `score` and `reason`.
   - If missing, build a fallback admission model using `transformAdmission(...)`.
6. Result is stored in local page state as `apiRecommendedPrograms`.
7. UI and stats prefer `apiRecommendedPrograms`; if empty, they fall back to local heuristics.

## Frontend Rules Used

- Minimum score threshold: `RECOMMENDATION_MIN_SCORE = 50`.
- Cooldown: recommendations request is skipped if same user requested in the last 60 seconds.
- Fallback list (dashboard):
  - First choice: admissions with `matchNumeric >= 50`, sorted descending, top 10.
  - Secondary choice: active admissions (`daysRemaining >= 0`) sorted by nearest deadline, top 10.
- Stats recommendation count:
  - Uses API-mapped list when available.
  - Otherwise uses admissions list filtered by `matchNumeric >= 50` and not expired (`daysRemaining >= 0`).

## Watchlist Page Behavior

Watchlist has its own local "AI Recommendations" carousel. It is not calling `/recommendations`.

- Source: current admissions list in store.
- Filter: unsaved programs with `matchNumeric >= 80`.
- Sort: highest `matchNumeric` first.
- Limit: top 6.

## Where "Generation" Actually Happens

- The frontend does not run the recommendation algorithm.
- Generation/scoring is backend-side and exposed through `/recommendations` endpoints.
- Frontend responsibility is to request, map, and render recommendation results.

## Scheduler And Retention (Verified)

Backend scheduler currently runs:

- Recommendation generation at `0 2 * * *` (daily 2:00 AM).
- Recommendation cleanup at `0 3 * * *` (daily 3:00 AM).

This does not imply 1-hour recommendation lifetime.

- Recommendation rows are written with `expires_at = now + 7 days` by default.
- Cleanup only deletes records where `expires_at <= NOW()`.
- Recommendation API can also generate on-demand if no active rows exist for a user.

## Related Endpoints (Consumed by Frontend)

- `GET /recommendations` - fetch personalized recommendations.
- `POST /recommendations/refresh` - force regeneration.
- `GET /recommendations/count` - fetch active count.

## Key Source Files

- `src/pages/student/StudentDashboard.tsx`
- `src/services/recommendationsService.ts`
- `src/hooks/useStudentDashboardData.ts`
- `src/store/studentStore.ts`
- `src/utils/transformers.ts`
- `src/pages/student/WatchlistPage.tsx`
- `src/services/adminService.ts`
