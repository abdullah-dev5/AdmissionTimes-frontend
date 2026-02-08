# 🏗️ System Architecture & Design Document

**Last Updated:** February 9, 2026  
**Phase:** Phase 1 Complete - Direct Supabase + Enhancements  
**Latest Updates:** Active admissions fix, status consolidation, analytics planning  
**Next Phase:** Phase 2 - Engagement Analytics Implementation

---

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADMISSION TIMES PLATFORM                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐         ┌──────────────────┐
│   React Frontend    │         │   Backend API    │
│   (Port 5173)       │◄────────┤   (Port 3000)    │
│                     │  REST   │                  │
└────────┬────────────┘         └────────┬─────────┘
         │                                │
         │      Direct Supabase           │
         │      (Phase 1)                 │
         ▼                                ▼
    ┌────────────────────────────────────────────┐
    │      Supabase PostgreSQL Database          │
    │   (Authentication + Data + Storage)        │
    │                                            │
    │  • Auth (JWT ES256)                       │
    │  • admissions table + 7 others            │
    │  • Row-Level Security (RLS)               │
    │  • Automated backups                      │
    └────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### Supabase Auth (Current)
```
1. User enters email/password
   ↓
2. Supabase Auth validates
   ↓
3. Returns JWT token (ES256 signed)
   ↓
4. Frontend stores in localStorage + Zustand
   ↓
5. API client auto-injects in all requests:
   - Authorization: Bearer {token}
   - x-user-id: {user.id}
   - x-user-role: {user.role}
   - x-university-id: {user.university_id}
   ↓
6. Backend/Database validates token
   ↓
7. RLS policies enforce row-level permissions
```

### JWT Token Structure
```json
{
  "sub": "68edbfca-ac83-4b2f-b272-8847c1c9527f",
  "email": "university@test.com",
  "role": "university",
  "aud": "authenticated",
  "iat": 1707346200,
  "exp": 1707432600
}
```

### User Auto-Sync
```
Supabase Auth          Frontend Database
(Source of Truth)      (Synced)
   ↓                      ↓
   Create user ──────→ Trigger creates matching
                       users table record
   ↓                      ↓
   Role in profile ──→ Synced to users.role
                       column
```

---

## 📦 Admissions CRUD Flow (Phase 1)

### CREATE Admission
```
1. User fills form in Create Admission page
   ├─ title, deadline, fee, degree_type, etc.
   └─ verification_status = 'pending' (default)

2. Frontend transforms to API format
   └─ transformAdmissionToApi()
   └─ university_id from auth user included

3. Direct Supabase INSERT
   ├─ No backend hop
   ├─ JWT taken from browser
   └─ RLS policy checks:
      • User authenticated? ✅
      • university_id matches user's organization_id? ✅

4. Database validation
   ├─ All required fields present
   ├─ Data types correct
   ├─ No foreign key violations
   └─ Returns created record

5. Update local state
   └─ setAdmissions([...prev, newRecord])

6. Show success message
   └─ "Admission created successfully"
```

### UPDATE Admission
```
1. User clicks edit on existing admission
   └─ ManageAdmissions page

2. Modify fields
   ├─ title, deadline, fee, etc.
   ├─ Note: Cannot edit university_id (set on create)
   └─ verification_status changes to match edit

3. Frontend prepares payload
   ├─ Only sends changed fields
   ├─ Field whitelist ensures no non-existent columns
   └─ transformAdmissionToApi()

4. Direct Supabase UPDATE
   ├─ PATCH request to supabase.co
   ├─ RLS policy enforces: only owner or admin
   └─ Returns updated record

5. Update local state
   └─ setAdmissions([...updated])

6. Show success
   └─ "Admission updated successfully"
```

### DELETE Admission
```
1. User clicks delete icon
   ├─ Confirmation dialog appears
   └─ "Are you sure you want to delete?"

2. User confirms
   └─ deleteDirect(admissionId)

3. Direct Supabase DELETE
   ├─ No backend involved (Phase 1)
   ├─ RLS policy checks: owner or admin
   └─ Executes: DELETE FROM admissions WHERE id = {id}

4. Update local state
   └─ Filter out deleted: setAdmissions(prev.filter(a => a.id !== id))

5. Show success
   └─ "Admission deleted successfully"
```

