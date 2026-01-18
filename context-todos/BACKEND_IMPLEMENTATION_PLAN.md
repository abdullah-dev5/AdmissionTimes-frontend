# Backend Implementation Plan

**Created:** January 18, 2026  
**Last Updated:** January 18, 2026  
**Purpose:** Complete backend implementation plan with all required endpoints, specifications, and implementation details  
**Status:** Ready for Backend Implementation  
**Aligned With:** `FRONTEND_IMPLEMENTATION_PLAN.md`

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Required Endpoints](#required-endpoints)
4. [Dashboard Aggregation Endpoints](#dashboard-aggregation-endpoints)
5. [PDF Parsing Endpoint](#pdf-parsing-endpoint)
6. [Recommendations Endpoint](#recommendations-endpoint)
7. [Scraper Logs Endpoint](#scraper-logs-endpoint)
8. [Endpoint Enhancements](#endpoint-enhancements)
9. [Database Schema Requirements](#database-schema-requirements)
10. [Implementation Guidelines](#implementation-guidelines)
11. [Testing Requirements](#testing-requirements)
12. [Performance Optimization](#performance-optimization)
13. [API Documentation](#api-documentation)
14. [Implementation Phases](#implementation-phases)

---

## 📊 Executive Summary

### Current Backend State

- ✅ **51 API endpoints** across 9 domains
- ✅ **RESTful design** with standardized responses
- ✅ **PostgreSQL database** with migrations
- ✅ **Swagger documentation** available
- ✅ **Mock authentication** (development headers)
- ⚠️ **5 endpoints missing** (critical for frontend)
- ⚠️ **Some endpoints need enhancements**

### Required Changes

1. **🔴 Critical:** Dashboard aggregation endpoints (3 endpoints)
2. **🔴 Critical:** PDF parsing endpoint (1 endpoint)
3. **🟡 High:** Recommendations endpoint (1 endpoint)
4. **🟢 Medium:** Scraper logs endpoint (1 endpoint)
5. **🟡 Medium:** Search endpoint enhancements
6. **🟢 Low:** Batch operations (3 endpoints)

### Goals

1. **Implement all critical endpoints** for frontend integration
2. **Maintain API consistency** with existing endpoints
3. **Optimize performance** with SQL aggregation
4. **Complete Swagger documentation** for all new endpoints
5. **Comprehensive testing** for all endpoints

### Timeline

- **Phase 1:** Week 1-2 (Critical endpoints)
- **Phase 2:** Week 3 (High priority endpoints)
- **Phase 3:** Week 4 (Enhancements & polish)

---

## 🔍 Current State Analysis

### Existing Endpoints (51)

#### Admissions Domain (10 endpoints)
- ✅ `GET /api/v1/admissions` - List admissions
- ✅ `GET /api/v1/admissions/:id` - Get detail
- ✅ `POST /api/v1/admissions` - Create
- ✅ `PUT /api/v1/admissions/:id` - Update
- ✅ `DELETE /api/v1/admissions/:id` - Delete
- ✅ `PATCH /api/v1/admissions/:id/submit` - Submit for verification
- ✅ `PATCH /api/v1/admissions/:id/verify` - Verify (admin)
- ✅ `PATCH /api/v1/admissions/:id/reject` - Reject (admin)
- ✅ `PATCH /api/v1/admissions/:id/dispute` - Dispute (university)
- ✅ `GET /api/v1/admissions/:id/changelogs` - Get changelogs

#### Notifications Domain (7 endpoints)
- ✅ `GET /api/v1/notifications` - List notifications
- ✅ `GET /api/v1/notifications/unread-count` - Unread count
- ✅ `GET /api/v1/notifications/:id` - Get detail
- ✅ `PATCH /api/v1/notifications/:id/read` - Mark as read
- ✅ `PATCH /api/v1/notifications/read-all` - Mark all as read
- ✅ `POST /api/v1/notifications` - Create (admin)
- ✅ `DELETE /api/v1/notifications/:id` - Delete

#### Deadlines Domain (6 endpoints)
- ✅ `GET /api/v1/deadlines` - List deadlines
- ✅ `GET /api/v1/deadlines/upcoming` - Upcoming deadlines
- ✅ `GET /api/v1/deadlines/:id` - Get detail
- ✅ `POST /api/v1/deadlines` - Create
- ✅ `PUT /api/v1/deadlines/:id` - Update
- ✅ `DELETE /api/v1/deadlines/:id` - Delete

#### Watchlists Domain (5 endpoints)
- ✅ `GET /api/v1/watchlists` - List watchlists
- ✅ `POST /api/v1/watchlists` - Add to watchlist
- ✅ `GET /api/v1/watchlists/:id` - Get watchlist item
- ✅ `PATCH /api/v1/watchlists/:id` - Update notes
- ✅ `DELETE /api/v1/watchlists/:id` - Remove from watchlist

#### Users Domain (5 endpoints)
- ✅ `GET /api/v1/users/me` - Get current user
- ✅ `PUT /api/v1/users/me` - Update current user
- ✅ `GET /api/v1/users/:id` - Get user by ID
- ✅ `GET /api/v1/users` - List users (admin)
- ✅ `PATCH /api/v1/users/:id/role` - Update role (admin)

#### User Preferences Domain (3 endpoints)
- ✅ `GET /api/v1/users/me/preferences` - Get preferences
- ✅ `PUT /api/v1/users/me/preferences` - Full update
- ✅ `PATCH /api/v1/users/me/preferences` - Partial update

#### Changelogs Domain (3 endpoints)
- ✅ `GET /api/v1/changelogs` - List changelogs
- ✅ `GET /api/v1/changelogs/:id` - Get changelog by ID
- ✅ `GET /api/v1/changelogs/admission/:admissionId` - Get admission changelogs

#### Analytics Domain (5 endpoints)
- ✅ `POST /api/v1/analytics/events` - Track event
- ✅ `GET /api/v1/analytics/stats` - General statistics
- ✅ `GET /api/v1/analytics/admissions` - Admission statistics
- ✅ `GET /api/v1/analytics/users` - User statistics
- ✅ `GET /api/v1/analytics/activity` - Aggregated activity feed

#### User Activity Domain (2 endpoints)
- ✅ `GET /api/v1/activity` - List activities
- ✅ `GET /api/v1/activity/:id` - Get detail

---

## 🎯 Required Endpoints

### 🔴 Critical Priority (Must Implement)

| Endpoint | Method | Purpose | Priority | Estimated Effort |
|----------|--------|---------|----------|------------------|
| `/api/v1/student/dashboard` | GET | Aggregated student dashboard | 🔴 Critical | 3-5 days |
| `/api/v1/university/dashboard` | GET | Aggregated university dashboard | 🔴 Critical | 3-5 days |
| `/api/v1/admissions/parse-pdf` | POST | Extract data from PDF | 🔴 Critical | 2-3 days |

### 🟡 High Priority (Should Implement)

| Endpoint | Method | Purpose | Priority | Estimated Effort |
|----------|--------|---------|----------|------------------|
| `/api/v1/student/recommendations` | GET | Personalized recommendations | 🟡 High | 2-3 days |
| `/api/v1/admin/dashboard` | GET | Aggregated admin dashboard | 🟡 Medium | 2-3 days |

### 🟢 Medium Priority (Nice to Have)

| Endpoint | Method | Purpose | Priority | Estimated Effort |
|----------|--------|---------|----------|------------------|
| `/api/v1/university/scraper-logs` | GET | Scraper activity logs | 🟢 Medium | 1-2 days |
| `/api/v1/watchlists/batch` | POST | Batch add to watchlist | 🟢 Medium | 1-2 days |
| `/api/v1/notifications/read-batch` | PATCH | Batch mark as read | 🟢 Medium | 1 day |
| `/api/v1/admissions/batch-delete` | DELETE | Batch delete admissions | 🟢 Medium | 1-2 days |

---

## 📊 Dashboard Aggregation Endpoints

### 1. Student Dashboard Endpoint

**Endpoint:** `GET /api/v1/student/dashboard`

**Authentication:**
- Development: `x-user-id` header (required)
- Production: JWT Bearer token

**Response Structure:**

```typescript
{
  success: true,
  message: "Dashboard data retrieved successfully",
  data: {
    stats: {
      active_admissions: number,
      saved_count: number,
      upcoming_deadlines: number,
      recommendations_count: number,
      unread_notifications: number,
      urgent_deadlines: number
    },
    recommended_programs: Array<{
      id: string,
      university_id: string,
      university_name: string,
      title: string,
      degree_level: string,
      deadline: string,
      days_remaining: number,
      application_fee: number,
      location: string,
      verification_status: 'verified' | 'pending' | 'rejected',
      match_score?: number,
      match_reason?: string,
      saved: boolean,
      alert_enabled: boolean
    }>,
    upcoming_deadlines: Array<{
      id: string,
      admission_id: string,
      university_name: string,
      program_title: string,
      deadline: string,
      days_remaining: number,
      urgency_level: 'low' | 'medium' | 'high' | 'urgent',
      saved: boolean,
      alert_enabled: boolean
    }>,
    recent_notifications: Array<{
      id: string,
      category: 'verification' | 'deadline' | 'system' | 'update',
      priority: 'low' | 'medium' | 'high' | 'urgent',
      title: string,
      message: string,
      is_read: boolean,
      created_at: string,
      action_url: string | null
    }>,
    recent_activity: Array<{
      type: 'notification' | 'saved' | 'alert' | 'deadline',
      action: string,
      timestamp: string,
      related_entity_id?: string,
      related_entity_type?: string
    }>
  },
  timestamp: string
}
```

**SQL Query Structure:**

```sql
-- Student Dashboard Aggregation Query
WITH student_stats AS (
  SELECT 
    COUNT(DISTINCT CASE 
      WHEN a.verification_status = 'verified' 
        AND a.deadline > NOW()
        AND a.status = 'active'
      THEN a.id 
    END) as active_admissions,
    
    COUNT(DISTINCT w.id) as saved_count,
    
    COUNT(DISTINCT CASE 
      WHEN d.days_remaining BETWEEN 0 AND 7 
        AND d.deadline > NOW()
      THEN d.id 
    END) as upcoming_deadlines,
    
    COUNT(DISTINCT CASE 
      WHEN d.days_remaining BETWEEN 0 AND 3 
        AND d.deadline > NOW()
      THEN d.id 
    END) as urgent_deadlines,
    
    COUNT(DISTINCT CASE 
      WHEN n.is_read = false 
      THEN n.id 
    END) as unread_notifications
    
  FROM users u
  LEFT JOIN watchlists w ON w.user_id = u.id
  LEFT JOIN admissions a ON a.id = w.admission_id OR a.verification_status = 'verified'
  LEFT JOIN deadlines d ON d.admission_id = a.id AND d.user_id = u.id
  LEFT JOIN notifications n ON n.user_id = u.id AND n.user_type = 'student'
  WHERE u.id = $1
),
recommended_programs AS (
  SELECT 
    a.id,
    a.university_id,
    u.name as university_name,
    a.title,
    a.degree_level,
    a.deadline,
    EXTRACT(DAY FROM (a.deadline - NOW()))::int as days_remaining,
    a.application_fee,
    a.location,
    a.verification_status,
    COALESCE(r.score, 0) as match_score,
    r.reason as match_reason,
    CASE WHEN w.id IS NOT NULL THEN true ELSE false END as saved,
    COALESCE(w.alert_opt_in, false) as alert_enabled
  FROM admissions a
  INNER JOIN universities univ ON univ.id = a.university_id
  LEFT JOIN recommendations r ON r.admission_id = a.id AND r.user_id = $1
  LEFT JOIN watchlists w ON w.admission_id = a.id AND w.user_id = $1
  WHERE a.verification_status = 'verified'
    AND a.deadline > NOW()
    AND a.status = 'active'
    AND (r.score >= 85 OR r.score IS NULL)
  ORDER BY r.score DESC NULLS LAST, a.deadline ASC
  LIMIT 4
),
upcoming_deadlines AS (
  SELECT 
    d.id,
    d.admission_id,
    univ.name as university_name,
    a.title as program_title,
    d.deadline,
    d.days_remaining,
    d.urgency_level,
    CASE WHEN w.id IS NOT NULL THEN true ELSE false END as saved,
    COALESCE(w.alert_opt_in, false) as alert_enabled
  FROM deadlines d
  INNER JOIN admissions a ON a.id = d.admission_id
  INNER JOIN universities univ ON univ.id = a.university_id
  LEFT JOIN watchlists w ON w.admission_id = a.id AND w.user_id = $1
  WHERE d.user_id = $1
    AND d.days_remaining BETWEEN 0 AND 30
    AND d.deadline > NOW()
  ORDER BY d.days_remaining ASC
  LIMIT 3
),
recent_notifications AS (
  SELECT 
    id,
    category,
    priority,
    title,
    message,
    is_read,
    created_at,
    action_url
  FROM notifications
  WHERE user_id = $1 
    AND user_type = 'student'
  ORDER BY created_at DESC
  LIMIT 5
),
recent_activity AS (
  SELECT 
    'notification' as type,
    title as action,
    created_at as timestamp,
    id::text as related_entity_id,
    'notification' as related_entity_type
  FROM notifications
  WHERE user_id = $1 AND user_type = 'student'
  
  UNION ALL
  
  SELECT 
    'saved' as type,
    'Saved program: ' || a.title as action,
    w.saved_at as timestamp,
    w.admission_id::text as related_entity_id,
    'admission' as related_entity_type
  FROM watchlists w
  INNER JOIN admissions a ON a.id = w.admission_id
  WHERE w.user_id = $1
  
  ORDER BY timestamp DESC
  LIMIT 3
)
SELECT 
  (SELECT row_to_json(ss) FROM student_stats ss) as stats,
  (SELECT json_agg(row_to_json(rp)) FROM recommended_programs rp) as recommended_programs,
  (SELECT json_agg(row_to_json(ud)) FROM upcoming_deadlines ud) as upcoming_deadlines,
  (SELECT json_agg(row_to_json(rn)) FROM recent_notifications rn) as recent_notifications,
  (SELECT json_agg(row_to_json(ra)) FROM recent_activity ra) as recent_activity;
```

**Implementation Steps:**

1. Create route handler: `routes/dashboardRoutes.ts`
2. Create controller: `controllers/dashboardController.ts`
3. Create service: `services/dashboardService.ts`
4. Add SQL query to service
5. Add error handling
6. Add Swagger documentation
7. Write unit tests
8. Write integration tests

**See:** `BACKEND_DASHBOARD_ENDPOINTS_SPEC.md` for complete specification

---

### 2. University Dashboard Endpoint

**Endpoint:** `GET /api/v1/university/dashboard`

**Authentication:**
- Development: `x-user-id` and `x-university-id` headers (required)
- Production: JWT Bearer token

**Response Structure:**

```typescript
{
  success: true,
  message: "Dashboard data retrieved successfully",
  data: {
    stats: {
      total_admissions: number,
      pending_verification: number,
      verified_admissions: number,
      recent_updates: number,
      unread_notifications: number,
      pending_audits: number
    },
    recent_admissions: Array<{
      id: string,
      title: string,
      degree_level: string,
      verification_status: 'verified' | 'pending' | 'rejected',
      deadline: string,
      created_at: string,
      updated_at: string
    }>,
    pending_verifications: Array<{
      id: string,
      admission_id: string,
      program_title: string,
      submitted_at: string,
      verification_status: 'pending',
      admin_notes: string | null
    }>,
    recent_changes: Array<{
      id: string,
      admission_id: string,
      program_title: string,
      field: string,
      old_value: string,
      new_value: string,
      changed_at: string,
      changed_by: string
    }>,
    recent_notifications: Array<{
      id: string,
      category: 'verification' | 'deadline' | 'system' | 'update',
      priority: 'low' | 'medium' | 'high' | 'urgent',
      title: string,
      message: string,
      is_read: boolean,
      created_at: string,
      action_url: string | null
    }>
  },
  timestamp: string
}
```

**SQL Query Structure:**

```sql
-- University Dashboard Aggregation Query
WITH university_stats AS (
  SELECT 
    COUNT(DISTINCT a.id) as total_admissions,
    COUNT(DISTINCT CASE 
      WHEN a.verification_status = 'pending' 
      THEN a.id 
    END) as pending_verification,
    COUNT(DISTINCT CASE 
      WHEN a.verification_status = 'verified' 
      THEN a.id 
    END) as verified_admissions,
    COUNT(DISTINCT CASE 
      WHEN a.updated_at >= NOW() - INTERVAL '7 days'
      THEN a.id 
    END) as recent_updates,
    COUNT(DISTINCT CASE 
      WHEN n.is_read = false 
      THEN n.id 
    END) as unread_notifications,
    COUNT(DISTINCT CASE 
      WHEN a.verification_status = 'pending'
      THEN a.id 
    END) as pending_audits
  FROM admissions a
  LEFT JOIN notifications n ON n.user_id = $1 AND n.user_type = 'university'
  WHERE a.university_id = $2
),
recent_admissions AS (
  SELECT 
    id,
    title,
    degree_level,
    verification_status,
    deadline,
    created_at,
    updated_at
  FROM admissions
  WHERE university_id = $2
  ORDER BY updated_at DESC
  LIMIT 5
),
pending_verifications AS (
  SELECT 
    a.id,
    a.id as admission_id,
    a.title as program_title,
    a.created_at as submitted_at,
    a.verification_status,
    NULL as admin_notes
  FROM admissions a
  WHERE a.university_id = $2
    AND a.verification_status = 'pending'
  ORDER BY a.created_at DESC
  LIMIT 5
),
recent_changes AS (
  SELECT 
    cl.id,
    cl.admission_id,
    a.title as program_title,
    cl.field,
    cl.old_value,
    cl.new_value,
    cl.changed_at,
    cl.changed_by
  FROM change_logs cl
  INNER JOIN admissions a ON a.id = cl.admission_id
  WHERE a.university_id = $2
  ORDER BY cl.changed_at DESC
  LIMIT 5
),
recent_notifications AS (
  SELECT 
    id,
    category,
    priority,
    title,
    message,
    is_read,
    created_at,
    action_url
  FROM notifications
  WHERE user_id = $1 
    AND user_type = 'university'
  ORDER BY created_at DESC
  LIMIT 5
)
SELECT 
  (SELECT row_to_json(us) FROM university_stats us) as stats,
  (SELECT json_agg(row_to_json(ra)) FROM recent_admissions ra) as recent_admissions,
  (SELECT json_agg(row_to_json(pv)) FROM pending_verifications pv) as pending_verifications,
  (SELECT json_agg(row_to_json(rc)) FROM recent_changes rc) as recent_changes,
  (SELECT json_agg(row_to_json(rn)) FROM recent_notifications rn) as recent_notifications;
```

**Implementation:** Similar to student dashboard

---

### 3. Admin Dashboard Endpoint (Optional)

**Endpoint:** `GET /api/v1/admin/dashboard`

**Response Structure:**

```typescript
{
  success: true,
  data: {
    stats: {
      pending_verifications: number,
      total_admissions: number,
      total_universities: number,
      total_students: number,
      recent_actions: number,
      scraper_jobs_running: number
    },
    pending_verifications: Array<{...}>,
    recent_actions: Array<{...}>,
    scraper_activity: Array<{...}>
  }
}
```

**Priority:** Medium (can use multiple calls for now)

---

## 📄 PDF Parsing Endpoint

**Endpoint:** `POST /api/v1/admissions/parse-pdf`

**Authentication:**
- Development: `x-user-id` and `x-university-id` headers
- Production: JWT Bearer token

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `file` (File) - PDF file to parse
  - `university_id` (string) - University ID

**Response:**

```typescript
{
  success: true,
  message: "PDF parsed successfully",
  data: {
    title: string,
    degree_level: string,
    deadline: string, // ISO 8601
    application_fee: number,
    location: string,
    description: string,
    // ... other extracted fields
    confidence: number, // 0-100 extraction confidence score
    extracted_fields: string[] // List of fields successfully extracted
  },
  timestamp: string
}
```

**Error Response:**

```typescript
{
  success: false,
  message: "Failed to parse PDF",
  errors: {
    file: "Invalid PDF format" | "File too large" | "Parsing failed"
  },
  timestamp: string
}
```

**Implementation Steps:**

1. **Install PDF parsing library:**
   ```bash
   npm install pdf-parse
   # or
   npm install pdfjs-dist
   ```

2. **Create route handler:**
   ```typescript
   router.post('/parse-pdf', upload.single('file'), parsePDFController);
   ```

3. **Create controller:**
   ```typescript
   export async function parsePDFController(req: Request, res: Response) {
     try {
       const file = req.file;
       const universityId = req.body.university_id;
       
       if (!file) {
         return res.status(400).json({
           success: false,
           message: "PDF file is required"
         });
       }
       
       // Parse PDF
       const parsedData = await pdfService.parsePDF(file.buffer);
       
       // Extract structured data
       const extractedData = await pdfService.extractFields(parsedData);
       
       return res.json({
         success: true,
         data: extractedData
       });
     } catch (error) {
       return res.status(500).json({
         success: false,
         message: "Failed to parse PDF",
         errors: { file: error.message }
       });
     }
   }
   ```

4. **Create PDF service:**
   ```typescript
   import pdfParse from 'pdf-parse';
   
   export class PDFService {
     async parsePDF(buffer: Buffer): Promise<string> {
       const data = await pdfParse(buffer);
       return data.text;
     }
     
     async extractFields(text: string): Promise<ExtractedData> {
       // Use regex or NLP to extract fields
       // Return structured data
     }
   }
   ```

5. **Add file upload middleware** (multer):
   ```typescript
   import multer from 'multer';
   
   const upload = multer({
     limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
     fileFilter: (req, file, cb) => {
       if (file.mimetype === 'application/pdf') {
         cb(null, true);
       } else {
         cb(new Error('Only PDF files are allowed'));
       }
     }
   });
   ```

**Testing:**
- Test with valid PDF
- Test with invalid file format
- Test with large file (>10MB)
- Test with corrupted PDF
- Test field extraction accuracy

---

## 🎯 Recommendations Endpoint

**Endpoint:** `GET /api/v1/student/recommendations`

**Query Parameters:**
- `limit` (number, default: 10) - Number of recommendations
- `min_score` (number, default: 75) - Minimum match score

**Response:**

```typescript
{
  success: true,
  message: "Recommendations retrieved successfully",
  data: Array<{
    admission_id: string,
    score: number, // 0-100 match score
    reason: string, // Why this was recommended
    factors: {
      degree_match: number,
      deadline_proximity: number,
      location_preference: number,
      gpa_match: number,
      interest_match: number
    }
  }>,
  timestamp: string
}
```

**Implementation Logic:**

1. **Get student profile and preferences**
2. **Get all verified admissions**
3. **Calculate match scores for each admission:**
   - Degree level match (0-25 points)
   - Deadline proximity (0-20 points)
   - Location preference (0-20 points)
   - GPA/requirements match (0-20 points)
   - Interest match (0-15 points)
4. **Sort by total score**
5. **Return top N recommendations**

**SQL Query:**

```sql
WITH student_profile AS (
  SELECT 
    u.id,
    u.user_type,
    up.preferences
  FROM users u
  LEFT JOIN user_preferences up ON up.user_id = u.id
  WHERE u.id = $1
),
recommendations AS (
  SELECT 
    a.id as admission_id,
    -- Calculate match score
    (
      -- Degree match (0-25)
      CASE 
        WHEN a.degree_level = sp.preferences->>'preferred_degree_level' THEN 25
        ELSE 15
      END +
      -- Deadline proximity (0-20)
      CASE 
        WHEN a.deadline BETWEEN NOW() AND NOW() + INTERVAL '30 days' THEN 20
        WHEN a.deadline BETWEEN NOW() + INTERVAL '30 days' AND NOW() + INTERVAL '60 days' THEN 15
        ELSE 10
      END +
      -- Location preference (0-20)
      CASE 
        WHEN a.location = ANY(string_to_array(sp.preferences->>'preferred_locations', ',')) THEN 20
        ELSE 10
      END +
      -- GPA match (0-20) - if requirements exist
      CASE 
        WHEN a.requirements->>'min_gpa' IS NOT NULL 
          AND (sp.preferences->>'gpa')::float >= (a.requirements->>'min_gpa')::float 
        THEN 20
        ELSE 10
      END +
      -- Interest match (0-15) - based on search history
      CASE 
        WHEN a.title ILIKE ANY(SELECT '%' || term || '%' FROM search_history WHERE user_id = $1)
        THEN 15
        ELSE 5
      END
    ) as score,
    'High match based on your preferences' as reason,
    json_build_object(
      'degree_match', CASE WHEN a.degree_level = sp.preferences->>'preferred_degree_level' THEN 25 ELSE 15 END,
      'deadline_proximity', CASE WHEN a.deadline BETWEEN NOW() AND NOW() + INTERVAL '30 days' THEN 20 ELSE 10 END,
      'location_preference', CASE WHEN a.location = ANY(string_to_array(sp.preferences->>'preferred_locations', ',')) THEN 20 ELSE 10 END
    ) as factors
  FROM admissions a
  CROSS JOIN student_profile sp
  WHERE a.verification_status = 'verified'
    AND a.status = 'active'
    AND a.deadline > NOW()
)
SELECT 
  admission_id,
  score,
  reason,
  factors
FROM recommendations
WHERE score >= $2
ORDER BY score DESC
LIMIT $3;
```

**Caching Strategy:**
- Cache recommendations for 24 hours
- Invalidate cache when:
  - Student preferences change
  - New admissions added
  - Student saves/removes from watchlist

---

## 📊 Scraper Logs Endpoint

**Endpoint:** `GET /api/v1/university/scraper-logs`

**Query Parameters:**
- `university_id` (string, required)
- `status` (string, optional) - 'running' | 'completed' | 'failed'
- `limit` (number, default: 50)
- `offset` (number, default: 0)

**Response:**

```typescript
{
  success: true,
  data: Array<{
    id: string,
    university_id: string,
    status: 'running' | 'completed' | 'failed',
    started_at: string,
    completed_at: string | null,
    admissions_found: number,
    admissions_updated: number,
    errors: Array<{
      message: string,
      timestamp: string
    }>,
    logs: string[]
  }>,
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
  timestamp: string
}
```

**Alternative:** Use existing `/api/v1/analytics/activity` endpoint with filter

**Priority:** Low (can work around with analytics)

---

## 🔧 Endpoint Enhancements

### 1. Enhanced Search Endpoint

**Current:** `GET /api/v1/admissions?search=`

**Enhancements Needed:**

1. **Advanced Filters:**
   ```typescript
   // Add query parameters:
   degree_level[]: string[]  // Array of degree levels
   location[]: string[]       // Array of locations
   fee_min: number           // Minimum fee
   fee_max: number           // Maximum fee
   deadline_from: string     // ISO date
   deadline_to: string       // ISO date
   verification_status: string // 'verified' | 'pending' | 'rejected'
   ```

2. **Sorting Options:**
   ```typescript
   sort_by: 'deadline' | 'fee' | 'title' | 'created_at'
   sort_order: 'asc' | 'desc'
   ```

3. **Implementation:**
   ```typescript
   // In admissionsService.ts
   async list(params: {
     search?: string;
     degree_level?: string[];
     location?: string[];
     fee_min?: number;
     fee_max?: number;
     deadline_from?: string;
     deadline_to?: string;
     verification_status?: string;
     sort_by?: string;
     sort_order?: 'asc' | 'desc';
     page?: number;
     limit?: number;
   }) {
     // Build query with filters
   }
   ```

---

### 2. Batch Operations

#### Batch Add to Watchlist

**Endpoint:** `POST /api/v1/watchlists/batch`

**Request:**
```typescript
{
  admission_ids: string[],
  alert_opt_in: boolean
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    created: number,
    failed: number,
    results: Array<{
      admission_id: string,
      success: boolean,
      error?: string
    }>
  }
}
```

#### Batch Mark Notifications as Read

**Endpoint:** `PATCH /api/v1/notifications/read-batch`

**Request:**
```typescript
{
  notification_ids: string[]
}
```

#### Batch Delete Admissions

**Endpoint:** `DELETE /api/v1/admissions/batch`

**Request:**
```typescript
{
  admission_ids: string[]
}
```

---

## 🗄️ Database Schema Requirements

### Required Tables (Already Exist)

- `admissions` - Main admissions table
- `universities` - University reference data
- `watchlists` - Saved programs
- `deadlines` - Deadline tracking
- `notifications` - User notifications
- `change_logs` - Audit trail
- `users` - User accounts
- `user_preferences` - User preferences
- `analytics_events` - Analytics events

### Optional Tables (For Recommendations)

- `recommendations` - Cached recommendations
  ```sql
  CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    admission_id UUID NOT NULL REFERENCES admissions(id),
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    reason TEXT,
    factors JSONB,
    generated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, admission_id)
  );
  
  CREATE INDEX idx_recommendations_user_score ON recommendations(user_id, score DESC);
  ```

### Required Indexes

```sql
-- For dashboard queries
CREATE INDEX idx_admissions_verification_status ON admissions(verification_status);
CREATE INDEX idx_admissions_university_id ON admissions(university_id);
CREATE INDEX idx_admissions_deadline ON admissions(deadline);
CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX idx_deadlines_user_id ON deadlines(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, user_type);
CREATE INDEX idx_change_logs_admission_id ON change_logs(admission_id);
```

---

## 🛠️ Implementation Guidelines

### 1. Code Structure

```
backend/
├── routes/
│   ├── dashboardRoutes.ts        # ✅ NEW
│   └── admissionsRoutes.ts       # ⚠️ UPDATE (add parse-pdf)
├── controllers/
│   ├── dashboardController.ts     # ✅ NEW
│   └── admissionsController.ts    # ⚠️ UPDATE (add parsePDF)
├── services/
│   ├── dashboardService.ts       # ✅ NEW
│   ├── pdfService.ts             # ✅ NEW
│   ├── recommendationsService.ts  # ✅ NEW
│   └── admissionsService.ts      # ⚠️ UPDATE
├── models/
│   └── (existing models)
└── utils/
    └── (existing utils)
```

### 2. Error Handling

```typescript
// Standard error response format
{
  success: false,
  message: "Error message",
  errors?: {
    field: "Field-specific error"
  },
  timestamp: string
}

// HTTP Status Codes:
// 200 - Success
// 400 - Bad Request (validation errors)
// 401 - Unauthorized
// 403 - Forbidden
// 404 - Not Found
// 500 - Internal Server Error
```

### 3. Response Format Consistency

All endpoints must follow:
```typescript
{
  success: boolean,
  message: string,
  data: T | T[],
  pagination?: {...},  // For paginated responses
  timestamp: string
}
```

### 4. Authentication

**Development:**
- Use headers: `x-user-id`, `x-user-role`, `x-university-id`
- Never block requests (mock auth)

**Production:**
- JWT Bearer token in `Authorization` header
- Extract user info from token
- Validate token on every request

---

## 🧪 Testing Requirements

### Unit Tests

1. **Dashboard Service Tests:**
   - Test SQL query correctness
   - Test data aggregation logic
   - Test error handling

2. **PDF Service Tests:**
   - Test PDF parsing
   - Test field extraction
   - Test error cases

3. **Recommendations Service Tests:**
   - Test score calculation
   - Test filtering logic
   - Test caching

### Integration Tests

1. **Dashboard Endpoints:**
   - Test with valid user_id
   - Test with invalid user_id
   - Test response structure
   - Test performance (<500ms)

2. **PDF Parsing Endpoint:**
   - Test with valid PDF
   - Test with invalid file
   - Test with large file
   - Test field extraction

3. **Recommendations Endpoint:**
   - Test with user preferences
   - Test without preferences
   - Test limit parameter
   - Test min_score parameter

### Performance Tests

- Dashboard endpoints: <500ms response time
- PDF parsing: <5s for 10MB PDF
- Recommendations: <1s response time
- Handle 1000+ admissions per university
- Handle 100+ watchlist entries per student

---

## ⚡ Performance Optimization

### 1. Database Indexes

```sql
-- Critical indexes for dashboard queries
CREATE INDEX CONCURRENTLY idx_admissions_status_deadline 
  ON admissions(verification_status, deadline) 
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_watchlists_user_admission 
  ON watchlists(user_id, admission_id);

CREATE INDEX CONCURRENTLY idx_deadlines_user_days 
  ON deadlines(user_id, days_remaining) 
  WHERE deadline > NOW();
```

### 2. Caching Strategy

- **Dashboard endpoints:** Cache for 1-5 minutes (Redis)
- **Recommendations:** Cache for 24 hours
- **Invalidate cache on:**
  - New admission created
  - Admission updated
  - Watchlist changes
  - Preference changes

### 3. Query Optimization

- Use CTEs for complex queries
- Limit result sets (TOP 3, TOP 5, etc.)
- Use `EXPLAIN ANALYZE` to optimize queries
- Consider materialized views for heavy aggregations

---

## 📚 API Documentation

### Swagger/OpenAPI Documentation

All new endpoints must be documented in Swagger:

```typescript
/**
 * @swagger
 * /api/v1/student/dashboard:
 *   get:
 *     summary: Get student dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentDashboard'
 */
```

### Update Swagger Spec

1. Add new endpoint definitions
2. Add response schemas
3. Add request schemas (if needed)
4. Add authentication requirements
5. Add example responses

---

## 🗓️ Implementation Phases

### Phase 1: Critical Endpoints (Weeks 1-2)

**Week 1:**
- [ ] Implement `/api/v1/student/dashboard` endpoint
- [ ] Implement `/api/v1/university/dashboard` endpoint
- [ ] Add database indexes
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Update Swagger documentation

**Week 2:**
- [ ] Implement `/api/v1/admissions/parse-pdf` endpoint
- [ ] Install PDF parsing library
- [ ] Create PDF service
- [ ] Write tests for PDF parsing
- [ ] Update Swagger documentation
- [ ] Performance testing

### Phase 2: High Priority Endpoints (Week 3)

**Week 3:**
- [ ] Implement `/api/v1/student/recommendations` endpoint
- [ ] Create recommendations service
- [ ] Implement scoring algorithm
- [ ] Add caching for recommendations
- [ ] Write tests
- [ ] Update Swagger documentation

### Phase 3: Enhancements & Polish (Week 4)

**Week 4:**
- [ ] Enhance search endpoint with filters
- [ ] Implement batch operations (if needed)
- [ ] Implement `/api/v1/admin/dashboard` (optional)
- [ ] Performance optimization
- [ ] Final testing
- [ ] Documentation updates

---

## ✅ Success Criteria

### Phase 1 Complete When:
- ✅ Student dashboard endpoint working
- ✅ University dashboard endpoint working
- ✅ PDF parsing endpoint working
- ✅ All endpoints tested
- ✅ Swagger documentation updated
- ✅ Performance meets requirements (<500ms)

### Phase 2 Complete When:
- ✅ Recommendations endpoint working
- ✅ Scoring algorithm accurate
- ✅ Caching implemented
- ✅ Tests passing

### Phase 3 Complete When:
- ✅ All enhancements complete
- ✅ Performance optimized
- ✅ Documentation complete
- ✅ Ready for production

---

## 🔗 Related Documents

- **Frontend Plan:** See `FRONTEND_IMPLEMENTATION_PLAN.md`
- **Dashboard Spec:** See `BACKEND_DASHBOARD_ENDPOINTS_SPEC.md`
- **Gap Analysis:** See `COMPLETE_GAP_ANALYSIS_AND_STRATEGY.md`
- **Integration Guide:** See `INTEGRATION_GUIDE.md`

---

## 📞 Questions & Support

For questions about:
- **Endpoint specifications:** See `BACKEND_DASHBOARD_ENDPOINTS_SPEC.md`
- **SQL queries:** See dashboard endpoint sections above
- **Error handling:** See Implementation Guidelines
- **Testing:** See Testing Requirements

---

**Status:** Ready for Backend Implementation  
**Last Updated:** January 18, 2026  
**Next Review:** After Phase 1 completion

---

## 🔄 Backend-Frontend Alignment Plan

### Overview

Before frontend can fully integrate with backend API, we need to ensure:
1. **Backend endpoints match frontend expectations**
2. **Data structures are aligned** (backend schema ↔ frontend types)
3. **Mock data is converted to seeding data** for consistent testing
4. **Response formats match** frontend transformers

### Alignment Checklist

#### ✅ Already Aligned
- ✅ API response format (`success`, `message`, `data`, `timestamp`)
- ✅ Pagination structure
- ✅ Error response format
- ✅ Authentication headers (development mode)

#### ⚠️ Needs Alignment

1. **Dashboard Endpoints** (Critical)
   - ❌ `/api/v1/student/dashboard` - Not implemented
   - ❌ `/api/v1/university/dashboard` - Not implemented
   - ❌ `/api/v1/admin/dashboard` - Not implemented

2. **Data Field Mapping**
   - Frontend expects `university_name` in responses (JOIN needed)
   - Frontend expects `days_remaining` calculated field
   - Frontend expects `match_score` and `match_reason` for recommendations
   - Frontend expects `saved` and `alert_enabled` boolean flags

3. **Search & Filter Enhancements**
   - Frontend expects array filters: `degree_level[]`, `location[]`
   - Frontend expects date range filters
   - Frontend expects sorting options (`sort_by`, `sort_order`)

4. **Missing Endpoints**
   - ❌ `/api/v1/admissions/parse-pdf` - PDF parsing
   - ❌ `/api/v1/student/recommendations` - Recommendations
   - ❌ `/api/v1/university/scraper-logs` - Scraper logs

---

## 📦 Mock Data to Seeding Data Conversion Plan

### Purpose

Convert frontend mock data files into backend database seeding scripts to ensure:
- **Consistent test data** across frontend and backend
- **Realistic data** for development and testing
- **Easy data reset** during development
- **Data integrity** between frontend and backend

### Source Files (Frontend Mock Data)

1. **`src/data/studentData.ts`**
   - `sharedAdmissions` - Student admissions data
   - `sharedNotifications` - Student notifications
   - Types: `StudentAdmission`, `StudentNotification`

2. **`src/data/universityData.ts`**
   - `sharedAdmissions` - University admissions
   - `sharedAudits` - Verification audits
   - `sharedChangeLogs` - Change logs
   - `sharedNotifications` - University notifications

3. **`src/data/adminData.ts`**
   - `pendingVerifications` - Pending verifications
   - `adminActions` - Admin action logs
   - `adminNotifications` - Admin notifications
   - `scraperActivities` - Scraper activity
   - `verificationItems` - Verification items
   - `adminChangeLogs` - Admin change logs
   - `scraperJobs` - Scraper jobs
   - `analyticsEvents` - Analytics events
   - `admissionAnalytics` - Admission analytics

4. **`src/data/mockData.ts`**
   - `mockPrograms` - Program detail data

### Target Structure (Backend Seeding)

```
backend/
├── prisma/
│   └── seeds/
│       ├── 01_universities.ts          # University data
│       ├── 02_users.ts                 # User accounts
│       ├── 03_admissions.ts           # Admission programs
│       ├── 04_watchlists.ts           # Saved programs
│       ├── 05_deadlines.ts            # Deadline tracking
│       ├── 06_notifications.ts        # Notifications
│       ├── 07_changelogs.ts           # Change logs
│       ├── 08_analytics.ts            # Analytics events
│       └── 09_scraper_jobs.ts         # Scraper jobs
└── scripts/
    └── seed.ts                        # Main seeding script
```

### Data Mapping Strategy

#### 1. Universities Mapping

**Frontend Mock Data:**
```typescript
// From studentData.ts
university: 'FAST University'
location: 'Islamabad, Pakistan'
city: 'Islamabad'
```

**Backend Schema:**
```sql
CREATE TABLE universities (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Pakistan',
  website VARCHAR(255),
  logo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Mapping Logic:**
```typescript
// Extract unique universities from admissions
const universities = new Set();
admissions.forEach(admission => {
  universities.add({
    name: admission.university,
    city: admission.city,
    country: 'Pakistan',
    // Extract from location string
  });
});
```

#### 2. Admissions Mapping

**Frontend Structure:**
```typescript
interface StudentAdmission {
  id: string
  university: string
  program: string
  degree: string
  degreeType: 'BS' | 'MS' | 'PhD' | ...
  deadline: string
  fee: string
  feeNumeric: number
  location: string
  status: 'Verified' | 'Pending' | 'Updated' | 'Closed'
  // ...
}
```

**Backend Schema:**
```sql
CREATE TABLE admissions (
  id UUID PRIMARY KEY,
  university_id UUID REFERENCES universities(id),
  title VARCHAR(255) NOT NULL,
  degree_level VARCHAR(50),
  deadline DATE,
  application_fee DECIMAL(10,2),
  location VARCHAR(255),
  description TEXT,
  verification_status VARCHAR(20),
  status VARCHAR(20),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Mapping Logic:**
```typescript
function mapAdmission(frontendAdmission: StudentAdmission, universityId: string) {
  return {
    id: frontendAdmission.id, // Or generate UUID
    university_id: universityId,
    title: frontendAdmission.program,
    degree_level: mapDegreeType(frontendAdmission.degreeType),
    deadline: frontendAdmission.deadline,
    application_fee: frontendAdmission.feeNumeric,
    location: frontendAdmission.location,
    description: frontendAdmission.aiSummary,
    verification_status: mapStatus(frontendAdmission.status),
    status: mapProgramStatus(frontendAdmission.programStatus),
  };
}

function mapStatus(status: string): 'verified' | 'pending' | 'rejected' {
  const map = {
    'Verified': 'verified',
    'Pending': 'pending',
    'Updated': 'pending',
    'Closed': 'rejected',
  };
  return map[status] || 'pending';
}

function mapDegreeType(degreeType: string): string {
  const map = {
    'BS': 'bachelor',
    'MS': 'master',
    'PhD': 'phd',
    'MBA': 'mba',
    'BBA': 'bba',
    'MD': 'md',
    'MPhil': 'mphil',
  };
  return map[degreeType] || 'bachelor';
}
```

#### 3. Users Mapping

**Frontend References:**
- User IDs referenced in notifications, watchlists, etc.
- User types: 'student', 'university', 'admin'

**Backend Schema:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  university_id UUID REFERENCES universities(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Mapping Logic:**
```typescript
// Extract unique users from mock data
const users = new Set();

// From notifications
notifications.forEach(notif => {
  // Extract user_id from notification context
});

// From watchlists (if exists in mock)
// From analytics events
analyticsEvents.forEach(event => {
  users.add({
    id: event.userId,
    email: generateEmail(event.userName),
    user_type: mapUserRole(event.userRole),
  });
});

function mapUserRole(role: string): 'student' | 'university' | 'admin' {
  const map = {
    'Student': 'student',
    'UniversityRep': 'university',
    'Admin': 'admin',
  };
  return map[role] || 'student';
}
```

#### 4. Watchlists Mapping

**Frontend Structure:**
```typescript
// From StudentAdmission
saved: boolean
alertEnabled: boolean
```

**Backend Schema:**
```sql
CREATE TABLE watchlists (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  admission_id UUID REFERENCES admissions(id),
  saved_at TIMESTAMP DEFAULT NOW(),
  alert_opt_in BOOLEAN DEFAULT false,
  notes TEXT
);
```

**Mapping Logic:**
```typescript
// Extract from admissions where saved = true
admissions
  .filter(admission => admission.saved)
  .map(admission => ({
    user_id: getCurrentUserId(), // From context
    admission_id: admission.id,
    alert_opt_in: admission.alertEnabled || false,
  }));
```

#### 5. Notifications Mapping

**Frontend Structure:**
```typescript
interface StudentNotification {
  id: string
  type: 'alert' | 'system' | 'admission'
  title: string
  description: string
  time: string
  read: boolean
  // ...
}
```

**Backend Schema:**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID,
  user_type VARCHAR(20),
  category VARCHAR(50),
  priority VARCHAR(20),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

**Mapping Logic:**
```typescript
function mapNotification(frontendNotif: StudentNotification, userId: string) {
  return {
    id: frontendNotif.id,
    user_id: userId,
    user_type: 'student', // or extract from context
    category: mapNotificationCategory(frontendNotif.type),
    priority: 'medium', // or extract from frontend
    title: frontendNotif.title,
    message: frontendNotif.description,
    is_read: frontendNotif.read,
    created_at: parseDate(frontendNotif.time),
  };
}

function mapNotificationCategory(type: string): string {
  const map = {
    'alert': 'deadline',
    'system': 'system',
    'admission': 'verification',
  };
  return map[type] || 'system';
}
```

#### 6. Change Logs Mapping

**Frontend Structure:**
```typescript
interface ChangeLogItem {
  id: number
  admission: string
  modifiedBy: string
  date: string
  diff: Array<{ field: string; old: string; new: string }>
}
```

**Backend Schema:**
```sql
CREATE TABLE change_logs (
  id UUID PRIMARY KEY,
  admission_id UUID REFERENCES admissions(id),
  changed_by UUID REFERENCES users(id),
  change_type VARCHAR(50),
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP
);
```

**Mapping Logic:**
```typescript
function mapChangeLog(frontendLog: ChangeLogItem) {
  // Split diff array into multiple change_log entries
  return frontendLog.diff.map(diff => ({
    admission_id: getAdmissionIdByName(frontendLog.admission),
    changed_by: getUserIdByName(frontendLog.modifiedBy),
    change_type: 'updated',
    field_name: diff.field,
    old_value: diff.old,
    new_value: diff.new,
    created_at: parseDate(frontendLog.date),
  }));
}
```

### Implementation Steps

#### Step 1: Create Seeding Script Structure

```typescript
// backend/scripts/seed.ts
import { PrismaClient } from '@prisma/client';
import * as studentData from '../data/seeds/studentData';
import * as universityData from '../data/seeds/universityData';
import * as adminData from '../data/seeds/adminData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  // 1. Seed universities
  await seedUniversities();
  
  // 2. Seed users
  await seedUsers();
  
  // 3. Seed admissions
  await seedAdmissions();
  
  // 4. Seed watchlists
  await seedWatchlists();
  
  // 5. Seed deadlines
  await seedDeadlines();
  
  // 6. Seed notifications
  await seedNotifications();
  
  // 7. Seed change logs
  await seedChangeLogs();
  
  // 8. Seed analytics
  await seedAnalytics();
  
  // 9. Seed scraper jobs
  await seedScraperJobs();
  
  console.log('✅ Seeding completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

#### Step 2: Create Data Conversion Scripts

```typescript
// backend/scripts/convertMockData.ts
/**
 * Converts frontend mock data to backend seeding format
 * 
 * This script:
 * 1. Reads frontend mock data files
 * 2. Transforms data to match backend schema
 * 3. Generates seeding scripts
 * 4. Handles relationships (foreign keys)
 */

import * as fs from 'fs';
import * as path from 'path';

// Import frontend mock data (or copy to backend/data/mock/)
import { sharedAdmissions as studentAdmissions } from '../../frontend/src/data/studentData';
import { sharedAdmissions as universityAdmissions } from '../../frontend/src/data/universityData';

function convertAdmissions() {
  // Extract unique universities
  const universities = extractUniversities(studentAdmissions);
  
  // Map admissions
  const admissions = studentAdmissions.map(admission => ({
    id: admission.id,
    university_id: getUniversityId(admission.university, universities),
    title: admission.program,
    degree_level: mapDegreeType(admission.degreeType),
    deadline: admission.deadline,
    application_fee: admission.feeNumeric,
    location: admission.location,
    description: admission.aiSummary,
    verification_status: mapStatus(admission.status),
    status: mapProgramStatus(admission.programStatus),
  }));
  
  return { universities, admissions };
}

// Generate seeding file
function generateSeedingFile(data: any, filename: string) {
  const content = `// Auto-generated from frontend mock data
export const ${filename} = ${JSON.stringify(data, null, 2)};
`;
  
  fs.writeFileSync(
    path.join(__dirname, `../prisma/seeds/${filename}.ts`),
    content
  );
}
```

#### Step 3: Handle Data Relationships

```typescript
// Maintain referential integrity
const universityMap = new Map<string, string>(); // name -> id
const userMap = new Map<string, string>(); // name -> id
const admissionMap = new Map<string, string>(); // title -> id

// Create in order: universities -> users -> admissions -> watchlists -> etc.
```

#### Step 4: Generate UUIDs

```typescript
import { randomUUID } from 'crypto';

function generateId(existingIds: string[]): string {
  let id: string;
  do {
    id = randomUUID();
  } while (existingIds.includes(id));
  return id;
}
```

#### Step 5: Date Handling

```typescript
function parseDate(dateString: string): Date {
  // Handle various date formats from frontend
  // "2025-07-30" -> Date
  // "Updated 2 days ago" -> Calculate relative date
  // "January 20, 2025" -> Parse formatted date
}
```

### Seeding Data Files Structure

#### `01_universities.ts`
```typescript
export const universities = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'FAST University',
    city: 'Islamabad',
    country: 'Pakistan',
    website: 'https://www.nu.edu.pk',
    created_at: new Date('2024-01-01'),
  },
  // ... more universities
];
```

#### `03_admissions.ts`
```typescript
export const admissions = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    university_id: '550e8400-e29b-41d4-a716-446655440000', // FAST
    title: 'BS Computer Science',
    degree_level: 'bachelor',
    deadline: new Date('2025-07-30'),
    application_fee: 75000,
    location: 'Islamabad, Pakistan',
    description: 'This program offers...',
    verification_status: 'verified',
    status: 'active',
    created_at: new Date('2024-12-01'),
    updated_at: new Date('2025-01-16'),
  },
  // ... more admissions
];
```

### Validation & Testing

#### 1. Data Validation
```typescript
function validateSeedingData() {
  // Check all foreign keys exist
  // Check required fields
  // Check data types
  // Check date ranges
}
```

#### 2. Relationship Validation
```typescript
function validateRelationships() {
  // All admission.university_id must exist in universities
  // All watchlist.admission_id must exist in admissions
  // All notification.user_id must exist in users
}
```

#### 3. Test Seeding
```typescript
// Run seeding in test database
// Verify data integrity
// Check record counts match
```

### Migration Strategy

#### Phase 1: Extract & Convert
1. Copy mock data files to `backend/data/mock/`
2. Create conversion scripts
3. Generate seeding files

#### Phase 2: Test Seeding
1. Run seeding on test database
2. Validate data integrity
3. Fix any mapping issues

#### Phase 3: Integration
1. Update frontend to use API (with seeded data)
2. Compare API responses with mock data
3. Adjust transformers if needed

#### Phase 4: Documentation
1. Document data mapping rules
2. Document seeding process
3. Create data reset scripts

### Benefits

✅ **Consistent Data** - Same data in frontend and backend  
✅ **Realistic Testing** - Real-world-like data for development  
✅ **Easy Reset** - Quick database reset during development  
✅ **Data Integrity** - Proper relationships and foreign keys  
✅ **Type Safety** - TypeScript types match between frontend and backend  

---

## 🎯 Backend Alignment Implementation Plan

### Phase 0: Data Preparation (Week 0)

**Tasks:**
- [ ] Create seeding script structure
- [ ] Convert frontend mock data to backend format
- [ ] Generate seeding files for all entities
- [ ] Validate data relationships
- [ ] Test seeding on development database
- [ ] Document data mapping rules

**Deliverables:**
- ✅ Seeding scripts for all entities
- ✅ Seeded development database
- ✅ Data mapping documentation

### Phase 1: Critical Endpoints (Weeks 1-2)

**Week 1: Dashboard Endpoints**
- [ ] Implement `/api/v1/student/dashboard`
  - [ ] SQL aggregation query
  - [ ] Include `university_name` (JOIN)
  - [ ] Include `days_remaining` (calculated)
  - [ ] Include `saved` and `alert_enabled` flags
  - [ ] Test with seeded data
- [ ] Implement `/api/v1/university/dashboard`
  - [ ] Similar structure to student dashboard
  - [ ] Include university-specific stats
  - [ ] Test with seeded data

**Week 2: PDF Parsing & Testing**
- [ ] Implement `/api/v1/admissions/parse-pdf`
- [ ] Test all endpoints with seeded data
- [ ] Compare API responses with frontend mock data
- [ ] Fix any data structure mismatches

### Phase 2: Enhancements (Week 3)

**Week 3: Search & Recommendations**
- [ ] Enhance search endpoint with array filters
- [ ] Add sorting options
- [ ] Implement `/api/v1/student/recommendations`
- [ ] Test with seeded data

### Phase 3: Polish (Week 4)

**Week 4: Final Alignment**
- [ ] Verify all response formats match frontend expectations
- [ ] Update Swagger documentation
- [ ] Performance testing with seeded data
- [ ] Final data validation

---

## 📋 Alignment Checklist

### Data Structure Alignment

- [ ] **Universities** - Name, city, country mapping
- [ ] **Admissions** - All fields mapped correctly
  - [ ] `title` ↔ `program`
  - [ ] `degree_level` ↔ `degreeType`
  - [ ] `verification_status` ↔ `status`
  - [ ] `application_fee` ↔ `feeNumeric`
- [ ] **Notifications** - Category, priority, type mapping
- [ ] **Change Logs** - Field mapping and diff structure
- [ ] **Watchlists** - Saved and alert flags
- [ ] **Deadlines** - Days remaining calculation

### Response Format Alignment

- [ ] Dashboard responses include all required fields
- [ ] JOINed data includes `university_name`
- [ ] Calculated fields (`days_remaining`, `match_score`)
- [ ] Boolean flags (`saved`, `alert_enabled`)
- [ ] Pagination structure matches frontend expectations

### Endpoint Alignment

- [ ] All dashboard endpoints implemented
- [ ] Search endpoint supports array filters
- [ ] Recommendations endpoint implemented
- [ ] PDF parsing endpoint implemented
- [ ] All endpoints return consistent format

---

## 🔗 Related Documents

- **Frontend Plan:** `FRONTEND_IMPLEMENTATION_PLAN.md`
- **Dashboard Spec:** `BACKEND_DASHBOARD_ENDPOINTS_SPEC.md`
- **Gap Analysis:** `COMPLETE_GAP_ANALYSIS_AND_STRATEGY.md`
- **Mock Data Files:** `src/data/studentData.ts`, `src/data/universityData.ts`, `src/data/adminData.ts`

---

**Status:** ✅ Phase 1 Complete - Critical Endpoints Implemented  
**Last Updated:** January 18, 2026  
**Completion:** See `BACKEND_IMPLEMENTATION_COMPLETE.md` for details

---

## ✅ Implementation Status

### Completed Endpoints (5/5)

- ✅ `GET /api/v1/student/dashboard` - Student dashboard aggregation
- ✅ `GET /api/v1/university/dashboard` - University dashboard aggregation
- ✅ `GET /api/v1/admin/dashboard` - Admin dashboard aggregation
- ✅ `POST /api/v1/admissions/parse-pdf` - PDF parsing with field extraction
- ✅ `GET /api/v1/student/recommendations` - Personalized recommendations with scoring

**See:** `BACKEND_IMPLEMENTATION_COMPLETE.md` for full completion report.