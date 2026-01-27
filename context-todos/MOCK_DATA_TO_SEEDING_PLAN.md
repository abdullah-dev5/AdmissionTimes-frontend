# Mock Data to Seeding Data Conversion Plan

**Created:** January 18, 2026  
**Purpose:** Convert frontend mock data files into backend database seeding scripts  
**Status:** Ready for Implementation  
**Related:** `BACKEND_IMPLEMENTATION_PLAN.md`

---

## 📋 Overview

This document provides a detailed plan to convert frontend mock data files into backend database seeding scripts. This ensures:

- ✅ **Consistent test data** across frontend and backend
- ✅ **Realistic data** for development and testing
- ✅ **Easy data reset** during development
- ✅ **Data integrity** between frontend and backend

---

## 📁 Source Files (Frontend Mock Data)

### 1. Student Data (`src/data/studentData.ts`)

**Data:**
- `sharedAdmissions` - ~50+ admission records
- `sharedNotifications` - Notification records

**Key Fields:**
```typescript
interface StudentAdmission {
  id: string
  university: string        // → universities.name
  program: string           // → admissions.title
  degreeType: 'BS' | 'MS'  // → admissions.degree_level
  deadline: string          // → admissions.deadline
  feeNumeric: number       // → admissions.application_fee
  status: 'Verified' | ... // → admissions.verification_status
  saved: boolean           // → watchlists entry
  alertEnabled: boolean     // → watchlists.alert_opt_in
}
```

### 2. University Data (`src/data/universityData.ts`)

**Data:**
- `sharedAdmissions` - University admissions
- `sharedAudits` - Verification audits
- `sharedChangeLogs` - Change logs
- `sharedNotifications` - University notifications

### 3. Admin Data (`src/data/adminData.ts`)

**Data:**
- `pendingVerifications` - Pending verifications
- `adminActions` - Admin action logs
- `adminNotifications` - Admin notifications
- `scraperActivities` - Scraper activity
- `verificationItems` - Verification items
- `adminChangeLogs` - Admin change logs
- `scraperJobs` - Scraper jobs
- `analyticsEvents` - Analytics events
- `admissionAnalytics` - Admission analytics

### 4. Mock Data (`src/data/mockData.ts`)

**Data:**
- `mockPrograms` - Detailed program information

---

## 🗄️ Target Structure (Backend Seeding)

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
    ├── seed.ts                        # Main seeding script
    └── convertMockData.ts             # Conversion script
```

---

## 🔄 Data Mapping Rules

### 1. Universities

**Extraction:**
```typescript
// From all admissions, extract unique universities
const universities = new Set<string>();

studentAdmissions.forEach(admission => {
  universities.add({
    name: admission.university,
    city: extractCity(admission.location),
    country: 'Pakistan', // Default
  });
});
```

**Mapping:**
- `university` (string) → `universities.name`
- `location` (string) → Extract `city` and `country`
- Generate UUID for `id`

### 2. Admissions

**Field Mapping:**
```typescript
{
  id: admission.id,                    // Keep or generate UUID
  university_id: getUniversityId(...), // Lookup from universities
  title: admission.program,            // program → title
  degree_level: mapDegreeType(admission.degreeType),
  deadline: parseDate(admission.deadline),
  application_fee: admission.feeNumeric,
  location: admission.location,
  description: admission.aiSummary,
  verification_status: mapStatus(admission.status),
  status: mapProgramStatus(admission.programStatus),
}
```

**Status Mapping:**
```typescript
'Verified' → 'verified'
'Pending' → 'pending'
'Updated' → 'pending'
'Closed' → 'rejected'
```

**Degree Type Mapping:**
```typescript
'BS' → 'bachelor'
'MS' → 'master'
'PhD' → 'phd'
'MBA' → 'mba'
'BBA' → 'bba'
'MD' → 'md'
'MPhil' → 'mphil'
```

### 3. Users

**Extraction:**
- From `analyticsEvents` - Extract user IDs and roles
- From notifications context
- Generate default users for testing

**Mapping:**
```typescript
{
  id: event.userId,                    // Or generate UUID
  email: generateEmail(event.userName),
  user_type: mapUserRole(event.userRole),
  university_id: getUniversityId(...), // If university user
}
```

**User Role Mapping:**
```typescript
'Student' → 'student'
'UniversityRep' → 'university'
'Admin' → 'admin'
```

### 4. Watchlists

**Extraction:**
- From admissions where `saved === true`

**Mapping:**
```typescript
admissions
  .filter(admission => admission.saved)
  .map(admission => ({
    user_id: getCurrentUserId(),
    admission_id: admission.id,
    alert_opt_in: admission.alertEnabled || false,
    saved_at: new Date(), // Or extract from context
  }));
