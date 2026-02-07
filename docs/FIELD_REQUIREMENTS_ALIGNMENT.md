# Backend-Frontend Alignment & Field Requirements Audit

**Date**: February 7, 2026  
**Status**: Review and alignment needed  
**Scope**: Admission fields, required/optional status, and all associated tables

---

## Executive Summary

**Current State**:
- ❌ Frontend types don't match backend requirements
- ❌ Frontend form provides unnecessary defaults for optional fields
- ⚠️ Only **1 field actually required** (title) but frontend assumes 6-10
- ✅ Backend properly configured with nullable fields
- ✅ Associated tables properly structured

**Action Needed**:
1. Realign frontend API types with backend requirements
2. Remove defaults from optional form fields
3. Update form validation to match backend
4. Document all associated table workflows

---

## Part 1: Field Requirements Analysis

### Backend Requirements (Database Schema)

**REQUIRED (NOT NULL)**:
```sql
id                    -- UUID, auto-generated
title                 -- VARCHAR(255), user-provided
verification_status   -- ENUM, auto-set to 'draft'
created_at            -- TIMESTAMP, auto-set to NOW()
updated_at            -- TIMESTAMP, auto-set to NOW()
is_active             -- BOOLEAN, auto-set to true
```

**OPTIONAL (NULLABLE)**:
```
university_id, description, program_type, degree_level,
field_of_study, duration, tuition_fee, currency,
application_fee, deadline, start_date, location,
delivery_mode, requirements, verified_at, verified_by,
rejection_reason, dispute_reason, created_by
```

### Current Frontend Types (INCORRECT ❌)

**Marked as Required**:
```typescript
id: string;              // ✅ Correct
title: string;           // ✅ Correct
location: string;        // ❌ WRONG - Should be optional
verification_status: '...' // ✅ Correct
created_at: string;      // ✅ Correct
updated_at: string;      // ✅ Correct
```

**Marked as Optional**:
```typescript
degree_level: string;    // ❌ WRONG - Should be optional (but currently required!)
application_fee: number; // ❌ WRONG - Should be optional
deadline: string;        // ❌ WRONG - Should be optional
```

### Misalignments Found

| Field | Backend | Frontend | Issue |
|-------|---------|----------|-------|
| `title` | ✅ Required | ✅ Required | CORRECT |
| `location` | ❌ Optional | ✅ Required | MISMATCH - Frontend requires, backend allows null |
| `degree_level` | ❌ Optional | ✅ Required | MISMATCH - Frontend shows required |
| `application_fee` | ❌ Optional | ✅ Required | MISMATCH - Frontend requires |
| `deadline` | ❌ Optional | ✅ Required | MISMATCH - Frontend requires date input |
| `verification_status` | ✅ Required | ✅ Required | CORRECT |
| `program_type` | ❌ Optional | ❌ Optional | CORRECT |
| `field_of_study` | ❌ Optional | ❌ Optional | CORRECT |
| `duration` | ❌ Optional | ❌ Optional | CORRECT |
| `delivery_mode` | ❌ Optional | ❌ Optional | CORRECT |
| `start_date` | ❌ Optional | ❌ Optional | CORRECT |
| `currency` | ❌ Optional | ❌ Optional | CORRECT |
| `tuition_fee` | ❌ Optional | ❌ Optional | CORRECT |
| `description` | ❌ Optional | ❌ Optional | CORRECT |

---

## Part 2: Form Default Issues

### Current Form State (PROBLEMATIC ❌)

