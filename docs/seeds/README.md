# Backend Seed Scripts for Testing

This folder contains seed scripts to populate your backend database with test data for development and testing purposes.

## 📁 Files

- **`test_universities_seed.sql`** - PostgreSQL seed script for test universities
- **`seed_test_universities.py`** - Python/FastAPI seed script for test universities
- **`README.md`** - This file

## 🎯 Purpose

These scripts create test universities in your backend database with known UUIDs that match the frontend's `TEST_UNIVERSITIES` constant. This allows you to test university representative signup without needing admin intervention.

## 🚀 Usage

### Option 1: SQL Script (Recommended)

**Prerequisites:**
- PostgreSQL installed
- Database created
- Connection credentials

**Steps:**
```bash
# From your backend directory
psql -U your_username -d your_database -f path/to/test_universities_seed.sql

# Example:
psql -U postgres -d admissiontimes -f ../frontend/docs/seeds/test_universities_seed.sql
```

**What it does:**
- Creates 5 test universities
- Uses `ON CONFLICT DO NOTHING` to avoid duplicates
- Shows verification output

### Option 2: Python Script

**Prerequisites:**
- Python environment set up
- SQLAlchemy and database models configured
- Database connection working

**Steps:**

1. **Copy the script to your backend:**
   ```bash
   cp docs/seeds/seed_test_universities.py ../backend/seeds/
   ```

2. **Customize the imports:**
   ```python
   # Edit seed_test_universities.py
   # Uncomment and adjust these lines:
   from app.database import SessionLocal
   from app.models.university import University
   ```

3. **Uncomment database operations:**
   - Uncomment the database queries
   - Uncomment the `db.add()` and `db.commit()` calls

4. **Run the script:**
   ```bash
   cd ../backend
   python seeds/seed_test_universities.py
   ```

## 📋 Test Universities

The scripts create these universities:

| ID | Name | Country | City |
|----|------|---------|------|
| `00000000-0000-0000-0000-000000000001` | Stanford University | USA | Stanford, California |
| `00000000-0000-0000-0000-000000000002` | MIT | USA | Cambridge, Massachusetts |
| `00000000-0000-0000-0000-000000000003` | Harvard University | USA | Cambridge, Massachusetts |
| `00000000-0000-0000-0000-000000000004` | Oxford University | UK | Oxford |
| `00000000-0000-0000-0000-000000000005` | Cambridge University | UK | Cambridge |

## 🔄 Consistency with Frontend

These IDs **MUST** match the frontend constant in:
- **File:** `src/constants/testUniversities.ts`
- **Constant:** `TEST_UNIVERSITIES`

```typescript
// Frontend
export const TEST_UNIVERSITIES = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Stanford University', ... },
  // ... etc
]
```

## ✅ Verification

After running the seed script, verify the data:

```sql
-- Check if universities were created
SELECT id, name, country 
FROM universities 
WHERE id::text LIKE '00000000-0000-0000-0000-%';
```

Expected output:
```
                  id                  |        name           | country
--------------------------------------|-----------------------|--------
00000000-0000-0000-0000-000000000001 | Stanford University   | USA
00000000-0000-0000-0000-000000000002 | MIT                   | USA
00000000-0000-0000-0000-000000000003 | Harvard University    | USA
00000000-0000-0000-0000-000000000004 | Oxford University     | UK
00000000-0000-0000-0000-000000000005 | Cambridge University  | UK
```

## 🧪 Testing After Seeding

1. **Start your backend:**
   ```bash
   cd backend
   # Your backend start command (e.g., uvicorn, flask run, etc.)
   ```

2. **Start your frontend:**
   ```bash
   cd frontend
   pnpm dev
   ```

3. **Test university signup:**
   - Navigate to `http://localhost:5173/signup`
   - Select "University Representative"
   - Choose a university from the dropdown
   - Complete the signup form
   - Sign in with your new credentials

## 🗑️ Cleanup (Production)

Before deploying to production, you may want to remove test universities:

```sql
-- Remove all test universities
DELETE FROM universities 
WHERE id::text LIKE '00000000-0000-0000-0000-%';

-- Verify deletion
SELECT COUNT(*) FROM universities 
WHERE id::text LIKE '00000000-0000-0000-0000-%';
-- Should return 0
```

## 📝 Schema Notes

The seed scripts assume your `universities` table has these columns:
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `country` (VARCHAR)
- `city` (VARCHAR)
- `description` (TEXT)
- `website` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Adjust the scripts if your schema is different!**

## 🆘 Troubleshooting

### Issue: "relation 'universities' does not exist"
**Solution:** Run your migrations first to create the table schema

### Issue: Duplicate key violation
**Solution:** The universities already exist. The SQL script uses `ON CONFLICT DO NOTHING` to handle this gracefully.

### Issue: UUIDs don't match frontend
**Solution:** 
1. Check `src/constants/testUniversities.ts` for frontend IDs
2. Ensure seed script uses the same IDs
3. Re-run the seed script

### Issue: Python import errors
**Solution:** Customize the imports at the top of `seed_test_universities.py` to match your project structure

## 🔗 Related Documentation

- [UNIVERSITY_SIGNUP_TESTING_GUIDE.md](../UNIVERSITY_SIGNUP_TESTING_GUIDE.md) - Complete testing guide
- [AUTHENTICATION_ARCHITECTURE.md](../../AUTHENTICATION_ARCHITECTURE.md) - Auth system docs
- [FRONTEND_BACKEND_API_CONTRACT.md](../../FRONTEND_BACKEND_API_CONTRACT.md) - API specs

## 📧 Need Help?

If you encounter issues:
1. Verify your database schema matches the expected structure
2. Check that your database connection is working
3. Review the error messages carefully
4. Consult the main testing guide
