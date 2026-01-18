# CORS Fix Guide

**Issue:** CORS (Cross-Origin Resource Sharing) error when frontend tries to access backend API  
**Status:** ✅ Fixed with Vite Proxy

---

## 🔧 Solution 1: Vite Proxy (Recommended for Development)

### What We Did

1. **Updated `vite.config.ts`** to proxy API requests
2. **Updated `apiClient.ts`** to use relative paths in development

### How It Works

- Frontend makes request to `/api/v1/student/dashboard`
- Vite dev server proxies it to `http://localhost:3000/api/v1/student/dashboard`
- No CORS issues because request appears to come from same origin

### Files Modified

- ✅ `vite.config.ts` - Added proxy configuration
- ✅ `src/services/apiClient.ts` - Use relative paths in development

---

## 🔧 Solution 2: Backend CORS Configuration (For Production)

If you need to configure CORS on the backend, here's how:

### Express.js Example

```typescript
import cors from 'cors';

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',  // Alternative port
    'https://your-production-domain.com',  // Production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-id',
    'x-user-role',
    'x-university-id',
  ],
}));
```

### Fastify Example

```typescript
import fastifyCors from '@fastify/cors';

await fastify.register(fastifyCors, {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-production-domain.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-id',
    'x-user-role',
    'x-university-id',
  ],
});
```

### Manual CORS Headers (If not using middleware)

```typescript
// Add CORS headers manually
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-user-role, x-university-id');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
```

---

## ✅ Testing

### After Fix

1. **Restart Vite dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   pnpm run dev
   ```

2. **Test API connection:**
   - Navigate to `/student/dashboard`
   - Check browser console - should see no CORS errors
   - Check Network tab - requests should succeed

3. **Verify Proxy:**
   - Open Network tab in browser DevTools
   - Look for requests to `/api/v1/student/dashboard`
   - Should show status 200 (not CORS error)

---

## 🐛 Troubleshooting

### Issue: Still Getting CORS Errors

**Check:**
1. ✅ Vite dev server restarted after config change?
2. ✅ Backend server running on `http://localhost:3000`?
3. ✅ Using relative paths (`/api/v1`) not full URLs in development?

**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check browser console for exact error

### Issue: 404 Not Found

**Check:**
1. ✅ Backend running?
2. ✅ Backend URL correct?
3. ✅ Proxy target URL correct?

**Solution:**
- Verify backend is accessible at `http://localhost:3000`
- Check `vite.config.ts` proxy target matches backend URL

### Issue: Proxy Not Working

**Check:**
1. ✅ Vite config syntax correct?
2. ✅ Server restarted?

**Solution:**
- Check `vite.config.ts` for syntax errors
- Restart Vite dev server
- Check terminal for proxy errors

---

## 📝 Notes

- **Development:** Vite proxy handles CORS automatically
- **Production:** Need to configure CORS on backend or use same origin
- **Headers:** Make sure backend accepts custom headers (`x-user-id`, etc.)

---

## 🔗 Related

- **Vite Proxy Docs:** https://vitejs.dev/config/server-options.html#server-proxy
- **CORS MDN:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

---

**Status:** ✅ Fixed  
**Date:** January 18, 2026
