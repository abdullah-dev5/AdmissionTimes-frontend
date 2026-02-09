# Quick Reference Guide
**Last Updated:** February 9, 2026

---

## Commands

```bash
# Frontend
pnpm dev
pnpm build
pnpm lint

# Backend
pnpm dev
pnpm test
```

---

## Ports

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Swagger: http://localhost:3000/api-docs

---

## API Alignment Notes

- Admissions: `/university/admissions` and `/admin/admissions` alias routes exist.
- Deadlines: `/deadlines/upcoming` and `/deadlines/urgent` available.
- Analytics: alias routes supported for `user-activity`, `system-metrics`, `admission-stats`.
- Watchlists: `toggle-alert` and `delete-by-admission` endpoints available.

---

## Debug Checklist

- Check `Authorization` header for `/api/v1/*` requests.
- Validate service calls in `src/services/*`.
- Verify context wiring in `src/contexts/*`.
- Inspect API responses in DevTools Network tab.

```
❌ Dashboard query returns only 18 of 25 fields
❌ 7 fields not fetched from database
❌ No JOIN with universities table
```

### ❌ Frontend Form
```
❌ Form only collects 12 of 25 fields
❌ 13 fields can't be edited
❌ Editing loses uncollected fields
```

---

## 📊 Coverage Summary

```
FIELD COVERAGE BY LAYER

Before Fix:
┌─────────────────────────────────────┐
│ Database:        25 fields  ✅      │
│ API Types:       12 fields  ❌      │
│ Transformer:     12 fields  ❌      │
│ Form:            12 fields  ❌      │
│ Total Coverage:  48%        ❌      │
└─────────────────────────────────────┘

After Phase 1 (Current):
┌─────────────────────────────────────┐
│ Database:        25 fields  ✅      │
│ API Types:       25 fields  ✅      │
│ Transformer:     25 fields  ✅      │
│ Save Utility:    25 fields  ✅      │
│ Form:            12 fields  ❌      │
│ Total Coverage:  84%        ⚠️      │
└─────────────────────────────────────┘

After All Phases (Goal):
┌─────────────────────────────────────┐
│ Database:        25 fields  ✅      │
│ API Types:       25 fields  ✅      │
│ Transformer:     25 fields  ✅      │
│ Save Utility:    25 fields  ✅      │
│ Form:            25 fields  ✅      │
│ Dashboard:       25 fields  ✅      │
│ Total Coverage:  100%       ✅      │
└─────────────────────────────────────┘
```

---

## 🔄 Data Flow Comparison

### Before Fix (Broken ❌)
```
Form (12 fields collected)
  → buildPayload() (12 fields)
  → transformAdmissionToApi() (12 fields)
  → Backend API (accepts 25, saves 25)
  → Database (stores 25)
  → Dashboard Query (returns 18)
  → Transformer (maps 18 to 12)
  → Display (shows 12)
  ❌ 13 FIELDS LOST
```

### After Phase 1 (Partial Fix ⚠️)
```
Form (12 fields collected)
  → buildPayload() (12 fields)
  → transformAdmissionToApi() (25 fields!) ← Now includes all
  → Backend API (accepts 25, saves 25)
  → Database (stores 25)
  → Dashboard Query (returns 18) ← Still need to fix
  → Transformer (25 fields mapped!) ← Now handles all
  → Display (shows 12) ← Form not complete yet
  ⚠️ 7 FIELDS LOST at dashboard query level
  ⚠️ Cannot display/edit 13 fields (form incomplete)
```

### After All Phases (Complete ✅)
```
Form (25 fields collected) ← All phases complete
  → buildPayload() (25 fields)
  → transformAdmissionToApi() (25 fields)
  → Backend API (accepts 25, saves 25)
  → Database (stores 25)
  → Dashboard Query (returns 25!)
  → Transformer (25 fields mapped)
  → Display (shows 25)
  ✅ NO FIELDS LOST
```

---

## 🛠️ Quick Do's & Don'ts

### DO ✅
- ✅ Import new fields from types/api.ts
- ✅ Use the updated transformers
- ✅ Test with mock data containing all fields
- ✅ Add validation for new form fields
- ✅ Update backend queries to join universities table

### DON'T ❌
- ❌ Remove any fields from types/api.ts
- ❌ Stop mapping fields in transformers
- ❌ Remove dropdown options from forms
- ❌ Skip database migrations
- ❌ Assume fields will auto-populate

---

## 📋 Completion Checklist

### Phase 1: Frontend Types ✅
- [x] Update API Admission type
- [x] Update internal Admission type
- [x] Update dashboard transformer
- [x] Update save utility
- [x] Verify TypeScript compilation

### Phase 2: Database 🔴 NOT STARTED
- [ ] Create universities table migration
- [ ] Extend admissions table (4 columns)
- [ ] Create analytics table migration
- [ ] Run migrations on Supabase
- [ ] Verify tables in database

### Phase 3: Backend Services 🔴 NOT STARTED
- [ ] Update dashboard service queries
- [ ] Add JOIN universities table
- [ ] Add JOIN analytics table
- [ ] Include all 25 fields in SELECT
- [ ] Test backend endpoints

### Phase 4: Frontend Form 🔴 NOT STARTED
- [ ] Add 13 new form fields
- [ ] Update form state (formData)
- [ ] Update buildAdmissionPayload()
- [ ] Update form validation
- [ ] Update mock data

### Phase 5: Integration Testing 🔴 NOT STARTED
- [ ] Test create with all fields
- [ ] Test fetch from API
- [ ] Test edit in form
- [ ] Test save and persist
- [ ] Verify no data loss

---

## 🎓 Learning Points

1. **Type Definitions are Critical**
   - Must match backend exactly
   - Frontend and backend need contract
   - TypeScript catches mismatches

2. **Data Transformation Matters**
   - Must map all available fields
   - API to internal to UI each need mapping
   - Graceful fallbacks prevent crashes

3. **Database Schema Must Be Complete**
   - All needed data must have columns
   - Foreign keys must exist
   - Schema drives what's possible

4. **Forms Are The Bottleneck**
   - No field collection = no data edit
   - Users can't save what isn't in form
   - Form is gatekeeper for data input

5. **Round-Trip Testing Essential**
   - Save data
   - Fetch it back
   - Edit it again
   - Verify nothing lost
   - Test this cycle!

---

## 💡 Pro Tips

### To Debug Field Issues
1. Check TypeScript types first
2. Look at transformer mappings
3. Verify backend query includes field
4. Check if form field exists
5. Trace data through each layer

### To Add New Field
1. Add to database schema
2. Add to backend API types
3. Add to transformers
4. Add form field
5. Test round-trip

### To Prevent This Again
1. Auto-sync API types from backend
2. Document field requirements
3. Create round-trip tests
4. Use strict TypeScript
5. Review schema consistency regularly

