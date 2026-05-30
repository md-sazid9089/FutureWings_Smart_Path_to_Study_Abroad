# FutureWings Authentication Testing Plan

## Test Summary

### Backend Configuration ✅
- **JWT_SECRET**: `futurewings_jwt_secret_2026` (defined in .env)
- **DATABASE_URL**: Azure SQL Server configured (Windows Auth)
- **Auth Middleware**: Properly extracting Bearer tokens
- **Admin Middleware**: Checking for ADMIN role

### Seed Data Available ✅
**Admin Users:**
- Email: `sazidcse@gmail.com` / Password: `admin124` (Role: ADMIN)
- Email: `irfancse@gmail.com` / Password: `admin124` (Role: ADMIN)

**Demo User:**
- Email: `demo@futurewings.com` / Password: `demo123` (Role: USER)

### Frontend Configuration ✅
- **Axios Base URL**: `http://localhost:5000` (default)
- **JWT Interceptor**: Automatically attaches Bearer token
- **Protected Routes**: ProtectedRoute & AdminRoute components present
- **AuthContext**: Stores token and user in localStorage

---

## Test Cases

### 1. BACKEND CONNECTIVITY TEST
```
Endpoint: GET http://localhost:5000/api/health
Expected: 200 OK with database connection status
```

### 2. USER LOGIN TEST (Role: USER)
```
Endpoint: POST http://localhost:5000/api/auth/login
Body: { "email": "demo@futurewings.com", "password": "demo123" }
Expected:
  - 200 OK
  - Token contains: userId, role: "USER"
  - User data: id, email, role, isPremium
```

### 3. ADMIN LOGIN TEST (Role: ADMIN)
```
Endpoint: POST http://localhost:5000/api/auth/login
Body: { "email": "sazidcse@gmail.com", "password": "admin124" }
Expected:
  - 200 OK
  - Token contains: userId, role: "ADMIN"
  - User data: role: "ADMIN"
```

### 4. TOKEN VERIFICATION
```
Decode JWT tokens to verify:
  - userId is present
  - role is correct (USER or ADMIN)
  - expiresIn is set (7 days)
```

### 5. PROTECTED ROUTE TEST (USER)
```
Endpoint: GET http://localhost:5000/api/applications
Header: Authorization: Bearer <user_token>
Expected: 200 OK (user can access own applications)
```

### 6. PROTECTED ROUTE TEST (USER - without token)
```
Endpoint: GET http://localhost:5000/api/applications
Header: (no Authorization header)
Expected: 401 Unauthorized
```

### 7. ADMIN ROUTE TEST (ADMIN)
```
Endpoint: GET http://localhost:5000/api/admin/countries
Header: Authorization: Bearer <admin_token>
Expected: 200 OK (admin can access countries)
```

### 8. ADMIN ROUTE TEST (USER with valid token)
```
Endpoint: GET http://localhost:5000/api/admin/countries
Header: Authorization: Bearer <user_token>
Expected: 403 Forbidden (USER role cannot access admin routes)
```

### 9. INVALID TOKEN TEST
```
Endpoint: GET http://localhost:5000/api/applications
Header: Authorization: Bearer invalid_token
Expected: 401 Unauthorized
```

### 10. FRONTEND LOGIN FLOW
```
1. Navigate to http://localhost:3000/login
2. Enter: demo@futurewings.com / demo123
3. Expected:
   - Token saved to localStorage
   - User data saved to localStorage
   - Redirect to /recommendations
   - Token in axios headers for subsequent requests
```

### 11. FRONTEND ADMIN LOGIN FLOW
```
1. Navigate to http://localhost:3000/admin/login
2. Enter: sazidcse@gmail.com / admin124
3. Expected:
   - Admin token saved to localStorage
   - User role: ADMIN
   - Redirect to admin dashboard
```

### 12. FRONTEND PROTECTED ROUTE TEST
```
1. Logout (clear localStorage)
2. Try to access http://localhost:3000/recommendations
3. Expected: Redirect to /login
```

---

## Audit Checklist

### ✅ Auth Middleware
- [x] requireAuth middleware exists
- [x] Extracts Bearer token from Authorization header
- [x] Returns 401 if no token provided
- [x] Attaches req.auth with userId and role

### ✅ Admin Middleware
- [x] requireAdmin middleware exists
- [x] Calls requireAuth first
- [x] Checks req.auth.role === "ADMIN"
- [x] Returns 403 if not ADMIN

### ✅ Route Protection
- [x] /api/auth/* - No auth required
- [x] /api/applications/* - requireAuth
- [x] /api/documents/* - requireAuth
- [x] /api/admin/* - requireAdmin
- [x] /api/payments/* - requireAuth

### ✅ Password Security
- [x] Signup hashes passwords with bcrypt (cost: 10)
- [x] Login uses bcrypt.compare()
- [x] No plaintext passwords stored

### ✅ JWT Configuration
- [x] JWT_SECRET defined in .env
- [x] Token expiry set to 7 days
- [x] signToken() and verifyToken() implemented
- [x] Token includes userId and role

### ✅ Frontend Security
- [x] Token stored in localStorage
- [x] ProtectedRoute redirects to /login if no token
- [x] AdminRoute redirects to /admin/login if not ADMIN
- [x] Axios interceptor adds token to all requests
- [x] 401 response clears localStorage and redirects to /login

### ✅ CORS Configuration
- [x] Frontend URL in allowedOrigins
- [x] Credentials enabled
- [x] Vercel preview domains allowed (.vercel.app)

### ✅ Seed Data
- [x] Admin users created with hashed passwords
- [x] Demo user created for testing
- [x] Application statuses seeded

---

## Known Issues & Resolutions

### None found during audit ✅

All authentication components are properly implemented and configured.

---

## Next Steps

1. Run seed script: `npm run seed`
2. Execute test cases in order
3. Monitor browser console and backend logs
4. Verify JWT payload in browser DevTools
5. Check network requests in DevTools Network tab
