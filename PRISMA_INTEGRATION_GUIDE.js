/**
 * ═════════════════════════════════════════════════════════════════════════
 * PRISMA INTEGRATION GUIDE - FutureWings Study Abroad Backend
 * ═════════════════════════════════════════════════════════════════════════
 *
 * This document describes the Prisma integration completed for the backend.
 *
 * PART 2: Implementation Summary
 * ═════════════════════════════════════════════════════════════════════════
 */

// ═════════════════════════════════════════════════════════════════════════
// 1. PROJECT STRUCTURE
// ═════════════════════════════════════════════════════════════════════════

/*
backend/
├── src/
│   ├── prisma/
│   │   └── client.js              ← Prisma singleton instance
│   ├── middleware/
│   │   ├── auth.js                ← JWT verification middleware
│   │   └── admin.js               ← Admin role verification
│   ├── utils/
│   │   └── response.js            ← Standardized API response helpers
│   └── routes/
│       ├── auth.js                ← POST /api/auth/signup, /login
│       ├── user.js                ← GET /api/user/me, PUT /api/user/me
│       ├── recommendations.js     ← GET /api/recommendations/countries
│       ├── countries.js           ← GET /api/countries, /:id/universities
│       ├── universities.js        ← GET /api/universities/:id/programs
│       ├── scholarships.js        ← GET /api/scholarships/country/:id
│       ├── applications.js        ← POST/GET applications
│       ├── visa-outcomes.js       ← GET /api/applications/:id/visa-outcome
│       ├── documents.js           ← User document management
│       ├── ratings.js             ← POST/GET ratings
│       └── admin.js               ← Admin CRUD operations
├── prisma/
│   ├── schema.prisma              ← Database schema (pre-configured)
│   ├── migrations/                ← Database migrations
│   └── seed.js                    ← Database seeding
├── server.js                      ← Updated main entry point
├── .env.example                   ← Environment template
└── package.json                   ← Dependencies with Prisma

*/

// ═════════════════════════════════════════════════════════════════════════
// 2. KEY FILES CREATED/UPDATED
// ═════════════════════════════════════════════════════════════════════════

/*
✓ src/prisma/client.js
  - Singleton pattern to prevent multiple Prisma Client instances
  - Reuses connection pool in production
  - Logs queries in development

✓ src/middleware/auth.js
  - signToken(payload): Generate JWT token
  - verifyToken(token): Verify JWT token
  - requireAuth: Middleware for protected routes

✓ src/middleware/admin.js
  - requireAdmin: Middleware for admin-only routes
  - Checks role === "ADMIN"

✓ src/utils/response.js
  - successResponse(res, data, statusCode): Send success response
  - errorResponse(res, message, statusCode): Send error response

*/

// ═════════════════════════════════════════════════════════════════════════
// 3. ROUTES IMPLEMENTATION
// ═════════════════════════════════════════════════════════════════════════

