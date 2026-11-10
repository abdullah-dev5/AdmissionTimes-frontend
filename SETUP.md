# 🚀 Quick Setup & Run Guide

**Last Updated:** February 25, 2026

## Prerequisites

- Node.js v18+ and pnpm installed
- Supabase account with database credentials
- Backend service running on `localhost:3000`

---

## 1. Install Dependencies

```bash
cd admission-times-frontend
pnpm install
```

---

## 2. Environment Setup

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_URL=http://localhost:3000
```

---

## 3. Start Development Server

```bash
pnpm dev
```

Open: http://localhost:5173

---

## 4. Building for Production

```bash
pnpm build
```

Output goes to `dist/` folder.

---

## User Roles & Logins

### Student
- Email: `student@example.com`
- Password: Your password

### University
- Email: `university@example.com`
- Password: Your password

### Admin
- Email: `admin@example.com`
- Password: Your password

---

## 🔧 Key Features

✅ JWT Authentication (Supabase)  
✅ Role-Based Dashboards (Student/University/Admin)  
✅ Admissions Management  
✅ Watchlists & Deadlines  
✅ Notifications System  
✅ Smart Recommendations  
✅ Real-time Data Integration  

---

## 📚 Documentation

- **Main Docs**: See `project-docs/README.md`
- **API Reference**: `http://localhost:3000/api-docs`
- **Architecture**: `project-docs/overview.md`

---

## 🆘 Troubleshooting

**Port Already in Use?**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Dependencies Issue?**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Database Connection Error?**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- Check backend is running on `localhost:3000`
- Verify network connectivity to Supabase

---

## 🚀 Next Steps

1. Start both backend and frontend
2. Sign in with test credentials
3. Explore student/university dashboards
4. Check notifications and recommendations
5. Test admission workflow

---

## Scraper Integration Status (Phase Review)

### Completed

- Frontend scraper monitor is API-backed (no mock monitor data).
- Scraped verification has a separate route: `/admin/verification/scraped`.
- Scraper-origin admissions are tagged and rendered in admin/student UI.
- Frontend scraped verification now fetches all pages from backend (not only first 100 records).
- Auto-refresh is enabled in scraper monitor and verification views (30s cadence).

### In Progress / Remaining

- True push real-time streaming is not enabled yet (current mode is polling + scheduled ingestion).
- Backend replay semantics still need full all-source replay behavior for perfect multi-university coverage.
- Parent-child staging normalization and hash-based idempotency remain to be finalized in scraper/backend repos.

### End-to-End Scraper Flow

1. Scrapers write to scraper staging DB.
2. Publish script sends staged records to backend internal ingestion API.
3. Backend writes canonical admissions + ingestion runs/events.
4. Frontend reads canonical data from backend APIs for admin and student modules.

### Quick Verification Checklist

1. Open `/admin/scraper-logs` and confirm new runs/events are appearing.
2. Open `/admin/verification/scraped` and confirm records include FAST and other universities.
3. Open student search and verify scraper-origin records are visible with source badge.
4. Verify ingestion mode is `publish` for manual replay actions.

---

**Ready to code!** 🎉
