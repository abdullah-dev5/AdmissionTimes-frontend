# Admission Submit Endpoint Analysis

## Problem Summary
The `/admissions/:id/submit` endpoint accesses `submitted_by` which can be undefined, causing potential issues in the changelog creation.

---

## 1. Frontend Implementation

### File: [src/services/admissionsService.ts](src/services/admissionsService.ts)

**Lines 243-246: Submit endpoint call**
```typescript
submitForVerification: async (id: string): Promise<ApiResponse<Admission>> => {
    const response = await apiClient.patch(`/admissions/${id}/submit`);
    return response.data;
  },
```

**Key Finding:** Frontend sends **NO request body** to the submit endpoint.

---

## 2. Backend Controller

### File: `E:\fyp\admission-times-backend\src\domain\admissions\controllers\admissions.controller.ts`

**Lines 190-203: submitAdmission controller**
```typescript
/**
 * Submit an admission (university - moves draft to pending)
 * 
 * PATCH /api/v1/admissions/:id/submit
 */
export const submitAdmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.validated as SubmitAdmissionDTO;        // ← Gets validated request body
    const userContext = req.user as UserContext | undefined;  // ← Gets user from JWT middleware

    const admission = await admissionsService.submit(id, data, userContext);

    sendSuccess(res, admission, 'Admission submitted successfully');
  } catch (error) {
    next(error);
  }
};
```

**Key Points:**
- `req.validated` contains the validated request body (from `SubmitAdmissionDTO`)
- `req.user` contains the user context from JWT authentication middleware
- Both are passed to the service

---

## 3. Route Registration

### File: `E:\fyp\admission-times-backend\src\domain\admissions\routes\admissions.routes.ts`

**Lines 435-439: PATCH /admissions/:id/submit route**
```typescript
// PATCH /api/v1/admissions/:id/submit - Submit admission (university - draft to pending)
router.patch(
  '/:id/submit',
  validateParams(uuidParamSchema),
  validateBody(submitAdmissionSchema),          // ← Validates request body
  admissionsController.submitAdmission
);
```

---

## 4. Request Body Schema

### File: `E:\fyp\admission-times-backend\src\domain\admissions\validators\admissions.validators.ts`

**Lines 227-234: submitAdmissionSchema validator**
```typescript
/**
 * Submit admission validation schema
 */
export const submitAdmissionSchema = Joi.object({
  submitted_by: Joi.string()
    .uuid()
    .allow(null, '')
    .optional()                    // ← OPTIONAL - can be undefined
    .messages({
      'string.guid': 'submitted_by must be a valid UUID',
    }),
});
```

**Key Finding:** `submitted_by` is **OPTIONAL** in the request body.

---

## 5. Type Definition

### File: `E:\fyp\admission-times-backend\src\domain\admissions\types\admissions.types.ts`

**Lines 150-152: SubmitAdmissionDTO type**
```typescript
/**
 * Submit admission request DTO (Draft → Pending)
 */
export interface SubmitAdmissionDTO {
  submitted_by?: string;  // ← Optional property
}
```

---

## 6. The Problematic Service Method

### File: `E:\fyp\admission-times-backend\src\domain\admissions\services\admissions.service.ts`

**Lines 350-395: submit() service method**
```typescript
/**
 * Submit an admission (university - moves draft to pending)
 * 
 * @param id - Admission UUID
 * @param data - Submit data
 * @param userContext - User context
 * @returns Submitted admission
 * @throws AppError if cannot be submitted
 */
export const submit = async (
  id: string,
  data: SubmitAdmissionDTO,
  userContext?: UserContext
): Promise<Admission> => {
  const existing = await admissionsModel.findById(id, true);

  if (!existing) {
    throw new AppError('Admission not found', 404);
  }

  // Only draft admissions can be submitted
  if (existing.verification_status !== VERIFICATION_STATUS.DRAFT) {
    throw new AppError(
      `Cannot submit admission with status: ${existing.verification_status}. Only draft admissions can be submitted.`,
      400
    );
  }

  // Update admission to pending
  const updated = await admissionsModel.update(id, {
    verification_status: VERIFICATION_STATUS.PENDING,
  });

  if (!updated) {
    throw new AppError('Failed to submit admission', 500);
  }

  // ⚠️ PROBLEMATIC LINE 369:
  await createChangelogEntry({
    admission_id: updated.id,
    actor_type: 'university',
    changed_by: data.submitted_by || userContext?.id || null,  // ← LINE 369
    action_type: CHANGE_TYPE.STATUS_CHANGED as any,
    field_name: 'verification_status',
    old_value: VERIFICATION_STATUS.DRAFT,
    new_value: VERIFICATION_STATUS.PENDING,
    diff_summary: 'Admission submitted for verification',
  });

  return updated;
};
```

**Line 369 - The Issue:**
```typescript
changed_by: data.submitted_by || userContext?.id || null,
```

**Access Chain:** 
1. `data.submitted_by` - Since frontend sends NO body, this is `undefined`
2. Falls back to `userContext?.id` - Should provide user ID from JWT token
3. Falls back to `null` if both are falsy

---

## 7. User Context Extraction (JWT Middleware)

