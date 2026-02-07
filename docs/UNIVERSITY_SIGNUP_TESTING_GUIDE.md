# University Signup Flow - Testing Guide

**Project:** AdmissionTimes  
**Last Updated:** February 6, 2026  
**Status:** Development/Testing Solution

---

## 🎯 Problem Overview

### The Challenge
University representatives need a `university_id` to sign up, which should normally be provided by an admin. However, during development and testing, there's a chicken-and-egg problem:
- You can't create a university representative without a university ID
- University IDs should come from existing universities in the database
- For testing, we need a simple way to create university representatives

---

## ✅ Solution Implemented

### Frontend Changes

#### 1. Test Universities Constants (`src/constants/testUniversities.ts`)
Created a file with pre-defined test universities:
- 5 test universities with known UUIDs
- Helper functions to get university info
- Development mode detection

```typescript
export const TEST_UNIVERSITIES = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Stanford University', ... },
  { id: '00000000-0000-0000-0000-000000000002', name: 'MIT', ... },
  // ... 3 more universities
]
```

#### 2. Enhanced Signup Form (`src/pages/SignUp.tsx`)
Modified the university signup flow:
- **Development Mode:** Shows a dropdown with test universities
- **Production Mode:** Shows text input for university ID (admin-provided)
- Automatically detects environment using Vite's `import.meta.env.DEV`

**Before (Manual ID Entry):**
```
University ID: [text input] "Enter your university ID"
```

**After (Development Mode):**
```
Select University: [dropdown]
  -- Select a University --
  Stanford University (USA)
  MIT (USA)
  Harvard University (USA)
  ...
```

---

## 🔧 Backend Requirements

To make this work, you need to seed your backend database with these test universities.

### Option 1: SQL Seed Script (Recommended)

Create a seed file in your backend (e.g., `backend/seeds/test_universities.sql`):

```sql
-- Test Universities for Development
-- These UUIDs match the frontend TEST_UNIVERSITIES constant

INSERT INTO universities (id, name, country, city, description, website, created_at, updated_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'Stanford University',
    'USA',
    'Stanford, California',
    'Leading research university in California',
    'https://www.stanford.edu',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'MIT',
    'USA',
    'Cambridge, Massachusetts',
    'Massachusetts Institute of Technology',
    'https://www.mit.edu',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Harvard University',
    'USA',
    'Cambridge, Massachusetts',
    'Ivy League research university',
    'https://www.harvard.edu',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Oxford University',
    'UK',
    'Oxford',
    'Historic university in England',
    'https://www.ox.ac.uk',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Cambridge University',
    'UK',
    'Cambridge',
    'Collegiate research university',
    'https://www.cam.ac.uk',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;
```

**Run the seed:**
```bash
# PostgreSQL
psql -U your_user -d your_database -f backend/seeds/test_universities.sql

# OR via your backend migration tool
```

### Option 2: Python/FastAPI Seed Script

Create `backend/seeds/seed_test_universities.py`:

```python
from uuid import UUID
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.university import University

TEST_UNIVERSITIES = [
    {
        "id": UUID("00000000-0000-0000-0000-000000000001"),
        "name": "Stanford University",
        "country": "USA",
        "city": "Stanford, California",
        "description": "Leading research university in California",
        "website": "https://www.stanford.edu",
    },
    {
        "id": UUID("00000000-0000-0000-0000-000000000002"),
        "name": "MIT",
        "country": "USA",
        "city": "Cambridge, Massachusetts",
        "description": "Massachusetts Institute of Technology",
        "website": "https://www.mit.edu",
    },
    # ... add the rest
]

def seed_test_universities():
    db: Session = SessionLocal()
    try:
        for uni_data in TEST_UNIVERSITIES:
            # Check if university already exists
            existing = db.query(University).filter(University.id == uni_data["id"]).first()
            if not existing:
                university = University(**uni_data)
                db.add(university)
                print(f"✓ Created: {uni_data['name']}")
            else:
                print(f"○ Already exists: {uni_data['name']}")
        
        db.commit()
        print("\n✅ Test universities seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error seeding universities: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_test_universities()
```

**Run the seed:**
```bash
python backend/seeds/seed_test_universities.py
```

---

## 🧪 Testing the Flow

### 1. Ensure Backend is Seeded
Before testing, make sure your backend database has the test universities:

```sql
-- Verify universities exist
SELECT id, name, country FROM universities;
```

Expected output:
```
id                                   | name                  | country
-------------------------------------|-----------------------|--------
00000000-0000-0000-0000-000000000001 | Stanford University   | USA
00000000-0000-0000-0000-000000000002 | MIT                   | USA
...
```

### 2. Test University Signup

**Step 1:** Navigate to signup page
```
http://localhost:5173/signup
```

