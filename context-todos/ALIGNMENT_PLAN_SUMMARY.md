# Frontend-Backend Alignment Plan Summary

**Created:** January 18, 2026  
**Purpose:** Quick reference for frontend-first alignment strategy  
**Status:** Ready for Implementation

---

## 🎯 Strategy: Frontend-First Alignment

**Approach:** Align frontend to existing backend API structure first, then request backend enhancements if needed.

---

## 🔴 Critical Inconsistencies Found

### 1. API Endpoint Mismatches

**Frontend Expects (Doesn't Exist - Will Be Created):**
- 🔄 `GET /api/v1/student/dashboard` → **Approach B Selected** - Backend will create aggregated endpoint
- 🔄 `GET /api/v1/university/dashboard` → **Approach B Selected** - Backend will create aggregated endpoint
- ❌ `GET /api/admissions/search` → Use `/api/v1/admissions?search=`
- ❌ `GET /api/student/recommendations` → Calculate from admissions (temporary)
- ❌ `POST /api/admissions/parse-pdf` → Request backend endpoint
- ❌ `GET /api/university/scraper-logs` → Request backend endpoint or use analytics

**Path Differences:**
- Frontend docs: `/api/student/*`, `/api/university/*`
- Backend actual: `/api/v1/*` (no role prefixes)

### 2. Data Structure Mismatches

**Key Differences:**
- Frontend: `university` (string) → Backend: `university_id` (UUID)
- Frontend: `program` → Backend: `title`
- Frontend: `status` → Backend: `verification_status`
- Frontend: Calculates `daysRemaining` → Backend: Separate `deadlines` table
- Frontend: `saved`/`alertEnabled` → Backend: Separate `watchlists` table

**Solution:** Create data transformer functions

### 3. Missing Features

**Frontend Missing:**
- 8 pages (Profile, Preferences, Recommendations, Activity, etc.)
- API client layer
- Data transformation layer
- API integration (0%)

**Backend Missing:**
- Dashboard aggregation endpoints (can work around)
- PDF parsing endpoint (required)
- Recommendations endpoint (can work around)
- Scraper logs endpoint (can work around)

---

## 📅 6-Week Implementation Plan

### Week 1: Foundation
- ✅ Create API client
- ✅ Create API types (matching backend)
- ✅ Create 9 service files
- ✅ Create data transformers

### Week 2: Core Integration
- ✅ Migrate StudentDataContext
- ✅ Migrate UniversityDataContext
- ✅ Update Dashboard pages
- ✅ Update Search/Deadline pages

### Week 3: Pages Integration
- ✅ Update all existing pages
- ✅ Integrate all domains

### Week 4: Missing Pages
- ✅ Create 8 missing pages
- ✅ Integrate with API

### Week 5: Features
- ✅ Complete PDF upload
- ✅ Complete all features
- ✅ Request backend enhancements

### Week 6: Polish
- ✅ Remove mock data
- ✅ Testing
- ✅ Optimization

---

## 🔧 Frontend Adaptations Required

1. **Use `/api/v1/*` paths** (not `/api/*`)
2. **Make multiple API calls** for dashboards (instead of aggregated endpoints)
3. **Transform backend data** to frontend format
4. **Merge watchlist data** with admissions
5. **Calculate frontend-only fields** (daysRemaining, programStatus, match scores)

---

## 🚀 Backend Enhancements (Priority Order)

1. **Dashboard Aggregation** (✅ **HIGH PRIORITY - Approach B Selected**)
   - `GET /api/v1/student/dashboard` - **See `BACKEND_DASHBOARD_ENDPOINTS_SPEC.md`**
   - `GET /api/v1/university/dashboard` - **See `BACKEND_DASHBOARD_ENDPOINTS_SPEC.md`**
   - **Status:** Specification ready, awaiting backend implementation

2. **PDF Parsing** (Required)
   - `POST /api/v1/admissions/parse-pdf`

3. **Recommendations** (Optional)
   - `GET /api/v1/student/recommendations`

---

## 📊 Quick Stats

| Metric | Frontend | Backend | Gap |
|--------|----------|---------|-----|
| API Integration | 0% | 100% | 100% |
| Missing Pages | 8 | N/A | 8 |
| Endpoint Mismatches | 10+ | 0 | 10+ |
| Data Structure Mismatches | Multiple | N/A | Multiple |

---

**See `MERGED_GAP_ANALYSIS.md` for complete details.**
