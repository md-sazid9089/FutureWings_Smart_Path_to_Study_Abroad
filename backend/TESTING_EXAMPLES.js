/**
 * POSTMAN / cURL Testing Examples
 * 
 * Copy these requests into Postman or run as cURL commands
 * to test all implemented endpoints
 */

// ═════════════════════════════════════════════════════════════════
// 1. AUTHENTICATION ENDPOINTS
// ═════════════════════════════════════════════════════════════════

// SIGNUP - Create new account
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@futurewings.com",
    "password": "SecurePass123!",
    "fullname": "John Doe"
  }'

/**
Response (201):
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "student@futurewings.com",
      "role": "USER",
      "fullname": "John Doe"
    }
  },
  "error": null
}
*/

// LOGIN - Authenticate and get JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@futurewings.com",
    "password": "SecurePass123!"
  }'

/**
Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "student@futurewings.com",
      "role": "USER",
      "fullname": "John Doe"
    }
  },
  "error": null
}
*/

// ═════════════════════════════════════════════════════════════════
// 2. USER PROFILE ENDPOINTS
// ═════════════════════════════════════════════════════════════════

// Save token from login/signup response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// GET USER PROFILE
curl -X GET http://localhost:5000/api/user/me \
  -H "Authorization: Bearer $TOKEN"

/**
Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "email": "student@futurewings.com",
    "fullname": "John Doe",
    "cgpa": null,
    "degreeLevel": null,
    "major": null,
    "fundScore": null,
    "role": "USER",
    "createdAt": "2026-02-24T10:30:00.000Z"
  },
  "error": null
}
*/

// UPDATE USER PROFILE
curl -X PUT http://localhost:5000/api/user/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Doe",
    "cgpa": 3.85,
    "degreeLevel": "Masters",
    "major": "Computer Science",
    "fundScore": 8
  }'

/**
Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "email": "student@futurewings.com",
    "fullname": "John Doe",
    "cgpa": 3.85,
    "degreeLevel": "Masters",
    "major": "Computer Science",
    "fundScore": 8,
    "role": "USER",
    "updatedAt": "2026-02-24T10:35:00.000Z"
  },
  "error": null
}
*/

// ═════════════════════════════════════════════════════════════════
// 3. RECOMMENDATION ENDPOINTS
// ═════════════════════════════════════════════════════════════════

// GET RECOMMENDED COUNTRIES (based on CGPA tier)
curl -X GET http://localhost:5000/api/recommendations/countries \
  -H "Authorization: Bearer $TOKEN"

/**
Response (200):
{
  "success": true,
  "data": {
    "userTier": 1,
    "cgpa": 3.85,
    "countries": [
      {
        "id": 1,
        "name": "United States",
        "code": "US",
        "description": "Top-ranked universities worldwide",
        "tier": 1,
        "isActive": true
      },
      {
        "id": 2,
        "name": "United Kingdom",
        "code": "GB",
        "description": "World-class education heritage",
        "tier": 1,
        "isActive": true
      }
    ]
  },
  "error": null
}
*/

// ═════════════════════════════════════════════════════════════════
// 4. BROWSING ENDPOINTS (Public)
// ═════════════════════════════════════════════════════════════════

// GET ALL COUNTRIES
curl -X GET http://localhost:5000/api/countries

/**
Response (200):
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
*/

// GET UNIVERSITIES IN A COUNTRY
curl -X GET http://localhost:5000/api/countries/1/universities

/**
Response (200):
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
    },
    {
      "id": 2,
      "name": "Stanford University",
      "countryId": 1,
      "location": "Stanford, CA",
      "ranking": 3,
      "website": "https://stanford.edu"
    }
  ],
  "error": null
}
*/

// GET PROGRAMS AT A UNIVERSITY
curl -X GET http://localhost:5000/api/universities/1/programs

/**
Response (200):
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
      "description": "Advanced computer science program"
    }
  ],
  "error": null
}
*/