### READ Admissions
```
Dashboard Data (Complex - Uses Backend)
├─ Recent admissions (8 latest with stats)
├─ Pending verifications (count, list)
├─ Change logs (10 recent)
└─ Notifications (system messages)

Uses: dashboardService.getUniversityDashboard()
  └─ Backend API (aggregation needed)

Direct Read (Simple - Uses Supabase)
├─ Single admission by ID
├─ List with filters/pagination
└─ Search across title, description

Uses: admissionsService.listDirect()
  └─ Direct Supabase SELECT
```

---

## 🗄️ Database Schema

### Core Tables

**users** (Supabase Auth)
```sql
id (UUID)                    -- Primary key
auth_user_id (UUID)          -- Link to auth.users
email (string)               -- From Supabase
role (enum)                  -- 'student', 'university', 'admin'
organization_id (UUID)       -- FK to universities.id
display_name (string)        -- University name
created_at (timestamp)
updated_at (timestamp)
```

**universities** (New - Auto-created)
```sql
id (UUID)                    -- Primary key (= users.organization_id)
name (string)                -- University name
is_active (boolean)          -- Active status
created_at (timestamp)
updated_at (timestamp)
-- Note: Additional columns can be added
--       logo_url, address, contact_email, etc.
```

**admissions** (Main table)
```sql
id (UUID)                    -- Primary key
university_id (UUID)         -- FK to universities.id
title (string)               -- Program name
description (text)           -- Overview
degree_level (string)        -- 'bachelor', 'master', 'phd'
program_type (string)        -- 'undergraduate', 'graduate'
field_of_study (string)      -- e.g., 'Computer Science'
duration (string)            -- e.g., '4 years'
tuition_fee (numeric)        -- Annual tuition
currency (string)            -- 'PKR', 'USD'
application_fee (numeric)    -- One-time application fee
deadline (timestamp)         -- Application deadline
start_date (string)          -- Program start date
location (string)            -- Campus location
delivery_mode (string)       -- 'on-campus', 'online', 'hybrid'
requirements (jsonb)         -- GPA, documents, test scores
verification_status (enum)   -- 'pending', 'verified', 'rejected'
created_at (timestamp)
updated_at (timestamp)
-- Note: No website_url or admission_portal_link columns
--       (These were removed during alignment)
```

**notifications** (System messages)
```sql
id (UUID)
user_id (UUID)  -- FK to users.id
type (string)   -- 'alert', 'system', 'admission'
title (string)
message (text)
read (boolean)
created_at (timestamp)
```

**Additional Tables:**
- watchlists (track favorite admissions)
- change_logs (audit trail)
- deadlines (important dates)
- (and 2 more for analytics/preferences)

---

## 🔒 Security: Row-Level Security (RLS)

### RLS Policies on admissions table

**SELECT Policy** (Read access)
```sql
CREATE POLICY "Universities can view their admissions"
ON admissions FOR SELECT
TO authenticated
USING (
  university_id IN (
    SELECT organization_id FROM auth.users WHERE id = auth.uid()
  )
  OR (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
);
```
👉 Result: Users only see their own admissions (+ admins see all)

**INSERT Policy** (Create access)
```sql
CREATE POLICY "Universities can create admissions"
ON admissions FOR INSERT
TO authenticated
WITH CHECK (
  university_id IN (
    SELECT organization_id FROM auth.users WHERE id = auth.uid()
  )
);
```
👉 Result: Users can only create admissions for their university

**UPDATE Policy** (Edit access)
```sql
CREATE POLICY "Universities can update their admissions"
ON admissions FOR UPDATE
TO authenticated
USING (
  university_id IN (
    SELECT organization_id FROM auth.users WHERE id = auth.uid()
  )
)
WITH CHECK (same logic);
```
👉 Result: Users can only edit their own admissions

**DELETE Policy** (Delete access)
```sql
CREATE POLICY "Universities can delete their admissions"
ON admissions FOR DELETE
TO authenticated
USING (
  university_id IN (
    SELECT organization_id FROM auth.users WHERE id = auth.uid()
  )
  OR (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
);
```
👉 Result: User can delete own, admin can delete any

