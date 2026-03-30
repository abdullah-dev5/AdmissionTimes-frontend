# Frontend Technical Specs

## Runtime and Build

- Node.js: 18+
- Package manager: pnpm
- Build tooling: Vite 7 + TypeScript 5 project references

## Core Dependencies

- React 19 (`react`, `react-dom`)
- React Router 7 (`react-router-dom`)
- Zustand 5
- Axios 1.x
- Supabase JS 2.x
- Tailwind CSS 4 + `@tailwindcss/vite`
- SweetAlert2

## Architecture

- API client: `src/services/apiClient.ts`
- Domain services: `src/services/*.ts`
- Auth state: `src/store/authStore.ts`
- Role/domain stores: `src/store/studentStore.ts`, `src/store/universityStore.ts`
- Context providers: `src/contexts/*`
- Route mapping: `src/Router/router.tsx`

## API Contract Baseline

- Backend prefix expected by client: `/api/v1`
- Student dashboard: `/student/dashboard`
- Notifications: `/notifications/*`
- Preferences: `/users/me/preferences`
- Watchlist: `/watchlists/*`
- Recommendations: `/recommendations/*`

## Quality Gate

- Compile/build success via `pnpm build`
- Lint via `pnpm lint`

Updated: 2026-03-30



