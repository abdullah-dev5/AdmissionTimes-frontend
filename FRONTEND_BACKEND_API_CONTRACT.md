# Frontend-Backend API Contract & Integration Specification

**Project:** AdmissionTimes  
**Version:** 1.0  
**Last Updated:** January 27, 2026  
**Purpose:** Complete API contract between React Frontend and FastAPI Backend

---

## Table of Contents

1. [General Conventions](#general-conventions)
2. [Authentication Module](#authentication-module)
3. [Student Module](#student-module)
4. [University Module](#university-module)
5. [Admin Module](#admin-module)
6. [Shared Data Contracts](#shared-data-contracts)
7. [Field Name Mappings](#field-name-mappings)
8. [Error Handling](#error-handling)
9. [Appendix: Complete Type Definitions](#appendix-complete-type-definitions)

---

## General Conventions

### Base URL
```
Development: http://localhost:8000/api/v1
Production: https://api.admissiontimes.com/api/v1
```

### Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error message"
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

### Authentication Headers

All authenticated requests must include these headers:

```http
x-user-id: <uuid>
x-user-role: student | university | admin
x-university-id: <uuid>  # Only for university users
```

**Future (Phase 4C):**
```http
Authorization: Bearer <jwt_token>
```

### Date/Time Format
- ISO 8601 format: `2026-01-27T15:34:24.921Z`
- All dates should be UTC

### Pagination Format
```json
{
  "page": 1,
  "page_size": 20,
  "total_items": 150,
  "total_pages": 8,
  "has_next": true,
  "has_prev": false
}
```

---

## Authentication Module

### 1.1 Sign Up

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123",
  "user_type": "student",  // "student" | "university" | "admin"
  "university_id": null     // Required only if user_type is "university"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "9a3224fe-4d45-4cfc-9a0c-884e13f5e0b5",
      "email": "student@example.com",
      "role": "student",  // ⚠️ IMPORTANT: Backend uses "role" not "user_type"
      "university_id": null,
      "display_name": "John Doe",
      "created_at": "2026-01-27T15:34:24.921Z",
      "updated_at": "2026-01-27T15:34:24.921Z"
    },
    "message": "Account created successfully"
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

**Frontend Expectations:**
- Frontend will access user data via `response.data.user`
- Frontend expects `role` field (not `user_type`) in user object
- Frontend will store user in Zustand store and React Context
- Automatic navigation to appropriate dashboard based on role

---

### 1.2 Sign In

**Endpoint:** `POST /auth/signin`

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "user": {
      "id": "9a3224fe-4d45-4cfc-9a0c-884e13f5e0b5",
      "email": "student@example.com",
      "role": "student",
      "university_id": null,
      "display_name": "John Doe",
      "created_at": "2026-01-27T15:34:24.921Z",
      "updated_at": "2026-01-27T15:34:24.921Z"
    },
    "message": "Signed in successfully"
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

**Frontend Behavior:**
1. Stores user in Zustand store (persisted to localStorage)
2. Stores user in React Context
3. Sets up localStorage items:
   - `userId`: User's ID
   - `userRole`: User's role
   - `universityId`: Only for university users
4. Navigates to:
   - `/student/dashboard` if role is "student"
   - `/university/dashboard` if role is "university"
   - `/admin/dashboard` if role is "admin"

---

### 1.3 Sign Out

**Endpoint:** `POST /auth/signout`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: <role>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Signed out successfully",
  "data": null,
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

**Frontend Behavior:**
1. Clears Zustand store
2. Clears React Context
3. Removes localStorage items
4. Navigates to `/signin`

---

### 1.4 Get Current User

**Endpoint:** `GET /auth/me`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: <role>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "9a3224fe-4d45-4cfc-9a0c-884e13f5e0b5",
    "email": "student@example.com",
    "role": "student",
    "university_id": null,
    "display_name": "John Doe",
    "created_at": "2026-01-27T15:34:24.921Z",
    "updated_at": "2026-01-27T15:34:24.921Z"
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

**Frontend Usage:**
- Called on app initialization to restore auth state
- Used to verify session validity

---

## Student Module

### 2.1 Get Student Dashboard

**Endpoint:** `GET /student/dashboard`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: student
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard retrieved successfully",
  "data": {
    "stats": {
      "total_admissions": 45,
      "active_applications": 12,
      "watchlist_count": 8,
      "unread_notifications": 3
    },
    "recent_admissions": [
      {
        "id": "uuid",
        "title": "MSc Computer Science",
        "university": "Stanford University",
        "country": "USA",
        "city": "Stanford",
        "degree_type": "Masters",
        "program_duration": "2 years",
        "application_deadline": "2026-03-15T00:00:00Z",
        "status": "verified",
        "verification_status": "verified",
        "is_featured": true,
        "views": 1234,
        "created_at": "2026-01-15T10:30:00Z",
        "updated_at": "2026-01-20T14:20:00Z"
      }
    ],
    "notifications": [
      {
        "id": "uuid",
        "title": "Application Deadline Approaching",
        "message": "MSc Computer Science deadline is in 5 days",
        "type": "deadline",
        "created_at": "2026-01-27T10:00:00Z",
        "is_read": false
      }
    ],
    "watchlist": [
      {
        "id": "uuid",
        "admission_id": "uuid",
        "admission": {
          "title": "MBA",
          "university": "Harvard Business School"
        },
        "created_at": "2026-01-20T15:00:00Z"
      }
    ]
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 2.2 Search & Filter Admissions

**Endpoint:** `GET /student/admissions`

**Query Parameters:**
```
?search=computer science
&country=USA
&city=Stanford
&degree_type=Masters
&min_duration=1
&max_duration=3
&status=verified
&deadline_from=2026-03-01
&deadline_to=2026-06-30
&page=1
&page_size=20
&sort_by=deadline
&sort_order=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admissions retrieved successfully",
  "data": {
    "admissions": [
      {
        "id": "uuid",
        "title": "MSc Computer Science",
        "university": "Stanford University",
        "country": "USA",
        "city": "Stanford",
        "degree_type": "Masters",
        "program_duration": "2 years",
        "application_deadline": "2026-03-15T00:00:00Z",
        "tuition_fees": "$50,000/year",
        "language_requirements": "IELTS 7.0 or TOEFL 100",
        "gpa_requirement": "3.5/4.0",
        "status": "verified",
        "verification_status": "verified",
        "is_featured": true,
        "tags": ["STEM", "Research"],
        "views": 1234,
        "created_at": "2026-01-15T10:30:00Z",
        "updated_at": "2026-01-20T14:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 150,
      "total_pages": 8,
      "has_next": true,
      "has_prev": false
    }
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 2.3 Get Admission Details

**Endpoint:** `GET /student/admissions/{admission_id}`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: student
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admission details retrieved",
  "data": {
    "id": "uuid",
    "title": "MSc Computer Science",
    "university": "Stanford University",
    "university_id": "uuid",
    "country": "USA",
    "city": "Stanford",
    "degree_type": "Masters",
    "program_duration": "2 years",
    "application_deadline": "2026-03-15T00:00:00Z",
    "tuition_fees": "$50,000/year",
    "language_requirements": "IELTS 7.0 or TOEFL 100",
    "gpa_requirement": "3.5/4.0",
    "description": "Full program description...",
    "requirements": "List of requirements...",
    "benefits": "Scholarships available...",
    "application_process": "Step by step guide...",
    "status": "verified",
    "verification_status": "verified",
    "is_featured": true,
    "tags": ["STEM", "Research"],
    "views": 1234,
    "documents_required": ["Transcript", "LOR", "SOP"],
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-01-20T14:20:00Z",
    "university_contact": {
      "name": "Admissions Office",
      "email": "admissions@stanford.edu",
      "phone": "+1-650-123-4567"
    }
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 2.4 Add to Watchlist

**Endpoint:** `POST /student/watchlist`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: student
```

**Request Body:**
```json
{
  "admission_id": "uuid"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Added to watchlist",
  "data": {
    "id": "watchlist_uuid",
    "user_id": "uuid",
    "admission_id": "uuid",
    "created_at": "2026-01-27T15:34:24.921Z"
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 2.5 Remove from Watchlist

**Endpoint:** `DELETE /student/watchlist/{admission_id}`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: student
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Removed from watchlist",
  "data": null,
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 2.6 Get Watchlist

**Endpoint:** `GET /student/watchlist`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: student
```

**Query Parameters:**
```
?page=1
&page_size=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Watchlist retrieved",
  "data": {
    "watchlist": [
      {
        "id": "uuid",
        "admission_id": "uuid",
        "admission": {
          "id": "uuid",
          "title": "MBA",
          "university": "Harvard Business School",
          "application_deadline": "2026-04-01T00:00:00Z",
          "status": "verified"
        },
        "created_at": "2026-01-20T15:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 8,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 2.7 Get Notifications

**Endpoint:** `GET /student/notifications`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: student
```

**Query Parameters:**
```
?is_read=false
&page=1
&page_size=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notifications retrieved",
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "title": "Application Deadline Approaching",
        "message": "MSc Computer Science deadline is in 5 days",
        "type": "deadline",
        "priority": "high",
        "related_admission_id": "uuid",
        "is_read": false,
        "created_at": "2026-01-27T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 3,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 2.8 Mark Notification as Read

**Endpoint:** `PATCH /student/notifications/{notification_id}`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: student
```

**Request Body:**
```json
{
  "is_read": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification updated",
  "data": {
    "id": "uuid",
    "is_read": true,
    "updated_at": "2026-01-27T15:34:24.921Z"
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 2.9 AI Chat

**Endpoint:** `POST /student/ai/chat`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: student
```

**Request Body:**
```json
{
  "message": "What are the best CS programs in USA?",
  "context": {
    "current_filters": {
      "country": "USA",
      "degree_type": "Masters"
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "AI response generated",
  "data": {
    "response": "Based on your search for CS programs in USA...",
    "suggestions": [
      {
        "admission_id": "uuid",
        "title": "MSc Computer Science - Stanford",
        "relevance_score": 0.95
      }
    ],
    "follow_up_questions": [
      "Would you like to see scholarship options?",
      "Are you interested in research-focused programs?"
    ]
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

## University Module

### 3.1 Get University Dashboard

**Endpoint:** `GET /university/dashboard`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: university
x-university-id: <uuid>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard retrieved successfully",
  "data": {
    "stats": {
      "total_admissions": 25,
      "pending_verification": 3,
      "verified_admissions": 20,
      "recent_changes": 5,
      "unread_notifications": 2
    },
    "pending_verifications": [
      {
        "id": "uuid",
        "title": "MSc Data Science",
        "status": "pending_verification",
        "verification_requested_at": "2026-01-25T10:00:00Z",
        "verification_notes": null,
        "submitted_by": "Rep Name",
        "created_at": "2026-01-20T15:00:00Z"
      }
    ],
    "recent_changes": [
      {
        "id": "uuid",
        "admission_id": "uuid",
        "admission_title": "MBA Program",
        "field_changed": "application_deadline",
        "old_value": "2026-03-01T00:00:00Z",
        "new_value": "2026-03-15T00:00:00Z",
        "changed_by": "Rep Name",
        "changed_at": "2026-01-27T14:00:00Z",
        "reason": "Extended due to high demand"
      }
    ],
    "recent_notifications": [
      {
        "id": "uuid",
        "title": "Admission Verified",
        "message": "MSc Computer Science has been verified by admin",
        "type": "verification",
        "is_read": false,
        "created_at": "2026-01-27T12:00:00Z"
      }
    ]
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 3.2 Create Admission

**Endpoint:** `POST /university/admissions`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: university
x-university-id: <uuid>
```

**Request Body:**
```json
{
  "title": "MSc Computer Science",
  "country": "USA",
  "city": "Stanford",
  "degree_type": "Masters",
  "program_duration": "2 years",
  "application_deadline": "2026-03-15T00:00:00Z",
  "tuition_fees": "$50,000/year",
  "language_requirements": "IELTS 7.0 or TOEFL 100",
  "gpa_requirement": "3.5/4.0",
  "description": "Full program description...",
  "requirements": "List of requirements...",
  "benefits": "Scholarships available...",
  "application_process": "Step by step guide...",
  "tags": ["STEM", "Research"],
  "documents_required": ["Transcript", "LOR", "SOP"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Admission created successfully",
  "data": {
    "id": "uuid",
    "title": "MSc Computer Science",
    "university_id": "uuid",
    "status": "pending_verification",
    "verification_status": "pending",
    "created_at": "2026-01-27T15:34:24.921Z",
    "updated_at": "2026-01-27T15:34:24.921Z"
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 3.3 Update Admission

**Endpoint:** `PUT /university/admissions/{admission_id}`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: university
x-university-id: <uuid>
```

**Request Body:**
```json
{
  "title": "MSc Computer Science (Updated)",
  "application_deadline": "2026-03-20T00:00:00Z",
  "change_reason": "Extended deadline due to high demand"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admission updated successfully",
  "data": {
    "id": "uuid",
    "title": "MSc Computer Science (Updated)",
    "application_deadline": "2026-03-20T00:00:00Z",
    "status": "pending_verification",
    "change_log_id": "uuid",
    "updated_at": "2026-01-27T15:34:24.921Z"
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

**Frontend Note:**
- Updates trigger a change log entry
- Verified admissions may need re-verification after significant changes

---

### 3.4 Delete Admission

**Endpoint:** `DELETE /university/admissions/{admission_id}`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: university
x-university-id: <uuid>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admission deleted successfully",
  "data": null,
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 3.5 Get University Admissions

**Endpoint:** `GET /university/admissions`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: university
x-university-id: <uuid>
```

**Query Parameters:**
```
?status=verified
&page=1
&page_size=20
&sort_by=created_at
&sort_order=desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admissions retrieved",
  "data": {
    "admissions": [
      {
        "id": "uuid",
        "title": "MSc Computer Science",
        "degree_type": "Masters",
        "application_deadline": "2026-03-15T00:00:00Z",
        "status": "verified",
        "verification_status": "verified",
        "views": 1234,
        "watchlist_count": 45,
        "created_at": "2026-01-15T10:30:00Z",
        "updated_at": "2026-01-20T14:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 25,
      "total_pages": 2,
      "has_next": true,
      "has_prev": false
    }
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 3.6 Get Change Logs

**Endpoint:** `GET /university/change-logs`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: university
x-university-id: <uuid>
```

**Query Parameters:**
```
?admission_id=uuid
&page=1
&page_size=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Change logs retrieved",
  "data": {
    "change_logs": [
      {
        "id": "uuid",
        "admission_id": "uuid",
        "admission_title": "MSc Computer Science",
        "field_changed": "application_deadline",
        "old_value": "2026-03-01T00:00:00Z",
        "new_value": "2026-03-15T00:00:00Z",
        "changed_by_user_id": "uuid",
        "changed_by_name": "Rep Name",
        "reason": "Extended due to high demand",
        "created_at": "2026-01-27T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 5,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 3.7 Request Verification

**Endpoint:** `POST /university/admissions/{admission_id}/request-verification`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: university
x-university-id: <uuid>
```

**Request Body:**
```json
{
  "notes": "All information is accurate and up to date"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification requested",
  "data": {
    "admission_id": "uuid",
    "status": "pending_verification",
    "verification_requested_at": "2026-01-27T15:34:24.921Z"
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

## Admin Module

### 4.1 Get Admin Dashboard

**Endpoint:** `GET /admin/dashboard`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: admin
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admin dashboard retrieved",
  "data": {
    "stats": {
      "total_users": 1250,
      "total_admissions": 450,
      "pending_verifications": 15,
      "total_notifications_sent": 3420
    },
    "pending_verifications": [
      {
        "id": "uuid",
        "title": "MSc Data Science",
        "university_name": "MIT",
        "university_id": "uuid",
        "status": "pending_verification",
        "verification_requested_at": "2026-01-25T10:00:00Z",
        "submitted_by": "University Rep Name",
        "created_at": "2026-01-20T15:00:00Z"
      }
    ],
    "recent_activity": [
      {
        "id": "uuid",
        "type": "admission_verified",
        "user_id": "uuid",
        "user_name": "Admin Name",
        "admission_id": "uuid",
        "admission_title": "MBA Program",
        "action": "Verified admission",
        "timestamp": "2026-01-27T14:30:00Z"
      }
    ],
    "system_metrics": {
      "scraper_jobs_today": 24,
      "successful_scrapes": 22,
      "failed_scrapes": 2
    },
    "analytics": {
      "status_breakdown": {
        "verified": 380,
        "pending": 50,
        "rejected": 20
      },
      "university_distribution": [
        {
          "university_id": "uuid",
          "university_name": "Stanford",
          "admission_count": 45
        }
      ],
      "monthly_trend": [
        {
          "month": "2026-01",
          "admissions_created": 120,
          "admissions_verified": 100
        }
      ],
      "degree_type_distribution": {
        "Masters": 200,
        "Bachelors": 150,
        "PhD": 100
      }
    }
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 4.2 Verify Admission

**Endpoint:** `POST /admin/admissions/{admission_id}/verify`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: admin
```

**Request Body:**
```json
{
  "verification_status": "verified",  // "verified" | "rejected"
  "notes": "All information verified and accurate",
  "rejection_reason": null  // Required if status is "rejected"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admission verified successfully",
  "data": {
    "id": "uuid",
    "title": "MSc Computer Science",
    "status": "verified",
    "verification_status": "verified",
    "verified_by": "uuid",
    "verified_at": "2026-01-27T15:34:24.921Z"
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 4.3 Get All Users

**Endpoint:** `GET /admin/users`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: admin
```

**Query Parameters:**
```
?role=student
&page=1
&page_size=20
&sort_by=created_at
&sort_order=desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "student@example.com",
        "role": "student",
        "university_id": null,
        "display_name": "John Doe",
        "is_active": true,
        "created_at": "2026-01-15T10:00:00Z",
        "last_login": "2026-01-27T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 1250,
      "total_pages": 63,
      "has_next": true,
      "has_prev": false
    }
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 4.4 Get All Admissions (Admin View)

**Endpoint:** `GET /admin/admissions`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: admin
```

**Query Parameters:**
```
?status=pending_verification
&university_id=uuid
&page=1
&page_size=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admissions retrieved",
  "data": {
    "admissions": [
      {
        "id": "uuid",
        "title": "MSc Computer Science",
        "university_id": "uuid",
        "university_name": "Stanford",
        "status": "pending_verification",
        "verification_status": "pending",
        "verification_requested_at": "2026-01-25T10:00:00Z",
        "created_at": "2026-01-20T15:00:00Z",
        "views": 0
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 15,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 4.5 Get Scraper Logs

**Endpoint:** `GET /admin/scraper/logs`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: admin
```

**Query Parameters:**
```
?status=success
&date_from=2026-01-20
&date_to=2026-01-27
&page=1
&page_size=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Scraper logs retrieved",
  "data": {
    "logs": [
      {
        "id": "uuid",
        "job_id": "scraper_job_123",
        "university_name": "Stanford University",
        "university_url": "https://www.stanford.edu/admissions",
        "status": "success",
        "records_found": 15,
        "records_created": 12,
        "records_updated": 3,
        "error_message": null,
        "started_at": "2026-01-27T10:00:00Z",
        "completed_at": "2026-01-27T10:15:00Z",
        "duration_seconds": 900
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 24,
      "total_pages": 2,
      "has_next": true,
      "has_prev": false
    }
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 4.6 Trigger Manual Scrape

**Endpoint:** `POST /admin/scraper/trigger`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: admin
```

**Request Body:**
```json
{
  "university_id": "uuid",  // Optional: specific university or all
  "scrape_type": "full"     // "full" | "incremental"
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Scraper job queued",
  "data": {
    "job_id": "scraper_job_124",
    "status": "queued",
    "queued_at": "2026-01-27T15:34:24.921Z"
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

### 4.7 Send Notification

**Endpoint:** `POST /admin/notifications/send`

**Headers:**
```http
x-user-id: <uuid>
x-user-role: admin
```

**Request Body:**
```json
{
  "recipient_type": "all_students",  // "all_students" | "all_universities" | "specific_user"
  "recipient_id": null,  // Required if recipient_type is "specific_user"
  "title": "System Maintenance Notice",
  "message": "The system will undergo maintenance on...",
  "type": "system",
  "priority": "high"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "notification_id": "uuid",
    "recipients_count": 850,
    "sent_at": "2026-01-27T15:34:24.921Z"
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

---

## Shared Data Contracts

### 5.1 Admission Object (Full Schema)

```typescript
interface Admission {
  // Basic Info
  id: string;
  title: string;
  university: string;
  university_id: string;
  country: string;
  city: string;
  
  // Program Details
  degree_type: 'Bachelors' | 'Masters' | 'PhD' | 'Diploma' | 'Certificate';
  program_duration: string;  // e.g., "2 years", "18 months"
  field_of_study: string;
  specialization?: string;
  
  // Deadlines & Dates
  application_deadline: string;  // ISO 8601
  program_start_date?: string;
  
  // Requirements
  tuition_fees: string;
  language_requirements: string;
  gpa_requirement: string;
  test_requirements?: string;  // GRE, GMAT, etc.
  
  // Content
  description: string;
  requirements: string;
  benefits?: string;
  application_process?: string;
  
  // Status & Verification
  status: 'draft' | 'pending_verification' | 'verified' | 'rejected' | 'archived';
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_requested_at?: string;
  verified_at?: string;
  verified_by?: string;
  verification_notes?: string;
  rejection_reason?: string;
  
  // Metadata
  is_featured: boolean;
  tags: string[];
  documents_required: string[];
  views: number;
  watchlist_count?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relations
  university_contact?: {
    name: string;
    email: string;
    phone?: string;
  };
}
```

---

### 5.2 User Object (Full Schema)

```typescript
interface User {
  id: string;
  email: string;
  role: 'student' | 'university' | 'admin';  // ⚠️ Backend uses "role"
  user_type?: 'student' | 'university' | 'admin';  // Optional for compatibility
  university_id: string | null;
  display_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  
  // Extended fields (not always returned)
  profile?: StudentProfile | UniversityProfile;
}
```

---

### 5.3 Notification Object

```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'verification' | 'system' | 'admission_update' | 'watchlist';
  priority?: 'low' | 'medium' | 'high';
  related_admission_id?: string;
  is_read: boolean;
  created_at: string;
}
```

---

### 5.4 ChangeLog Object

```typescript
interface ChangeLog {
  id: string;
  admission_id: string;
  admission_title: string;
  field_changed: string;
  old_value: string | null;
  new_value: string;
  changed_by_user_id: string;
  changed_by_name: string;
  reason?: string;
  created_at: string;
}
```

---

### 5.5 Pagination Object

```typescript
interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}
```

---

### 5.6 Filter/Sort Parameters

**Standard Query Parameters for List Endpoints:**

```typescript
interface ListQueryParams {
  // Pagination
  page?: number;           // Default: 1
  page_size?: number;      // Default: 20, Max: 100
  
  // Sorting
  sort_by?: string;        // Field name
  sort_order?: 'asc' | 'desc';  // Default: 'desc'
  
  // Search
  search?: string;         // Free text search
  
  // Filters (endpoint-specific)
  status?: string;
  country?: string;
  city?: string;
  degree_type?: string;
  // ... other filters
}
```

---

## Field Name Mappings

### Critical Differences Between Frontend & Backend

| Frontend Field | Backend Field | Notes |
|---------------|---------------|-------|
| `user_type` | `role` | ⚠️ **Backend uses "role"** - Frontend supports both |
| `verification_status` | `verification_status` | Same |
| `application_deadline` | `application_deadline` | Same, ISO 8601 format |
| `created_at` | `created_at` | Same, ISO 8601 format |
| `updated_at` | `updated_at` | Same, ISO 8601 format |

### Date/Time Handling

**Backend Format (Required):**
- ISO 8601: `2026-01-27T15:34:24.921Z`
- Always UTC timezone
- Include milliseconds

**Frontend Parsing:**
```typescript
const date = new Date(dateString);  // Handles ISO 8601 automatically
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed technical error information"
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Request data validation failed |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict (e.g., duplicate) |
| 422 | `UNPROCESSABLE_ENTITY` | Semantic errors in request |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Temporary service unavailable |

### Validation Error Format

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  },
  "timestamp": "2026-01-27T15:34:24.921Z"
}
```

### Frontend Error Handling

The frontend will:
1. Log errors to console
2. Display user-friendly toast messages
3. Fall back to mock data for dashboard endpoints (graceful degradation)
4. Retry failed requests for network errors

```typescript
try {
  const response = await api.call();
} catch (error) {
  if (error.response?.status === 403) {
    // Redirect to login
  } else if (error.response?.status >= 500) {
    // Show generic error, use fallback data
  } else {
    // Show specific error message
  }
}
```

---

## Appendix: Complete Type Definitions

### TypeScript Interfaces (Frontend)

```typescript
// User & Auth
export interface User {
  id: string;
  email: string;
  role: 'student' | 'university' | 'admin';
  user_type?: 'student' | 'university' | 'admin';  // Compatibility
  university_id: string | null;
  display_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  user_type: 'student' | 'university' | 'admin';
  university_id?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

// Admissions
export interface Admission {
  id: string;
  title: string;
  university: string;
  university_id: string;
  country: string;
  city: string;
  degree_type: string;
  program_duration: string;
  application_deadline: string;
  tuition_fees: string;
  language_requirements: string;
  gpa_requirement: string;
  description: string;
  requirements: string;
  benefits?: string;
  application_process?: string;
  status: string;
  verification_status: string;
  is_featured: boolean;
  tags: string[];
  views: number;
  created_at: string;
  updated_at: string;
}

// Dashboard Data
export interface StudentDashboard {
  stats: {
    total_admissions: number;
    active_applications: number;
    watchlist_count: number;
    unread_notifications: number;
  };
  recent_admissions: Admission[];
  notifications: Notification[];
  watchlist: WatchlistItem[];
}

export interface UniversityDashboard {
  stats: {
    total_admissions: number;
    pending_verification: number;
    verified_admissions: number;
    recent_changes: number;
    unread_notifications: number;
  };
  pending_verifications: Admission[];
  recent_changes: ChangeLog[];
  recent_notifications: Notification[];
}

export interface AdminDashboard {
  stats: {
    total_users: number;
    total_admissions: number;
    pending_verifications: number;
    total_notifications_sent: number;
  };
  pending_verifications: Admission[];
  recent_activity: Activity[];
  system_metrics: {
    scraper_jobs_today: number;
    successful_scrapes: number;
    failed_scrapes: number;
  };
  analytics?: {
    status_breakdown: Record<string, number>;
    university_distribution: Array<{
      university_id: string;
      university_name: string;
      admission_count: number;
    }>;
    monthly_trend: Array<{
      month: string;
      admissions_created: number;
      admissions_verified: number;
    }>;
    degree_type_distribution: Record<string, number>;
  };
}

// Notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority?: string;
  related_admission_id?: string;
  is_read: boolean;
  created_at: string;
}

// Change Logs
export interface ChangeLog {
  id: string;
  admission_id: string;
  admission_title: string;
  field_changed: string;
  old_value: string | null;
  new_value: string;
  changed_by_user_id: string;
  changed_by_name: string;
  reason?: string;
  created_at: string;
}

// Pagination
export interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// List Response
export interface ListResponse<T> {
  items: T[];
  pagination: Pagination;
}
```

---

## Implementation Notes

### Critical Backend Requirements

1. **User Object Field Name**
   - ✅ Use `role` (not `user_type`) in user object
   - Frontend has been updated to support both for compatibility

2. **Authentication Headers**
   - ✅ Accept `x-user-id`, `x-user-role`, `x-university-id` headers
   - Validate role matches endpoint requirements (e.g., student endpoint requires role="student")

3. **Response Wrapper**
   - ✅ All responses must use the standard format:
   ```json
   {
     "success": true/false,
     "message": "...",
     "data": {...},
     "timestamp": "ISO 8601"
   }
   ```

4. **Date Format**
   - ✅ Always use ISO 8601 with milliseconds and Z suffix
   - Example: `2026-01-27T15:34:24.921Z`

5. **Pagination**
   - ✅ Use consistent pagination structure across all list endpoints
   - Include `has_next` and `has_prev` boolean flags

6. **Error Responses**
   - ✅ Include error code and detailed error information
   - Use standard HTTP status codes
   - Provide validation errors in structured format

---

## Testing Checklist

### Backend Team Should Verify:

- [ ] All endpoints return responses in standard format
- [ ] User object uses `role` field (not `user_type`)
- [ ] Authentication headers are validated correctly
- [ ] Date fields use ISO 8601 format with timezone
- [ ] Pagination structure matches specification
- [ ] Error responses include proper error codes
- [ ] Dashboard endpoints return all required fields
- [ ] Verification workflow updates admission status correctly
- [ ] Change logs are created for admission updates

### Frontend Team Should Verify:

- [ ] Sign in/sign up flows work correctly
- [ ] Navigation to correct dashboard based on role
- [ ] Auth headers are sent with all requests
- [ ] Dashboard data displays correctly
- [ ] Error handling shows appropriate messages
- [ ] Graceful fallback to mock data on errors
- [ ] Pagination controls work correctly
- [ ] Notifications are displayed and can be marked as read

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-27 | Initial comprehensive API contract |

---

## Contact & Support

For questions or clarifications regarding this API contract:
- **Frontend Team Lead:** [Contact Info]
- **Backend Team Lead:** [Contact Info]
- **Project Manager:** [Contact Info]

---

**End of Document**
