# AdmissionTimes - Frontend Application
**Final Year Project - University Admissions Management Platform**

## 🎯 Project Status (January 27, 2026)

### ✅ Phase 1 Complete (40% Integration)
- **Backend:** 100% Ready (51 endpoints, tested & seeded)
- **Frontend:** 100% Complete (25+ pages, 50+ components)
- **Integration:** 40% Done (authentication + student dashboard working)
- **Documentation:** Complete (50,000+ words across 15+ documents)

### 🚀 Current Capabilities
- ✅ User authentication (sign in, sign up, sign out)
- ✅ Role-based navigation (student/university/admin dashboards)
- ✅ Persistent auth with Zustand + localStorage
- ✅ API client with automatic header injection
- ✅ Student dashboard fully integrated with real API
- ✅ Type-safe API calls with TypeScript
- ✅ Responsive UI with Tailwind CSS
- ✅ Mock data fallback for offline development

---

## 📚 Quick Start

### Prerequisites
- Node.js 18+ installed
- pnpm package manager (`npm install -g pnpm`)
- Backend API running on `http://localhost:3000`

### Installation
```bash
# Clone and install
cd e:\fyp\admission-times-frontend
pnpm install

# Run development server
pnpm dev

# Visit http://localhost:5173
```

### Test Credentials
```
Student:
  Email: student@test.com
  Password: (check with backend team)

University:
  Email: university@test.com
  Password: (check with backend team)

Admin:
  Email: admin@test.com
  Password: (check with backend team)
```

---

## 🏗️ Tech Stack

### Core Technologies
- **React 19.1.1** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 6.0** - Build tool & dev server
- **TailwindCSS 3.4** - Styling framework
- **React Router DOM 7.1** - Client-side routing

### State Management
- **React Context API** - UI state (auth, data contexts)
- **Zustand 5.0** - Persistent auth store (localStorage)

### API & Data
- **Axios** - HTTP client
- **React Query** (planned) - Server state management
- **TypeScript interfaces** - Complete type safety

### UI Components
- Custom components with Tailwind
- Recharts for data visualization
- Lucide React for icons

---

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   ├── student/         # Student-specific components
│   ├── university/      # University-specific components
│   ├── ai/              # AI chat components
│   └── common/          # Shared components
├── contexts/            # React Context providers
│   ├── AuthContext.tsx           # Authentication state
│   ├── StudentDataContext.tsx    # Student data (API integrated)
│   ├── UniversityDataContext.tsx # University data
│   ├── ToastContext.tsx          # Toast notifications
│   └── AiContext.tsx             # AI chat state
├── pages/               # Page components
│   ├── admin/           # Admin pages
│   ├── student/         # Student pages
│   └── university/      # University pages
├── services/            # API service layer
│   ├── apiClient.ts     # Axios instance (with interceptors)
│   ├── authService.ts   # Authentication API
│   ├── dashboardService.ts  # Dashboard APIs
│   ├── admissionsService.ts # Admissions CRUD
│   └── ...              # Other domain services
├── store/               # Zustand stores
│   └── authStore.ts     # Persistent auth state
├── types/               # TypeScript type definitions
│   └── api.ts           # API response types
├── utils/               # Utility functions
│   └── setupUserContext.ts  # User context helpers
├── Router/              # React Router configuration
└── hooks/               # Custom React hooks
```

---

## 🔑 Key Implementation Details

### Authentication Flow
```typescript
1. User signs in → POST /api/v1/auth/signin
2. Backend returns user data: { id, email, role, university_id }
3. Frontend stores in:
   - React Context (for UI components)
   - Zustand store (for API client, persisted to localStorage)
4. Navigate based on role:
   - student → /student/dashboard
   - university → /university/dashboard
   - admin → /admin/dashboard
5. API client automatically adds headers on every request:
   - x-user-id: user.id
   - x-user-role: user.role
   - x-university-id: user.university_id (if applicable)
```

### API Integration Pattern
```typescript
// 1. Service layer (services/dashboardService.ts)
export const dashboardService = {
  getStudentDashboard: () => apiClient.get('/student/dashboard')
}

// 2. Context layer (contexts/StudentDataContext.tsx)
const fetchDashboardData = async () => {
  const response = await dashboardService.getStudentDashboard()
  setAdmissions(response.data.admissions)
}

// 3. Component layer (pages/student/StudentDashboard.tsx)
const { admissions } = useStudentData()  // From context
```

### Field Compatibility Layer
Backend returns `user.role`, but we support both `role` and `user_type`:
```typescript
const userRole = user.role || user.user_type;
```
This pattern is applied throughout the codebase for resilience.

---

## 📖 Documentation

### Essential Docs (Start Here)
1. **[IMPLEMENTATION_STATUS_COMPLETE.md](IMPLEMENTATION_STATUS_COMPLETE.md)** - Latest implementation details
2. **[FRONTEND_BACKEND_API_CONTRACT.md](FRONTEND_BACKEND_API_CONTRACT.md)** - Complete API specification
3. **[FRONTEND_TODO_PRIORITIZED_LIST.md](FRONTEND_TODO_PRIORITIZED_LIST.md)** - Task roadmap

### Reference Docs
- **[STATUS_DASHBOARD.md](STATUS_DASHBOARD.md)** - Overall project status
- **[QUICK_START_INTEGRATION.md](QUICK_START_INTEGRATION.md)** - Quick integration guide
- **project-docs/** - Module specifications

---

## ⚡ Development Workflow

### Daily Development
```bash
# Start dev server
pnpm dev

# Type checking
pnpm run type-check

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Testing
```bash
# Open browser DevTools
# 1. Network tab - verify API calls return 200
# 2. Console - check for errors
# 3. Application → Local Storage - verify auth-store exists
```

