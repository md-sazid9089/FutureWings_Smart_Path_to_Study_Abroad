# Prisma Integration Guide - FutureWings Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

This will install:
- `@prisma/client`: Prisma ORM client
- `bcrypt`: Password hashing
- `express`: Web framework
- `jsonwebtoken`: JWT authentication
- `cors`: Cross-origin requests

### 2. Configure Environment
Ensure your `.env` file contains:
```env
DATABASE_URL="mysql://user:password@localhost:3306/futurewings"
JWT_SECRET="your_secret_key_here"
NODE_ENV="development"
PORT=5000
```

### 3. Run Prisma Migrations
```bash
npx prisma migrate dev
```

### 4. Start Server
```bash
npm run dev
```

---

## Directory Structure

```
backend/
├── src/
│   ├── prisma/
│   │   └── client.js              # Prisma singleton
│   ├── middleware/
│   │   ├── auth.js                # JWT verification
│   │   ├── admin.js               # Admin role check
│   │   └── response.js            # Response utilities
│   ├── routes/
│   │   ├── auth.js                # Signup & Login
│   │   ├── user.js                # User profile
│   │   ├── recommendations.js     # Country recommendations
│   │   ├── countries.js           # Browse countries, universities, programs, scholarships
│   │   ├── applications.js        # Create & view applications
│   │   ├── ratings.js             # Rate countries
│   │   └── admin.js               # Admin CRUD operations
│   └── server.js                  # Express server setup
└── package.json
```

---

## API Endpoints Reference

### ✓ Authentication Routes
**No auth required**

#### POST /api/auth/signup
Create new user account.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "securepassword",
  "fullname": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "student@example.com",
      "role": "USER",
      "fullname": "John Doe"
    }
  },
  "error": null
}
```

---

#### POST /api/auth/login
Authenticate user and get JWT.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "student@example.com",
      "role": "USER",
      "fullname": "John Doe"
    }
  },
  "error": null
}
```

---

### 👤 User Routes
**Auth required**

#### GET /api/user/me
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "student@example.com",
    "fullname": "John Doe",
    "cgpa": 3.8,
    "degreeLevel": "Bachelor",
    "major": "Computer Science",
    "fundScore": 8,
    "role": "USER",
    "createdAt": "2026-02-24T10:30:00Z"
  },
  "error": null
}
```

---

#### PUT /api/user/me
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "fullname": "John Doe",
  "cgpa": 3.8,
  "degreeLevel": "Masters",
  "major": "Data Science",
  "fundScore": 9
}
```

**Response (200):** Updated user object

---

### 🌍 Recommendation Routes
**Auth required**

#### GET /api/recommendations/countries
Get countries recommended based on CGPA tier.

**Tier Logic:**
- CGPA > 3.7 → Tier 1 (top countries)
- CGPA 3.2-3.7 → Tier 2 (mid-tier)
- CGPA < 3.2 → Tier 3 (accessible)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userTier": 1,
    "cgpa": 3.8,
    "countries": [
      {
        "id": 1,
        "name": "United States",
        "code": "US",
        "description": "Top-ranked universities worldwide",
        "tier": 1,
        "isActive": true
      }
    ]
  },
  "error": null
}
```

---

### 🏢 Browsing Routes
**Public (no auth required)**

#### GET /api/countries
Get all active countries.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "United States",
      "code": "US",
      "description": "Top-ranked universities worldwide",
      "tier": 1,
      "isActive": true
    }
  ],
  "error": null
}
```

---

#### GET /api/countries/:id/universities
Get universities in a country.

**Example:** GET /api/countries/1/universities

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "MIT",
      "countryId": 1,
      "location": "Cambridge, MA",
      "ranking": 1,
      "website": "https://mit.edu"
    }
  ],
  "error": null
}
```

---

#### GET /api/universities/:id/programs
Get programs at a university.

**Example:** GET /api/universities/1/programs

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "MS Computer Science",
      "universityId": 1,
      "degreeLevel": "Masters",
      "duration": "2 years",
      "tuitionFee": 55000,
      "description": "Advanced CS program"
    }
  ],
  "error": null
}
```

---

#### GET /api/scholarships/country/:id
Get scholarships for a country.

**Example:** GET /api/scholarships/country/1

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Fulbright Scholarship",
      "countryId": 1,
      "amount": 50000,
      "eligibility": "US citizens only",
      "deadline": "2026-10-01"
    }
  ],
  "error": null
}
```

---

### 📋 Application Routes
**Auth required**

#### POST /api/applications
Create new application.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "countryId": 1,
  "programId": 1,
  "intakeApplied": "Spring 2026"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "countryId": 1,
    "programId": 1,
    "statusId": 1,
    "intakeApplied": "Spring 2026",
    "createdAt": "2026-02-24T10:30:00Z",
    "updatedAt": "2026-02-24T10:30:00Z",
    "status": {
      "id": 1,
      "name": "Pending"
    }
  },
  "error": null
}
```

---

#### GET /api/applications
Get user's applications.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params (optional):**
- `status`: Filter by status name (e.g., "Pending", "Approved")

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "countryId": 1,
      "programId": 1,
      "intakeApplied": "Spring 2026",
      "status": { "id": 1, "name": "Pending" }
    }
  ],
  "error": null
}
```

---

#### GET /api/applications/:id
Get specific application.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):** Full application object with relations

---

#### GET /api/applications/:id/visa-outcome
Get visa outcome for application.

**Example:** GET /api/applications/1/visa-outcome

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "applicationId": 1,
    "outcome": "Approved",
    "note": "Approved by embassy",
    "createdAt": "2026-03-01T10:30:00Z",
    "updatedAt": "2026-03-01T10:30:00Z"
  },
  "error": null
}
```

