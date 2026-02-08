# University Module — User Stories & Technical Flows (V1)

- **Date:** 2025-11-19  
- **Latest Updates:** 2026-02-09 (Status filter consolidation, is_active field fix)
- **Source Inputs:** SRS v1.5, SDS v1.4, Database Schema v5.0, finalized UI flows (Figma `University-V1`)  
- **Scope:** All university representative-facing surfaces (Dashboard, Manage Admissions, Verification Center, Change Logs, Notifications Center, AI Assistant, Scraper Logs, Profile).  
- **Data Consistency Layer:** `UniversityDataContext` (front-end) mirrors API contract described below; all UI mutations must call the context helpers so state stays identical across pages and matches backend responses once APIs arrive.

---

## 💼 Recent Changes (Feb 9, 2026)

### Status Filter UI Update
- **Before:** 6 status filter cards (Total, Draft, Pending, Verified, Rejected, Disputed)
- **After:** 5 status filter cards (Total, Draft, Pending, Verified, Rejected+Disputed)
- **Impact:** "Disputed" count merged with "Rejected"; individual admission cards still show actual status
- **Files Updated:** `ViewAllAdmissions.tsx` (status filter logic, grid layout)

### Active Admissions Metric Fix  
- **Before:** "Active Admissions" showed 0 (checked `status === 'Active'`)
- **After:** Correctly uses `is_active === true` field
- **Impact:** Dashboard now shows accurate active admission count
- **Files Updated:** `UniversityDashboard.tsx` (stats calculation)

---

## 0. Shared Technical Foundations

### 0.1 Core Entities & Tables (DB v5)
| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `Users` | `id`, `email`, `role`, `university_id`, `password_hash` | University representatives (role = "UniversityRep") |
| `Universities` | `id`, `name`, `city`, `metadata` (JSONB) | University reference data |
| `Admissions` | `id`, `university_id`, `title`, `program`, `degree_type`, `deadline`, `fee`, `status`, `ai_summary`, `uploaded_by`, `updated_by`, `verified_by`, `attachments` | Admissions catalog managed by university reps |
| `Verification_Logs` | `id`, `admission_id`, `admin_id`, `status`, `comment`, `created_at` | Audit trail for admin verification |
| `Change_Logs` | `id`, `admission_id`, `modified_by`, `field`, `old_value`, `new_value`, `diff_json`, `created_at` | Track all changes to admissions |
| `Alerts_Notifications` | `id`, `user_id`, `role`, `type`, `payload`, `status`, `scheduled_at`, `sent_at` | Notifications for university reps |
| `Scraper_Logs` | `id`, `university_id`, `source_url`, `last_run_at`, `status`, `changes_detected` | System scraper activity (read-only for reps) |

### 0.2 API Contracts (v1)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/university/dashboard` | GET | Aggregated snapshot (total admissions, pending audits, verified/rejected/disputed counts, recent updates, verification feedback) |
| `/api/admissions` | POST | Create new admission (auto-publishes with status = "Pending Audit") |
| `/api/admissions/:id` | GET | Get admission details |
| `/api/admissions/:id` | PUT | Update admission (creates change log, sets status = "Pending Audit", triggers notifications) |
| `/api/admissions/:id` | DELETE | Delete admission |
| `/api/admissions/parse-pdf` | POST | Extract admission data from PDF using AI parser |
| `/api/university/audits` | GET | List admissions with verification status (Pending/Verified/Rejected/Disputed) |
| `/api/university/change-logs` | GET | List all changes made to admissions (with diff data) |
| `/api/university/notifications` | GET/PATCH | In-app notifications for university reps (verification feedback, system alerts) |
| `/api/university/scraper-logs` | GET | View scraper activity for university (read-only) |
| `/api/ai/query` | POST | AI assistant endpoint (role=university, context payload) |
| `/api/university/profile` | GET/PATCH | Update university rep profile & settings |

