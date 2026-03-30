# AdmissionTimes - Frontend

Frontend application for the University Admissions Management Platform.

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** February 25, 2026

---

## 📖 Documentation

### 👉 Complete Documentation
See **[project-docs/README.md](project-docs/README.md)** for complete project documentation.

### Quick Links
- **START HERE**: [START_HERE.md](START_HERE.md)
- **Quick Reference**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Project Status**: [PROJECT_STATUS.md](PROJECT_STATUS.md)
- **TODO List**: [TODO.md](TODO.md)

### Documentation Structure
- [project-docs/](project-docs/) - Core documentation (4 files)
  - Overview, tech specs, requirements, user structure
- [project-docs/overview.md](project-docs/overview.md) - System architecture
- [project-docs/tech-specs.md](project-docs/tech-specs.md) - Technologies & frameworks

---

## 🚀 Features

✅ **User Authentication** - Sign in/up with JWT tokens  
✅ **Student Dashboard** - Personal admission tracking, recommendations, deadlines  
✅ **University Dashboard** - Program management, verification queue  
✅ **Admin Dashboard** - System metrics, user management  
✅ **Program Browsing** - Search, filter, detailed views  
✅ **Watchlist** - Save favorite programs  
✅ **Smart Recommendations** - Collaborative filtering suggestions  
✅ **Email Notifications** - System + email alerts  
✅ **Responsive Design** - Mobile, tablet, desktop support  

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: React 18
- **Language**: TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Forms**: React Hook Form (optional)

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
node --version  # v18+ required
pnpm -v        # v10+ or use npm
```

### 2. Install Dependencies
```bash
cd admission-times-frontend
pnpm install
```

### 3. Setup Environment
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

**Required Variables:**
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=...
```

### 4. Start Development Server
```bash
pnpm dev
# Visit http://localhost:5173
```

### 5. Build for Production
```bash
pnpm build
pnpm preview
```

---

## 📁 Project Structure

```
src/
├── components/            # Reusable UI components
│   ├── admin/            # Admin-specific components
│   ├── student/          # Student-specific components
│   ├── university/       # University-specific components
│   ├── common/           # Shared components
│   └── ai/               # AI-related components
├── pages/                 # Page components
│   ├── student/          # Student pages (dashboard, etc.)
│   ├── university/       # University pages
│   ├── admin/            # Admin pages
│   └── ...
├── hooks/                 # Custom React hooks
├── contexts/              # React Context providers
│   ├── AuthContext.tsx   # Authentication context
│   ├── ToastContext.tsx  # Toast notifications
│   └── AiContext.tsx     # AI interactions
├── services/              # API services
│   ├── apiClient.ts      # Axios instance
│   ├── authService.ts    # Auth API calls
│   ├── dashboardService.ts
│   ├── recommendationsService.ts
│   └── ...
├── store/                 # Zustand stores
│   ├── authStore.ts      # Authentication state
│   ├── studentStore.ts   # Student data state
│   └── universityStore.ts
├── types/                 # TypeScript interfaces
│   └── api.ts           # API response types
├── utils/                 # Utility functions
│   ├── transformers.ts   # Data transformation
│   ├── dateUtils.ts      # Date helpers
│   └── ...
├── layouts/              # Layout components
│   ├── StudentLayout.tsx
│   ├── UniversityLayout.tsx
│   └── AdminLayout.tsx
├── constants/             # App constants
├── data/                  # Static data
└── main.tsx              # Application entry point
```

---

## 🔌 Key Services

### Authentication
- **Service**: `services/authService.ts`
- **Store**: `store/authStore.ts`
- **Context**: `contexts/AuthContext.tsx`

### Dashboard Data
- **Service**: `services/dashboardService.ts`
- **Hook**: `hooks/useStudentDashboardData.ts`

### Recommendations
- **Service**: `services/recommendationsService.ts`
- **Backend**: Collaborative filtering API

### Notifications
- **Context**: `contexts/ToastContext.tsx`
- **Service**: `services/notificationsService.ts`

---

## 🎨 Components

### Common Components
- `LoadingSpinner` - Loading states
- `ErrorBoundary` - Error handling
- `Modal` - Modal dialogs
- `Button` - Reusable buttons
- `Card` - Content cards

### Page Components
- `StudentDashboard` - Student home
- `UniversityDashboard` - University home
- `AdminDashboard` - Admin home
- `ProgramDetail` - Program details
- `SignIn` / `SignUp` - Auth pages

---

## 🔐 Authentication Flow

```
1. User visits app
   ↓
2. Check localStorage for token
   ↓
3. If token exists, validate and restore session
   ↓
4. If no token, show Sign In page
   ↓
5. Sign In → Supabase Auth → JWT token
   ↓
6. Auto-sync user to backend database
   ↓
7. Redirect to role-based dashboard
```

---

## 🌐 API Integration

### Axios Client
All API calls use a configured Axios instance with:
- Automatic JWT token injection
- Base URL configuration
- Error handling
- Request/response logging

**Location**: `services/apiClient.ts`

### Service Pattern
Each API domain has its own service:
```typescript
// Example: recommendationsService.ts
export const recommendationsService = {
  getRecommendations: async (limit, minScore) => { ... },
  refreshRecommendations: async () => { ... },
  getRecommendationCount: async () => { ... },
}
```

---

## 🧪 Testing

### Build Check
```bash
pnpm build  # Check for build errors
```

### Type Check
```bash
pnpm type-check  # Or: pnpm tsc --noEmit
```

### Lint Check
```bash
pnpm lint
```

---

## 📦 Build & Deployment

### Production Build
```bash
pnpm build
# Output: dist/
```

### Preview Build
```bash
pnpm preview
# Serves dist/ locally at http://localhost:5173
```

### Deploy to Vercel
```bash
# Connect GitHub repo to Vercel
# Set environment variables in Vercel dashboard
# Automatic deployment on push
```

---

## 📝 Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Supabase Configuration
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=...

# Optional
VITE_DEBUG=false              # Enable debug logging
VITE_MOCK_AUTH=false          # Mock auth for testing
```

---

## 🔗 Related Resources

- **Backend**: [../admission-times-backend](../admission-times-backend)
- **Mobile App**: [../AdmissionTimes-MobileApp](../AdmissionTimes-MobileApp)
- **Full Documentation**: [project-docs/](project-docs/)

---

## 🚀 Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Type check with TypeScript |
| `pnpm format` | Format code |

---

## 📖 Learning Resources

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org
- **Tailwind CSS**: https://tailwindcss.com
- **Zustand**: https://github.com/pmndrs/zustand
- **Vite**: https://vitejs.dev

---

## 📞 Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [project-docs/](project-docs/)
3. Check backend API docs: `http://localhost:3000/api-docs`

---

**Current Version:** 1.0.0  
**Last Updated:** February 25, 2026  
**Status:** Active Development
