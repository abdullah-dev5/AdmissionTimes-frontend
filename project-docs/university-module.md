# University Module (Frontend)

## Scope

University representative web flows:

- University dashboard
- Manage admissions
- Verification center
- Change logs
- Notifications center
- AI assistant support on university pages

## Main Client Modules

- Pages: `src/pages/university/*`
- Layout: `src/layouts/UniversityLayout.tsx`
- Store: `src/store/universityStore.ts`
- Services: admissions, dashboard, changelogs, notifications, ai

## Backend Endpoints Used

- `GET /university/dashboard`
- `GET /university/admissions`
- `POST /university/admissions`
- `PUT /university/admissions/:id`
- `DELETE /university/admissions/:id`
- `POST /university/admissions/:id/request-verification`
- `GET /change-logs*` (alias-sensitive)
- `GET/PATCH /notifications*`
- `POST /ai/chat`, `GET /ai/health`

## Operational Notes

- Verification lifecycle UI depends on backend status fields and aliases.
- Change log path naming must stay backward compatible to avoid broken screens.
- University flows should not bypass centralized admission services.

Updated: 2026-03-30