### 0.3 Front-End Consistency Rules
1. **Single Source of Truth:** The `UniversityDataContext` hydrates from `/api/university/dashboard` + page-specific endpoints. All pages must mutate context via provided helpers (`createOrUpdateAdmission`, `deleteAdmission`, etc.) to keep Dashboard, Manage Admissions, Verification Center, and Change Logs synchronized.  
2. **Status Workflow:** Admissions follow: Draft → Pending Audit → Verified/Rejected/Disputed. Any edit to a verified admission resets status to "Pending Audit" and creates a change log entry.  
3. **Auto-Publish System:** When a rep publishes an admission (manual or PDF upload), it automatically gets status = "Pending Audit" and `verified_by` = NULL. Admin verification happens separately.  
4. **Change Detection:** On update, system compares old vs. new values. If any field changed, creates `Change_Logs` entry with `diff_json` and notifies watchers (students) via `Alerts_Notifications`.  
5. **Notification Triggers:** University reps receive notifications when: admission verified, admission rejected, admission disputed, admin feedback provided, system maintenance alerts.

---

## EPIC 1 — UNIVERSITY DASHBOARD

### US-U01: View University Dashboard Overview
**User Story:** As a University Representative, I want to see all my admissions, their audit status, and recent updates so I can manage them effectively.

**Functional Flow:**
1. University rep logs in (role = "UniversityRep")
2. Dashboard loads showing:
   - **Total Admissions** count
   - **Pending Audit** count  
   - **Verified Admissions** count
   - **Rejected** count (includes disputed admissions)
   - **Recently updated admissions** (table/list)
   - **Recent verification feedback** (from notifications)
3. Show quick actions:
   - "Upload New Admission" button
   - "View Pending Audits" link
   - "View Change Logs" link
4. Display admissions table with filters:
   - Filter by status (All, Draft, Pending, Verified, Rejected+Disputed)
   - Sort by (Soonest to Close, Latest First, Most Views)
5. Each admission card shows:
   - Title, deadline, status badge
   - Views count
   - Verified by (if verified)
   - Last action timestamp
   - Actions: Edit, View Details, Delete