```typescript
const [formData, setFormData] = useState({
  programTitle: existingAdmission?.title || 'Bachelor of Science in Computer Science',
  // ❌ PROBLEM: Default value for editing new admission
  
  degreeType: existingAdmission?.degreeType || 'BS',
  // ❌ PROBLEM: Optional field but has a default, looks required
  
  department: existingAdmission?.department || 'School of Engineering',
  // ❌ PROBLEM: Default value misleads user
  
  academicYear: existingAdmission?.academicYear || '2025-2026',
  // ❌ PROBLEM: Auto-generating year for optional field
  
  applicationDeadline: formatDateForInput(existingAdmission?.deadline) || '',
  // ⚠️ PARTIAL: Empty string OK but form label says "Required"
  
  fee: existingAdmission?.fee || '2500',
  // ❌ PROBLEM: Default fee suggests it's always set
  
  overview: existingAdmission?.overview || '',
  // ✅ CORRECT: Empty string for optional field
  
  eligibility: existingAdmission?.eligibility || '',
  // ✅ CORRECT: Empty string for optional field
  
  websiteUrl: existingAdmission?.websiteUrl || 'https://university.edu',
  // ❌ PROBLEM: Default URL is misleading
  
  admissionPortalLink: existingAdmission?.admissionPortalLink || 'https://university.edu/admissions',
  // ❌ PROBLEM: Default URL is misleading
})
```

### Issues Identified

1. **Misleading Defaults**: Fields like `degreeType`, `department`, `fee`, `websiteUrl` have defaults that suggest they're required values rather than optional fields

2. **New Admission Creation**: When creating new admission (no `existingAdmission`), user sees filled form fields that they didn't enter

3. **Edit Mode Confusion**: Hard to distinguish between "optional field user left blank" vs "optional field with default value"

4. **UX Problem**: User might think leaving a field blank will use the default, but defaults aren't persisted to backend

---

## Part 3: Correct Field Requirements Matrix

### Field Classification

```typescript
// TRULY REQUIRED (Must always be provided by user)
interface AdmissionRequired {
  title: string;  // Only field that MUST be provided
}

// OPTIONAL (User may provide, but not required)
interface AdmissionOptional {
  // Program classification
  program_type?: string;
  degree_level?: string;
  field_of_study?: string;
  
  // Program details
  duration?: string;
  delivery_mode?: string;
  location?: string;
  requirements?: Record<string, any>;
  
  // Financial
  application_fee?: number;
  tuition_fee?: number;
  currency?: string;
  
  // Dates
  deadline?: string;
  start_date?: string;
  
  // Descriptions
  description?: string;
  
  // Web presence
  website_url?: string;
  admission_portal_link?: string;
}

// AUTO-SET (Never provided by user, always set by system)
interface AdmissionAutoSet {
  id: string;                           // Generated
  verification_status: 'draft';          // Always 'draft' on create
  created_at: string;                   // Set to NOW()
  updated_at: string;                   // Set to NOW()
  is_active: boolean;                   // Always true
  created_by: string | null;            // From auth context
  university_id: string | null;         // From auth context
}

// ADMIN-ONLY (Only admins can modify)
interface AdmissionAdminOnly {
  verified_at?: string;                 // Set by admin on verify
  verified_by?: string;                 // Set by admin on verify
  rejection_reason?: string;            // Set by admin on reject
  dispute_reason?: string;              // Set or updated by university on dispute
}
```

---

## Part 4: Associated Tables & Relationships

### Related Tables in University Module

#### 1. **Admissions Table** (Core)
```sql
-- Required for creation
title (VARCHAR(255), NOT NULL)

-- Optional for creation
description, program_type, degree_level, field_of_study,
duration, tuition_fee, currency, application_fee, deadline,
start_date, location, delivery_mode, requirements

-- Auto-set by system
id, verification_status (default 'draft'), created_at,
updated_at, is_active (default true), university_id,
created_by
```

**Actions**: Create, Read, Update (partial), Delete (soft via is_active)

---

#### 2. **Changelogs Table** (Audit Trail)
```sql
-- Schema
id, admission_id (FK), actor_type (enum),
changed_by (UUID), action_type (enum),
field_name, old_value (JSONB), new_value (JSONB),
diff_summary, metadata, created_at

-- Tracked Events
'created'           - Admission created
'updated'           - Admission updated
'verified'          - Admin verified
'rejected'          - Admin rejected
'disputed'          - University disputed rejection
'status_changed'    - Status transitioned
```

