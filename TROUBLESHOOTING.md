# 🔧 Troubleshooting & Issues Guide

**Last Updated:** February 7, 2026  
**Purpose:** Common issues, solutions, and debugging approaches

---

## 📋 Quick Issue Reference

| Issue | Symptom | Cause | Solution |
|-------|---------|-------|----------|
| **404 on DELETE** | "Delete returns 404 (Not Found)" | Backend routes missing | Use `deleteDirect()` for Supabase |
| **400 on UPDATE** | "Could not find column" | Sending non-existent fields | Use field whitelist in payload |
| **5 Admissions Only** | Dashboard shows max 5 items | Hardcoded LIMIT 5 in SQL | Remove LIMIT clause (✅ Fixed) |
| **Draft Not Saving** | Status reverts to draft | `verification_status` not sent | Include in API payload (✅ Fixed) |
| **Profile 400 Error** | "Update fails with 400" | Missing universities table entry | Run migration for auto-creation (✅ Fixed) |
| **university_id null** | Admissions save with null ID | Not extracted from request | Use `user.university_id` from auth |

---

## 🔴 Issue #1: DELETE Returns 404

### Symptoms
```
DELETE http://localhost:5173/api/v1/university/admissions/{id} 404 (Not Found)
```

### Root Cause
- Backend doesn't have all `/university/admissions/{id}` routes implemented
- Frontend was calling non-existent API endpoint

### Solution (Applied ✅)
Changed from backend API to direct Supabase:
```typescript
// BEFORE (❌ 404)
const response = await apiClient.delete(`/university/admissions/${id}`);

// AFTER (✅ Works)
await admissionsService.deleteDirect(id);
```

**Files Modified:**
- [admissionsService.ts](src/services/admissionsService.ts) - Added `deleteDirect()`
- [UniversityDataContext.tsx](src/contexts/UniversityDataContext.tsx) - Uses `deleteDirect()`

**Verification:**
```javascript
// In console, admissions delete should complete without errors
handleDelete(admissionId)
// Watch Network tab: DELETE shows 200, not 404
```

---

## 🔴 Issue #2: UPDATE Returns 400 - Invalid Column

### Symptoms
```
PATCH https://supabase.co/rest/v1/admissions?id=eq.{id} 400 (Bad Request)
Message: "Could not find the 'admission_portal_link' column"
```