/*
AUTHENTICATION
═════════════════════════════════════════════════════════════════════════

POST /api/auth/signup
  Body: { email, password, fullName? }
  - Lowercase email
  - Hash password with bcrypt (salt: 10)
  - Check for unique email
  - Create user with role="USER"
  - Return JWT token + user data
  
  Response:
  {
    "success": true,
    "data": {
      "token": "eyJhbGc...",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "role": "USER",
        "fullName": "John Doe"
      }
    }
  }

POST /api/auth/login
  Body: { email, password }
  - Lowercase email
  - Find user by email
  - Verify password with bcrypt
  - Return JWT token + user data
  
  Response:
  {
    "success": true,
    "data": {
      "token": "eyJhbGc...",
      "user": { id, email, role, fullName }
    }
  }


USER PROFILE
═════════════════════════════════════════════════════════════════════════

GET /api/user/me
  Headers: Authorization: Bearer <token>
  - Requires authentication
  - Return current user profile
  
  Response:
  {
    "success": true,
    "data": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "USER",
      "cgpa": 3.8,
      "degreeLevel": "Bachelor",
      "major": "Computer Science",
      "fundScore": 150,
      "createdAt": "2026-02-26T10:00:00Z"
    }
  }

PUT /api/user/me
  Headers: Authorization: Bearer <token>
  Body: { fullName?, degreeLevel?, major?, cgpa?, fundScore? }
  - Requires authentication
  - Update user profile fields
  - Return updated user
  
  Response: { "success": true, "data": { ...updated user } }


RECOMMENDATIONS
═════════════════════════════════════════════════════════════════════════

GET /api/recommendations/countries
  Headers: Authorization: Bearer <token>
  - Requires authentication
  - Read user CGPA
  - Compute tier:
    * cgpa > 3.7 => tier 1 (top universities)
    * cgpa >= 3.2 && <= 3.7 => tier 2
    * cgpa < 3.2 => tier 3
  - Return countries where tierLevel matches AND isActive=true
  
  Response:
  {
    "success": true,
    "data": {
      "userCgpa": 3.8,
      "tier": 1,
      "countries": [
        {
          "id": 1,
          "countryName": "United States",
          "region": "North America",
          "currency": "USD",
          "tierLevel": 1,
          "isActive": true
        }
      ]
    }
  }


BROWSING / DISCOVERY
═════════════════════════════════════════════════════════════════════════

GET /api/countries
  - No authentication required
  - Return all active countries
  
  Response:
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "countryName": "United States",
        "region": "North America",
        "currency": "USD",
        "tierLevel": 1,
        "isActive": true
      }
    ]
  }

GET /api/countries/:countryId/universities
  - No auth required
  - Return universities in country
  
  Response:
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "countryId": 1,
        "universityName": "Harvard University",
        "type": "Private",
        "city": "Cambridge"
      }
    ]
  }

GET /api/universities/:universityId/programs
  - No auth required
  - Return programs in university
  
  Response:
  {
    "success": true,
    "data": [
      {
        "id": 5,
        "universityId": 1,
        "programName": "Computer Science (MS)",
        "level": "Master",
        "tuitionPerYear": 60000
      }
    ]
  }

GET /api/scholarships/country/:countryId
  - No auth required
  - Return scholarships in country
  
  Response:
  {
    "success": true,
    "data": [
      {
        "id": 12,
        "countryId": 1,
        "scholarshipName": "Fulbright Scholarship",
        "eligibilityCriteria": "US citizens, TOEFL 100+",
        "applyLink": "https://...",
        "deadline": "2026-03-15T00:00:00Z",
        "amount": 50000
      }
    ]
  }


APPLICATIONS
═════════════════════════════════════════════════════════════════════════

POST /api/applications
  Headers: Authorization: Bearer <token>
  Body: { countryId, programId, intakeApplied? }
  - Requires authentication
  - Set status to "Pending"
  - Create application record
  
  Response:
  {
    "success": true,
    "data": {
      "id": 5,
      "userId": 1,
      "countryId": 1,
      "programId": 2,
      "statusId": 1,
      "appliedDate": "2026-02-26T10:00:00Z",
      "intakeApplied": "Fall 2026",
      "country": { "id": 1, "countryName": "United States" },
      "program": { "id": 2, "programName": "Computer Science (MS)" },
      "status": { "id": 1, "statusName": "Pending" },
      "visaOutcome": null
    }
  }

GET /api/applications
  Headers: Authorization: Bearer <token>
  - Requires authentication
  - Return all user's applications
  
  Response:
  {
    "success": true,
    "data": [
      { ...application object... }
    ]
  }

GET /api/applications/:applicationId
  Headers: Authorization: Bearer <token>
  - Requires authentication
  - Check ownership
  - Return single application with details
  
  Response:
  {
    "success": true,
    "data": { ...application object... }
  }


VISA OUTCOMES
═════════════════════════════════════════════════════════════════════════

GET /api/applications/:applicationId/visa-outcome
  Headers: Authorization: Bearer <token>
  - Requires authentication
  - Check application ownership
  - Return visa outcome or 404 if not set
  
  Response:
  {
    "success": true,
    "data": {
      "id": 8,
      "applicationId": 5,
      "decision": "APPROVED",
      "reasonTitle": "Strong academic profile",
      "notes": "Approved for fall intake",
      "destinationDate": "2026-09-01T00:00:00Z"
    }
  }


RATINGS
═════════════════════════════════════════════════════════════════════════

POST /api/ratings
  Headers: Authorization: Bearer <token>
  Body: { countryId, applicationId, ratingValue, comments? }
  - Requires authentication
  - Check visaOutcome exists for application
  - Check application belongs to user
  - Check unique constraint (one rating per user+country+type)
  - ratingValue: 1-5
  
  Response:
  {
    "success": true,
    "data": {
      "id": 3,
      "userId": 1,
      "countryId": 1,
      "applicationId": 5,
      "ratingValue": 5,
      "comments": "Great experience!",
      "ratingType": "POST",
      "createdAt": "2026-02-26T10:00:00Z"
    }
  }

GET /api/countries/:countryId/ratings-summary
  - No auth required
  - Return average rating and count for country
  
  Response:
  {
    "success": true,
    "data": {
      "countryId": 1,
      "averageRating": 4.5,
      "count": 12
    }
  }


ADMIN ROUTES (role="ADMIN")
═════════════════════════════════════════════════════════════════════════

COUNTRIES CRUD
──────────────
GET /api/admin/countries
  - List all countries (active + inactive)

POST /api/admin/countries
  Body: { countryName, region?, currency?, tierLevel? }
  - Create country

PUT /api/admin/countries/:id
  Body: { countryName?, region?, currency?, tierLevel?, isActive? }
  - Update country

DELETE /api/admin/countries/:id
  - Delete country


UNIVERSITIES CRUD
─────────────────
GET /api/admin/universities
  - List all universities with country info

POST /api/admin/universities
  Body: { countryId, universityName, type?, city? }
  - Create university

PUT /api/admin/universities/:id
  Body: { universityName?, type?, city? }
  - Update university

DELETE /api/admin/universities/:id
  - Delete university


PROGRAMS CRUD
─────────────
GET /api/admin/programs
  - List all programs with university info

POST /api/admin/programs
  Body: { universityId, programName, level?, tuitionPerYear? }
  - Create program

PUT /api/admin/programs/:id
  Body: { programName?, level?, tuitionPerYear? }
  - Update program

DELETE /api/admin/programs/:id
  - Delete program


SCHOLARSHIPS CRUD
─────────────────
GET /api/admin/scholarships
  - List all scholarships

POST /api/admin/scholarships
  Body: {
    countryId,
    scholarshipName,
    eligibilityCriteria?,
    applyLink?,
    deadline? (ISO date),
    amount?
  }
  - Create scholarship

PUT /api/admin/scholarships/:id
  Body: { similar to POST }
  - Update scholarship

DELETE /api/admin/scholarships/:id
  - Delete scholarship


DOCUMENTS MANAGEMENT
────────────────────
GET /api/admin/documents?status=PENDING
  - List documents with optional status filter
  - Statuses: PENDING, VERIFIED, REJECTED

PUT /api/admin/documents/:docId/verify
  Body: { verificationStatus, adminNote? }
  - Update document verification status
  - Set admin notes


APPLICATIONS MANAGEMENT
───────────────────────
PUT /api/admin/applications/:id/status
  Body: { statusName }
  - Update application status
  - statusName: "Pending", "Accepted", "Rejected", etc.

POST /api/admin/applications/:id/visa-outcome
  Body: {
    decision,
    reasonTitle?,
    notes?,
    destinationDate? (ISO date)
  }
  - Create/update visa outcome
  - decision: "APPROVED" | "DENIED"


RATINGS MANAGEMENT
───────────────────
GET /api/admin/ratings?countryId=1&userId=1
  - List all ratings with optional filters
  - includes user, country, application info

*/