**Step 2:** Fill in the form
- **Account Type:** University Representative
- **Select University:** MIT (USA)  ← Dropdown should appear in dev mode
- **Display Name:** John Doe
- **Email:** john.doe@mit.edu
- **Password:** password123
- **Confirm Password:** password123

**Step 3:** Submit and verify
- Should create user successfully
- Should show: "Account created! Please check your email..."
- Should redirect to `/signin`

**Step 4:** Sign in
- Email: john.doe@mit.edu
- Password: password123
- Should redirect to `/university/dashboard`

### 3. Verify in Database

```sql
-- Check user was created with correct university_id
SELECT 
  u.id, 
  u.email, 
  u.role, 
  u.university_id,
  uni.name as university_name
FROM users u
LEFT JOIN universities uni ON u.university_id = uni.id
WHERE u.email = 'john.doe@mit.edu';
```

---

## 🔄 Consistency Between Frontend & Backend

### Frontend
- File: `src/constants/testUniversities.ts`
- IDs: `00000000-0000-0000-0000-00000000000X` (UUID format)

### Backend
- Table: `universities`
- Column: `id` (UUID type)
- Must match frontend IDs exactly

### Critical Points
1. **Same UUIDs:** Frontend and backend must use identical UUIDs
2. **UUID Format:** All IDs must be valid UUIDs
3. **Foreign Keys:** `users.university_id` references `universities.id`

---

## 📋 Production vs Development Behavior

### Development Mode (`import.meta.env.DEV === true`)
- ✅ Shows **dropdown** with test universities
- ✅ Easy to test without admin intervention
- ✅ User-friendly for developers

### Production Mode (`import.meta.env.DEV === false`)
- ✅ Shows **text input** for university ID
- ✅ Requires admin to provide ID
- ✅ Secure - prevents unauthorized signups

---

## 🚀 How to Use - Quick Start

### For Developers

1. **Seed your backend database:**
   ```bash
   # Run the SQL seed script or Python seed script
   psql -U postgres -d admissiontimes -f seeds/test_universities.sql
   ```

2. **Start the frontend:**
   ```bash
   pnpm dev
   ```

3. **Sign up as university representative:**
   - Go to `/signup`
   - Select "University Representative"
   - Choose from the dropdown (e.g., "Stanford University")
   - Complete the form and submit

4. **Sign in:**
   - Use the email and password you just created
   - You'll be redirected to `/university/dashboard`

### For Production Deployment

1. **Remove test universities** (optional):
   ```sql
   DELETE FROM universities WHERE id::text LIKE '00000000-0000-0000-0000-%';
   ```

2. **Admin creates real universities:**
   - Admin logs in to admin dashboard
   - Creates universities with real data
   - Note the generated UUIDs

3. **Admin invites university representatives:**
   - Admin provides the university UUID to the representative
   - Representative enters the UUID during signup

---

## 📝 Additional Notes

### Why UUIDs?
- Globally unique, no collisions
- Can be generated client-side or server-side
- Standard for distributed systems

### Why Test IDs Start with `00000000`?
- Easy to identify as test data
- Won't collide with real UUIDs (which are random)
- Can be easily cleaned up in production

### Security Considerations
- In production, university_id should be validated against existing universities
- Backend should verify that the university_id exists before creating the user
- Consider implementing an invitation system for university representatives

---

## ✅ Testing Checklist

- [ ] Backend database has test universities seeded
- [ ] Frontend shows dropdown in development mode
- [ ] Can successfully create university representative account
- [ ] User is created with correct university_id
- [ ] Can sign in with university credentials
- [ ] Redirected to `/university/dashboard` after signin
- [ ] University dashboard loads correctly
- [ ] User role is 'university' in database

---

## 🔗 Related Documentation

- [AUTHENTICATION_ARCHITECTURE.md](./AUTHENTICATION_ARCHITECTURE.md) - Complete auth system
- [FRONTEND_BACKEND_API_CONTRACT.md](./FRONTEND_BACKEND_API_CONTRACT.md) - API specifications
- [README.md](./README.md) - Project overview

---

## 🆘 Troubleshooting

### Issue: Dropdown not showing
**Solution:** Check that you're running in development mode (`pnpm dev`)

### Issue: "University not found" error
**Solution:** Verify backend database has the test universities seeded

### Issue: Foreign key constraint violation
**Solution:** 
1. Check that university_id exists in universities table
2. Verify UUID format is correct
3. Run the seed script again

### Issue: University ID mismatch
**Solution:** 
1. Frontend: Check `src/constants/testUniversities.ts`
2. Backend: Check `universities` table
3. Ensure UUIDs match exactly

---

## 📞 Need Help?

If you encounter issues:
1. Check that backend is running and seeded
2. Verify frontend is in development mode
3. Check browser console for errors
4. Verify database has test universities
5. Review the authentication architecture documentation