### File: `E:\fyp\admission-times-backend\src\shared\middleware\jwtAuth.ts`

**Lines 260-283: JWT authentication middleware that sets req.user**
```typescript
// Extract user context from verified token
const userRole = payload.user_metadata?.role || 'student';
const universityId = payload.user_metadata?.university_id || null;
const email = payload.email || null;

req.user = {
  id: databaseUserId,           // ← User ID from database (set at line 281)
  role: userRole as 'student' | 'university' | 'admin',
  university_id: universityId,
  email: email,
} as UserContext;

console.log('✅ User authenticated:', { userId: databaseUserId, userRole, email });
next();
```

**How user ID is extracted:**

1. **Line 256:** JWT payload is verified/decoded:
   ```typescript
   payload = await ensureUserExists(payload);  // Syncs user to database
   ```

2. **Line 107-138:** ensureUserExists() function extracts auth user ID and returns database user ID:
   ```typescript
   const databaseUserId = payload.sub;  // From JWT sub claim
   // ... checks if user exists in database, auto-syncs if needed
   return existingUser.id;  // Returns database user ID
   ```

3. **Line 281:** Sets `req.user.id` to the database user ID

**App Configuration - Line 61 in src/index.ts:**
```typescript
app.use('/api/v1', jwtAuth);  // ← All /api/v1 routes require JWT auth
```

---

## 8. Request Flow Summary

```
Frontend: PATCH /admissions/{id}/submit (NO BODY)
    ↓
Route Validation:
  - validateParams: Validates {id} as UUID ✓
  - validateBody: Validates empty body against submitAdmissionSchema ✓
    (All fields optional, so {} is valid)
    ↓
    req.validated = {}  (empty object, data.submitted_by = undefined)
    ↓
Controller (submitAdmission):
  - Receives: data = {} (empty DTO)
  - Receives: userContext from req.user (set by jwtAuth middleware)
    ↓
Service (submit):
  - Line 369: changed_by = data.submitted_by || userContext?.id || null
  - If userContext?.id exists → Uses user ID ✓
  - If userContext?.id is null/undefined → Uses null
```

---

## 9. Potential Issues

### Issue #1: Missing User Context
If JWT authentication fails or is bypassed:
- `req.user` would be undefined
- `userContext?.id` would try to access `.id` on undefined → **undefined**
- Changelog would be created with `changed_by: null`

### Issue #2: Database User ID Mismatch
The `ensureUserExists()` function returns the **database user ID**, not the Supabase auth user ID:
- This is intentional - the database is the source of truth
- Requires the user to exist in the `users` table

### Issue #3: Changelog Query
The changelog is inserted via direct SQL query (lines 475-489):
```typescript
await query(
  `INSERT INTO changelogs (...) VALUES (...)`,
  [
    entry.admission_id,
    entry.actor_type,
    entry.changed_by,           // ← Could be null
    entry.action_type,
    entry.field_name,
    ...
  ]
);
```

If `changed_by` is null, the changelog will be created but without tracking who made the change.

---

## 10. Root Cause Analysis

**The actual problem is NOT with `submitted_by` being undefined** (this is expected and handled with fallback to `userContext?.id`).

**The real issue is:**
1. Frontend doesn't send any request body
2. `submitted_by` in DTO is always undefined
3. System relies entirely on `userContext?.id` from JWT token
4. If user context extraction fails, `changed_by` becomes `null`

**When would this fail?**
- If JWT authentication middleware doesn't execute or fails silently
- If the user doesn't exist in the database (ensureUserExists fails)
- If the user ID cannot be extracted from JWT claims

---

## 11. Recommendations

### Option A: Send submitted_by from Frontend
Frontend should send the user ID in the request body:
```typescript
submitForVerification: async (id: string, userId?: string): Promise<ApiResponse<Admission>> => {
    const body = userId ? { submitted_by: userId } : {};
    const response = await apiClient.patch(`/admissions/${id}/submit`, body);
    return response.data;
  },
```

### Option B: Make submitted_by Required (Not Recommended)
Change validator to require `submitted_by`:
```typescript
submitted_by: Joi.string()
    .uuid()
    .required()  // ← Force client to provide it
```

### Option C: Add Logging & Validation
Add explicit checks in the service to detect when user context is missing:
```typescript
if (!userContext?.id) {
  throw new AppError('User context required for submission', 400);
}
```

### Option D: Current Approach (Acceptable)
The current approach with fallback to null is acceptable **IF**:
- JWT authentication is properly enabled (which it is at line 61 in src/index.ts)
- User exists in database and ensureUserExists() works correctly
- Null values in `changed_by` are acceptable in changelog records

---

## Conclusion

The `submitted_by` field is **correctly designed as optional** because:
1. Frontend doesn't (and shouldn't need to) send user ID in body
2. User ID should come from JWT token (already authenticated)
3. Fallback to `null` is safe if user context isn't available

**The system works correctly IF JWT authentication is functioning properly.**
If `changed_by` is being set to `null` unexpectedly, investigate:
1. Whether JWT authentication middleware is executing
2. Whether the user exists in the database
3. Whether `ensureUserExists()` is successfully returning a database user ID
