# Quick Start Guide - Prisma Integration

Get your Prisma-integrated backend running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
cd backend
npm install
```

This installs:
- `@prisma/client` - Prisma ORM
- `bcrypt` - Password hashing
- Required for all new routes

## Step 2: Configure Environment (1 min)

Ensure `.env` has:
```env
DATABASE_URL="mysql://root:password@localhost:3306/futurewings"
JWT_SECRET="futurewings_super_secret_key_change_in_production"
NODE_ENV="development"
PORT=5000
```

**Update the database credentials to match your setup!**

## Step 3: Initialize Database (1 min)

```bash
npx prisma migrate dev
```

This applies all pending migrations to your database.

## Step 4: Start Server (1 min)

```bash
npm run dev
```

You should see:
```
✓ Server running on http://localhost:5000
✓ Database: mysql://root:password@localhost:3306/futurewings
```

## Step 5: Test an Endpoint (1 min)

```bash
# Test health check
curl http://localhost:5000/health

# Create account
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullname": "Test User"
  }'
```

✅ **Done!** Your Prisma backend is running!

---

## 📂 New Files Created

```
backend/src/
├── prisma/client.js                 - Singleton Prisma instance
├── middleware/
│   ├── auth.js                      - JWT verification
│   ├── admin.js                     - Admin check
│   └── response.js                  - Response formatting
├── routes/
│   ├── auth.js                      - Signup/Login
│   ├── user.js                      - Profile management
│   ├── recommendations.js           - Tier-based suggestions
│   ├── countries.js                 - Browse data
│   ├── applications.js              - Application CRUD
│   ├── ratings.js                   - Rating system
│   └── admin.js                     - Admin operations
└── server.js                        - Express setup
```

---

## 🔑 Main Routes

### Auth (No login needed)
```
POST   /api/auth/signup          - Create account
POST   /api/auth/login           - Login & get token
```

### User Profile (Login needed)
```
GET    /api/user/me              - Get profile
PUT    /api/user/me              - Update profile
```

### Browse (Public)
```
GET    /api/countries            - List countries
GET    /api/countries/:id/universities
GET    /api/universities/:id/programs
GET    /api/scholarships/country/:id
```

### Applications (Login needed)
```
POST   /api/applications         - Apply to program
GET    /api/applications         - View my applications
GET    /api/applications/:id
GET    /api/applications/:id/visa-outcome
```

### Recommendations (Login needed)
```
GET    /api/recommendations/countries
```

### Ratings
```
POST   /api/ratings              - Rate country (Login needed)
GET    /api/countries/:id/ratings-summary
```

### Admin (Admin login needed)
```
CRUD operations for:
- Countries
- Universities
- Programs
- Scholarships
- Document verification
- Application status & visa outcomes
```

---

## 📖 For More Details

See these files:
- **Full Setup:** `PRISMA_INTEGRATION_GUIDE.md`
- **What's Done:** `IMPLEMENTATION_CHECKLIST.md`
- **API Reference:** `PRISMA_INTEGRATION_GUIDE.md` (Endpoints section)

---

## 🆘 Troubleshooting

**"Can't connect to database"**
- Check DATABASE_URL in .env
- Verify MySQL is running
- Check credentials

**"Port 5000 already in use"**
- Change PORT in .env
- Or: `lsof -ti:5000 | xargs kill -9`

**"Token invalid/expired"**
- Login again to get new token
- Make sure JWT_SECRET matches .env

**"Admin access denied"**
- Create admin user in database
- Use Prisma Studio: `npx prisma studio`
- Set role to "ADMIN"

---

## ✅ Checklist

- [ ] npm install completed
- [ ] DATABASE_URL in .env is correct
- [ ] JWT_SECRET in .env is set
- [ ] npx prisma migrate dev ran
- [ ] npm run dev started successfully
- [ ] Health check endpoint responds
- [ ] Signup endpoint works
- [ ] Login endpoint returns token

**You're all set!** 🎉

