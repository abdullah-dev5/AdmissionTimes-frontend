# 📘 AdmissionTimes - Developer Guide
**Quick Start & Documentation Index**  
**Last Updated:** January 27, 2026

---

## 🚀 Absolute Quickest Start (5 Minutes)

1. **Install & Run:**
   ```bash
   cd e:\fyp\admission-times-frontend
   pnpm install
   pnpm dev
   ```

2. **Sign In:** Visit http://localhost:5173, use test credentials
3. **Verify:** Check dashboard loads with real data

---

## 📚 Essential Documentation

### 🎯 Start Here (Priority Order)
1. **[README.md](../README.md)** - Main project readme (5 min read)
2. **[IMPLEMENTATION_STATUS_COMPLETE.md](../IMPLEMENTATION_STATUS_COMPLETE.md)** - Latest status & code changes (15 min)
3. **[FRONTEND_BACKEND_API_CONTRACT.md](../FRONTEND_BACKEND_API_CONTRACT.md)** - Complete API specification (20 min)
4. **[FRONTEND_TODO_PRIORITIZED_LIST.md](../FRONTEND_TODO_PRIORITIZED_LIST.md)** - Task roadmap (10 min)
5. **[STATUS_DASHBOARD.md](../STATUS_DASHBOARD.md)** - Overall project dashboard (5 min)

### 📖 Reference Documentation
- **project-docs/** - Module specifications (student, university, admin modules)
- **context-todos/** - Implementation plans & analysis documents

---

## 🎓 For New Developers

### First 30 Minutes
1. Read README.md (understand project structure)
2. Read IMPLEMENTATION_STATUS_COMPLETE.md (see what's done)
3. Run `pnpm dev` and sign in
4. Open DevTools → Network tab, make API calls
5. Read one component file (e.g., StudentDataContext.tsx)

### Key Concepts to Understand
- **React Context:** Shares state across components
- **Zustand Store:** Persistent auth with localStorage
- **API Client Interceptor:** Auto-adds headers to requests
- **Service Layer:** Abstracts API calls
- **Field Compatibility:** Supports both `role` and `user_type`

### Implementation Pattern
```typescript
// 1. Service layer
export const someService = {
  fetchData: () => apiClient.get('/endpoint')
}

// 2. Context layer
const fetchData = async () => {
  const response = await someService.fetchData()
  setState(response.data)
}

// 3. Component layer
const { data } = useSomeContext()
```

---

## 🔧 For Active Developers

### Adding New Features (Step-by-Step)
1. Pick task from FRONTEND_TODO_PRIORITIZED_LIST.md
2. Create/update service method (services/[domain]Service.ts)
3. Update context if needed (contexts/[Domain]Context.tsx)
4. Update component (pages/[role]/[Page].tsx)
5. Test in browser with DevTools open
6. Check Network tab for 200 responses
7. Verify no console errors

### Code Quality Checklist
- [ ] TypeScript strict mode compliance
- [ ] Error handling with try-catch
- [ ] Graceful fallback for API failures
- [ ] Debug logging for troubleshooting
- [ ] Field compatibility (user.role || user.user_type)
- [ ] Documentation comments for complex logic

---

## 🎯 Current Status (Phase 1 Complete)

### ✅ Working Features
- Authentication (sign in, sign up, sign out)
- Student dashboard with real API data
- Role-based navigation
- API client with automatic headers
- Session persistence
- Type-safe API calls

### 🟡 Next Tasks (Phase 2)
- University dashboard integration (30 min)
- Admin dashboard integration (20 min)
- Notifications system (2-3 hours)
- Deadlines management (2-3 hours)
- Watchlists (2-3 hours)

---

## 🐛 Common Issues & Solutions

### Issue: 403 Forbidden
**Solution:** Check localStorage has auth-store, verify headers in Network tab

### Issue: Navigation not working
**Solution:** Verify user.role || user.user_type compatibility pattern

### Issue: TypeScript errors
**Solution:** Check src/types/api.ts for correct interfaces

---

## 📞 Get Help

- **Backend API:** http://localhost:3000/api-docs (Swagger)
- **Browser DevTools:** F12 → Network tab & Console
- **Documentation:** Read IMPLEMENTATION_STATUS_COMPLETE.md

---

**Next Step:** Read [README.md](../README.md) then start coding! 🚀

---

## Archive Notice

This guide consolidates multiple documentation files from the project:
- 00_START_HERE_MASTER_INDEX.md
- 00_COMPLETE_DOCUMENTATION_INDEX.md
- README_START_HERE.md
- QUICK_START_INTEGRATION.md
- README_ANALYSIS_DOCS.md

All detailed information is preserved in the essential docs listed above.