### Debugging API Calls
1. Open DevTools → Network tab
2. Make API request
3. Click on request
4. Check "Request Headers" - should see x-user-id, x-user-role
5. Check "Response" - should see { success: true, data: {...} }

---

## 🎯 Current Integration Status

### ✅ Complete Features
- [x] Authentication (sign in, sign up, sign out)
- [x] Zustand auth store with persistence
- [x] API client with automatic auth headers
- [x] Student dashboard with real API data
- [x] Role-based routing
- [x] Session persistence
- [x] Field compatibility (role vs user_type)

### 🟡 Pending Features (Phase 2)
- [ ] University dashboard integration (30 min)
- [ ] Admin dashboard integration (20 min)
- [ ] Notifications system (2-3 hours)
- [ ] Deadlines management (2-3 hours)
- [ ] Watchlists (2-3 hours)
- [ ] Admissions list with filters (2-3 hours)
- [ ] Search & pagination (1-2 hours)

### 🔄 Future Enhancements (Phase 3-4)
- [ ] User preferences (2-3 hours)
- [ ] PDF upload (2 hours)
- [ ] Changelogs (1-2 hours)
- [ ] Error boundaries
- [ ] Loading states
- [ ] Mobile optimization
- [ ] Real JWT authentication (Phase 4C)

---

## 🤝 Contributing

### Before You Start
1. Read [IMPLEMENTATION_STATUS_COMPLETE.md](IMPLEMENTATION_STATUS_COMPLETE.md)
2. Check [FRONTEND_TODO_PRIORITIZED_LIST.md](FRONTEND_TODO_PRIORITIZED_LIST.md) for tasks
3. Understand the authentication flow and API integration pattern

### Code Standards
- **TypeScript:** Strict mode enabled
- **Naming:** camelCase for functions/variables, PascalCase for components
- **Components:** Functional components with hooks
- **API calls:** Always use service layer
- **Error handling:** Always use try-catch with graceful fallback
- **Comments:** Document complex logic

### Adding New Features
```typescript
// 1. Create service method (services/[domain]Service.ts)
export const someService = {
  fetchData: () => apiClient.get('/endpoint')
}

// 2. Update context if needed (contexts/[Domain]Context.tsx)
const fetchData = async () => {
  const response = await someService.fetchData()
  setState(response.data)
}

// 3. Use in component (pages/[role]/[Page].tsx)
const { data } = useSomeContext()
```

---

## 🐛 Troubleshooting

### "403 Forbidden" on API calls
**Cause:** User not authenticated or headers missing  
**Fix:** Check `localStorage.auth-store` exists, verify headers in Network tab

### "Navigation not working after login"
**Cause:** User role undefined  
**Fix:** Check `user.role || user.user_type` compatibility pattern applied

### "TypeScript errors"
**Cause:** Type mismatch or missing type definitions  
**Fix:** Check `src/types/api.ts` for correct interfaces

### "Blank dashboard"
**Cause:** API call failed or data not mapping correctly  
**Fix:** Check browser console for errors, verify API response structure

---

## 📞 Support & Resources

### Backend Team
- API Documentation: `http://localhost:3000/api-docs` (Swagger UI)
- Backend repo: [link to backend repo]
- Contact: [backend team contact]

### Frontend Resources
- This README
- [IMPLEMENTATION_STATUS_COMPLETE.md](IMPLEMENTATION_STATUS_COMPLETE.md) - Latest status
- [FRONTEND_BACKEND_API_CONTRACT.md](FRONTEND_BACKEND_API_CONTRACT.md) - API spec
- Browser DevTools (F12) - Your best friend

---

## 📅 Timeline

### Completed (Phase 1)
- ✅ January 1-15: UI/UX development
- ✅ January 16-22: Backend integration setup
- ✅ January 23-27: Authentication + Student dashboard

### Upcoming (Phase 2-4)
- 🟡 January 28-February 3: University/Admin dashboards + core features
- 🟡 February 4-10: Additional features (preferences, PDF, changelogs)
- 🟡 February 11-17: Polish, testing, optimization
- 🎯 **MVP Launch:** February 17-24, 2026

---

## 🎓 Learning Resources

### For New Developers
1. **Understand the flow:** User → Component → Context → Service → API → Backend
2. **Follow the pattern:** See StudentDataContext for reference implementation
3. **Use TypeScript:** Let types guide you
4. **Test frequently:** Browser DevTools is essential

### Key Concepts
- **React Context:** Shares state across components
- **Zustand:** Persistent state with localStorage
- **API Interceptor:** Automatically adds headers
- **Service Layer:** Abstracts API calls from components

---

## ✨ Credits

**Frontend Development Team:**  
[Your team members]

**Backend Development Team:**  
[Backend team members]

**Project Lead:**  
[Project lead name]

---

**Last Updated:** January 27, 2026  
**Version:** 1.0.0 (Phase 1 Complete)  
**License:** [Your license]  
**Repository:** e:\fyp\admission-times-frontend

---

## 🚀 Next Steps

**For Developers:**
1. Read [IMPLEMENTATION_STATUS_COMPLETE.md](IMPLEMENTATION_STATUS_COMPLETE.md)
2. Review [FRONTEND_TODO_PRIORITIZED_LIST.md](FRONTEND_TODO_PRIORITIZED_LIST.md)
3. Pick a task from Phase 2
4. Follow the implementation pattern
5. Test thoroughly
6. Submit PR

**For Project Managers:**
1. Review [STATUS_DASHBOARD.md](STATUS_DASHBOARD.md)
2. Check progress against timeline
3. Schedule Phase 2 kickoff
4. Monitor integration milestones

**Ready to code? Let's build this! 🚀**

---

## React + Vite (Original Template Info)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