**Technical Flow:**
- **API:** `GET /api/university/dashboard`
- **DB Reads:**
  - `Admissions` (filtered by `uploaded_by` = rep_id OR `university_id` = rep's university_id)
  - `Verification_Logs` (latest log per admission)
  - `Change_Logs` (recent changes, limit 10)
  - `Alerts_Notifications` (recent notifications for rep, limit 5)
  - Associated `Universities` info
- **No DB writes**
- **Frontend:** `UniversityDashboard.tsx` + `ViewAllAdmissions.tsx`
  - **Active admissions calculation:** `admissions.filter(a => a.is_active === true).length`
  - **Rejected filter:** Includes both `status === 'Rejected'` AND `status === 'Disputed'`
  - **UI:** 5 status filter cards (Total, Draft, Pending, Verified, Rejected)
- **State Management:** Stats calculated via `useMemo` from admissions array

**UI Components:**
- Stats cards (Total, Active, Closing Soon, Verified)
- Admissions table with status badges
- Quick action buttons
- Recent activity sidebar

---

## EPIC 2 — UPLOAD / PUBLISH ADMISSION (AUTO-PUBLISH SYSTEM)

### US-U02: Upload New Admission Manually
**User Story:** As a University Rep, I want to manually enter admission data so students can view updated programs.

**Functional Flow:**
1. Rep opens "Manage Admissions" page
2. Clicks "New Admission" or "+ New Admission" button
3. Fills form fields:
   - `title` (e.g., "BSCS Fall 2025")
   - `program` (e.g., "Computer Science")
   - `degree` (e.g., "Bachelor of Science")
   - `degreeType` (BS, MS, PhD, MBA, etc.)
   - `department` (e.g., "School of Engineering")
   - `academicYear` (e.g., "2025-2026")
   - `deadline` (date picker)
   - `fee` (numeric input)
   - `overview` (textarea)
   - `eligibility` (textarea)
   - `websiteUrl` (URL input)
   - `admissionPortalLink` (URL input)
4. Clicks "Publish" button
5. System auto-publishes admission with:
   - `status` = "Pending Audit"
   - `verified_by` = NULL
   - `updated_by` = rep_id
   - `uploaded_by` = rep_id
   - `created_at` = current timestamp
6. **AI Summary Generation:** Backend calls AI model to generate `ai_summary` from form data
7. Record appears under "Active Admissions" in dashboard
8. Success message: "Admission published successfully. Pending admin verification."

**Technical Flow:**
- **API:** `POST /api/admissions`
- **Request Body:**
  ```json
  {
    "title": "BSCS Fall 2025",
    "program": "Computer Science",
    "degree": "Bachelor of Science",
    "degreeType": "BS",
    "department": "School of Engineering",
    "academicYear": "2025-2026",
    "deadline": "2025-07-15",
    "fee": "5000",
    "overview": "...",
    "eligibility": "...",
    "websiteUrl": "https://university.edu/cs",
    "admissionPortalLink": "https://university.edu/admissions/cs"
  }
  ```
- **DB Writes:**
  - `Admissions` table insert with:
    - `status` = "Pending Audit"
    - `verified_by` = NULL
    - `uploaded_by` = rep_id (from JWT/session)
    - `updated_by` = rep_id
    - `ai_summary` = generated by AI model (background job or inline)
  - No `Verification_Logs` entry yet (admin creates that during verification)
- **Background Job:** AI summary generation (can be async or inline)
- **Frontend:** `ManageAdmissions.tsx` form submission calls `createOrUpdateAdmission()` from context
- **Response:** Returns created admission object with generated `id`

---

### US-U03: Upload Admission via PDF → Auto-Extract
**User Story:** As a rep, I want to upload a PDF and let the system auto-fill fields.

**Functional Flow:**
1. Rep opens "Manage Admissions" page
2. Clicks "Upload PDF" button or drags PDF into drop zone
3. System validates:
   - File type = PDF
   - File size ≤ 10MB
4. Shows processing indicator: "Processing PDF and extracting information..."
5. Backend → AI parser extracts:
   - `title`
   - `program`
   - `degree` / `degreeType`
   - `fee`
   - `deadlines`
   - `overview` / `eligibility`
   - `department`
   - `academicYear`
6. UI auto-fills editable form fields with extracted data
7. Rep reviews and can edit any field
8. Rep clicks "Publish"
9. Status = "Pending Audit" (same as manual upload)
10. Success message: "Admission extracted and published successfully."

**Technical Flow:**
- **API Step 1:** `POST /api/admissions/parse-pdf`
  - **Request:** Multipart form-data with PDF file
  - **Response:** Extracted data JSON
  ```json
  {
    "programTitle": "Bachelor of Science in Computer Science",
    "degreeType": "BS",
    "department": "School of Engineering",
    "academicYear": "2025-2026",
    "applicationDeadline": "2025-07-15",
    "fee": "5000",
    "overview": "...",
    "eligibility": "..."
  }
  ```
- **API Step 2:** `POST /api/admissions` (same as US-U02)
- **DB Writes:** Same as US-U02
- **AI Processing:** OCR + NLP extraction (can use Gemini AI, GPT-4 Vision, or specialized PDF parser)
- **Frontend:** `ManageAdmissions.tsx` handles file upload, calls `extractDataFromPDF()` mock function (replace with API call), populates form, then submits

---

## EPIC 3 — EDIT / UPDATE ADMISSIONS

### US-U04: Edit Existing Admission
**User Story:** As a university rep, I want to update a published admission when details change.

**Functional Flow:**
1. Rep opens admission from dashboard or "Manage Admissions" page
2. Clicks "Edit" button
3. Form loads with existing data (read-only fields: `id`, `created_at`, `verified_by` if verified)
4. Rep updates fields (e.g., deadline, fee, overview)
5. Clicks "Update" or "Save Changes"
6. System compares old vs. new values (field-by-field diff)
7. If any field changed:
   - Create `Change_Logs` entry with:
     - `admission_id`
     - `modified_by` = rep_id
     - `field` = changed field name
     - `old_value` = previous value
     - `new_value` = new value
     - `diff_json` = JSON object with all changes
     - `created_at` = current timestamp
   - Mark Admission as:
     - `status` = "Pending Audit" (even if previously verified)
     - `updated_by` = rep_id
     - `updated_at` = current timestamp
8. **Notify Admin:** Create notification for admin (type: "Admission Updated - Pending Review")
9. **Notify Watchers:** Create notifications for all students who saved this admission (type: "Admission Updated")
10. Success message: "Admission updated successfully. Status changed to Pending Audit. Admin will review changes."

**Technical Flow:**
- **API:** `PUT /api/admissions/:id`
- **Request Body:** Same structure as POST, but with `id` in URL
- **DB Reads:**
  - Fetch existing admission to compare values
- **DB Writes:**
  - `Admissions` table update (all fields)
  - `Change_Logs` table insert (one row per changed field, or one row with `diff_json` containing all changes)
  - `Alerts_Notifications` inserts:
     - For admin: `{ type: "Admission Updated", admission_id, payload: { changes: diff_json } }`
     - For watchers: `{ type: "Admission Updated", admission_id, user_id: <watcher_id>, payload: { title, changes } }` (one per watcher)
  - `Verification_Logs` insert (type: "Updated - Pending Review", `status` = "Pending")
- **Frontend:** `ManageAdmissions.tsx` in edit mode (detected via URL param `?edit=:id`), calls `createOrUpdateAdmission()` with existing admission ID
- **Change Detection:** Backend compares old vs. new, only creates change log if differences found

**Edge Cases:**
- If admission is "Draft", update doesn't change status (stays Draft)
- If admission is "Verified" and rep edits, status → "Pending Audit"
- If admission is "Rejected", rep can still edit and republish (status → "Pending Audit")

---

## EPIC 4 — PENDING AUDITS / VERIFICATION STATUS

### US-U05: View Verification Status
**User Story:** As a rep, I want to see whether my admissions have been verified or rejected by admin.

**Functional Flow:**
1. Rep opens "Verification Center" or "Pending Audits" page
2. Table shows all admissions with columns:
   - **Title** (admission name)
   - **Status** badge (Pending / Verified / Rejected / Disputed)
   - **Verified By** (admin username, if verified)
   - **Comment / Review** (admin feedback)
   - **Timestamp** (last action date)
   - **Actions** (View Details button)
3. Filters:
   - Filter by status (All, Pending, Verified, Rejected, Disputed)
   - Search by title
4. Click "View Details" → Modal or page showing:
   - Full admission details
   - Complete verification log history
   - Admin comments
   - Change history (links to Change Logs)

**Technical Flow:**
- **API:** `GET /api/university/audits`
- **Query Params:** `?status=Pending&search=...`
- **DB Reads:**
  - `Admissions` (filtered by `uploaded_by` = rep_id OR `university_id` = rep's university_id)
  - `Verification_Logs` (join with admissions, get latest log per admission)
  - `Users` (to get admin names for `verified_by`)
- **Response:**
  ```json
  {
    "admissions": [
      {
        "id": "1",
        "title": "BSCS Fall 2025",
        "status": "Pending Audit",
        "verifiedBy": null,
        "lastAction": "2025-02-07",
        "remarks": "Under review",
        "verificationLog": {
          "id": 1,
          "adminId": null,
          "status": "Pending",
          "comment": "Under review",
          "createdAt": "2025-02-07T10:00:00Z"
        }
      }
    ]
  }
  ```
- **Frontend:** `VerificationCenter.tsx` uses `useUniversityData()` to fetch audits, displays table with status badges
- **No DB writes**

---

## EPIC 5 — CHANGE LOGS

### US-U06: View All Changes Made to Admissions
**User Story:** As a rep, I want to track all changes I or admins made to my admissions.

**Functional Flow:**
1. Rep opens "Change Logs" page
2. List of changes displayed in table:
   - **Admission** name (link to admission detail)
   - **Modified By** (rep name or admin name)
   - **Timestamp** (date/time)
   - **Summary** of changed fields (e.g., "Deadline, Fee updated")
   - **Actions** (View Diff button)
3. Filters:
   - Filter by admission (dropdown)
   - Filter by modifier (rep vs. admin)
   - Date range picker
4. Click "View Diff" → Modal showing:
   - Side-by-side or inline diff view
   - Field-by-field changes:
     - Field name
     - Old value → New value
   - `diff_json` data rendered as formatted JSON (if available)
5. Click admission name → Navigate to admission detail page

**Technical Flow:**
- **API:** `GET /api/university/change-logs`
- **Query Params:** `?admission_id=1&modified_by=rep&start_date=...&end_date=...`
- **DB Reads:**
  - `Change_Logs` (filtered by `admission_id` in rep's admissions)
  - `Admissions` (join to get admission titles)
  - `Users` (join to get modifier names)
- **Response:**
  ```json
  {
    "changeLogs": [
      {
        "id": 1,
        "admission": "BSCS Fall 2025",
        "admissionId": "1",
        "modifiedBy": "Rep-01",
        "date": "2025-02-07T10:00:00Z",
        "diff": [
          { "field": "deadline", "old": "2025-07-10", "new": "2025-07-15" },
          { "field": "fee", "old": "4500", "new": "5000" }
        ],
        "diffJson": { "deadline": { "old": "2025-07-10", "new": "2025-07-15" }, ... }
      }
    ]
  }
  ```
- **Frontend:** `ChangeLogs.tsx` uses `useUniversityData()` to fetch change logs, displays table with diff modal
- **No DB writes**

---

## EPIC 6 — NOTIFICATIONS CENTER

### US-U07: Receive Verification Feedback & System Messages
**User Story:** As a rep, I want to see admin responses about my admissions.

**Types of Notifications:**
1. **Admission Verified** — "Your admission 'BSCS Fall 2025' has been verified by the Admin."
2. **Admission Rejected** — "Your admission 'MS Data Science' was rejected. Reason: Incomplete document."
3. **Admission Disputed** — "The Admin has disputed your admission 'PhD Physics'. Please review comments."
4. **Feedback Comment** — "Admin left a comment on 'BSCS Fall 2025': 'Please update fee structure.'"
5. **System Maintenance Alerts** — "System maintenance scheduled for 2025-02-10 02:00 AM."

> **Note:** The current release models a single administrator persona (`Admin`) rather than multiple individually named admins.

**Functional Flow:**
1. Rep opens "Notifications Center" page
2. Tabs:
   - **All** (default)
   - **Verification** (verified/rejected/disputed)
   - **Feedback** (admin comments)
   - **System** (maintenance alerts)
3. List of notifications with:
   - **Title** (notification type)
   - **Message** (description)
   - **Type** badge (Admin Feedback / System Alert / Data Update)
   - **Time** (relative: "2 hours ago")
   - **Read** status (unread = bold, read = gray)
   - **Actions** (Mark as Read, View Admission link if applicable)
4. Click notification → Navigate to related admission or show details
5. "Mark All as Read" button
6. Unread count badge in header

**Technical Flow:**
- **API:** `GET /api/university/notifications`
- **Query Params:** `?type=verification&read=false`
- **DB Reads:**
  - `Alerts_Notifications` (filtered by `user_id` = rep_id AND `role` = "UniversityRep")
  - Join with `Admissions` to get admission titles (if `admission_id` present)
- **Response:**
  ```json
  {
    "notifications": [
      {
        "id": 1,
        "title": "Admission Verified",
        "message": "Your admission 'BSCS Fall 2025' has been verified by the Admin.",
        "type": "Admin Feedback",
        "time": "2025-02-07T10:00:00Z",
        "timeAgo": "2 hours ago",
        "read": false,
        "admissionId": "1"
      }
    ]
  }
  ```
- **API:** `PATCH /api/university/notifications/:id` (mark as read)
- **API:** `PATCH /api/university/notifications/mark-all-read` (mark all as read)
- **DB Writes:**
  - `Alerts_Notifications` update `status` = "read", `read_at` = current timestamp
- **Frontend:** `NotificationsCenter.tsx` uses `useUniversityData()` to fetch notifications, displays tabs and list with mark-as-read actions

---

## EPIC 7 — AI ASSISTANT (University)

### US-U08: Ask AI Assistant for Help
**User Story:** As a rep, I want to ask AI questions like: "How do I upload an admission?" or "What does Pending Audit mean?"

**Functional Flow:**
1. Rep clicks AI Assistant button (sidebar widget or floating button)
2. Chat panel opens
3. Rep types question (e.g., "How do I upload an admission?")
4. AI uses context:
   - University profile (name, city)
   - Verified admissions count
   - Pending audits count
   - Upload history
   - Current page context
5. AI returns step-by-step guidance or answer
6. Rep can ask follow-up questions
7. Quick action chips:
   - "Upload New Admission"
   - "View Pending Audits"
   - "Check Verification Status"

**Technical Flow:**
- **API:** `POST /api/ai/query`
- **Request Body:**
  ```json
  {
    "role": "university",
    "query": "How do I upload an admission?",
    "context": {
      "universityId": "1",
      "universityName": "FAST University",
      "verifiedCount": 5,
      "pendingCount": 2,
      "currentPage": "dashboard"
    }
  }
  ```
- **AI Model:** Gemini AI or GPT-4 with university-specific prompt
- **Response:**
  ```json
  {
    "response": "To upload a new admission, follow these steps:\n1. Click the 'New Admission' button on your dashboard...",
    "suggestions": ["Upload New Admission", "View Pending Audits"]
  }
  ```
- **Frontend:** `UniversityAIAssistant.tsx` widget in sidebar, uses `AiContext` for chat state, calls mock AI function (replace with API call)

---

## EPIC 8 — SCRAPER LOGS (System-Limited View)

### US-U09: View University Scraper Activity (Read Only)
**User Story:** As a rep, I want to see when the system last scraped our website (for transparency).

**Functional Flow:**
1. Rep opens "Scraper Logs" page (if available in navigation)
2. Page displays table with:
   - **Last Run** (timestamp: "2025-02-07 10:00 AM")
   - **Scraper Source URL** (university website URL)
   - **Status** (Success / Failed / In Progress)
   - **Changes Detected** (number: "3 admissions updated")
   - **Details** (link to see what changed)
3. Read-only page (University cannot edit or trigger scraper)
4. Shows last 10-20 scraper runs
5. Filter by status or date range

**Technical Flow:**
- **API:** `GET /api/university/scraper-logs`
- **Query Params:** `?status=success&limit=20`
- **DB Reads:**
  - `Scraper_Logs` (filtered by `university_id` = rep's university_id)
  - Join with `Admissions` to count changes detected
- **Response:**
  ```json
  {
    "scraperLogs": [
      {
        "id": 1,
        "lastRunAt": "2025-02-07T10:00:00Z",
        "sourceUrl": "https://university.edu/admissions",
        "status": "Success",
        "changesDetected": 3,
        "details": { "updatedAdmissions": ["1", "2", "3"] }
      }
    ]
  }
  ```
- **Frontend:** `ScraperLogs.tsx` (if implemented) displays read-only table
- **No DB writes** (university cannot modify scraper logs)

**Note:** This feature may be optional or limited to system admins only. If not in scope, omit this epic.

---

## EPIC 9 — PROFILE & ACCOUNT SETTINGS

### US-U10: Manage University Account Settings
**User Story:** As a rep, I want to update my profile and university account settings.

**Functional Flow:**
1. Rep opens "Profile" or "Settings" page
2. Editable fields:
   - **Name** (rep name)
   - **Email** (login email, may require verification to change)
   - **Password** (change password form)
   - **University Metadata** (JSONB fields, if applicable):
     - Contact phone
     - Office address
     - Department
3. Click "Save Changes"
4. Success message: "Profile updated successfully."

**Technical Flow:**
- **API:** `GET /api/university/profile`
- **API:** `PATCH /api/university/profile`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@university.edu",
    "password": "newpassword123" // hashed on backend
  }
  ```
- **DB Writes:**
  - `Users` table update (name, email, password_hash)
  - `Universities` table update (metadata JSONB, if changed)
- **Frontend:** Profile page (if implemented) with form submission

**Note:** This feature may be basic or advanced depending on requirements. If not in scope, omit this epic.

---

## TECHNICAL SUMMARY (University Module)

### APIs Used
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/university/dashboard` | GET | Dashboard overview |
| `/api/admissions` | POST | Create new admission |
| `/api/admissions/:id` | GET | Get admission details |
| `/api/admissions/:id` | PUT | Update admission |
| `/api/admissions/:id` | DELETE | Delete admission |
| `/api/admissions/parse-pdf` | POST | Extract data from PDF |
| `/api/university/audits` | GET | View verification status |
| `/api/university/change-logs` | GET | View change history |
| `/api/university/notifications` | GET/PATCH | Notifications management |
| `/api/university/scraper-logs` | GET | View scraper activity (optional) |
| `/api/ai/query` | POST | AI assistant queries |
| `/api/university/profile` | GET/PATCH | Profile management (optional) |

### DB Tables Involved
- `Users` (university reps)
- `Universities` (reference data)
- `Admissions` (core entity)
- `Verification_Logs` (audit trail)
- `Change_Logs` (change tracking)
- `Alerts_Notifications` (notifications)
- `Scraper_Logs` (system activity, optional)

### Background Jobs
1. **AI Summary Generation:** When admission is created/updated, generate `ai_summary` using AI model (can be async job or inline)
2. **Notification Scheduler:** When admission is updated, create notifications for watchers (students) and admin
3. **Change Detection:** Compare old vs. new values on update, create change log entries
4. **Scraper:** System-level job that scrapes university websites (not triggered by reps)

### Frontend Components
- `UniversityDashboard.tsx` — Dashboard overview
- `ManageAdmissions.tsx` — Create/edit admissions (manual + PDF upload)
- `VerificationCenter.tsx` — View verification status
- `ChangeLogs.tsx` — View change history
- `NotificationsCenter.tsx` — Notifications management
- `UniversityAIAssistant.tsx` — AI assistant widget
- `UniversityLayout.tsx` — Layout wrapper with sidebar
- `UniversityDataContext.tsx` — State management context

### State Management
- `UniversityDataContext` provides:
  - `admissions` — List of admissions
  - `audits` — Verification status data
  - `changeLogs` — Change history
  - `notifications` — Notifications list
  - `createOrUpdateAdmission()` — Create/update admission
  - `deleteAdmission()` — Delete admission
  - `getAdmissionById()` — Get admission by ID
  - Helper functions for filtering/sorting

### Key Workflows
1. **Upload Flow:** Manual form → POST `/api/admissions` → Status = "Pending Audit" → AI summary generated
2. **PDF Upload Flow:** PDF file → POST `/api/admissions/parse-pdf` → Extract data → Fill form → POST `/api/admissions`
3. **Edit Flow:** Load admission → Edit form → PUT `/api/admissions/:id` → Compare old/new → Create change log → Set status = "Pending Audit" → Notify admin & watchers
4. **Verification Flow:** Admin verifies → Status = "Verified" → Create notification for rep
5. **Change Tracking:** Any update → Compare fields → Create change log entry → Store diff JSON

---

## Notes & Considerations

1. **Auto-Publish System:** All admissions published by reps automatically get status = "Pending Audit". Admin verification is separate and updates status to Verified/Rejected/Disputed.

2. **Change Detection:** System must track all field changes. Consider storing `diff_json` as JSONB for flexibility.

3. **Notification Triggers:** Notifications are created for:
   - Rep when admin verifies/rejects/disputes
   - Students when admission they saved is updated
   - Admin when rep updates a verified admission

4. **PDF Extraction:** AI parser should handle various PDF formats. Consider fallback to manual entry if extraction fails.

5. **Scraper Logs:** This feature may be read-only for reps or admin-only. Clarify requirements.

6. **Profile Management:** Basic profile updates may be sufficient. Advanced features (2FA, API keys) are out of scope for V1.

7. **Data Consistency:** All pages must use `UniversityDataContext` to ensure admissions, audits, and change logs stay synchronized.

---

**End of University Module Documentation**

