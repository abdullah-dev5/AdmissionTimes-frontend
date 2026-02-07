# Consistency Fix Implementation Plan

## Phase 1: Frontend Type Definitions (Complete Now)

### Task 1.1: Update API Admission Type
File: `src/types/api.ts`

Current (12 fields):
```typescript
interface Admission {
  id: string;
  university_id: string | null;
  title: string;
  degree_level: string;
  deadline: string;
  application_fee: number;
  location: string;
  description: string | null;
  verification_status: 'verified' | 'pending' | 'rejected';
  status: 'active' | 'inactive' | 'closed';
  created_at: string;
  updated_at: string;
}
```

Should include (25 fields):
```typescript
interface Admission {
  // Core fields
  id: string;
  university_id: string | null;
  title: string;
  
  // Program details
  degree_level: string;
  program_type?: string;
  field_of_study?: string;
  duration?: string;
  delivery_mode?: string;
  
  // Fees & dates
  application_fee: number;
  tuition_fee?: number;
  currency?: string;
  deadline: string;
  start_date?: string;
  
  // Location & requirements
  location: string;
  description: string | null;
  requirements?: Record<string, any>;
  
  // Status & audit
  verification_status: 'verified' | 'pending' | 'rejected' | 'draft' | 'disputed';
  status: 'active' | 'inactive' | 'closed';
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
  dispute_reason?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
}
```

### Task 1.2: Update Dashboard Response Type
File: `src/types/api.ts`

Field name fix:
```typescript
stats: {
  recent_changes: number;  // Was: recent_updates
}
```

---

## Phase 2: Backend Migrations (Start)

### Task 2.1: Create Universities Table
Migration file needed: `supabase/migrations/TIMESTAMP_create_universities_table.sql`

```sql
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  country VARCHAR(100),
  website VARCHAR(255),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, country)
);

-- Seed test universities
INSERT INTO universities (name, city, country, website) VALUES
  ('Sukkur IBA University', 'Sukkur', 'Pakistan', 'https://www.iba.edu.pk'),
  ('FAST NUCES', 'Karachi', 'Pakistan', 'https://www.fast.edu.pk'),
  ('COMSATS', 'Islamabad', 'Pakistan', 'https://www.comsats.edu.pk')
ON CONFLICT DO NOTHING;
```

### Task 2.2: Extend Admissions Table
Migration file needed: `supabase/migrations/TIMESTAMP_extend_admissions_table.sql`

```sql
ALTER TABLE admissions
ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS admission_portal_link VARCHAR(255),
ADD COLUMN IF NOT EXISTS department VARCHAR(255),
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20);

-- Add foreign key constraint once universities table exists
ALTER TABLE admissions
ADD CONSTRAINT fk_university_id 
FOREIGN KEY (university_id) REFERENCES universities(id)
ON DELETE SET NULL;
```

### Task 2.3: Create Analytics Table
Migration file needed: `supabase/migrations/TIMESTAMP_create_analytics_table.sql`

```sql
CREATE TABLE IF NOT EXISTS admission_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL,
  viewer_id UUID,
  viewer_type VARCHAR(20),  -- 'student', 'anonymous', 'university', 'admin'
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admission_views_admission_id 
ON admission_views(admission_id);

CREATE INDEX IF NOT EXISTS idx_admission_views_viewed_at 
ON admission_views(viewed_at);
```

---

## Phase 3: Backend Service Updates

### Task 3.1: Update Dashboard Service
File: `src/domain/dashboard/services/dashboard.service.ts`

Changes needed:
1. Join with universities table to get proper university names
2. Include `website_url`, `admission_portal_link`, `department`, `academic_year`
3. Change stat field `recent_updates` to `recent_changes`
4. Calculate `status` field from `is_active` + `verification_status`

```sql
-- Updated recent_admissions query (add to current)
SELECT 
  a.id::text,
  a.title,
  a.description,
  a.program_type,
  a.degree_level,
  a.field_of_study,
  a.duration,
  a.tuition_fee,
  a.currency,
  a.application_fee,
  a.deadline::text,
  a.start_date,
  a.location,
  a.delivery_mode,
  a.requirements,
  a.verification_status::text,
  a.website_url,
  a.admission_portal_link,
  a.department,
  a.academic_year,
  a.verified_at::text,
  a.verified_by::text,
  a.created_by::text,
  a.created_at::text,
  a.updated_at::text,
  a.is_active,
  CASE 
    WHEN a.is_active = false THEN 'inactive'
    WHEN a.is_active = true AND a.verification_status = 'verified' THEN 'active'
    ELSE 'pending'
  END as status,
  COALESCE(u.name, 'Unknown University') as university_name,
  COUNT(*) OVER (PARTITION BY a.id) as views
FROM admissions a
LEFT JOIN universities u ON a.university_id = u.id
LEFT JOIN admission_views av ON a.id = av.admission_id
WHERE a.university_id = $2 OR a.created_by = $1
ORDER BY a.updated_at DESC
LIMIT 5
```

