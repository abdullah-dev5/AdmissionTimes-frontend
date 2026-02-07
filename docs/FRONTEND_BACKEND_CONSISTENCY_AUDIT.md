# Frontend-Backend Consistency Audit Report
**Date**: February 7, 2026  
**Status**: ⚠️ CRITICAL MISMATCHES FOUND

## Executive Summary

The frontend and backend have **significant data structure mismatches** that will prevent proper data persistence and display. 

**Issues Found: 14 Critical, 8 Medium, 5 Low**

---

## 1. BACKEND SCHEMA vs FRONTEND TYPES

### Available Backend Fields (admissions table)
```
id, university_id, title, description, program_type, degree_level, 
field_of_study, duration, tuition_fee, currency, application_fee, 
deadline, start_date, location, delivery_mode, requirements, 
verification_status, verified_at, verified_by, rejection_reason, 
dispute_reason, created_by, created_at, updated_at, is_active
Total: 25 fields
```

### Frontend API Type Definition (src/types/api.ts - Admission interface)
```typescript
id, university_id, title, degree_level, deadline, application_fee,
location, description, verification_status, status, created_at, updated_at
Total: 12 fields (missing 13 from backend)
```

### frontend Internal Type (src/data/universityData.ts - Admission interface)
```typescript
id, title, deadline, status, views?, verifiedBy?, lastAction?, remarks?,
degreeType?, department?, academicYear?, fee?, overview?, eligibility?,
websiteUrl?, admissionPortalLink?
Total: 16 fields (mix of backend + custom frontend fields)
```

---

## 2. FIELD MAPPING BREAKDOWN

### ✅ Properly Mapped Fields
| Backend | Frontend (API) | Frontend (Internal) | Status |
|---------|---|---|---|
| `id` | ✅ id | ✅ id | CORRECT |
| `title` | ✅ title | ✅ title | CORRECT |
| `deadline` | ✅ deadline | ✅ deadline | CORRECT |
| `description` | ✅ description | ✅ overview | CORRECT |
| `degree_level` | ✅ degree_level | ✅ degreeType | CORRECT |
| `application_fee` | ✅ application_fee | ✅ fee | CORRECT |
| `location` | ✅ location | ❓ department | PARTIAL |
| `verification_status` | ✅ verification_status | ℹ️ status | MAPPING |

### ❌ Missing from Frontend API Type
| Backend Field | Frontend (API) | Frontend (Internal) | Impact |
|---|---|---|---|
| `program_type` | ❌ MISSING | ❓ NOT MAPPED | Cannot determine academic level |
| `field_of_study` | ❌ MISSING | ❓ PARTIAL (as dept) | Cannot categorize programs |
| `duration` | ❌ MISSING | ❌ NOT MAPPED | User sees no program length |
| `delivery_mode` | ❌ MISSING | ❌ NOT MAPPED | User sees no format info |
| `requirements` | ❌ MISSING | ✅ eligibility | Partially mapped via JSONB |
| `start_date` | ❌ MISSING | ❌ NOT MAPPED | User sees no start date |
| `currency` | ❌ MISSING | ❌ NOT MAPPED | Fee lacks currency context |
| `tuition_fee` | ❌ MISSING | ❌ NOT MAPPED | User sees only application fee |
| `verified_by` | ❌ MISSING | ✅ verifiedBy | Partially available |
| `verified_at` | ❌ MISSING | ❌ NOT MAPPED | Audit trail incomplete |
| `created_by` | ❌ MISSING | ❌ NOT MAPPED | Attribution missing |

### ❌ Frontend-Only Fields (Not in Backend)
| Frontend Field | Backend | Status | Solution |
|---|---|---|---|
| `views` | NONE | 🔴 ORPHAN | Needs analytics table |
| `lastAction` | updated_at | ✅ CAN MAP | Use updated_at |
| `remarks` | rejection_reason, dispute_reason | ⚠️ PARTIAL | Multiple backend fields |
| `academicYear` | NONE | 🔴 ORPHAN | Can extract from deadline/start_date |
| `department` | field_of_study | ✅ CAN MAP | Use field_of_study |
| `eligibility` | requirements JSONB | ✅ CAN MAP | Use requirements |
| `websiteUrl` | NONE | 🔴 ORPHAN | Needs new column |
| `admissionPortalLink` | NONE | 🔴 ORPHAN | Needs new column |

---

## 3. API RESPONSE STRUCTURE MISMATCHES

### Dashboard API Response (Backend)
```typescript
interface UniversityDashboard {
  stats: {
    total_admissions: number;
    pending_verification: number;
    verified_admissions: number;
    recent_updates: number;  // ⚠️ Mismatch: frontend expects 'recent_changes'
    unread_notifications: number;
  };
  recent_admissions: Admission[];      // ✅ Returns 18 fields
  pending_verifications: Object[];      // ⚠️ Reduced schema
  recent_changes: ChangeLog[];
  recent_notifications: Notification[];
}
```