```

### 5. Notifications

**Field Mapping:**
```typescript
{
  id: notification.id,
  user_id: getUserIdFromContext(),
  user_type: 'student' | 'university' | 'admin',
  category: mapNotificationCategory(notification.type),
  priority: extractPriority(notification),
  title: notification.title,
  message: notification.description,
  is_read: notification.read,
  created_at: parseDate(notification.time),
}
```

**Category Mapping:**
```typescript
'alert' → 'deadline'
'system' → 'system'
'admission' → 'verification'
```

### 6. Change Logs

**Extraction:**
- From `sharedChangeLogs` and `adminChangeLogs`

**Mapping:**
```typescript
// Each diff item becomes a change_log entry
changeLog.diff.forEach(diff => ({
  admission_id: getAdmissionIdByName(changeLog.admission),
  changed_by: getUserIdByName(changeLog.modifiedBy),
  change_type: 'updated',
  field_name: diff.field,
  old_value: diff.old,
  new_value: diff.new,
  created_at: parseDate(changeLog.date),
}));
```

---

## 🛠️ Implementation Steps

### Step 1: Setup Conversion Script

```typescript
// backend/scripts/convertMockData.ts

import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

// Import or copy frontend mock data
import { sharedAdmissions as studentAdmissions } from '../../frontend/src/data/studentData';
import { sharedAdmissions as universityAdmissions } from '../../frontend/src/data/universityData';
import { adminData } from '../../frontend/src/data/adminData';

interface ConversionResult {
  universities: any[];
  users: any[];
  admissions: any[];
  watchlists: any[];
  notifications: any[];
  changelogs: any[];
  analytics: any[];
  scraperJobs: any[];
}

async function convertMockData(): Promise<ConversionResult> {
  // 1. Extract universities
  const universities = extractUniversities([
    ...studentAdmissions,
    ...universityAdmissions,
  ]);
  
  // 2. Extract users
  const users = extractUsers(adminData.analyticsEvents);
  
  // 3. Convert admissions
  const admissions = convertAdmissions(studentAdmissions, universities);
  
  // 4. Convert watchlists
  const watchlists = convertWatchlists(studentAdmissions, users);
  
  // 5. Convert notifications
  const notifications = convertNotifications(
    studentData.sharedNotifications,
    users
  );
  
  // 6. Convert change logs
  const changelogs = convertChangeLogs(
    universityData.sharedChangeLogs,
    adminData.adminChangeLogs,
    admissions,
    users
  );
  
  // 7. Convert analytics
  const analytics = convertAnalytics(adminData.analyticsEvents);
  
  // 8. Convert scraper jobs
  const scraperJobs = convertScraperJobs(adminData.scraperJobs);
  
  return {
    universities,
    users,
    admissions,
    watchlists,
    notifications,
    changelogs,
    analytics,
    scraperJobs,
  };
}
```

### Step 2: Create Seeding Files

```typescript
// Generate TypeScript seeding files
function generateSeedingFile(data: any[], filename: string) {
  const content = `// Auto-generated from frontend mock data
// Generated on: ${new Date().toISOString()}

export const ${filename} = ${JSON.stringify(data, null, 2)};
`;
  
  const outputPath = path.join(
    __dirname,
    `../prisma/seeds/${filename}.ts`
  );
  
  fs.writeFileSync(outputPath, content);
  console.log(`✅ Generated: ${filename}.ts`);
}
```

### Step 3: Handle Relationships

```typescript
// Maintain referential integrity
const universityMap = new Map<string, string>(); // name -> UUID
const userMap = new Map<string, string>();     // name -> UUID
const admissionMap = new Map<string, string>(); // title -> UUID

