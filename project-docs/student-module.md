# Student Module — User Stories & Technical Flows (V1)

- **Date:** 2026-02-18  
- **Source Inputs:** SRS v1.5, SDS v1.4, Database Schema v5.0, finalized UI flows (Figma `Student-V1`)  
- **Scope:** All student-facing surfaces (Dashboard, Search, Admission Detail, Watchlist, Compare, Deadlines, Notifications, AI Assistant, Recommendations, Profile).  
- **Data Consistency Layer:** `StudentDataContext` (front-end) mirrors API contract described below; all UI mutations must call the context helpers so state stays identical across pages and matches backend responses once APIs arrive.

---

## 0. Shared Technical Foundations

### 0.1 Core Entities & Tables (DB v5)
| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `Admissions` | `id`, `university_id`, `title`, `program`, `degree_type`, `deadline`, `fee`, `status`, `ai_summary`, `attachments` | Canonical admissions catalog |
| `Universities` | `id`, `name`, `city`, `metadata` | Reference data for admissions |
| `Watchlists` | `id`, `student_id`, `admission_id`, `saved_at`, `alert_opt_in`, `notes` | Saved admissions per student |
| `Alerts_Notifications` | `id`, `student_id`, `type`, `payload`, `status`, `scheduled_at`, `sent_at` | Deadline & system alerts |
| `Recommendations` | `id`, `student_id`, `admission_id`, `score`, `reason`, `generated_at` | AI/ML recommendations |
| `Change_Log` | `id`, `admission_id`, `field`, `old_value`, `new_value`, `changed_at`, `trigger` | Basis for “Admission Updated” alerts |
| `Student_Profile` | `id`, `user_id`, `preferences`, `last_login`, `search_history` | Profile + personalization seed |

### 0.2 API Contracts (v1)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/student/dashboard` | GET | Aggregated snapshot (watchlist, alerts, recommendations, upcoming deadlines, compare tray) |
| `/api/admissions/search` | GET | Search + filters (supports pagination, TSVector search, caching) |
| `/api/admissions/:id` | GET | Detailed admission with verification metadata |
| `/api/watchlist` | POST/DELETE | Save or remove admissions, auto-provision alerts |
| `/api/watchlist` | GET | List saved admissions (used by watchlist, compare, deadlines) |
| `/api/student/deadlines` | GET | Derived deadlines with countdown buckets |
| `/api/student/notifications` | GET/PATCH | In-app notifications, mark read/all read |
| `/api/compare` | POST (optional) | Server-side snapshot for export; client uses `/api/admissions/:id` for inline compare |
| `/api/student/recommendations` | GET | Personalized recommendations |
| `/api/ai/query` | POST | AI assistant endpoint (role=student, context payload) |
| `/api/student/profile` | GET/PATCH | Update profile & preferences |

### 0.3 Front-End Consistency Rules
1. **Single Source of Truth:** The StudentDataContext hydrates from `/api/student/dashboard` + page-specific endpoints. All pages must mutate context via provided helpers (`toggleSaved`, `toggleAlert`, `updateAdmission`, etc.) to keep Watchlist, Compare, Dashboard, and Deadlines synchronized.  
2. **Navigation Contracts:** Clicking any admission card anywhere routes to `/program/:id` which calls `getAdmissionById` (context) and lazily fetches `/api/admissions/:id` for detailed fields (overview, attachments). No page should directly read `mockPrograms`.  
3. **ID Integrity:** UI selections (`compareIds`, `alertEnabled`) must use admission IDs; no array indexes.  
4. **Optimistic Updates:** Save/remove watchlist, toggle alerts, mark notifications as read all update context immediately and then await API confirmation. On failure, context rolls back + toast shows error.  
5. **Background Jobs:** Deadline alerts (T-7/T-3/T-1) and recommendations rely on scheduler output; UI should never attempt to compute them beyond display formatting.

---

## 1. EPIC — Student Dashboard
### US-01 View Personalized Dashboard
- **Functional:** On load, render hero CTA, stats (Active, Saved, Upcoming Deadlines, Recommendations), recommended cards, upcoming deadlines sidebar, recent activity.
- **Technical Flow:**
  1. `GET /api/student/dashboard` returns JSON aggregate:
      ```json
      {
        "watchlist": [...],
        "alerts_unread": 3,
        "recommendations": [...],
        "upcoming_deadlines": [...],
        "recent_activity": [...],
        "compare_tray": ["adm-1","adm-5"]
      }
      ```
  2. Context splits payload into memoized selectors (counts, urgent deadlines).  
  3. Stats cards reference selectors; recommended tiles deep link to `/program/:id`.  
  4. No writes; errors show skeleton + retry CTA.