// ═════════════════════════════════════════════════════════════════════════
// 4. API RESPONSE FORMAT
// ═════════════════════════════════════════════════════════════════════════

/*
SUCCESS RESPONSE (2xx)
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Example",
    ...
  }
}

ERROR RESPONSE (4xx, 5xx)
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}

HTTP Status Codes:
- 200: OK (GET, PUT)
- 201: Created (POST)
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

*/

// ═════════════════════════════════════════════════════════════════════════
// 5. ENVIRONMENT SETUP
// ═════════════════════════════════════════════════════════════════════════

/*
Create .env file in backend/ directory:

DATABASE_URL="sqlserver://localhost:1433;database=FutureWings_Smart_Path_to_Study_Abroad;user=sa;password=YOUR_PASSWORD;trustServerCertificate=true;encrypt=false"
JWT_SECRET="your_jwt_secret_here"
NODE_ENV="development"

Run migrations:
npm run prisma:migrate

Seed database:
npm run seed

*/

// ═════════════════════════════════════════════════════════════════════════
// 6. DEVELOPMENT & DEPLOYMENT
// ═════════════════════════════════════════════════════════════════════════

/*
Development:
  npm install     # Install dependencies
  npm run dev     # Start development server

Testing:
  - Use Postman or curl to test endpoints
  - Include Authorization header for protected routes:
    Authorization: Bearer <jwt_token>

Production:
  - Build: vercel deploy
  - Database: Use managed MSSQL service
  - Update DATABASE_URL in production environment

*/