**Workflow**:
1. User creates admission → Changelog: action='created', admission_id set
2. User updates admission → Changelog: action='updated', field_name, old_value, new_value captured
3. Admin verifies → Changelog: action='verified', verified_at & verified_by set
4. Admin rejects → Changelog: action='rejected', rejection_reason captured
5. University disputes → Changelog: action='disputed', dispute_reason captured

**Purpose**: Immutable audit trail of all changes
**Retention**: Forever (for compliance)

---

#### 3. **Notifications Table**
```sql
-- Schema
id, user_id, user_type (enum: student/university/admin),
category (enum: verification/deadline/system/update),
priority (low/medium/high/urgent),
title, message, related_entity_type,
related_entity_id, is_read, read_at, action_url,
created_at

-- Related Operations
admission_verified       → notification for created_by
admission_rejected       → notification with rejection_reason
deadline_approaching     → notification for interested users
admission_updated        → notification for followers
dispute_acknowledged     → notification for admin
```

**Types**:
- **verification**: Admission verified/rejected by admin
- **deadline**: Application deadline approaching
- **system**: System-generated alerts
- **update**: Admission data updated

**Purpose**: User-facing alerts and reminders
**Retention**: 90 days or per user setting

---

#### 4. **Analytics Events Table**
```sql
-- Schema
id, event_type (enum), entity_type, entity_id,
user_type, user_id, metadata (JSONB), created_at

-- Tracked Events
'admission_viewed'           - User viewed admission
'admission_created'          - University created admission
'admission_updated'          - University updated admission
'verification_completed'     - Admin completed verification
'admission_searched'         - User searched admissions
'admission_compared'         - Student compared programs
'deadline_alert_sent'        - System sent reminder
```

**Purpose**: Analytics and system monitoring
**Retention**: 1 year
**Used for**: Dashboard stats, trending programs, user insights

---

#### 5. **Deadlines Table** (Deadline Tracking)
```sql
-- Schema
id, admission_id (FK), deadline_type (enum),
deadline_date, timezone, is_flexible,
reminder_sent, created_at, updated_at

-- Deadline Types
'application'           - Main application deadline
'document_submission'   - Supporting docs deadline
'payment'              - Tuition payment deadline
'other'                - Custom deadline
```

**Purpose**: Track multiple related deadlines per admission
**Automation**: Reminders sent 7 days, 3 days, 1 day before

---

#### 6. **Universities Table** (Currently Missing - Design Included)
```sql
-- Proposed Schema (for future deployment)
id (UUID, PK), name (VARCHAR(255)),
city, country, website, logo_url,
is_active (BOOLEAN), created_at, updated_at

-- Will link admissions.university_id → universities.id
-- Will link users.organization_id → universities.id for university staff
```

**Status**: Not yet created in backend but referenced in admissions
**Design**: Ready, awaiting deployment

---

#### 7. **Users Table** (Authentication & Authorization)
```sql
-- Schema
id, auth_user_id (Supabase UUID),
role (enum: student/university/admin),
display_name, organization_id (for university staff),
status (active/suspended), created_at, updated_at

-- Role Permissions
admin:       Can verify/reject/dispute, view all admissions
university:  Can create/edit own admissions, see own changelog
student:     Read-only access to verified admissions
```

**Purpose**: User authentication and role-based access
**Integration**: Supabase Auth handles login, users table stores metadata

---

## Part 5: Workflows Using Multiple Tables