### Data Consistency Notes
- Watchlist count = `context.savedAdmissions.length`.  
- Urgent deadlines = admissions with `daysRemaining ≤ 7`.  
- Notifications badge uses `context.notifications.filter(n => !n.read).length`.

---

## 2. EPIC — Search & Filter Admissions
### US-02 Keyword Search
- **Functional:** Debounced search box hits backend, shows results list/grid, highlight terms.
- **Technical:** `GET /api/admissions/search?q=term&page=1&limit=24`. Backend uses TSVector index on (title, program, ai_summary). Response cached 60s.

### US-03 Advanced Filters
- **Functional:** Filters (university, city, degree, fee range, deadline range, status) combine with keyword search.
- **Technical:**
  - Endpoint adds query params (`degree=BS&city=Lahore&fee_min=50000&fee_max=150000&deadline_to=2025-02-01`).
  - Backend builds dynamic SQL with sanitized clauses + indexes on `degree_type`, `city`, `deadline`.  
  - Results include `saved` flag (join with Watchlists) so list shows stateful Save buttons.  
  - UI merges response into context (update admission objects so other pages reflect latest data).

### Data Consistency
- Save/unsave inside search page must call `toggleSaved(id)` to sync watchlist + dashboard immediately.  
- Compare tray persisted in context; search page uses same array as dashboard header.

---

## 3. EPIC — Admission Detail
### US-04 View Detailed Admission
- **Functional:** Show full details, AI summary, attachments, verification badge, CTAs (Save, Compare, Alert).
- **Technical Flow:**
  1. Route `/program/:id` -> context lookup. If not hydrated, fetch `/api/admissions/:id`.  
  2. Response shape merges `Admission`, `University`, `Verification_Log.latest`, `Attachments`.  
  3. UI renders sections + ensures Save/Alert buttons wire to context helpers.  
  4. If admission not found => 404 page.

### Data Consistency
- `ProgramDetail` uses same context object; Save/Remove updates watchlist instantly (no double data sources).  
- Set Alert toggles `alertEnabled` flag stored per watchlist row.

---

## 4. EPIC — Watchlist / Save Admissions
### US-05 Save Admission
- **Functional:** Add admission to watchlist, auto-enable alerts (T-7/T-3/T-1).  
- **Technical Flow:**
  1. UI calls `toggleSaved(id, true)` -> optimistic add to context.  
  2. API `POST /api/watchlist` body `{ admission_id, alert_opt_in: true }`.  
  3. Backend inserts into `Watchlists`, schedules alerts in `Alerts_Notifications` (one row per trigger).  
  4. Response returns watchlist entry; context ensures dedupe.

### US-06 Remove Admission
- `DELETE /api/watchlist/:id` removes row + cancels pending alerts. Context removes admission + clears compare selection.

### Data Consistency
- Watchlist page, Dashboard saved count, Compare page, Deadlines page all read from `context.savedAdmissions`; no separate fetches.  
- Removing an item auto-clears associated compare checkboxes and alert toggles.

---

## 5. EPIC — Compare Admissions
### US-07 Compare Multiple Admissions
- **Functional:** Select 2–4 saved admissions, view side-by-side matrix, highlight cheapest/earliest/best match, copy link/share.  
- **Technical Flow:**
  1. Selected IDs stored in context (`compareIds`).  
  2. Compare page resolves `getAdmissionsByIds(compareIds)` to build cards.  
  3. Optional server snapshot: `POST /api/compare` with IDs returns normalized data for PDF export (future).  
  4. Share button copies `/student/compare?ids=1,2,4`.  
  5. Save/discard uses context to keep dashboard tray synced.

### Data Consistency
- Compare always reads from same admission objects so updates (e.g., deadline change) reflect immediately.  
- URL param parsing ensures reloading page rebuilds compare selection and updates context.

---

## 6. EPIC — Deadline Tracker
### US-08 View Upcoming Deadlines
- **Functional:** Timeline view grouped by urgency, Calendar view with colored dots, ability to toggle alerts per admission.  
- **Technical Flow:**
  1. `GET /api/student/deadlines` returns watchlist rows with `days_remaining`, `alert_opt_in`.  
  2. Context merges into admissions to keep `alertEnabled` consistent.  
  3. Calendar component highlights urgent dates; clicking date filters list (client-side).  
  4. Toggle alert calls `PATCH /api/watchlist/:id` or reuse `/api/watchlist` with `alert_opt_in` state.  
  5. Attempting to toggle alert on unsaved admission prompts Save first.

### Data Consistency
- `alertEnabled` boolean lives in context; toggling anywhere (watchlist, deadlines, detail page) updates same object.  
- Dashboard urgent count uses same derived list, preventing mismatched numbers.

---

