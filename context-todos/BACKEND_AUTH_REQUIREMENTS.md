# Backend Authentication Requirements

**Created:** January 18, 2026  
**Purpose:** Backend requirements for basic authentication (sign in/sign up)  
**Status:** Ready for Backend Implementation  
**Type:** Basic Auth (No JWT yet)

---

## 📋 Overview

Frontend now has sign in and sign up pages. Backend needs to implement basic authentication endpoints to support these features.

---

## 🔐 Required Endpoints

### 1. Sign Up Endpoint

**Endpoint:** `POST /api/v1/auth/signup`

**Request Body:**
```typescript
{
  email: string;                    // Required, must be valid email, unique
  password: string;                 // Required, min 6 characters
  user_type: 'student' | 'university' | 'admin';  // Required
  display_name?: string;            // Optional
  university_id?: string;           // Required if user_type is 'university'
}
```

**Response (Success - 201):**
```typescript
{
  success: true,
  message: "Account created successfully",
  data: {
    user: {
      id: string,                   // UUID
      email: string,
      user_type: 'student' | 'university' | 'admin',
      university_id: string | null,
      created_at: string,           // ISO 8601
      updated_at: string            // ISO 8601
    },
    message: "Account created successfully"
  },
  timestamp: string
}
```

**Response (Error - 400):**
```typescript
{
  success: false,
  message: "Validation failed",
  errors: {
    email?: "Email already exists" | "Invalid email format",
    password?: "Password must be at least 6 characters",
    user_type?: "Invalid user type",
    university_id?: "University ID is required for university accounts"
  },
  timestamp: string
}
```

**Business Rules:**
- Email must be unique
- Password must be at least 6 characters (can be plain text for now, no hashing required)
- If `user_type` is `university`, `university_id` must be provided and must exist in `universities` table
- If `user_type` is `admin`, only allow if creating from admin account (or skip for now)
- Auto-generate UUID for `id`
- Set `created_at` and `updated_at` timestamps

---

### 2. Sign In Endpoint

**Endpoint:** `POST /api/v1/auth/signin`

**Request Body:**
```typescript
{
  email: string;        // Required
  password: string;      // Required
}
```

**Response (Success - 200):**
```typescript
{
  success: true,
  message: "Signed in successfully",
  data: {
    user: {
      id: string,
      email: string,
      user_type: 'student' | 'university' | 'admin',
      university_id: string | null,
      created_at: string,
      updated_at: string
    },
    message: "Signed in successfully"
  },
  timestamp: string
}
```

**Response (Error - 401):**
```typescript
{
  success: false,
  message: "Invalid email or password",
  timestamp: string
}
```

**Business Rules:**
- Verify email exists in database
- Verify password matches (plain text comparison for now)
- Return user data if credentials are valid
- Return 401 if email doesn't exist or password doesn't match

---

### 3. Sign Out Endpoint

**Endpoint:** `POST /api/v1/auth/signout`

**Request Headers:**
- `x-user-id` (development) or `Authorization: Bearer <token>` (production)

**Response (Success - 200):**
```typescript
{
  success: true,
  message: "Signed out successfully",
  data: null,
  timestamp: string
}
```

**Business Rules:**
- For now, just return success (no session management needed)
- In future, will invalidate JWT tokens

---

### 4. Get Current User Endpoint

**Endpoint:** `GET /api/v1/auth/me`

**Request Headers:**
- `x-user-id` (development) or `Authorization: Bearer <token>` (production)

**Response (Success - 200):**
```typescript
{
  success: true,
  message: "User retrieved successfully",
  data: {
    id: string,
    email: string,
    user_type: 'student' | 'university' | 'admin',
    university_id: string | null,
    created_at: string,
    updated_at: string
  },
  timestamp: string
}
```

**Response (Error - 401):**
```typescript
{
  success: false,
  message: "Unauthorized",
  timestamp: string
}
```

**Business Rules:**
- Extract user ID from header (`x-user-id` in development)
- Look up user in database
- Return user data if found
- Return 401 if user not found

---

## 🗄️ Database Schema

### Users Table (Should Already Exist)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Plain text for now, will hash later
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'university', 'admin')),
  university_id UUID REFERENCES universities(id),
  display_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
```

**Note:** If `users` table doesn't have `password` column, add it:
```sql
ALTER TABLE users ADD COLUMN password VARCHAR(255);
```

---

## 🔧 Implementation Steps

### Step 1: Update Users Table

```sql
-- Add password column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add display_name if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
```

### Step 2: Create Auth Routes

```typescript
// routes/authRoutes.ts
import express from 'express';
import { signUp, signIn, signOut, getCurrentUser } from '../controllers/authController';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);
router.get('/me', getCurrentUser);