// GET SCHOLARSHIPS FOR A COUNTRY
curl -X GET http://localhost:5000/api/scholarships/country/1

/**
Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Fulbright Scholarship",
      "countryId": 1,
      "amount": 50000,
      "eligibility": "US citizens only",
      "deadline": "2026-10-01T00:00:00.000Z"
    }
  ],
  "error": null
}
*/

// ═════════════════════════════════════════════════════════════════
// 5. APPLICATION ENDPOINTS
// ═════════════════════════════════════════════════════════════════

// CREATE NEW APPLICATION
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "countryId": 1,
    "programId": 1,
    "intakeApplied": "Spring 2026"
  }'

/**
Response (201):
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "countryId": 1,
    "programId": 1,
    "statusId": 1,
    "intakeApplied": "Spring 2026",
    "createdAt": "2026-02-24T10:40:00.000Z",
    "updatedAt": "2026-02-24T10:40:00.000Z",
    "status": {
      "id": 1,
      "name": "Pending"
    }
  },
  "error": null
}
*/

// GET ALL USER APPLICATIONS
curl -X GET http://localhost:5000/api/applications \
  -H "Authorization: Bearer $TOKEN"

/**
Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "countryId": 1,
      "programId": 1,
      "statusId": 1,
      "intakeApplied": "Spring 2026",
      "createdAt": "2026-02-24T10:40:00.000Z",
      "updatedAt": "2026-02-24T10:40:00.000Z",
      "status": {
        "id": 1,
        "name": "Pending"
      }
    }
  ],
  "error": null
}
*/

// GET FILTER BY STATUS
curl -X GET "http://localhost:5000/api/applications?status=Pending" \
  -H "Authorization: Bearer $TOKEN"

// GET SPECIFIC APPLICATION
curl -X GET http://localhost:5000/api/applications/1 \
  -H "Authorization: Bearer $TOKEN"

// GET VISA OUTCOME FOR APPLICATION
curl -X GET http://localhost:5000/api/applications/1/visa-outcome \
  -H "Authorization: Bearer $TOKEN"

/**
Response (200): null (no visa outcome yet)
or
{
  "success": true,
  "data": {
    "id": 1,
    "applicationId": 1,
    "outcome": "Approved",
    "note": "Approved by immigration office",
    "createdAt": "2026-03-01T14:30:00.000Z",
    "updatedAt": "2026-03-01T14:30:00.000Z"
  },
  "error": null
}
*/

// ═════════════════════════════════════════════════════════════════
// 6. RATING ENDPOINTS
// ═════════════════════════════════════════════════════════════════

// CREATE RATING (only after visa outcome received)
curl -X POST http://localhost:5000/api/ratings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": 1,
    "countryId": 1,
    "ratingValue": 5,
    "comments": "Excellent experience! Top-notch universities and great quality of life."
  }'

/**
Response (201):
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "applicationId": 1,
    "countryId": 1,
    "ratingValue": 5,
    "comments": "Excellent experience! Top-notch universities and great quality of life.",
    "createdAt": "2026-03-02T10:30:00.000Z"
  },
  "error": null
}
*/

// GET RATINGS SUMMARY FOR COUNTRY
curl -X GET http://localhost:5000/api/countries/1/ratings-summary

/**
Response (200):
{
  "success": true,
  "data": {
    "countryId": 1,
    "average": 4.5,
    "count": 12
  },
  "error": null
}
*/

// ═════════════════════════════════════════════════════════════════
// 7. ADMIN ENDPOINTS (require admin token)
// ═════════════════════════════════════════════════════════════════

ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// ─── COUNTRY MANAGEMENT ───

// CREATE COUNTRY
curl -X POST http://localhost:5000/api/admin/countries \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Australia",
    "code": "AU",
    "description": "High quality of life and excellent research opportunities",
    "tier": 1,
    "isActive": true
  }'

