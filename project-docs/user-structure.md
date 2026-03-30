# User Structure and Flow (Frontend)

## Roles

- student
- university
- admin

## Shared Entry Flow

1. User opens app.
2. Auth bootstrap restores Supabase session.
3. Frontend calls `GET /auth/me`.
4. Router redirects to role-specific area.

## Student Flow

1. Open dashboard (`/student/dashboard`).
2. Explore admissions search/list.
3. Save to watchlist and enable alert toggles.
4. Check deadlines and notifications.
5. Use recommendations and AI helper.

## University Flow

1. Open university dashboard.
2. Create/update admissions.
3. Submit records for verification.
4. Review verification and change-log feedback.

## Admin Flow

1. Open admin dashboard.
2. Review pending admissions.
3. Verify or request revisions.
4. Monitor analytics and operational notifications.

## Frontend Enforcement Points

- Route-level constraints in router setup.
- Store/state role guards in auth and role stores.
- Service-layer endpoint segregation by role.

Updated: 2026-03-30
