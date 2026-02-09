# AdmissionTimes Frontend Developer Guide
**Last Updated:** February 9, 2026

---

## Quick Start (5 minutes)

```bash
cd e:\fyp\admission-times-frontend
pnpm install
pnpm dev
```

Open http://localhost:5173 and sign in.

---

## Essential Docs

1. [README.md](../README.md)
2. [FRONTEND_BACKEND_GAP_REPORT.md](FRONTEND_BACKEND_GAP_REPORT.md)
3. [QUICK_REFERENCE_GUIDE.md](QUICK_REFERENCE_GUIDE.md)
4. [project-docs/index.md](../project-docs/index.md)

---

## Development Workflow

1. Add or update a service method in `src/services/*`.
2. Wire it into the relevant context in `src/contexts/*`.
3. Use the data in a page under `src/pages/*`.
4. Verify requests in DevTools and check console for errors.

---

## Key Conventions

- Use backend APIs for data mutations and complex workflows.
- Supabase direct reads are limited to Phase 1 performance shortcuts.
- Always include `Authorization: Bearer <jwt>` for `/api/v1/*` calls.

---

## Common Issues

- **403 Forbidden:** confirm auth headers and role-based routing.
- **Missing data:** verify service method and context wiring.
- **Type errors:** check `src/types/api.ts` alignment.

---

## Useful Links

- Backend API docs: http://localhost:3000/api-docs
- Frontend entry: `src/main.tsx`
- Routing: `src/Router/*`