// GET ALL COUNTRIES (including inactive)
curl -X GET http://localhost:5000/api/admin/countries \
  -H "Authorization: Bearer $ADMIN_TOKEN"

// UPDATE COUNTRY
curl -X PUT http://localhost:5000/api/admin/countries/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": 2,
    "isActive": false
  }'

// DELETE COUNTRY
curl -X DELETE http://localhost:5000/api/admin/countries/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

// ─── UNIVERSITY MANAGEMENT ───

// CREATE UNIVERSITY
curl -X POST http://localhost:5000/api/admin/universities \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "University of Melbourne",
    "countryId": 5,
    "location": "Melbourne, VIC",
    "ranking": 14,
    "website": "https://unimelb.edu.au"
  }'

// ─── PROGRAM MANAGEMENT ───

// CREATE PROGRAM
curl -X POST http://localhost:5000/api/admin/programs \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MBA - Business Administration",
    "universityId": 1,
    "degreeLevel": "Masters",
    "duration": "2 years",
    "tuitionFee": 100000,
    "description": "Advanced business program with international focus"
  }'

// ─── SCHOLARSHIP MANAGEMENT ───

// CREATE SCHOLARSHIP
curl -X POST http://localhost:5000/api/admin/scholarships \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chevening Scholarship",
    "countryId": 2,
    "amount": 40000,
    "eligibility": "British government scholarship for postgraduate students",
    "deadline": "2026-11-01"
  }'

// ─── DOCUMENT MANAGEMENT ───

// GET PENDING DOCUMENTS
curl -X GET "http://localhost:5000/api/admin/documents?status=Pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

// VERIFY DOCUMENT
curl -X PUT http://localhost:5000/api/admin/documents/1/verify \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Verified",
    "note": "All documents checked and verified"
  }'

// ─── APPLICATION MANAGEMENT ───

// UPDATE APPLICATION STATUS
curl -X PUT http://localhost:5000/api/admin/applications/1/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "statusName": "Under Review"
  }'

// ADD/UPDATE VISA OUTCOME
curl -X POST http://localhost:5000/api/admin/applications/1/visa-outcome \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outcome": "Approved",
    "note": "Visa approved by immigration office on 2026-03-01"
  }'

// ─── VIEW ALL RATINGS ───

// GET ALL RATINGS
curl -X GET http://localhost:5000/api/admin/ratings \
  -H "Authorization: Bearer $ADMIN_TOKEN"

// FILTER RATINGS BY COUNTRY
curl -X GET "http://localhost:5000/api/admin/ratings?countryId=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

// FILTER RATINGS BY USER
curl -X GET "http://localhost:5000/api/admin/ratings?userId=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

// ═════════════════════════════════════════════════════════════════
// ERROR RESPONSE EXAMPLES
// ═════════════════════════════════════════════════════════════════

// 400 - Bad Request (missing fields)
/**
{
  "success": false,
  "data": null,
  "error": {
    "message": "Email and password are required"
  }
}
*/

// 401 - Unauthorized (invalid token)
/**
{
  "success": false,
  "data": null,
  "error": {
    "message": "Unauthorized - Invalid token"
  }
}
*/

// 403 - Forbidden (not admin)
/**
{
  "success": false,
  "data": null,
  "error": {
    "message": "Forbidden - Admin access required"
  }
}
*/

// 404 - Not Found
/**
{
  "success": false,
  "data": null,
  "error": {
    "message": "Country not found"
  }
}
*/

// ═════════════════════════════════════════════════════════════════
// IMPORTING TO POSTMAN
// ═════════════════════════════════════════════════════════════════
/*

1. Create new Collection: "FutureWings API"
2. Set Collection Variable: TOKEN = (paste token from login)
3. Set Collection Variable: ADMIN_TOKEN = (paste admin token)

You can then reference these in requests:
- Header: Authorization: Bearer {{TOKEN}}
- Body parameter: "countryId": "{{COUNTRY_ID}}"

*/