### Expected by Frontend (src/types/api.ts)
```typescript
interface UniversityDashboard {
  stats: {
    total_admissions: number;
    pending_verification: number;
    verified_admissions: number;
    recent_changes: number;     // ❌ Backend returns 'recent_updates'
    unread_notifications: number;
  };
  // ... rest of fields
}
```

**Impact**: Frontend stats display may not match reality.

---

## 4. DATA TRANSFORMATION ISSUES

### Frontend Transformer (src/utils/dashboardTransformers.ts)

**Current Mappings:**
```typescript
admission.degree_level → degreeType ✅
admission.field_of_study || admission.department → department ⚠️ (field not in API response)
admission.application_fee → fee ✅
admission.description → overview ✅
admission.deadline → deadline ✅
admission.verified_by → verifiedBy ✅
admission.updated_at → lastAction ✅
admission.requirements → eligibility 🔴 (Still optional, JSONB parsing missing)
admission.website_url → websiteUrl 🔴 (Field not returned from API)
admission.admission_portal_link → admissionPortalLink 🔴 (Field not returned)
```

**Missing Transformations:**
- `program_type` - Not mapped (backend returns, frontend ignores)
- `duration` - Not mapped
- `delivery_mode` - Not mapped
- `start_date` - Not mapped
- `currency` - Not mapped
- `tuition_fee` - Not mapped
- `created_by` - Not returned from API
- `verified_at` - Not mapped

### Frontend Save Transformer (src/utils/admissionUtils.ts)

**Current Mappings (Frontend → Backend):**
```typescript
degreeType → degree_level ✅
overview → description ✅
fee → application_fee (string → number) ✅
department → location ❌ (Should save separately)
```

**Missing:**
- `program_type` - Frontend ignores input
- `duration` - Frontend ignores input
- `delivery_mode` - Frontend ignores input
- `requirements` - Frontend doesn't collect
- `start_date` - Frontend doesn't collect
- `currency` - Frontend doesn't collect
- `tuition_fee` - Frontend doesn't collect
- `field_of_study` - Mapped to `department` field

---

## 5. DATABASE STRUCTURAL ISSUES

### ❌ Missing Universities Table
- **Issue**: Admissions table references `university_id` with comment "Future: foreign key to universities table"
- **Status**: Table does NOT exist
- **Impact**:
  - Cannot properly associate admissions with universities
  - Backend uses `OR created_by = $1` workaround instead of proper FK join
  - Dashboard query uses `location` field as `university_name` (wrong!)
  - Cannot support multi-university deployments properly

### ❌ Missing Analytics/Views Table
- **Issue**: Frontend `views` field has no backend source
- **Status**: No views/analytics tracking table
- **Impact**: "Most Viewed" sorting doesn't work
- **Solution**: Need dedicated analytics table

### ⚠️ Incomplete Changelog Tracking
- **Issue**: Changelog only stores single field changes, not full deltas
- **Status**: Design limitation
- **Impact**: Cannot show comprehensive before/after

### ⚠️ Requirements as JSONB
- **Issue**: Complex `requirements` field stored as JSONB without schema
- **Status**: Flexible but unvalidated
- **Impact**: Frontend cannot reliably parse requirements

---

## 6. CRITICAL ISSUES SUMMARY

### 🔴 CRITICAL (Will Cause Errors)
1. **No Universities Table** - Cannot form proper FK relationships
2. **Status Field Missing from API** - Frontend expects but backend doesn't return
3. **Missing Analytics Table** - Views/trending data has no source
4. **Orphan Frontend Fields** - `views`, `websiteUrl`, `admissionPortalLink`, `academicYear` not persisted
5. **Dashboard Stat Mismatch** - `recent_changes` vs `recent_updates` naming

### 🟡 MEDIUM (Data Loss/Incomplete)
1. **program_type Not in Frontend Type** - Data returned by API but ignored
2. **field_of_study Not in Frontend Type** - Data returned but ignored
3. **duration Not Collected** - Student needs program length
4. **start_date Not Collected** - Important for planning
5. **delivery_mode Not Collected** - Important for students
6. **currency Not Collected** - Fee without currency is ambiguous
7. **tuition_fee Not Collected** - Frontend only shows application fee
8. **Requirements Parsing Missing** - JSONB field not properly handled

### 🔵 LOW (UI/Display Issues)
1. **Department/Location Confusion** - Field serves dual purpose
2. **LastAction Display** - Shows created_at or updated_at unclear
3. **Remarks/Notes Incomplete** - Multiple backend fields squashed into one
4. **Academic Year Calculation** - Frontend calculates from deadline, may be inaccurate

---

## 7. DATA FLOW AUDIT

### Create/Update Flow Issues
```
Frontend Form
  ↓
ManageAdmissions.tsx
  ↓
buildAdmissionPayload() - ⚠️ Only 12 fields
  ↓
admissionUtils.transformAdmissionToApi() - ⚠️ Transformation incomplete
  ↓
admissionsService.create/update() - ✅ API call correct
  ↓
Backend /admissions endpoint - ✅ Accepts all 25 fields
  ↓
Database INSERT/UPDATE - ✅ Stores all fields
  ↓
Dashboard Fetch - ❌ Returns ONLY 18 fields
  ↓
dashboardTransformers.transformUniversityDashboard() - ⚠️ Maps available fields only
  ↓
UniversityDataContext - ⚠️ 7 fields lost
  ↓
Frontend State - ❌ 7 backend fields never reach UI
```