### Key Benefits
- ✅ Enforced at database level (cannot be bypassed)
- ✅ No business logic needed in backend
- ✅ Consistent across all clients (web, mobile, API)
- ✅ Transparent (queries automatically filtered)
- ✅ Performant (filter applied before data returned)

---

## 🔄 Data Transformation Pipeline

### Frontend → Database

**Step 1: Form Input** (Frontend types)
```typescript
interface Admission {
  title: string              // "MSc Computer Science"
  degreeType: string         // "master"
  department: string         // "CS Department"
  fee: string                // "500000"
  tuition_fee: string        // "5000"
  deadline: string           // "2026-03-15"
  overview: string           // "Program description"
  eligibility: string        // "Requirements"
  programme_type: string     // "graduate"
  // ... 15+ more fields
}
```

**Step 2: Transform** (transformAdmissionToApi)
```typescript
const payload = {
  university_id: universityId,           // From authenticated user
  title: frontendAdmission.title,         // Direct map
  description: frontendAdmission.overview, // Rename
  degree_level: frontendAdmission.degreeType, // Rename + values
  field_of_study: frontendAdmission.department, // Rename
  application_fee: parseFloat(frontendAdmission.fee),
  deadline: formatDate(frontendAdmission.deadline),
  // ... 20+ transformed fields
  
  // Filter out non-existent:
  // ❌ admission_portal_link (removed)
  // ❌ website_url (removed)
}
```

**Step 3: Validate & Send**
```typescript
// Field whitelist ensures only valid fields sent
const allowedFields = ['university_id', 'title', 'description', ...]
for (const field of allowedFields) {
  if (payload.hasOwnProperty(field)) {
    updatePayload[field] = payload[field]
  }
}

// Send to Supabase
await supabase.from('admissions').update(updatePayload).eq('id', id)
```

**Step 4: Database Storage**
```sql
-- Stored in admissions table exactly as sent
UPDATE admissions SET
  title = 'MSc Computer Science',
  description = 'Program description',
  degree_level = 'master',
  -- ...
WHERE id = '51a63c16-9abf-4d54-8012-b9f2ace790d0'
```

### Database → Frontend

**Step 1: Query Results**
```json
{
  "id": "51a63c16-9abf-4d54-8012-b9f2ace790d0",
  "title": "SSA",
  "description": "SSES",
  "degree_level": "MS",
  ...
}
```

**Step 2: Transform** (dashboardTransformers)
```typescript
const admission: Admission = {
  id: raw.id,
  title: raw.title,
  degreeType: raw.degree_level,      // Rename back
  department: raw.location,           // Map location
  fee: raw.application_fee.toString(), // Convert to string
  deadline: formatDateForInput(raw.deadline), // Format
  overview: raw.description,          // Rename back
  // ... 20+ more transformations
}
```

**Step 3: Display in UI**
```tsx
<div>
  <h2>{admission.title}</h2>
  <p>Degree: {admission.degreeType}</p>
  <p>Deadline: {admission.deadline}</p>
</div>
```

---

## 🏛️ Backend Integration Pattern (Phase 2)

### When to Use Backend
```
✅ Simple CRUD     → Direct Supabase (Current Phase 1)
✅ Complex queries → Backend API (e.g., dashboard)
✅ Business logic  → Backend API (e.g., verification)
✅ Rate limiting   → Backend API (e.g., admin updates)
✅ External APIs   → Backend API (e.g., PDF processing)
```

### Migration Path
```
Phase 1: Frontend ──→ Supabase (Current)
         [Everything uses RLS]

Phase 2: Frontend ──→ Backend ──→ Supabase
         [Complex ops use backend]
         [CRUD can optionally use backend]
```

### Backend API Contract
See [FRONTEND_BACKEND_API_CONTRACT.md](FRONTEND_BACKEND_API_CONTRACT.md) for:
- All 51 endpoint specifications
- Request/response formats
- Error codes
- Authentication headers
- Field mappings

---

## 🎯 Component Architecture

### Frontend Layers

**1. Pages** (Route handlers)
- `ManageAdmissions.tsx` - Create/edit admissions
- `ViewAllAdmissions.tsx` - List with filters
- `UniversityDashboard.tsx` - Aggregate stats
- (18+ more pages)

