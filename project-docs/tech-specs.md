# Technical Specifications

- Date: 2026-02-09

## Tech Stack

- React + TypeScript + Vite
- React Router
- Tailwind CSS
- Supabase Auth (JWT)
- Express + TypeScript backend
- PostgreSQL

## Auth and Identity

- JWT issued by Supabase.
- Backend maps Supabase UUID to internal user context.
- `Authorization: Bearer <jwt>` required for `/api/v1/*`.

## Frontend Architecture

- Service layer in `src/services/*`.
- Context providers in `src/contexts/*`.
- Pages in `src/pages/*`.

## Backend Alignment Notes

- Admissions admin/university alias routes registered.
- Deadlines urgent endpoint available.
- Analytics alias routes available.



