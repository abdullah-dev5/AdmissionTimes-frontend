# Project Overview

- Date: 2026-02-09
- Status: Frontend and backend APIs aligned

## Vision

AdmissionTimes streamlines admissions discovery for students and admissions management for universities and admins.

## Current State

- JWT auth integrated across frontend and backend.
- Admissions, deadlines, analytics, watchlists, notifications, and users are API-aligned.
- Soft delete and admin verification flows are supported in the backend.

## Modules

### Student
- Dashboard, search, watchlists, deadlines, notifications.

### University
- Admissions CRUD, verification workflows, dashboards.

### Admin
- Verification, analytics, system monitoring.

## Architecture

- React + TypeScript frontend with service + context pattern.
- Express + TypeScript backend with domain-driven architecture.
- PostgreSQL + Supabase Auth for JWT.