Or `null` if visa outcome not yet available.

---

### ⭐ Rating Routes
**Auth required**

#### POST /api/ratings
Rate a country after receiving visa outcome.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "applicationId": 1,
  "countryId": 1,
  "ratingValue": 5,
  "comments": "Great experience! Highly recommended."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "applicationId": 1,
    "countryId": 1,
    "ratingValue": 5,
    "comments": "Great experience! Highly recommended.",
    "createdAt": "2026-03-02T10:30:00Z"
  },
  "error": null
}
```

**Error (400):** If visa outcome doesn't exist yet

---

#### GET /api/countries/:id/ratings-summary
Get average rating and count for a country.

**Example:** GET /api/countries/1/ratings-summary

**Response (200):**
```json
{
  "success": true,
  "data": {
    "countryId": 1,
    "average": 4.5,
    "count": 12
  },
  "error": null
}
```

---

### 🛡️ Admin Routes
**Auth required + Admin role**

All admin endpoints require:
```
Authorization: Bearer <admin_token>
```

Admin role is set in the database. Use Prisma Studio to update:
```bash
npx prisma studio
```

---

#### CRUD Countries

**POST /api/admin/countries**
```json
{
  "name": "New Zealand",
  "code": "NZ",
  "description": "Scenic country with quality education",
  "tier": 2,
  "isActive": true
}
```

**GET /api/admin/countries** - Get all countries (including inactive)

**PUT /api/admin/countries/:id**
```json
{
  "name": "Updated Name",
  "tier": 1
}
```

**DELETE /api/admin/countries/:id** - Delete country

---

#### CRUD Universities

**POST /api/admin/universities**
```json
{
  "name": "Harvard University",
  "countryId": 1,
  "location": "Cambridge, MA",
  "ranking": 5,
  "website": "https://harvard.edu"
}
```

**GET /api/admin/universities** - Get all universities

**PUT /api/admin/universities/:id** - Update university

**DELETE /api/admin/universities/:id** - Delete university

---

#### CRUD Programs

**POST /api/admin/programs**
```json
{
  "name": "MBA",
  "universityId": 1,
  "degreeLevel": "Masters",
  "duration": "2 years",
  "tuitionFee": 100000,
  "description": "Business program"
}
```

**GET /api/admin/programs** - Get all programs

**PUT /api/admin/programs/:id** - Update program

**DELETE /api/admin/programs/:id** - Delete program

---

#### CRUD Scholarships

**POST /api/admin/scholarships**
```json
{
  "name": "Merit Scholarship",
  "countryId": 1,
  "amount": 50000,
  "eligibility": "GPA > 3.7",
  "deadline": "2026-12-31"
}
```

**GET /api/admin/scholarships** - Get all scholarships

**PUT /api/admin/scholarships/:id** - Update scholarship

**DELETE /api/admin/scholarships/:id** - Delete scholarship

---

#### Document Management

**GET /api/admin/documents**
Query params:
- `status`: "Pending", "Verified", or "Rejected"

**PUT /api/admin/documents/:docId/verify**
```json
{
  "status": "Verified",
  "note": "All documents verified"
}
```

---

#### Application Management

**PUT /api/admin/applications/:id/status**
```json
{
  "statusName": "Approved"
}
```

**POST /api/admin/applications/:id/visa-outcome**
```json
{
  "outcome": "Approved",
  "note": "Visa approved by embassy"
}
```

---

#### View Ratings

**GET /api/admin/ratings**
Query params:
- `countryId`: Filter by country
- `userId`: Filter by user

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Error description"
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (not admin) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Testing Examples

### 1. Create User Account
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "fullname": "John Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

### 3. Get User Profile (use token from login)
```bash
curl -X GET http://localhost:5000/api/user/me \
  -H "Authorization: Bearer <token>"
```

### 4. Get Recommendations
```bash
curl -X GET http://localhost:5000/api/recommendations/countries \
  -H "Authorization: Bearer <token>"
```

### 5. Browse Countries
```bash
curl -X GET http://localhost:5000/api/countries
```

### 6. Create Application
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "countryId": 1,
    "programId": 1,
    "intakeApplied": "Spring 2026"
  }'
```

---

## Key Features

✅ **Prisma Singleton** - Prevents multiple instances in development  
✅ **Password Hashing** - bcrypt for secure password storage  
✅ **JWT Authentication** - Token-based auth with 7-day expiry  
✅ **Role-Based Access** - Admin and User roles  
✅ **Tier-Based Recommendations** - CGPA-based country suggestions  
✅ **Complete CRUD Ops** - All admin management endpoints  
✅ **Visa Outcome Tracking** - Post-application visa updates  
✅ **Rating System** - User feedback on countries  
✅ **Standard Response Format** - Consistent API responses  
✅ **Error Handling** - Proper HTTP status codes

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Update `.env` with correct database credentials
3. ✅ Run migrations: `npx prisma migrate dev`
4. ✅ Seed database (optional): `npx prisma db seed`
5. ✅ Start server: `npm run dev`
6. ✅ Test endpoints with provided curl examples

---

## Troubleshooting

**Prisma Connection Error:**
- Check DATABASE_URL in .env
- Ensure database server is running
- Verify credentials are correct

**Token Expired:**
- Tokens expire after 7 days
- Login again to get new token

**Admin Access Denied:**
- Ensure user role is set to "ADMIN" in database
- Use Prisma Studio to update: `npx prisma studio`

**Port Already in Use:**
- Change PORT in .env
- Or kill process: `lsof -ti:5000 | xargs kill -9`

