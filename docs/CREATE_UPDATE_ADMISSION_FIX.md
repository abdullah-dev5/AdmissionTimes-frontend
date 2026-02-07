# Create/Update Admission Functionality Fix

## Issue Summary

**Problem**: Creating and editing admissions was not persisting to the backend database. Changes were only updating the frontend React state without making API calls.

**Symptoms**:
- Form submission appeared to work (alerts shown)
- Local state updated temporarily
- Page refresh lost all changes
- Backend database had no new/updated records
- Date format errors in edit form (ISO format vs yyyy-MM-dd)

## Root Causes

### 1. Missing Backend Persistence
The `createOrUpdateAdmission` function in `UniversityDataContext.tsx` was only updating local React state without calling the backend API.

### 2. Data Structure Mismatch
Frontend and backend used different field names:
- Frontend: `degreeType`, `overview`, `fee` (string)
- Backend: `degree_level`, `description`, `application_fee` (number)

### 3. Date Format Inconsistency
- Backend returns: `2026-07-30 23:59:59+00` (ISO with time)
- HTML date input expects: `2026-07-30` (yyyy-MM-dd only)

## Files Modified

### 1. `src/utils/admissionUtils.ts` (Created)
**Purpose**: Centralized utility functions for admission data handling

**Functions Added**:
- `formatDateForInput(dateString)` - Converts ISO datetime to yyyy-MM-dd format
- `sanitizeAdmission(admission)` - Ensures all fields have defaults
- `transformAdmissionToApi(frontendAdmission, universityId)` - Maps frontend format to backend API format
  - Maps `degreeType` → `degree_level`
  - Maps `overview` → `description`
  - Maps `fee` (string) → `application_fee` (number)
  - Maps `status` → `verification_status` + `status`
  - Maps `department` → `location`

### 2. `src/contexts/UniversityDataContext.tsx`
**Changes**:
- Imported `admissionsService` and `transformAdmissionToApi`
- Made `createOrUpdateAdmission` async (returns Promise)
- Added backend persistence with proper API calls:
  ```typescript
  // Create new admission
  await admissionsService.create(apiPayload)
  
  // Update existing admission
  await admissionsService.update(admission.id, apiPayload)
  ```
- Added error handling with user-friendly messages
- Transforms frontend admission to API format before sending
- Updates local state only after successful API response
- Updated interface signature to reflect async return type

### 3. `src/pages/university/ManageAdmissions.tsx`
**Changes**:
- Removed duplicate `formatDateForInput` function (now imported from utils)
- Imported `formatDateForInput` and `sanitizeAdmission` from utils
- Made `handleSaveDraft` and `handlePublish` async
- Added await for `createOrUpdateAdmission` calls
- Added result checking before showing success alerts
- Used `sanitizeAdmission` in useEffect for robustness

### 4. `src/domain/dashboard/services/dashboard.service.ts` (Backend)
**Previous Fix**:
- Updated `recent_admissions` query to return all 19 fields instead of 7
- Ensures complete data for edit operations

## Data Flow (After Fix)

### Create New Admission:
1. User fills form in ManageAdmissions.tsx
2. `handlePublish` builds admission payload (frontend format)
3. Calls `createOrUpdateAdmission(payload)` (async)
4. Context transforms payload to API format using `transformAdmissionToApi`
5. Calls `admissionsService.create(apiPayload)`
6. API creates database record
7. Context updates local state with response
8. Success alert shown, navigates to dashboard

### Update Existing Admission:
1. User navigates to edit mode (?edit=admission-id)
2. Form loads with `formatDateForInput` for date field
3. `sanitizeAdmission` ensures all fields have defaults
4. User modifies fields
5. `handlePublish` builds updated payload
6. Context calls `admissionsService.update(id, apiPayload)`
7. API updates database record
8. Context updates local state
9. Changelog entry created
10. Success alert + navigation

## Field Mapping Reference

| Frontend Field | Backend Field | Transformation |
|---------------|---------------|----------------|
| `id` | `id` | Direct |
| `title` | `title` | Direct |
| `degreeType` | `degree_level` | Direct |
| `deadline` | `deadline` | yyyy-MM-dd format |
| `fee` | `application_fee` | String → Number |
| `overview` | `description` | Direct |
| `department` | `location` | Direct |
| `status` | `verification_status` | Status mapper |
| `status` | `status` | Status mapper |

### Status Mapping:

**Frontend → Backend `verification_status`**:
- "Verified" → "verified"
- "Rejected", "Disputed" → "rejected"
- "Pending Audit", "Draft", "Active" → "pending"

**Frontend → Backend `status`**:
- "Closed" → "closed"
- "Draft" → "inactive"
- Others → "active"

## Testing Checklist

- [x] TypeScript compilation (no errors)
- [ ] Create new admission (verify in database)
- [ ] Edit existing admission (verify updates persist)
- [ ] Date format displays correctly in edit mode
- [ ] Form validation works (required fields)
- [ ] Error handling displays user-friendly messages
- [ ] Changelog entries created on edit
- [ ] Navigation after successful save
- [ ] Draft vs Publish status handling

## Known Limitations

1. **Field Coverage**: Not all frontend fields map to backend (e.g., `academicYear`, `eligibility`, `websiteUrl` not persisted to database)
2. **University ID**: Currently retrieved from user session (`user.id` or `user.university_id`)
3. **Location Field**: Currently mapping `department` to `location` as temporary solution
4. **Temporary IDs**: New admissions use client-side generated IDs (`adm-${Date.now()}`) until backend assigns real ID

## Future Improvements

1. Extend backend schema to include missing fields:
   - `academic_year`
   - `eligibility_criteria`
   - `website_url`
   - `admission_portal_link`
   - `department`
   
2. Implement optimistic updates with rollback on error
3. Add loading states during API calls
4. Implement field-level validation before submission
5. Add toast notifications instead of alerts
6. Implement auto-save draft functionality

## Rollback Plan

If issues occur:
1. Revert `UniversityDataContext.tsx` to synchronous version
2. Remove `admissionUtils.ts`
3. Restore original `ManageAdmissions.tsx`
4. Changes are isolated to these 3 files

## Related Documentation

- [Frontend Backend API Contract](../FRONTEND_BACKEND_API_CONTRACT.md)
- [Authentication Architecture](../AUTHENTICATION_ARCHITECTURE.md)
- [University Module Documentation](../project-docs/university-module.md)
