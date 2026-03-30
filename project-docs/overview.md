# Frontend Overview

## Goal

Provide a role-aware web interface for three personas:

- Student: discovery, tracking, notifications, recommendations, AI guidance
- University: admissions lifecycle and verification feedback
- Admin: verification, operations, and analytics views

## Implementation Shape

- UI: React 19 + TypeScript + Vite
- Routing: React Router 7
- State: Context + Zustand stores
- API integration: centralized Axios client and service modules
- Auth/session: Supabase session with backend user identity hydration

## Current Reality

- Frontend is backend-driven for primary business flows.
- Service layer endpoints are defined in `src/services/*`.
- AI chat support is wired through `/ai/*` backend endpoints.
- Notification and preference controls exist, with category-level UX still partial.

## Design Rules

- Keep all backend calls inside services, not directly in page components.
- Keep role gating in route and auth-store logic.
- Prefer typed transformers for backend payload normalization.

## Alignment References

- Requirements and contract expectations: [requirements.md](requirements.md)
- Concrete gap report: [frontend-backend-gap-analysis.md](frontend-backend-gap-analysis.md)

Updated: 2026-03-30