// Create in dependency order
async function seedInOrder() {
  // 1. Universities (no dependencies)
  const universities = await seedUniversities();
  universities.forEach(u => universityMap.set(u.name, u.id));
  
  // 2. Users (depends on universities)
  const users = await seedUsers(universities);
  users.forEach(u => userMap.set(u.email, u.id));
  
  // 3. Admissions (depends on universities)
  const admissions = await seedAdmissions(universities);
  admissions.forEach(a => admissionMap.set(a.title, a.id));
  
  // 4. Watchlists (depends on users, admissions)
  await seedWatchlists(users, admissions);
  
  // ... continue with other entities
}
```

### Step 4: Date Parsing

```typescript
function parseDate(dateString: string): Date {
  // Handle ISO format: "2025-07-30"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString);
  }
  
  // Handle relative: "Updated 2 days ago"
  if (dateString.includes('ago')) {
    const days = extractDays(dateString);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }
  
  // Handle formatted: "January 20, 2025"
  return new Date(dateString);
}
```

### Step 5: Generate Seeding Script

```typescript
// backend/prisma/seeds/index.ts
import { PrismaClient } from '@prisma/client';
import { universities } from './01_universities';
import { users } from './02_users';
import { admissions } from './03_admissions';
import { watchlists } from './04_watchlists';
import { notifications } from './06_notifications';
import { changelogs } from './07_changelogs';
import { analytics } from './08_analytics';
import { scraperJobs } from './09_scraper_jobs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  // Clear existing data (optional)
  await prisma.watchlist.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.changeLog.deleteMany();
  await prisma.admission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.university.deleteMany();
  
  // Seed in dependency order
  console.log('📚 Seeding universities...');
  for (const university of universities) {
    await prisma.university.create({ data: university });
  }
  
  console.log('👥 Seeding users...');
  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  
  console.log('🎓 Seeding admissions...');
  for (const admission of admissions) {
    await prisma.admission.create({ data: admission });
  }
  
  console.log('⭐ Seeding watchlists...');
  for (const watchlist of watchlists) {
    await prisma.watchlist.create({ data: watchlist });
  }
  
  console.log('🔔 Seeding notifications...');
  for (const notification of notifications) {
    await prisma.notification.create({ data: notification });
  }
  
  console.log('📝 Seeding change logs...');
  for (const changelog of changelogs) {
    await prisma.changeLog.create({ data: changelog });
  }
  
  console.log('📊 Seeding analytics...');
  for (const event of analytics) {
    await prisma.analyticsEvent.create({ data: event });
  }
  
  console.log('🤖 Seeding scraper jobs...');
  for (const job of scraperJobs) {
    await prisma.scraperJob.create({ data: job });
  }
  
  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## ✅ Validation Checklist

### Data Integrity

- [ ] All foreign keys reference existing records
- [ ] All required fields are present
- [ ] Data types match schema
- [ ] Date formats are valid
- [ ] UUIDs are properly formatted

### Relationship Validation

- [ ] All `admission.university_id` exist in `universities`
- [ ] All `watchlist.user_id` exist in `users`
- [ ] All `watchlist.admission_id` exist in `admissions`
- [ ] All `notification.user_id` exist in `users`
- [ ] All `changelog.admission_id` exist in `admissions`
- [ ] All `changelog.changed_by` exist in `users`

### Data Completeness

- [ ] All universities from mock data are included
- [ ] All admissions from mock data are included
- [ ] All users referenced in mock data are included
- [ ] All relationships are preserved

---

## 🧪 Testing

### 1. Run Conversion Script

```bash
cd backend
npm run convert-mock-data
```

### 2. Validate Generated Files

```bash
# Check TypeScript compilation
npx tsc --noEmit prisma/seeds/*.ts

# Check data structure
node scripts/validateSeedingData.js
```

### 3. Test Seeding

```bash
# Reset database
npx prisma migrate reset

# Run seeding
npx prisma db seed

# Verify data
npx prisma studio
```

### 4. Compare with Frontend

```bash
# Run API and compare responses
npm run dev
# Test endpoints and compare with frontend mock data
```

---

## 📊 Expected Results

### Statistics

After conversion, you should have:

- **Universities:** ~10-15 unique universities
- **Users:** ~20-30 users (students, university reps, admin)
- **Admissions:** ~50-100 admission records
- **Watchlists:** ~20-30 saved programs
- **Notifications:** ~30-50 notifications
- **Change Logs:** ~20-40 change log entries
- **Analytics Events:** ~50-100 events
- **Scraper Jobs:** ~10-20 jobs

### Data Quality

- ✅ All relationships intact
- ✅ No orphaned records
- ✅ Consistent date formats
- ✅ Valid UUIDs
- ✅ Proper enum values

---

## 🔄 Maintenance

### Updating Seeding Data

1. **Update Frontend Mock Data**
   - Modify mock data files in `src/data/`

2. **Regenerate Seeding Files**
   ```bash
   npm run convert-mock-data
   ```

3. **Test Seeding**
   ```bash
   npm run db:seed
   ```

4. **Verify Changes**
   - Check API responses match updated mock data

---

## 📝 Notes

- **UUID Generation:** Use consistent UUIDs or generate new ones
- **Date Handling:** Parse various date formats from frontend
- **Relationships:** Maintain referential integrity
- **Validation:** Always validate before seeding
- **Backup:** Keep original mock data files

---

**Status:** Ready for Implementation  
**Next Steps:** Create conversion script and generate seeding files