**2. Contexts** (State management)
- `AuthContext.tsx` - User authentication
- `UniversityDataContext.tsx` - Admissions + dashboard
- `StudentDataContext.tsx` - Student-specific data
- `ToastContext.tsx` - User notifications

**3. Services** (API layer)
- `admissionsService.ts` - Admission CRUD (both direct + backend)
- `dashboardService.ts` - Dashboard aggregations
- `authService.ts` - Authentication flows
- (8 more services)

**4. Utils** (Helpers)
- `admissionUtils.ts` - Data transformation
- `dateUtils.ts` - Date handling
- `validators.ts` - Input validation

**5. Components** (Reusable UI)
- Cards, modals, forms, tables
- Organized by feature (student/, university/, admin/)

---

## 🔌 Integration Points

### Frontend ↔ Supabase (Phase 1)
- ✅ Authentication (Supabase Auth)
- ✅ CRUD operations (Supabase REST API)
- ✅ Real-time updates (optional Supabase subscriptions)

### Frontend ↔ Backend (Phase 2)
- 🔄 Complex queries (dashboard, analytics)
- 🔄 Verification workflows (admin approvals)
- 🔄 External integrations (PDF, email, etc.)

### Backend ↔ Supabase
- ✅ Data persistence (SQL queries)
- ✅ Authentication validation (JWT verification)
- ✅ Business logic (Pydantic models, FastAPI)

---

## 📊 Environment Configuration

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SUPABASE_URL=https://lufhgsgubvxjrrcsevte.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_USE_BACKEND_CRUD=false  # false = Direct Supabase (Phase 1)
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/admissiontimes
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
SUPABASE_URL=https://lufhgsgubvxjrrcsevte.supabase.co
SUPABASE_KEY=service_role_key
```

---

## ✅ Key Design Decisions

### 1. Direct Supabase in Phase 1 (Why?)
- ✅ Faster (1 hop instead of 2)
- ✅ Simpler (no backend needed for CRUD)
- ✅ RLS provides security
- ✅ Can migrate to backend later

### 2. JWT ES256 (Why Supabase?)
- ✅ Industry standard
- ✅ Built-in JWKS support
- ✅ Automatic token refresh
- ✅ Social login ready

### 3. PostgreSQL (Why Supabase?)
- ✅ Relational data (admissions ↔ universities)
- ✅ Strong consistency
- ✅ RLS for security
- ✅ JSON support for complex fields

### 4. React Context (Why not Redux?)
- ✅ Simpler for medium-complexity apps
- ✅ Less boilerplate
- ✅ Good for feature-specific state
- ✅ Combines with Zustand for auth

---

## 🚀 Performance Considerations

### Current (Phase 1)
- CRUD operations: < 100ms (direct Supabase)
- Dashboard query: < 200ms (backend aggregation)
- Page load: < 2s (with lazy loading)

### Optimization Opportunities
- [ ] Database indexes on common filters
- [ ] Query result caching (5 min TTL)
- [ ] Code splitting on routes
- [ ] Image optimization
- [ ] CDN for static assets

---

## 📋 Checklist for Phase 2 Migration

When moving CRUD to backend API:

- [ ] Backend implements all `/university/admissions/*` routes
- [ ] Backend validates JWT tokens (JWKS)
- [ ] Backend enforces authorization (instead of RLS)
- [ ] Response format matches API contract exactly
- [ ] Error codes match specification
- [ ] Logging and monitoring in place
- [ ] Load testing passed (100 req/sec)
- [ ] Frontend environment flag: `VITE_USE_BACKEND_CRUD=true`
- [ ] Dual-write testing (write to both, compare)
- [ ] Rollback plan in place

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| [FRONTEND_BACKEND_API_CONTRACT.md](FRONTEND_BACKEND_API_CONTRACT.md) | API specification |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Status and progress |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Issues and fixes |
| [README.md](README.md) | Setup and deployment |

---

## 🎓 Key Takeaways

1. **Phase 1 = Direct Supabase** for CRUD ops
2. **RLS = Security layer** at database level
3. **Transformations = Field mapping** between frontend/DB
4. **JWT = Authentication** via Supabase Auth
5. **Phase 2 = Backend API** for complex ops (future)

All components are aligned and working correctly as of February 7, 2026. 🎉

---
