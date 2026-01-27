# User Setup Guide for Development

**Issue:** Foreign key constraint violation when adding to watchlist  
**Cause:** User ID from headers doesn't exist in database  
**Solution:** Ensure test users exist in seeded data

---

## 🔍 Problem

When trying to add an admission to watchlist, the backend returns:
```
insert or update on table "watchlists" violates foreign key constraint "watchlists_user_id_fkey"
```

This happens because the `user_id` from the `x-user-id` header doesn't exist in the `users` table.

---

## ✅ Solution

### Option 1: Ensure Users Exist in Seeded Data (Recommended)

The backend seeding script should include the test users that match the frontend test user IDs:

**Test User IDs (from frontend):**
- **Student:** `7998b0fe-9d05-44e4-94ab-e65e0213bf10`
- **University:** `412c9cd6-78db-46c1-84e1-c059a20d11bf`
- **Admin:** `e61690b2-0a64-47de-9274-66e06d1437b7`

**Backend Seeding Script Should Include:**
```typescript
// backend/prisma/seeds/02_users.ts
export const users = [
  {
    id: '7998b0fe-9d05-44e4-94ab-e65e0213bf10',
    email: 'student@test.com',
    user_type: 'student',
    university_id: null,
    created_at: new Date('2024-01-01'),
  },
  {
    id: '412c9cd6-78db-46c1-84e1-c059a20d11bf',
    email: 'university@test.com',
    user_type: 'university',
    university_id: '412c9cd6-78db-46c1-84e1-c059a20d11bf',
    created_at: new Date('2024-01-01'),
  },
  {
    id: 'e61690b2-0a64-47de-9274-66e06d1437b7',
    email: 'admin@test.com',
    user_type: 'admin',
    university_id: null,
    created_at: new Date('2024-01-01'),
  },
  // ... other users
];
```

### Option 2: Backend Auto-Create User (Development Only)

For development, the backend could automatically create a user if it doesn't exist:

```typescript
// Backend middleware (development only)
async function ensureUserExists(userId: string, userRole: string) {
  const user = await db.users.findUnique({ where: { id: userId } });
  
  if (!user) {
    // Auto-create user for development
    await db.users.create({
      data: {
        id: userId,
        email: `${userRole}@test.com`,
        user_type: userRole,
        created_at: new Date(),
      },
    });
  }
}
```

### Option 3: Use Existing User IDs

Check what user IDs exist in your seeded database and update the frontend to use those:

```typescript
// Update src/utils/setupUserContext.ts with actual user IDs from database
export function setupUserContext(userType: 'student' | 'university' | 'admin') {
  // Get actual user IDs from your seeded database
  const testUsers = {
    student: {
      id: 'ACTUAL_USER_ID_FROM_DB', // Replace with real ID
      role: 'student',
    },
    // ...
  };
}
```

---

## 🔧 Quick Fix for Testing

### Check Current User ID

Open browser console and run:
```javascript
console.log('Current User ID:', localStorage.getItem('userId'));
```

### Verify User Exists in Database

Check your backend database:
```sql
SELECT id, email, user_type FROM users WHERE id = '7998b0fe-9d05-44e4-94ab-e65e0213bf10';
```

### Create User Manually (Quick Test)

If user doesn't exist, create it:
```sql
INSERT INTO users (id, email, user_type, created_at)
VALUES (
  '7998b0fe-9d05-44e4-94ab-e65e0213bf10',
  'student@test.com',
  'student',
  NOW()
);
```

---

## 📝 Frontend Error Handling

The frontend now includes better error handling:

1. **Optimistic Updates:** UI updates immediately, rolls back on error
2. **User-Friendly Messages:** Shows specific error messages
3. **Error Detection:** Detects foreign key constraint errors specifically

---

## ✅ Verification

After fixing, test:

1. **Check User Exists:**
   ```bash
   # In backend, query database
   SELECT * FROM users WHERE id = '7998b0fe-9d05-44e4-94ab-e65e0213bf10';
   ```

2. **Test Watchlist:**
   - Navigate to student dashboard
   - Click "Save" on an admission
   - Should work without errors

3. **Check Console:**
   - No foreign key errors
   - Success message or proper error message

---

## 🔗 Related

- **Backend Seeding:** See `MOCK_DATA_TO_SEEDING_PLAN.md`
- **User Context:** See `src/utils/setupUserContext.ts`
- **API Client:** See `src/services/apiClient.ts`

---

**Status:** Needs Backend Fix  
**Priority:** High  
**Date:** January 18, 2026