// ═════════════════════════════════════════════════════════════════════════
// 7. KEY FEATURES
// ═════════════════════════════════════════════════════════════════════════

/*
✓ Prisma Client Singleton Pattern
  - Prevents multiple instances in development
  - Proper connection pooling in production

✓ JWT Authentication
  - Token generation on signup/login
  - Token verification on protected routes
  - 7-day expiration

✓ Role-Based Access Control
  - USER: Regular user operations
  - ADMIN: Management operations

✓ Input Validation
  - Type checking
  - Required field validation
  - ID parsing and validation

✓ Error Handling
  - Standardized error responses
  - Proper HTTP status codes
  - Graceful error messages

✓ Academic Tier System
  - auto-computed from CGPA
  - Tier 1: cgpa > 3.7
  - Tier 2: cgpa 3.2-3.7
  - Tier 3: cgpa < 3.2

✓ Ownership Verification
  - Users can only access their own data
  - Admin access for management

✓ No Raw SQL
  - All queries use Prisma Client
  - Type-safe queries

*/

// ═════════════════════════════════════════════════════════════════════════
// 8. EXAMPLE USAGE
// ═════════════════════════════════════════════════════════════════════════

/*
SIGNUP
------
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "USER",
      "fullName": "John Doe"
    }
  }
}


LOGIN
-----
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: (same as signup)


GET USER PROFILE
----------------
GET http://localhost:5000/api/user/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "cgpa": null,
    "degreeLevel": null,
    "major": null,
    "fundScore": null,
    "createdAt": "2026-02-26T10:00:00Z"
  }
}


UPDATE PROFILE
--------------
PUT http://localhost:5000/api/user/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "cgpa": 3.8,
  "degreeLevel": "Bachelor",
  "major": "Computer Science",
  "fundScore": 150
}

Response: (updated user)


GET RECOMMENDATIONS
-------------------
GET http://localhost:5000/api/recommendations/countries
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "success": true,
  "data": {
    "userCgpa": 3.8,
    "tier": 1,
    "countries": [
      {
        "id": 1,
        "countryName": "United States",
        "region": "North America",
        "currency": "USD",
        "tierLevel": 1,
        "isActive": true
      }
    ]
  }
}


GET ALL COUNTRIES
-----------------
GET http://localhost:5000/api/countries

Response:
{
  "success": true,
  "data": [
    { ...country objects... }
  ]
}


CREATE APPLICATION
------------------
POST http://localhost:5000/api/applications
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "countryId": 1,
  "programId": 5,
  "intakeApplied": "Fall 2026"
}

Response:
{
  "success": true,
  "data": {
    "id": 10,
    "userId": 1,
    "countryId": 1,
    "programId": 5,
    "statusId": 1,
    "appliedDate": "2026-02-26T10:00:00Z",
    "intakeApplied": "Fall 2026",
    "country": { "id": 1, "countryName": "United States" },
    "program": { "id": 5, "programName": "Computer Science (MS)" },
    "status": { "id": 1, "statusName": "Pending" },
    "visaOutcome": null
  }
}


ADMIN: CREATE COUNTRY
---------------------
POST http://localhost:5000/api/admin/countries
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "countryName": "Canada",
  "region": "North America",
  "currency": "CAD",
  "tierLevel": 2
}

Response:
{
  "success": true,
  "data": {
    "id": 5,
    "countryName": "Canada",
    "region": "North America",
    "currency": "CAD",
    "tierLevel": 2,
    "isActive": true
  }
}

*/

module.exports = {
  integrationGuide: "See above for complete documentation",
};