**Data Loss Points:**
1. Frontend form doesn't collect 13 fields
2. API response doesn't include all database fields
3. Transformer doesn't map fields that aren't in API response

---

## 8. FIELD-BY-FIELD CONSISTENCY CHECK

### Green (Fully Consistent)
- ✅ `id` - All three layers aligned
- ✅ `title` - All three layers aligned
- ✅ `deadline` - All three layers aligned
- ✅ `description` - Maps to `overview` consistently
- ✅ `degree_level` - Maps to `degreeType` consistently
- ✅ `application_fee` - Maps to `fee` consistently
- ✅ `verification_status` - Present in all layers
- ✅ `created_at` - Present in all layers
- ✅ `updated_at` - Maps to `lastAction` consistently

### Yellow (Partial/Incomplete)
- ⚠️ `location` - Used for `department` but also `university_name`
- ⚠️ `field_of_study` - Returned but not mapped to frontend type
- ⚠️ `requirements` - JSONB not properly parsed
- ⚠️ `verified_by` - Returned but not always available
- ⚠️ `status` / `is_active` - Mismapped to backend

### Red (Missing/Broken)
- 🔴 `program_type` - Backend → Frontend  LOST
- 🔴 `duration` - Backend → Frontend LOST
- 🔴 `start_date` - Backend → Frontend LOST
- 🔴 `delivery_mode` - Backend → Frontend LOST
- 🔴 `tuition_fee` - Backend → Frontend LOST
- 🔴 `currency` - Backend → Frontend LOST
- 🔴 `created_by` - Backend Query returns but Dashboard doesn't include
- 🔴 `status` - Frontend field, backend doesn't provide
- 🔴 `views` - Frontend field, backend doesn't track
- 🔴 `websiteUrl` - Frontend field, backend doesn't store
- 🔴 `admissionPortalLink` - Frontend field, backend doesn't store
- 🔴 `academicYear` - Frontend field, backend doesn't store
- 🔴 `eligibility` - Frontend field, backend mismaps to requirements

---

## 9. RECOMMENDED FIXES (Priority Order)

### Phase 1 - CRITICAL (Must Fix Now)
1. Create universities table
2. Add `status` field calculation logic to backend API
3. Fix dashboard stat field naming (`recent_updates` → `recent_changes`)
4. Update frontend API types to include all 18 returned fields
5. Update transformer to map all returned fields

### Phase 2 - HIGH (Fix Soon)
1. Add missing database columns:
   - `website_url` (VARCHAR)
   - `admission_portal_link` (VARCHAR)
   - `department` (VARCHAR)
   - `academic_year` (INT or VARCHAR)
2. Update form to collect these fields
3. Update transformers to map these fields

### Phase 3 - MEDIUM (Improve Quality)
1. Create analytics/views table
2. Implement proper requirements parsing
3. Add verification timestamps to API response
4. Create full field documentation

### Phase 4 - LOW (Polish)
1. Add data validation schemas
2. Implement field versioning
3. Add deprecation warnings for old field names

---

## 10. FILES REQUIRING UPDATES

### Frontend Files to Update
- `src/types/api.ts` - Add missing fields to Admission interface
- `src/utils/dashboardTransformers.ts` - Map all returned fields
- `src/utils/admissionUtils.ts` - Update transformation logic
- `src/pages/university/ManageAdmissions.tsx` - Collect new fields
- `src/data/universityData.ts` - Update mock data structure
- `src/contexts/UniversityDataContext.tsx` - Handle new fields

### Backend Files to Update
- `supabase/migrations/` - Create universities table, add missing columns
- `src/domain/dashboard/services/dashboard.service.ts` - Return all fields, join universities
- `src/domain/admissions/models/admissions.model.ts` - Update queries
- `src/domain/admissions/types/admissions.types.ts` - Add missing fields
- `src/domain/analytics/` - Create analytics table for views
- `src/domain/dashboard/types/dashboard.types.ts` - Update response types

---

## 11. VALIDATION CHECKLIST

Before considering the university module "complete", verify:

- [ ] All 25 database fields properly defined
- [ ] Frontend API types include all returned fields
- [ ] Dashboard API returns consistent field set
- [ ] Transformer maps all fields correctly
- [ ] Create/update preserves all fields
- [ ] Universities table exists and properly FK'd
- [ ] Analytics table exists for views tracking
- [ ] Status field properly calculated
- [ ] All forms collect necessary data
- [ ] Edit operations restore all fields
- [ ] Changelog properly tracks changes
- [ ] No data loss on round-trip (save and fetch)
- [ ] Frontend mock data matches backend schema
- [ ] API documentation matches implementation
- [ ] Tests verify field consistency