### Root Cause
Frontend transformation function was sending fields that don't exist in database:
- `website_url` ❌ (doesn't exist)
- `admission_portal_link` ❌ (doesn't exist)

### Solution (Applied ✅)

**Step 1:** Remove non-existent fields from transformation
```typescript
// admissionUtils.ts
// REMOVED:
// website_url: frontendAdmission.website_url || frontendAdmission.websiteUrl,
// admission_portal_link: frontendAdmission.admission_portal_link || ...,

// KEPT ONLY:
description: frontendAdmission.overview,
```

**Step 2:** Add field whitelist to updateDirect()
```typescript
// admissionsService.ts
const allowedFields = [
  'university_id', 'title', 'description', 'program_type',
  'degree_level', 'field_of_study', 'duration', 'tuition_fee',
  'currency', 'application_fee', 'deadline', 'start_date',
  'location', 'delivery_mode', 'requirements', 'verification_status',
];

// Only send allowed fields
for (const field of allowedFields) {
  if (data.hasOwnProperty(field)) {
    updatePayload[field] = data[field];
  }
}
```

**Files Modified:**
- [admissionUtils.ts](src/utils/admissionUtils.ts) - Removed non-existent fields
- [admissionsService.ts](src/services/admissionsService.ts) - Added field whitelisting

**Verification:**
```javascript
// Update should work without 400 error
const result = await updateAdmission(id, { title: 'New Title' })
// Check Network tab: PATCH returns 200
```

---

## 🔴 Issue #3: Only 5 Admissions Show

### Symptoms
```
Dashboard shows only 5 admissions even though 8+ exist
```

### Root Cause
Dashboard SQL query had hardcoded `LIMIT 5` on recent_admissions CTE

### Solution (Applied ✅)
Removed LIMIT clause from dashboard SQL:
```sql
-- BEFORE (❌)
WITH recent_admissions AS (
  SELECT * FROM admissions LIMIT 5
)

-- AFTER (✅)
WITH recent_admissions AS (
  SELECT * FROM admissions
  ORDER BY created_at DESC
)
```

**Location:**
- Backend dashboard service (separate backend repository)

**Verification:**
```bash
# Check backend dashboard logs
# Should see 8+ admissions in response
curl http://localhost:3000/api/v1/university/dashboard
```

---

## 🔴 Issue #4: Draft Status Not Persisting

### Symptoms
```
Change status to "Pending Audit" → Save → Refresh → Back to "Draft"
```

### Root Cause
- Backend DTO didn't accept `verification_status` field
- Frontend was sending it, backend was ignoring it
- Status reverted to default 'draft' on next read

### Solution (Applied ✅)

**Step 1:** Add to backend DTO
```typescript
// Backend (in separate repo)
class CreateAdmissionDTO {
  verification_status?: 'draft' | 'pending' | 'verified' | 'rejected'
}
```

**Step 2:** Include in service layer
```typescript
// admissionsService.ts
const saveAdmission = async (data) => {
  return await admissionsService.createDirect({
    ...data,
    verification_status: data.verification_status || 'pending'
  })
}
```

**Files Modified:**
- Backend DTOs and service layer
- [admissionsService.ts](src/services/admissionsService.ts) - Includes status in payload

**Verification:**
```javascript
// Status should persist through update/refresh
const admission = { title: 'Test', verification_status: 'pending' }
await updateAdmission(admission)
// Refresh page - status still "pending" ✅
```

---

## 🔴 Issue #5: University Profile 400 Error

### Symptoms
```
Trying to update university profile → 400 Bad Request
Checking database: users.organization_id has value but universities table is empty
```

### Root Cause
- User signup created record in `users` table with `organization_id`
- But didn't create corresponding entry in `universities` table
- Foreign key or RLS policy fails on update

### Solution (Applied ✅)

**Step 1:** Immediate fix - manually create missing record
```sql
INSERT INTO universities (id, name, is_active, created_at, updated_at)
VALUES ('975a3939-986a-4824-9528-6d7265739cac', 'Sukkur IBA University', true, NOW(), NOW());
```

**Step 2:** Permanent fix - auto-creation trigger
```sql
-- Migration: 20260207_auto_create_universities.sql
CREATE OR REPLACE FUNCTION create_university_for_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'university' THEN
    INSERT INTO universities (id, name, is_active, ...)
    VALUES (NEW.organization_id, NEW.display_name, true, ...)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_university_for_user
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION create_university_for_user();
```

**Files:**
- [20260207_auto_create_universities.sql](supabase/migrations/20260207_auto_create_universities.sql)
- See [AUTO_CREATE_UNIVERSITIES_GUIDE.md](docs/AUTO_CREATE_UNIVERSITIES_GUIDE.md) for testing

**Verification:**
```sql
-- After migration, every university user should have universities record
SELECT u.id, u.organization_id, uni.name
FROM users u
LEFT JOIN universities uni ON uni.id = u.organization_id
WHERE u.role = 'university'
-- All rows should show ✅ universities.name is NOT NULL
```

---

## 🔴 Issue #6: university_id Saves as NULL

### Symptoms
```
Create admission → university_id should be set → Saves as NULL
```

### Root Cause
- Backend wasn't extracting `university_id` from request
- Frontend sends it, but backend ignored it
- Defaulted to NULL

### Solution (Applied ✅)

**In Backend Service Layer:**
```typescript
// BEFORE (❌)
const admission = new Admission({
  title: data.title,
  // university_id not included
})

// AFTER (✅)
const admission = new Admission({
  title: data.title,
  university_id: data.university_id || userContext.university_id,
  verification_status: data.verification_status || 'draft'
})
```

**Frontend Sends:**
```typescript
const payload = {
  university_id: user.university_id,
  title: '...',
  verification_status: 'pending',
  // ... other fields
}
```

**Verification:**
```javascript
// Check new admission in database
SELECT id, title, university_id, verification_status
FROM admissions
WHERE title = 'Test Admission'
-- university_id should NOT be NULL ✅
```

---

## 🔵 Architecture Alignment (Phase 1)

### Current Approach: Direct Supabase
```
Frontend Service Layer (Phase 1)
├─ createDirect()   → Supabase INSERT
├─ readDirect()     → Supabase SELECT
├─ updateDirect()   → Supabase UPDATE
└─ deleteDirect()   → Supabase DELETE
```

### When Moving to Backend (Phase 2)
```
Frontend Service Layer (Phase 2)
├─ create()         → Backend POST /university/admissions
├─ read()           → Backend GET /university/admissions
├─ update()         → Backend PUT /university/admissions/{id}
└─ delete()         → Backend DELETE /university/admissions/{id}
```

**Migration Path:**
1. Backend implements all `/university/admissions/*` routes
2. Frontend changes service calls from `*Direct()` to regular methods
3. Backend validates permissions (instead of RLS)
4. Everything else stays the same

---

## 🟢 Debugging Checklist

### Network Issues
- [ ] Backend is running (`curl http://localhost:3000/health`)
- [ ] Frontend dev server running (`http://localhost:5173`)
- [ ] Database accessible from frontend (Supabase dashboard loads)
- [ ] JWT token is valid and not expired

### Authentication Issues
- [ ] User is authenticated (check AuthContext in console)
- [ ] JWT token present in localStorage
- [ ] Token includes correct user_id and role
- [ ] User has corresponding database record

### Database Issues
- [ ] university_id matches between users and universities tables
- [ ] RLS policies allow the operation
- [ ] Columns exist in target table
- [ ] Foreign key constraints are satisfied

### Data Issues
- [ ] Payload only includes valid fields
- [ ] Field names match database columns exactly
- [ ] Data types are correct (dates as ISO strings, numbers as numbers)
- [ ] Required fields are not null

---

## 🔍 Debug Commands

### Check Auth State
```javascript
// In browser console
useAuthStore.getState()
// Should show: { user, isAuthenticated, token }
```

### Check Admissions State
```javascript
// In browser console
const { admissions } = useUniversityData()
console.log(admissions)
// Should show array of admission objects
```

### Check Supabase Connection
```javascript
// In browser console
const { data, error } = await supabase
  .from('admissions')
  .select('*')
  .limit(1)
console.log(data, error)
// Should return data, not error
```

### Check JWT Token
```javascript
// In browser console
const token = useAuthStore.getState().token
console.log(atob(token.split('.')[1]))
// Should show user claims with id, role, university_id
```

---

## 📞 Support Resources

### Documentation
- **API Contract**: [FRONTEND_BACKEND_API_CONTRACT.md](FRONTEND_BACKEND_API_CONTRACT.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Status**: [PROJECT_STATUS.md](PROJECT_STATUS.md)

### Tools
- **Supabase Dashboard**: https://app.supabase.com
- **Backend Swagger**: http://localhost:3000/api-docs
- **Browser DevTools**: F12 → Console, Network tabs
- **VS Code**: Debug with breakpoints

### Key Concepts
- **Phase 1**: Uses direct Supabase (Current)
- **Phase 2**: Uses backend API (Future)
- **RLS**: Row-Level Security protects at database level
- **JWT**: Supabase ES256 tokens in Authorization header

---

## ✅ Quick Status Check

Run this to verify everything is working:

```bash
# 1. Check backend health
curl http://localhost:3000/health

# 2. Check database connection
# Open Supabase dashboard → SQL Editor → Run:
SELECT COUNT(*) FROM admissions;

# 3. Check frontend in console
useAuthStore.getState()  # Should show user
useUniversityData().admissions  # Should show 8+ items

# 4. Test create/update/delete
# Try in ManageAdmissions UI - should work without errors
```

---
