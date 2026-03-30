# Frontend-Backend Gap Analysis (Web)

Date: 2026-03-30
Scope: `admission-times-frontend` integration surface against backend contracts

## Executive Summary

Core integration is functional, but there are contract and documentation risks that can cause regressions during multi-repo updates.

## Confirmed Strengths

- Frontend service layer is consistently centralized in `src/services`.
- Main student and university data paths are backend-driven.
- Preferences endpoint is already wired in frontend services.

## Gaps

1. Preference contract drift risk
- Frontend supports preference updates, but backend docs historically exposed unsupported `email_frequency` values.
- Impact: UI/API assumptions may diverge unless Swagger is aligned.

2. Change log route naming risk
- Frontend uses `/change-logs` endpoints.
- Backend historically documents `/changelogs` in some places.
- Impact: alias removal would break university/admin pages.

3. Documentation staleness
- Previous docs referenced missing files and outdated stacks.
- Impact: onboarding and maintenance cost increases.

4. Category-level preference UX depth
- Backend supports category-level preferences.
- Frontend UX still mostly channel-level toggles.
- Impact: incomplete control exposure for users.

## Recommended Alignment Actions

1. Keep Swagger and route docs synchronized with runtime validators.
2. Preserve route aliases or migrate frontend consumers in lockstep.
3. Treat `src/services` as contract change detection points in review.
4. Add explicit category preference controls in student settings UX.

## Validation Checklist

- `pnpm build` passes.
- Preference update calls succeed for PUT/PATCH.
- Change-log views resolve data with current backend routes.
- Notification flows still update unread counts and list state.