### Task 3.2: Update Admissions Model
File: `src/domain/admissions/models/admissions.model.ts`

Ensure `create()` and `update()` handle all 25 fields:
- Save `website_url`, `admission_portal_link`, `department`, `academic_year`
- Preserve `program_type`, `field_of_study`, `duration`, `delivery_mode`
- Handle new optional fields gracefully

---

## Phase 4: Frontend Updates

### Task 4.1: Update Transformer
File: `src/utils/dashboardTransformers.ts`

Add mappings for new fields:
```typescript
{
  // ... existing mappings
  program_type: admission.program_type,
  field_of_study: admission.field_of_study,
  duration: admission.duration,
  delivery_mode: admission.delivery_mode,
  tuition_fee: admission.tuition_fee,
  currency: admission.currency,
  start_date: admission.start_date,
  website_url: admission.website_url,
  admission_portal_link: admission.admission_portal_link,
  department: admission.department,
  academic_year: admission.academic_year,
  verified_at: admission.verified_at,
  created_by: admission.created_by,
}
```

### Task 4.2: Update Admission Utils
File: `src/utils/admissionUtils.ts`

Update `transformAdmissionToApi()` to include all new fields:
```typescript
{
  program_type: frontendAdmission.program_type,
  field_of_study: frontendAdmission.department,  // Map department to field_of_study
  duration: frontendAdmission.duration,
  delivery_mode: frontendAdmission.delivery_mode,
  tuition_fee: frontendAdmission.tuition_fee,
  currency: frontendAdmission.currency,
  start_date: frontendAdmission.start_date,
  website_url: frontendAdmission.websiteUrl,
  admission_portal_link: frontendAdmission.admissionPortalLink,
}
```

### Task 4.3: Update ManageAdmissions Form
File: `src/pages/university/ManageAdmissions.tsx`

Add form fields for:
- Program Type (dropdown: BS, MS, PhD, Certificate)
- Start Date (date input)
- Delivery Mode (dropdown: On-campus, Online, Hybrid)
- Duration (text input: e.g., "4 years")
- Tuition Fee (number input)
- Currency (dropdown: PKR, USD, etc.)
- Website URL (text input)
- Admission Portal Link (text input)

Update `buildAdmissionPayload()` to include these fields.

### Task 4.4: Update Internal Admission Type
File: `src/data/universityData.ts`

Add optional fields:
```typescript
program_type?: string
field_of_study?: string
duration?: string
delivery_mode?: string
tuition_fee?: string
currency?: string
start_date?: string
website_url?: string  // Already exists
admission_portal_link?: string  // Already exists
academic_year?: string  // Already exists
department?: string
elegibility?: string  // Already exists
```

---

## Phase 5: Testing & Validation

### Test 1: Field Round-trip Test
1. Create admission with all new fields
2. Fetch admission from API
3. Verify all fields persist
4. Edit and verify
5. Fetch again and verify all changes

### Test 2: Transformation Test
1. Record database row with all 25 fields
2. Call dashboard API
3. Check all 25 fields in response
4. Verify transformer maps all fields
5. Check frontend receives all fields

### Test 3: UI/Form Test
1. New admission form displays all fields
2. Edit mode loads all fields
3. Submit preserves all fields
4. Dashboard shows all aggregated data

### Test 4: Backward Compatibility
1. Old admissions (without new fields) still work
2. Null/missing fields handled gracefully
3. Frontend displays defaults appropriately

---

## Estimated Effort

| Phase | Tasks | Est. Time | Priority |
|-------|-------|-----------|----------|
| 1 | Update API types | 30 min | NOW |
| 2 | Backend migrations | 45 min | NOW |
| 3 | Backend services | 60 min | NOW |
| 4a | Update transformers | 30 min | NOW |
| 4b | Update form/UI | 90 min | NEXT |
| 5 | Testing | 60 min | POST |
| **Total** | | **4.5 hours** | |

---

## Rollback Plan

If issues occur:
1. Revert migrations
2. Revert type changes
3. Keep transformers backward compatible
4. Test with old data format

---

## Success Criteria

- [ ] All 25 database fields accessible in API response
- [ ] Frontend types include all returned fields
- [ ] Create/update operations preserve all fields
- [ ] Edit operations restore all fields correctly
- [ ] Dashboard displays complete data
- [ ] No data loss on round-trip save/fetch
- [ ] Form collects all necessary data
- [ ] Backward compatibility maintained
- [ ] Unit tests pass with new schema
- [ ] Integration tests pass end-to-end