## 7. EPIC — Alerts & Notifications
### US-09 Receive Alerts & Manage Notifications
- **Functional:** See unread badge, filter notifications by type (alert/system/admission), mark individual or all as read, deep link to admission detail.  
- **Technical Flow:**
  1. Scheduler creates alert rows (deadline, admission update). Notification service dispatches email/push + writes to `Alerts_Notifications`.  
  2. UI fetch `GET /api/student/notifications`. Response includes `read` flag, CTA target, icon metadata.  
  3. `PATCH /api/student/notifications/:id` marks read; `PATCH .../mark-all` for bulk. Context updates counts instantly.  
  4. Clicking `View Admission` navigates to `/program/:id`, and `handleNotificationClick` ensures notification is marked read before routing.

### Data Consistency
- Sidebar/header badge uses `context.notifications`. Dashboard recent activity reuses same list filtered by time.  
- Mark-as-read anywhere reflects everywhere without extra fetch.

---

## 8. EPIC — AI Assistant
### US-10 Ask AI for Guidance
- **Functional:** Floating widget answers queries, provides quick chips, sets context-aware suggestions (saved programs, deadlines).  
- **Technical Flow:**
  1. `POST /api/ai/query` body: `{ query, role: "student", context: { watchlistIds, recentSearches, compareIds } }`.  
  2. AI service routes through orchestration layer (Gemini / local mock).  
  3. Response structure: `{ response_text, suggested_actions: [{ label, type, payload }] }`.  
  4. UI renders message bubble, action chips trigger navigation or search filters.  
  5. Conversations stored client-side for V1; SDS details eventual persistence.

### Data Consistency
- Quick actions (e.g., “Show saved deadlines”) must call same context selectors so AI responses match dashboard data.  
- When AI suggests “Save program X”, clicking action triggers `toggleSaved` ensuring watchlist updates instantly.

---

## 9. EPIC — Recommendations
### US-11 View Personalized Recommendations
- **Functional:** Dashboard + dedicated carousel show high-fit programs not yet saved, display match score + reason, allow quick save.  
- **Technical Flow:**
  1. Nightly batch writes to `Recommendations` with `score` and `reason`.  
  2. `GET /api/student/recommendations` returns top N for logged-in student.  
  3. UI filters out admissions already saved (server should also exclude).  
  4. Save button reuses watchlist API; after saving, recommendation card hides via context update.

### Data Consistency
- Recommendations list is derived from admissions data; saving removes card, increasing watchlist count simultaneously.  
- Dashboard stat “Recommendations” = length of `context.recommendations`.

---

## 10. EPIC — Auth & Profile
### US-12 Manage Profile Settings
- **Functional:** Edit profile info (name, password), adjust notification preferences (email, in-app, weekly digest), clear search history.  
- **Technical Flow:**
  1. `GET /api/student/profile` pre-populates form.  
  2. `PATCH /api/student/profile` updates fields; password change uses `/api/student/profile/password`.  
  3. Notification preferences stored in `Student_Profile.preferences` JSON (`{ emailAlerts: true, inApp: true, weeklyDigest: false }`).  
  4. On save, context updates preferences so AI + notifications obey new settings.

### Data Consistency
- Preference toggles influence scheduler (deadline alerts suppressed if `alert_opt_in=false`).  
- UI reads preferences to determine default alert toggles on Watchlist/Deadlines pages.

---

## 11. Quality & Bug-Free Demo Checklist
1. **Single Dataset:** Every admission card, detail page, compare entry, and alert references the same admission object via context to eliminate mismatches seen in earlier demos.  
2. **Navigation Validation:** All cards use `<Link to={`/program/${id}`}>`; ProgramDetail fetches canonical data ensuring accurate render.  
3. **State Synchronization:** Save/remove/alert toggles propagate instantly to Dashboard, Watchlist, Compare, Deadlines, Notifications.  
4. **Error Handling:** All API calls return toast-friendly errors; optimistic updates revert on failure.  
5. **Testing Hooks:** Introduce unit tests for context helpers and page selectors to guarantee consistency before QA sign-off.

---

### Implementation Notes for Developers
- **Context Hydration:** On app load, call `/api/student/dashboard`, then lazily fetch page-specific data (`/api/admissions/search`, `/api/student/notifications`, etc.) and merge into context.  
- **Program Detail Migration:** Ensure `ProgramDetail` uses the same context dataset; fallback fetch merges details instead of replacing admission object.  
- **Compare URL Sync:** `useEffect` watches query param `ids`; updates context so refresh/share flows persist selections.  
- **AI Assistant Integration:** Provide mock responses locally; when backend ready, simply swap fetch URL. Maintain same response contract.  
- **Background Jobs:** Documented in SDS—deadline alerts rely on cron triggers; UI must never try to “send” alerts itself.

This document serves as the authoritative reference for implementing and validating the complete Student Module in V1. All new requirements or deviations should append to this file with date-stamped addenda.