### Workflow 1: Create & Submit Admission
```
1. University Representative (user)
   ├─→ POST /admissions
   │   ├─ Input: title (required), other fields (optional)
   │   └─ Output: admission (id, verification_status='draft', ...)
   │
   ├─→ Admissions Table
   │   ├─ INSERT new row
   │   ├─ SET: created_by = user.id, university_id = org.id
   │   └─ SET: verification_status = 'draft'
   │
   ├─→ Changelogs Table
   │   ├─ INSERT action_type = 'created'
   │   └─ Record all field values
   │
   └─→ User clicks "Publish"
       ├─→ PUT /admissions/:id/submit
       ├─→ SET: verification_status = 'pending'
       ├─→ Changelogs: action_type = 'status_changed'
       └─→ Notifications: Create notification to assigned admins
```

### Workflow 2: Admin Verification
```
1. Admin Reviews Admission
   ├─→ GET /admissions/:id
   ├─→ View admission details & changelog
   │
   ├─→ Admin Action 1: APPROVE
   │   ├─→ PUT /admissions/:id/verify
   │   ├─→ SET: verification_status = 'verified'
   │   ├─→ SET: verified_at = NOW(), verified_by = admin.id
   │   ├─→ Changelogs: action_type = 'verified'
   │   └─→ Notifications: Create for admission creator
   │
   └─→ Admin Action 2: REJECT
       ├─→ PUT /admissions/:id/reject
       ├─→ SET: verification_status = 'rejected'
       ├─→ SET: rejection_reason (required)
       ├─→ Changelogs: action_type = 'rejected'
       └─→ Notifications: Create with rejection reason
```

### Workflow 3: University Dispute
```
1. University Gets Rejection Notification
   ├─→ Views rejection_reason in notification
   │
   ├─→ PUT /admissions/:id/dispute
   │   ├─ Input: dispute_reason (required)
   │   ├─→ SET: verification_status = 'disputed'
   │   ├─→ SET: dispute_reason
   │   ├─→ Changelogs: action_type = 'disputed'
   │   └─→ Notifications: Create for admins with dispute reason
   │
   └─→ Admin Reviews Dispute
       ├─→ May re-verify or maintain rejection
       └─→ Notifications: Send decision to university
```

### Workflow 4: Deadline Management
```
1. Admission Created
   ├─→ Deadline(s) may be set via requirements JSONB
   │
   ├─→ Deadlines Table
   │   ├─ Record deadline_date
   │   ├─ Record timezone
   │   └─ Set reminder_sent = false
   │
   ├─→ Cron Job (Daily)
   │   ├─ Check deadlines expiring in 7, 3, 1 days
   │   ├─ FOR EACH: Create deadline reminder notification
   │   └─ SET: reminder_sent = true
   │
   └─→ Notifications
       └─ Users get reminder with action_url to admission
```

---

## Part 6: Recommendations for Alignment

### Frontend Type Fix

```typescript
// BEFORE (Current - WRONG)
export interface Admission {
  title: string;                    // ✅
  location: string;                 // ❌ Should be optional
  degree_level: string;             // ❌ Should be optional (not in interface but assumed required)
  application_fee: number;          // ❌ Should be optional
  deadline: string;                 // ❌ Should be optional
  // ... rest optional
}

// AFTER (Correct alignment with backend)
export interface Admission {
  // Auto-set by backend (don't ask user)
  id: string;
  verification_status: 'draft' | 'pending' | 'verified' | 'rejected' | 'disputed';
  created_at: string;
  updated_at: string;
  
  // User-provided (REQUIRED)
  title: string;
  
  // User-provided (OPTIONAL - all nullable)
  description?: string | null;
  program_type?: string | null;
  degree_level?: string | null;
  field_of_study?: string | null;
  duration?: string | null;
  delivery_mode?: string | null;
  location?: string | null;
  requirements?: Record<string, any> | null;
  application_fee?: number | null;
  tuition_fee?: number | null;
  currency?: string | null;
  deadline?: string | null;
  start_date?: string | null;
  website_url?: string | null;
  admission_portal_link?: string | null;
  
  // Admin-only (never ask user to set)
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_reason?: string | null;
  dispute_reason?: string | null;
  
  // Context fields (auto-set)
  created_by?: string | null;
  university_id?: string | null;
  is_active?: boolean;
}
```