export default router;
```

### Step 3: Create Auth Controller

```typescript
// controllers/authController.ts
import { Request, Response } from 'express';
import { db } from '../db'; // Your database connection
import { v4 as uuidv4 } from 'uuid';

export async function signUp(req: Request, res: Response) {
  try {
    const { email, password, user_type, display_name, university_id } = req.body;

    // Validation
    if (!email || !password || !user_type) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and user type are required',
        timestamp: new Date().toISOString(),
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        errors: { email: 'Invalid email format' },
        timestamp: new Date().toISOString(),
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
        errors: { password: 'Password must be at least 6 characters' },
        timestamp: new Date().toISOString(),
      });
    }

    // Check if email already exists
    const existingUser = await db.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
        errors: { email: 'Email already exists' },
        timestamp: new Date().toISOString(),
      });
    }

    // Validate university_id for university users
    if (user_type === 'university' && !university_id) {
      return res.status(400).json({
        success: false,
        message: 'University ID is required for university accounts',
        errors: { university_id: 'University ID is required' },
        timestamp: new Date().toISOString(),
      });
    }

    // Verify university exists if provided
    if (university_id) {
      const university = await db.universities.findUnique({ where: { id: university_id } });
      if (!university) {
        return res.status(400).json({
          success: false,
          message: 'University not found',
          errors: { university_id: 'University not found' },
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Create user
    const user = await db.users.create({
      data: {
        id: uuidv4(),
        email,
        password, // Plain text for now
        user_type,
        university_id: university_id || null,
        display_name: display_name || null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: userWithoutPassword,
        message: 'Account created successfully',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Sign up error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create account',
      timestamp: new Date().toISOString(),
    });
  }
}

export async function signIn(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        timestamp: new Date().toISOString(),
      });
    }

    // Find user by email
    const user = await db.users.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        timestamp: new Date().toISOString(),
      });
    }

    // Verify password (plain text comparison for now)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        timestamp: new Date().toISOString(),
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      message: 'Signed in successfully',
      data: {
        user: userWithoutPassword,
        message: 'Signed in successfully',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Sign in error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sign in',
      timestamp: new Date().toISOString(),
    });
  }
}

export async function signOut(req: Request, res: Response) {
  // For basic auth, just return success
  // In future, will invalidate JWT tokens
  return res.json({
    success: true,
    message: 'Signed out successfully',
    data: null,
    timestamp: new Date().toISOString(),
  });
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    // Get user ID from header (development) or JWT token (production)
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        timestamp: new Date().toISOString(),
      });
    }

    // Find user
    const user = await db.users.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      message: 'User retrieved successfully',
      data: userWithoutPassword,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user',
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Step 4: Register Routes

```typescript
// app.ts or server.ts
import authRoutes from './routes/authRoutes';

app.use('/api/v1/auth', authRoutes);
```

---

## 🧪 Testing

### Test Sign Up

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123",
    "user_type": "student",
    "display_name": "Test Student"
  }'
```

### Test Sign In

```bash
curl -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123"
  }'
```

### Test Get Current User

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "x-user-id: <user-id-from-signup>"
```

---

## 🔒 Security Notes (For Future)

**Current (Basic Auth):**
- ✅ Password stored as plain text (for development only)
- ✅ No session management
- ✅ No JWT tokens

**Future (Production):**
- ⚠️ Hash passwords using bcrypt
- ⚠️ Implement JWT tokens
- ⚠️ Add session management
- ⚠️ Add rate limiting
- ⚠️ Add email verification
- ⚠️ Add password reset

---

## 📝 Validation Rules

### Email
- Required
- Must be valid email format
- Must be unique

### Password
- Required
- Minimum 6 characters
- (Future: Add complexity requirements)

### User Type
- Required
- Must be one of: 'student', 'university', 'admin'

### University ID
- Required if `user_type` is 'university'
- Must exist in `universities` table

---

## ✅ Success Criteria

Backend implementation is complete when:

- ✅ Sign up endpoint works
- ✅ Sign in endpoint works
- ✅ Sign out endpoint works
- ✅ Get current user endpoint works
- ✅ All validation rules enforced
- ✅ Error messages are user-friendly
- ✅ Response format matches frontend expectations

---

## 🔗 Related

- **Frontend Auth:** See `src/pages/SignIn.tsx` and `src/pages/SignUp.tsx`
- **Auth Context:** See `src/contexts/AuthContext.tsx`
- **Auth Service:** See `src/services/authService.ts`

---

**Status:** Ready for Backend Implementation  
**Priority:** High  
**Date:** January 18, 2026
