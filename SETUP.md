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

**Ready to code!** 🎉