### Form Validation Fix

```typescript
// BEFORE (Current - provides defaults)
const [formData, setFormData] = useState({
  programTitle: existingAdmission?.title || 'Bachelor of Science in Computer Science',
  degreeType: existingAdmission?.degreeType || 'BS',
  // ... all fields have defaults
})

// AFTER (Correct - optional fields remain empty)
const [formData, setFormData] = useState({
  programTitle: existingAdmission?.title || '',  // Empty if not provided
  degreeType: existingAdmission?.degreeType || '', // Don't default
  department: existingAdmission?.department || '', // Empty for optional
  // ... no defaults for optional fields
})

// Form validation
const requiredFields = ['programTitle'];
const isFormValid = requiredFields.every(field => formData[field]?.trim());

// Label clarification
{isFormValid ? 'All required fields complete' : 'Title is required'}
```

### Form UI Updates Needed

```
Before: 
[X] Program Title (appears as just "Program Title")
[X] Degree Type (appears required with default "BS")
[X] Application Deadline (appears required with default date picker)

After:
[X] Program Title * (asterisk = required)
[ ] Degree Type (no asterisk = optional, empty by default)
[ ] Application Deadline (no asterisk = optional, date picker empty)
```

---

## Part 7: Associated Table Operations

### Which Operations Create/Update Each Table

| Table | Create | Update | Read | Delete |
|-------|--------|--------|------|--------|
| Admissions | ✅ User creates | ✅ User edits ANY field | ✅ Always | ✅ Soft (is_active) |
| Changelogs | ✅ Auto on change | ❌ Never (immutable) | ✅ Always | ❌ Never |
| Notifications | ✅ Auto on event | ✅ mark_read() | ✅ User only | ⏳ Archive after 90d |
| Analytics Events | ✅ Auto on action | ❌ Never | ✅ Admin only | ⏳ Purge after 1y |
| Deadlines | ✅ Auto from requirements | ✅ User edits | ✅ Always | ✅ Remove if deadline passes |
| Universities | ✅ Admin setup | ✅ Admin only | ✅ Always | ❌ Never (data integrity) |
| Users | ✅ Auth signup | ✅ Admin/user | ✅ User own, admin all | ⏳ Soft delete |

---

## Part 8: Checklist for Alignment

### Frontend Changes Needed
- [ ] Update src/types/api.ts Admission interface (mark more fields as optional)
- [ ] Remove default values from form state
- [ ] Add "*" to only required fields
- [ ] Update form validation to reflect only title is required
- [ ] Test creating admission with only title field
- [ ] Test editing admission without touching optional fields

### Backend Verification
- [ ] Confirm title is only required field
- [ ] Confirm other fields are truly optional (nullable)
- [ ] Confirm auto-set fields work correctly
- [ ] Test creating admission via API with minimal data
- [ ] Verify changelog entries created correctly

### Associated Tables Integration
- [ ] Verify changelogs created on all operations
- [ ] Check notifications trigger on verification events
- [ ] Verify analytics events logged
- [ ] Test deadline reminders work
- [ ] Confirm users permissions working

---

## Part 9: Implementation Priority

### Phase 1 (IMMEDIATE)
1. Update frontend API types - remove required from optional fields
2. Fix form defaults - use empty strings instead of dummy values
3. Update form labels - add asterisk only to required fields
4. Test create/edit with minimal data

### Phase 2 (THIS SESSION)
1. Verify all backend associated tables working
2. Test changelog tracking on all operations
3. Test notification triggers
4. Document any issues found

### Phase 3 (FOLLOW-UP)
1. Implement analytics tracking dashboard
2. Add deadline reminder automation
3. Implement dispute workflow fully
4. Add admin verification dashboard

