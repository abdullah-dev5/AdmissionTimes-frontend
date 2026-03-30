# Frontend Requirements

## Functional Requirements

1. Authentication and identity
- Sign in and sign up via Supabase-backed auth.
- Resolve backend identity using `/auth/me` after session recovery.

2. Student flows
- Dashboard, search, detail, watchlist, deadlines, notifications, compare, recommendations.
- AI assistant access with role/context payload.

3. University flows
- Admissions management and verification-related pages.
- Change-log and notification center views.

4. Admin flows
- Pending verification queue and decision workflows.
- Dashboard and operational analytics.

5. Preferences and alerts
- User preference updates using `/users/me/preferences`.
- Toggle channels and categories without breaking other preferences.

## Non-Functional Requirements

- Type-safe API integration and DTO transformation.
- Route-level role protection.
- Consistent toast/dialog UX patterns.
- Responsive behavior across desktop/tablet/mobile web.

## Contract Expectations

- API path assumptions in `src/services` must match backend route aliases.
- Unsupported enum values must not be surfaced in UI docs.
- PUT/PATCH semantics for preferences must be clearly documented.

## Known Risk Areas

- Change logs route naming differences (`/change-logs` vs `/changelogs`) require backend alias certainty.
- Preference category partial updates require merge-safe backend behavior.

Updated: 2026-03-30



