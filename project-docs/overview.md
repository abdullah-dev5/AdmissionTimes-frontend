# Project Overview

- Date: 2025-11-20

## Vision
AdmissionTimes streamlines university admissions discovery and management for students and university representatives.

## Module: Student
The student portal now runs entirely on a shared mock data context so users can save programs, toggle alerts, compare up to four admissions, and monitor notifications/deadlines without a backend. All student pages (dashboard, search, watchlist, compare, deadlines, notifications) read/write through the same provider to keep selections, alerts, and clipboard actions in sync.

## Module: University
University representatives can publish, monitor, and verify admissions. Management flows (dashboard, manage admissions, verification center, change logs, notifications) share a common mock store so edits, status changes, and log updates propagate instantly. The Verification Center page maintains visibility into audit statuses for uploaded admissions.

## Module: Admin
The Admin Dashboard provides system administrators with a high-level overview of the platform. The dashboard displays pending verifications requiring admin review, recent admin actions (verified/rejected/disputed admissions), latest system notifications, and recent scraper activity. All sections link to their respective detail pages for full management capabilities.

## Objectives
- Provide consistent state handling across student and university modules using dedicated React contexts.
- Ensure mock operations (save, compare, toggle alerts, publish, edit, delete) feel production-ready before API integration.
- Keep verification and logging workflows transparent with field-level diffs and audit trails.
- Enable administrators to efficiently monitor and manage system-wide verification tasks and activities.
