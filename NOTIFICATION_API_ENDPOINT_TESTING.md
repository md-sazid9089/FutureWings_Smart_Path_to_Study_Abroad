# Notification System - API Endpoint Testing Guide

**Focus**: GET, POST, PUT endpoint validation  
**Date**: April 12, 2026  
**Status**: ✅ Complete Testing Framework

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Test Scenario 1: GET /api/notifications](#test-scenario-1-get-apinotifications)
3. [Test Scenario 2: POST /api/notifications/:id/read](#test-scenario-2-post-apinotificationsidread)
4. [Test Scenario 3: PUT /api/notifications/:id (If Applicable)](#test-scenario-3-put-apinotificationsid)
5. [Test Scenario 4: Error Handling](#test-scenario-4-error-handling)
6. [Test Scenario 5: Database Verification](#test-scenario-5-database-verification)
7. [Postman Request Templates](#postman-request-templates)
8. [cURL Commands Reference](#curl-commands-reference)
9. [Response Validation](#response-validation)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### System Requirements
- Backend running: `http://localhost:5000` ✓
- Database connected: Azure SQL Server ✓
- Test user created: `test@futurewings.com` / `Test@1234` ✓
- Postman or cURL available ✓
- SQL Manager access ✓

### Authentication
Before testing, obtain JWT token:

```bash
# LOGIN REQUEST
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@futurewings.com",
    "password": "Test@1234"
  }'

# RESPONSE (Save token for subsequent requests)
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "email": "test@futurewings.com",
    "fullName": "Test User"
  }
}
```

**Save this token as**: `JWT_TOKEN` for use in all authenticated requests

---

## 🧪 Test Scenario 1: GET /api/notifications

### Objective
Verify that GET requests successfully retrieve unread notifications for authenticated users

### Prerequisites
- Valid JWT token obtained
- At least 1 unread notification exists in database

### Test Steps

#### Step 1: Basic GET Request
```bash
curl -X GET "http://localhost:5000/api/notifications" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json"
```

#### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "userId": 123,
        "type": "subscription",
        "title": "Premium Subscription Active",
        "message": "Your AI Help premium subscription is now active!",
        "link": "/profile",
        "read": false,
        "createdAt": "2026-04-12T10:30:00.000Z",
        "updatedAt": "2026-04-12T10:30:00.000Z"
      },
      {
        "id": 2,
        "userId": 123,
        "type": "ai",
        "title": "New AI Recommendation",
        "message": "We found a great match: MIT Computer Science",
        "link": "/recommendations/5",
        "read": false,
        "createdAt": "2026-04-12T10:25:00.000Z",
        "updatedAt": "2026-04-12T10:25:00.000Z"
      }
    ],
    "total": 5,
    "limit": 20,
    "offset": 0
  },
  "message": "Notifications retrieved successfully"
}
```

#### Validation Checklist
- [ ] **Status Code**: 200 OK
- [ ] **Response Structure**: Contains `success`, `data`, `message` fields
- [ ] **Data Array**: `notifications` array is present
- [ ] **Total Count**: `total` reflects number of unread notifications
- [ ] **Pagination**: `limit` and `offset` present
- [ ] **Notification Fields**: Each notification has `id`, `userId`, `type`, `title`, `message`, `link`, `read`, `createdAt`, `updatedAt`
- [ ] **Read Status**: All notifications have `read: false`
- [ ] **Ordering**: Notifications ordered by `createdAt` (newest first)
- [ ] **User Match**: All notifications have correct `userId` (123)

---

#### Step 2: GET with Pagination Parameters
```bash
# Fetch only first 5 notifications, starting at offset 0
curl -X GET "http://localhost:5000/api/notifications?limit=5&offset=0&read=unread" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json"
```

#### Expected Response
```json
{
  "success": true,
  "data": {
    "notifications": [
      { /* first notification */ },
      { /* second notification */ },
      { /* third notification */ },
      { /* fourth notification */ },
      { /* fifth notification */ }
    ],
    "total": 5,
    "limit": 5,
    "offset": 0
  }
}
```

#### Validation Checklist
- [ ] **Limit Respected**: Returns exactly 5 notifications (or less if fewer available)
- [ ] **Correct Offset**: Starts from offset 0
- [ ] **Total Count**: Shows total available unread notifications
- [ ] **Pagination Math**: `limit + offset` doesn't exceed `total`

---

#### Step 3: GET with Different Filters
```bash
# Fetch ALL notifications (read + unread)
curl -X GET "http://localhost:5000/api/notifications?read=all" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Fetch only UNREAD notifications (default)
curl -X GET "http://localhost:5000/api/notifications?read=unread" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

#### Validation Checklist
- [ ] **Read Filter**: `?read=unread` returns only unread notifications
- [ ] **All Filter**: `?read=all` returns both read and unread
- [ ] **Data Accuracy**: Each notification matches filter criteria
- [ ] **Count Matches**: Returned count matches filter results

---

#### Step 4: Verify Response Data Completeness
```bash
# Save response to file for detailed inspection
curl -X GET "http://localhost:5000/api/notifications" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  | jq '.' > notification_response.json
```

**Inspect the saved file and verify each notification contains:**
- [ ] `id` (integer, unique)
- [ ] `userId` (integer, matches user ID)
- [ ] `type` (string: subscription, visa, ai, admin-update, recommendation, application)
- [ ] `title` (string, non-empty)
- [ ] `message` (string, non-empty)
- [ ] `link` (string or null, valid URL if present)
- [ ] `read` (boolean, false for unread filter)
- [ ] `createdAt` (ISO 8601 timestamp)
- [ ] `updatedAt` (ISO 8601 timestamp)

---

#### Step 5: Performance Check
```bash
# Measure response time for GET request
time curl -X GET "http://localhost:5000/api/notifications?limit=20" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -o /dev/null -s -w "Response Time: %{time_total}s\n"
```

#### Performance Validation Checklist
- [ ] **Response Time**: < 200ms
- [ ] **Time Consistency**: Multiple requests show similar times
- [ ] **No Timeouts**: Responses complete without timeout

---

### Test Case 1 Summary

| Check | Status | Notes |
|-------|--------|-------|
| Status Code 200 | ✓/✗ | |
| Data Structure Valid | ✓/✗ | |
| All Fields Present | ✓/✗ | |
| Pagination Works | ✓/✗ | |
| Filters Apply Correctly | ✓/✗ | |
| Response Time < 200ms | ✓/✗ | |
| **Overall Status** | **PASS/FAIL** | |

---

## 🧪 Test Scenario 2: POST /api/notifications/:id/read

### Objective
Verify that POST requests correctly mark notifications as read and update database

### Prerequisites
- Valid JWT token
- At least 1 unread notification ID (obtained from GET request above)
- Database access to verify updates

### Test Steps

#### Step 1: Get Notification ID (from GET request)
```bash
# Retrieve notifications and extract ID of first unread notification
curl -X GET "http://localhost:5000/api/notifications?limit=1&read=unread" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  | jq '.data.notifications[0].id'

# Output: 1 (or your actual notification ID)
```

**Save this ID as**: `NOTIFICATION_ID=1`

---

#### Step 2: Verify Initial State
```bash
# Before marking as read, check database
SELECT id, read, updatedAt FROM Notifications WHERE id = 1;

-- Expected Output:
-- id | read | updatedAt
-- 1  | 0    | 2026-04-12 10:30:00
```

---

#### Step 3: Mark Notification as Read
```bash
curl -X POST "http://localhost:5000/api/notifications/1/read" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json"
```

#### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 123,
    "type": "subscription",
    "title": "Premium Subscription Active",
    "message": "Your AI Help premium subscription is now active!",
    "link": "/profile",
    "read": true,
    "createdAt": "2026-04-12T10:30:00.000Z",
    "updatedAt": "2026-04-12T10:35:00.000Z"
  },
  "message": "Notification marked as read"
}
```

#### Immediate Validation Checklist
- [ ] **Status Code**: 200 OK
- [ ] **Read Status**: Response shows `read: true`
- [ ] **Timestamp Updated**: `updatedAt` is recent (just now)
- [ ] **ID Preserved**: Notification ID matches request
- [ ] **Other Fields Unchanged**: `title`, `message`, `link` remain same

---

#### Step 4: Verify Database Update
```bash
-- Run in SQL Management Studio
SELECT id, read, updatedAt FROM Notifications WHERE id = 1;

-- Expected Output:
-- id | read | updatedAt
-- 1  | 1    | 2026-04-12 10:35:00 (or current time)
```

#### Database Validation Checklist
- [ ] **Read Flag**: Changed from 0 to 1 (false to true)
- [ ] **Timestamp**: Updated to current time (within last 10 seconds)
- [ ] **Other Fields**: `createdAt` unchanged, all other data preserved

---

#### Step 5: Verify GET Request Now Excludes Marked Notification
```bash
# Fetch unread notifications again
curl -X GET "http://localhost:5000/api/notifications?read=unread" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

#### Expected Behavior
- [ ] **Notification Removed**: Previously marked notification NOT in response
- [ ] **Count Decreased**: Total unread count decreased by 1
- [ ] **Remaining Notifications**: All still have `read: false`

---

#### Step 6: Verify "Mark All as Read" Endpoint (if applicable)
```bash
# Mark ALL unread notifications as read
curl -X POST "http://localhost:5000/api/notifications/mark-all/read" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "count": 3
  },
  "message": "3 notifications marked as read"
}
```

#### Validation Checklist
- [ ] **Status Code**: 200 OK
- [ ] **Count Accurate**: `count` matches number of notifications marked
- [ ] **Database Updated**: All marked notifications have `read = 1`
- [ ] **GET Returns Empty**: Subsequent GET returns no unread notifications (or empty array)

---

### Test Case 2 Summary

| Check | Status | Notes |
|-------|--------|-------|
| POST Response: 200 OK | ✓/✗ | |
| Response: read = true | ✓/✗ | |
| DB Updated: read = 1 | ✓/✗ | |
| GET Excludes Marked | ✓/✗ | |
| Timestamp Updated | ✓/✗ | |
| Mark All Works | ✓/✗ | |
| **Overall Status** | **PASS/FAIL** | |

---

## 🧪 Test Scenario 3: PUT /api/notifications/:id

### Objective
Verify PUT endpoint for updating notification attributes (if implemented)

### Prerequisites
- Valid JWT token
- Notification ID to update
- Updated data payload

### IMPORTANT: Check Backend Support First

#### Step 1: Verify PUT Endpoint Exists
```bash
# Check if PUT endpoint is implemented
curl -X OPTIONS "http://localhost:5000/api/notifications/1" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -v

# Look for PUT in "Allow" header or try PUT request
```

#### Step 2: Check Backend Code
```bash
# Verify in backend/src/routes/notifications.js
grep -n "router.put" backend/src/routes/notifications.js

# If no output, PUT endpoint not implemented (expected)
```

---

### If PUT Endpoint IS Implemented, Run Tests

#### Test 2A: Update Notification Message
```bash
curl -X PUT "http://localhost:5000/api/notifications/1" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Updated message content",
    "title": "Updated Title"
  }'
```

#### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Title",
    "message": "Updated message content",
    "updatedAt": "2026-04-12T10:40:00.000Z"
  },
  "message": "Notification updated successfully"
}
```

#### Validation Checklist
- [ ] **Status Code**: 200 OK
- [ ] **Fields Updated**: `title` and `message` reflect changes
- [ ] **Timestamp Updated**: `updatedAt` is current
- [ ] **ID Preserved**: Notification ID unchanged
- [ ] **Unknown Fields Ignored**: Extra fields in request don't cause errors

---

#### Test 2B: Verify Database Update
```bash
SELECT id, title, message, updatedAt FROM Notifications WHERE id = 1;

-- Expected: title and message match updated values
```

#### Database Validation
- [ ] **Title Updated**: New title in database
- [ ] **Message Updated**: New message in database
- [ ] **Timestamp Updated**: Recent updatedAt value
- [ ] **Other Fields Preserved**: createdAt unchanged, other data intact

---

#### Test 2C: Partial Update (Only Change Some Fields)
```bash
curl -X PUT "http://localhost:5000/api/notifications/1" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Another message update"
  }'
```

#### Validation Checklist
- [ ] **Specified Field Updated**: message changed
- [ ] **Unspecified Fields Preserved**: title unchanged (or endpoint behavior)
- [ ] **No Partial Failures**: Either all succeed or all fail

---

### Test Case 3 Summary

| Check | Status | Implemented |
|-------|--------|-------------|
| PUT Endpoint Exists | ✓/✗ | Yes/No |
| Update Succeeds (200) | ✓/✗ | - |
| Fields Updated in Response | ✓/✗ | - |
| DB Changes Persisted | ✓/✗ | - |
| Timestamp Changes | ✓/✗ | - |
| Partial Updates Work | ✓/✗ | - |
| **Overall Status** | **PASS/FAIL** | - |

---

## 🧪 Test Scenario 4: Error Handling

### Objective
Verify proper error responses for invalid requests

---

### Test 4A: Invalid Notification ID (404 Error)

#### Test
```bash
# Try to mark non-existent notification as read
curl -X POST "http://localhost:5000/api/notifications/99999/read" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json"
```

#### Expected Response (404 Not Found)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Notification not found"
}
```

or

```json
{
  "error": "Notification not found",
  "statusCode": 404
}
```

#### Validation Checklist
- [ ] **Status Code**: 404 (or appropriate error code)
- [ ] **Error Message**: Clear, non-technical message
- [ ] **No Stack Trace**: Server error details not exposed
- [ ] **Message Field**: Present and descriptive

---

### Test 4B: Missing Authentication Header (401 Error)

#### Test
```bash
# Request WITHOUT Authorization header
curl -X GET "http://localhost:5000/api/notifications"
```

#### Expected Response (401 Unauthorized)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Validation Checklist
- [ ] **Status Code**: 401
- [ ] **Error Message**: Indicates missing authentication
- [ ] **Request Rejected**: Data not returned
- [ ] **Clear Message**: User knows why request was rejected

---

### Test 4C: Invalid JWT Token (401 Error)

#### Test
```bash
# Request with malformed token
curl -X GET "http://localhost:5000/api/notifications" \
  -H "Authorization: Bearer invalid_token_xyz"
```

#### Expected Response (401 Unauthorized)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid token"
}
```

#### Validation Checklist
- [ ] **Status Code**: 401
- [ ] **Token Rejected**: Invalid token detected
- [ ] **No Data Leaked**: User cannot access data with invalid token
- [ ] **Clear Error**: Indicates token issue

---

### Test 4D: Expired JWT Token (401 Error)

#### Test (if token expiration implemented)
```bash
# Use an old/expired token
curl -X GET "http://localhost:5000/api/notifications" \
  -H "Authorization: Bearer <expired_token>"
```

#### Expected Response (401 Unauthorized)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Token expired"
}
```

#### Validation Checklist
- [ ] **Status Code**: 401
- [ ] **Message**: Indicates expiration
- [ ] **Request Denied**: Data not returned

---

### Test 4E: Forbidden - Accessing Another User's Notification (403 Error)

#### Test Setup
```bash
# 1. Login as User A and get their notification ID
# 2. Login as User B
# 3. Try to mark/update User A's notification
```

#### Test Command
```bash
# After logging in as different user
curl -X POST "http://localhost:5000/api/notifications/1/read" \
  -H "Authorization: Bearer ${USER_B_TOKEN}" \
  -H "Content-Type: application/json"
```

#### Expected Response (403 Forbidden)
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Forbidden"
}
```

#### Validation Checklist
- [ ] **Status Code**: 403 (or 401)
- [ ] **Access Denied**: User cannot access other user's data
- [ ] **No Data Leaked**: Other user's notification not exposed

---

### Test 4F: Malformed Request Body (400 Error)

#### Test 1: Invalid JSON
```bash
curl -X POST "http://localhost:5000/api/notifications/1/read" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d 'invalid json {{'
```

#### Expected Response (400 Bad Request)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid JSON"
}
```

#### Validation Checklist
- [ ] **Status Code**: 400
- [ ] **Error Detected**: Malformed JSON caught
- [ ] **Clear Message**: Indicates parsing issue

---

#### Test 2: Missing Required Fields
```bash
# If PUT accepts data, send empty body
curl -X PUT "http://localhost:5000/api/notifications/1" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Expected: Request fails or requires at least one field
- [ ] **Validation Works**: Empty body rejected or handled properly

---

### Test 4G: Method Not Allowed (405 Error)

#### Test
```bash
# Try unsupported method on endpoint
curl -X DELETE "http://localhost:5000/api/notifications/count"
```

#### Expected Response (405 Method Not Allowed) - if applicable
```json
{
  "statusCode": 405,
  "message": "Method not allowed"
}
```

#### Validation Checklist
- [ ] **Status Code**: 405 (if not supported) or 501 Not Implemented
- [ ] **Clear Error**: Indicates method not supported

---

### Test Case 4 Summary

| Error Type | Status Code | Handled |
|------------|-------------|---------|
| Invalid Notification ID | 404 | ✓/✗ |
| Missing Auth | 401 | ✓/✗ |
| Invalid Token | 401 | ✓/✗ |
| Expired Token | 401 | ✓/✗ |
| Forbidden (Other User) | 403 | ✓/✗ |
| Malformed JSON | 400 | ✓/✗ |
| Missing Fields | 400 | ✓/✗ |
| Method Not Allowed | 405 | ✓/✗ |
| **Overall Status** | **PASS/FAIL** | |

---

## 🧪 Test Scenario 5: Database Verification

### Objective
Verify that all API operations correctly persist changes to database

### Prerequisites
- SQL Management Studio connected to Azure SQL
- Access to Notifications table

---

### Test 5A: Verify Read Flag Updated

#### Step 1: Before Marking as Read
```sql
SELECT 
  id,
  userId,
  title,
  read,
  updatedAt
FROM Notifications 
WHERE id = 1
  AND userId = 123;

-- Expected Output
-- |id|userId|title                      |read|updatedAt             |
-- |1 |123   |Premium Subscription...    |0   |2026-04-12 10:30...   |
```

#### Step 2: Mark as Read (via API)
```bash
curl -X POST "http://localhost:5000/api/notifications/1/read" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

#### Step 3: After Marking as Read
```sql
SELECT 
  id,
  userId,
  title,
  read,
  updatedAt,
  DATEDIFF(SECOND, updatedAt, GETUTCDATE()) as seconds_ago
FROM Notifications 
WHERE id = 1
  AND userId = 123;

-- Expected Output
-- |id|userId|title                   |read|updatedAt             |seconds_ago|
-- |1 |123   |Premium Subscription..  |1   |2026-04-12 10:35...   |< 10       |
```

#### Validation Checklist
- [ ] **Read Status Changed**: From 0 to 1
- [ ] **Timestamp Updated**: updatedAt is recent (< 10 seconds ago)
- [ ] **User ID Preserved**: Still matches original user
- [ ] **Other Data Preserved**: title, message, type unchanged
- [ ] **CreatedAt Unchanged**: Original creation time preserved

---

### Test 5B: Verify Notification Removed from Unread Query

#### Query: Count Unread Before vs After
```sql
-- BEFORE marking as read (run in Step 1 above)
SELECT COUNT(*) as unread_count 
FROM Notifications 
WHERE userId = 123 
  AND read = 0;

-- Result: 5 (example)

-- AFTER marking as read
SELECT COUNT(*) as unread_count 
FROM Notifications 
WHERE userId = 123 
  AND read = 0;

-- Result: 4 (decreased by 1)
```

#### Validation Checklist
- [ ] **Count Decreased**: By exactly 1
- [ ] **Query Accuracy**: `read = 0` filter working correctly
- [ ] **User Isolation**: Only counts for specific user

---

### Test 5C: Verify Mark All as Read Updates All Records

#### Step 1: Count Unread
```sql
SELECT COUNT(*) as unread_count 
FROM Notifications 
WHERE userId = 123 
  AND read = 0;

-- Example: 3 unread notifications
```

#### Step 2: Mark All as Read (via API)
```bash
curl -X POST "http://localhost:5000/api/notifications/mark-all/read" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

#### Step 3: Verify All Marked
```sql
SELECT COUNT(*) as unread_count 
FROM Notifications 
WHERE userId = 123 
  AND read = 0;

-- Expected: 0

-- Verify all were updated
SELECT 
  id,
  read,
  updatedAt,
  DATEDIFF(SECOND, updatedAt, GETUTCDATE()) as seconds_ago
FROM Notifications 
WHERE userId = 123 
  AND read = 1
ORDER BY updatedAt DESC
LIMIT 3;

-- All should have recent updatedAt
```

#### Validation Checklist
- [ ] **Unread Count = 0**: All marked as read
- [ ] **ALL Updated**: Each record has `read = 1`
- [ ] **Timestamps Recent**: All updated within last minute
- [ ] **Count Matches**: Number updated matches initial count

---

### Test 5D: Verify Notification Type Distribution

#### Query: Check All Notification Types
```sql
SELECT 
  type,
  COUNT(*) as total_count,
  SUM(CASE WHEN read = 0 THEN 1 ELSE 0 END) as unread_count,
  SUM(CASE WHEN read = 1 THEN 1 ELSE 0 END) as read_count
FROM Notifications
WHERE userId = 123
GROUP BY type;

-- Expected Output
-- |type          |total_count|unread_count|read_count|
-- |subscription  |2          |1           |1         |
-- |ai            |1          |0           |1         |
-- |application   |1          |1           |0         |
-- |visa          |1          |1           |0         |
```

#### Validation Checklist
- [ ] **All Types Present**: Expected notification types shown
- [ ] **Count Accuracy**: total_count = unread_count + read_count
- [ ] **Read Distribution**: Mix of read/unread for multiple types

---

### Test 5E: Data Integrity Checks

#### Query 1: Check for NULL Values
```sql
SELECT 
  COUNT(CASE WHEN userId IS NULL THEN 1 END) as null_userIds,
  COUNT(CASE WHEN type IS NULL THEN 1 END) as null_types,
  COUNT(CASE WHEN title IS NULL THEN 1 END) as null_titles,
  COUNT(CASE WHEN message IS NULL THEN 1 END) as null_messages,
  COUNT(CASE WHEN read IS NULL THEN 1 END) as null_read_flags
FROM Notifications
WHERE userId = 123;

-- Expected: All zeros (no NULLs in required fields)
```

#### Validation Checklist
- [ ] **No NULLs**: All counts are 0
- [ ] **Data Integrity**: All required fields populated

---

#### Query 2: Verify Timestamp Consistency
```sql
SELECT 
  id,
  createdAt,
  updatedAt,
  DATEDIFF(SECOND, createdAt, updatedAt) as seconds_between,
  CASE 
    WHEN createdAt > updatedAt THEN 'ERROR: Created > Updated'
    WHEN DATEDIFF(SECOND, createdAt, updatedAt) < 0 THEN 'ERROR: Invalid'
    ELSE 'OK'
  END as validation
FROM Notifications
WHERE userId = 123
ORDER BY id DESC
LIMIT 10;
```

#### Validation Checklist
- [ ] **Consistency**: createdAt ≤ updatedAt for all records
- [ ] **No Inversions**: updatedAt never before createdAt
- [ ] **Logical Order**: Timestamps make sense

---

#### Query 3: Check for Orphaned Records
```sql
SELECT COUNT(*) as orphaned_count
FROM Notifications n
LEFT JOIN Users u ON n.userId = u.id
WHERE u.id IS NULL;

-- Expected: 0 (no orphans)
```

#### Validation Checklist
- [ ] **No Orphans**: All userIds reference existing users
- [ ] **Referential Integrity**: Foreign key constraint valid

---

### Test 5F: Response Time Analysis
```sql
-- Measure query performance for notifications fetch
SET STATISTICS TIME ON;
SET STATISTICS IO ON;

SELECT TOP 20
  id, userId, type, title, message, link, read, createdAt, updatedAt
FROM Notifications
WHERE userId = 123 
  AND read = 0
ORDER BY createdAt DESC;

SET STATISTICS TIME OFF;
SET STATISTICS IO OFF;

-- Check output for:
-- - CPU time
-- - Elapsed time
-- Expected: < 100ms combined
```

#### Validation Checklist
- [ ] **Elapsed Time**: < 100 ms
- [ ] **CPU Time**: < 50 ms
- [ ] **IO Reads**: Minimized (< 20 logical reads)
- [ ] **Query Efficient**: No table scans (uses indexes)

---

### Test Case 5 Summary

| Check | Status | Pass/Fail |
|-------|--------|-----------|
| Read Flag Updated | ✓/✗ | |
| Timestamp Changed | ✓/✗ | |
| Unread Count Decreased | ✓/✗ | |
| Mark All Works | ✓/✗ | |
| All Updates Persist | ✓/✗ | |
| No NULL Values | ✓/✗ | |
| Timestamps Consistent | ✓/✗ | |
| No Orphaned Records | ✓/✗ | |
| Query Performance < 100ms | ✓/✗ | |
| **Overall Status** | **PASS/FAIL** | |

---

## 📮 Postman Request Templates

### Pre-Setup
1. **Import Collection**: `NOTIFICATION_POSTMAN_COLLECTION.json`
2. **Set Variables**:
   - `base_url`: `http://localhost:5000`
   - `jwt_token`: (Leave empty, will be filled by login request)
   - `notification_id`: (Will be filled by GET request)

---

### Request 1: Login
```json
{
  "method": "POST",
  "url": "{{base_url}}/api/auth/login",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "email": "test@futurewings.com",
    "password": "Test@1234"
  },
  "tests": "
    pm.environment.set('jwt_token', pm.response.json().token);
  "
}
```

---

### Request 2: Get Unread Notifications
```json
{
  "method": "GET",
  "url": "{{base_url}}/api/notifications?limit=20&offset=0&read=unread",
  "headers": {
    "Authorization": "Bearer {{jwt_token}}",
    "Content-Type": "application/json"
  },
  "tests": "
    pm.test('Status is 200', function() {
      pm.response.to.have.status(200);
    });
    pm.test('Response has notifications', function() {
      pm.expect(pm.response.json().data.notifications).to.be.an('array');
    });
    pm.test('All notifications are unread', function() {
      pm.response.json().data.notifications.forEach(function(n) {
        pm.expect(n.read).to.be.false;
      });
    });
    if (pm.response.json().data.notifications.length > 0) {
      pm.environment.set('notification_id', pm.response.json().data.notifications[0].id);
    }
  "
}
```

---

### Request 3: Mark Notification as Read
```json
{
  "method": "POST",
  "url": "{{base_url}}/api/notifications/{{notification_id}}/read",
  "headers": {
    "Authorization": "Bearer {{jwt_token}}",
    "Content-Type": "application/json"
  },
  "body": "{}",
  "tests": "
    pm.test('Status is 200', function() {
      pm.response.to.have.status(200);
    });
    pm.test('Notification marked as read', function() {
      pm.expect(pm.response.json().data.read).to.be.true;
    });
    pm.test('UpdatedAt timestamp changed', function() {
      pm.expect(pm.response.json().data.updatedAt).to.be.a('string');
    });
  "
}
```

---

### Request 4: Get Unread Count (Verification)
```json
{
  "method": "GET",
  "url": "{{base_url}}/api/notifications/count",
  "headers": {
    "Authorization": "Bearer {{jwt_token}}"
  },
  "tests": "
    pm.test('Status is 200', function() {
      pm.response.to.have.status(200);
    });
    pm.test('Returns unread count', function() {
      pm.expect(pm.response.json().data.unreadCount).to.be.a('number');
    });
  "
}
```

---

### Request 5: Mark All as Read
```json
{
  "method": "POST",
  "url": "{{base_url}}/api/notifications/mark-all/read",
  "headers": {
    "Authorization": "Bearer {{jwt_token}}",
    "Content-Type": "application/json"
  },
  "body": "{}",
  "tests": "
    pm.test('Status is 200', function() {
      pm.response.to.have.status(200);
    });
    pm.test('Returns count of marked notifications', function() {
      pm.expect(pm.response.json().data.count).to.be.a('number');
    });
  "
}
```

---

### Request 6: Error Test - Invalid Notification ID
```json
{
  "method": "POST",
  "url": "{{base_url}}/api/notifications/99999/read",
  "headers": {
    "Authorization": "Bearer {{jwt_token}}"
  },
  "tests": "
    pm.test('Status is 404', function() {
      pm.response.to.have.status(404);
    });
    pm.test('Error message present', function() {
      pm.expect(pm.response.json().message).to.include('not found');
    });
  "
}
```

---

## 🔧 cURL Commands Reference

### Login Command
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@futurewings.com","password":"Test@1234"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

---

### GET Notifications
```bash
curl -X GET "http://localhost:5000/api/notifications?limit=10&offset=0&read=unread" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'
```

---

### Get Specific Notification ID
```bash
NOTIF_ID=$(curl -s -X GET "http://localhost:5000/api/notifications?limit=1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data.notifications[0].id')

echo "Notification ID: $NOTIF_ID"
```

---

### Mark as Read
```bash
curl -X POST "http://localhost:5000/api/notifications/$NOTIF_ID/read" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'
```

---

### Get Unread Count  
```bash
curl -X GET "http://localhost:5000/api/notifications/count" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data.unreadCount'
```

---

### Mark All as Read
```bash
curl -X POST "http://localhost:5000/api/notifications/mark-all/read" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' \
  | jq '.'
```

---

## ✅ Response Validation

### Success Response Format
```json
{
  "success": true,
  "statusCode": 200,
  "data": { },
  "message": "Success message"
}
```

---

### Error Response Format
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description"
}
```

---

### Key Validation Points

#### Status Codes
- [ ] `200 OK` - Success
- [ ] `201 Created` - Resource created
- [ ] `400 Bad Request` - Invalid input
- [ ] `401 Unauthorized` - Auth missing/invalid
- [ ] `403 Forbidden` - Access denied
- [ ] `404 Not Found` - Resource not found
- [ ] `500 Internal Server Error` - Server error

#### Response Structure
- [ ] `success` field present (boolean)
- [ ] `statusCode` or `status` field present (integer)
- [ ] `message` field present (string)
- [ ] `data` field present (object/array)
- [ ] No stack traces exposed
- [ ] No sensitive data in error messages

#### Data Validation
- [ ] All required fields present
- [ ] No extra unexpected fields
- [ ] Data types correct (string, number, boolean)
- [ ] Dates in ISO 8601 format
- [ ] IDs are integers
- [ ] URLs valid if present
- [ ] No circular references

---

## 🐛 Troubleshooting

### Issue 1: 401 Unauthorized on All Requests
**Solution**:
1. Verify JWT token: `echo $TOKEN`
2. Obtain new token: Run login request first
3. Use Bearer format: `Authorization: Bearer $TOKEN` (not `Authorization: $TOKEN`)
4. Check token expiration: Tokens may expire after time

---

### Issue 2: 404 Notification Not Found
**Solution**:
1. Verify notification exists: Run GET request first
2. Use correct ID: Copy ID from GET response
3. Check user authorization: You can only access your own notifications
4. Verify read status: Maybe already deleted

---

### Issue 3: 403 Forbidden on Mark as Read
**Solution**:
1. Can only mark OWN notifications as read
2. Verify you're logged in as correct user
3. Check notification belongs to current user:
   ```sql
   SELECT userId FROM Notifications WHERE id = X;
   ```
4. Compare with current session user ID

---

### Issue 4: Empty Notifications Array
**Solution**:
1. No unread notifications exist: Create some via test
2. Check filter parameter: `?read=unread` vs `?read=all`
3. Verify user ID in database:
   ```sql
   SELECT COUNT(*) FROM Notifications WHERE userId = 123;
   ```
4. All notifications marked as read: Run `GET ?read=all`

---

### Issue 5: Database Not Updating
**Solution**:
1. Verify database connection: Check .env file
2. Check database credentials
3. Verify Prisma migrations ran:
   ```bash
   cd backend && npx prisma migrate deploy
   ```
4. Restart backend service

---

### Issue 6: Response Time > 200ms
**Solution**:
1. Check database indexes:
   ```sql
   SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('Notifications');
   ```
2. Add index if missing:
   ```sql
   CREATE INDEX idx_notifications_userid_read
   ON Notifications(userId, read, createdAt DESC);
   ```
3. Check database load:
   ```sql
   EXEC sp_who2;  -- See active connections
   ```
4. Reduce limit parameter: `?limit=5` instead of `?limit=20`

---

## 📊 Test Results Summary Template

```html
TEST EXECUTION REPORT
====================
Date: [Date]
Tester: [Name]
Backend Version: [Version]
Database: [Environment]

TEST RESULTS:
┌─────────────────────────────────┬────────┬─────────────┐
│ Test Scenario                   │ Result │ Notes       │
├─────────────────────────────────┼────────┼─────────────┤
│ GET /api/notifications          │ PASS   │ 200 OK      │
│ GET /api/notifications (pagina) │ PASS   │ Limit/Offset│
│ GET with filters                │ PASS   │ read=unread │
│ POST /:id/read                  │ PASS   │ read=true   │
│ POST /mark-all/read             │ PASS   │ All marked  │
│ PUT /:id (if applicable)        │ N/A    │ Not impl.   │
│ Error: Invalid ID (404)         │ PASS   │ 404 returned│
│ Error: No Auth (401)            │ PASS   │ 401 returned│
│ Error: Invalid Token (401)      │ PASS   │ Token reject│
│ Database: Read flag updated     │ PASS   │ DB verified │
│ Database: Timestamps updated    │ PASS   │ Recent time │
│ Database: Unread count correct  │ PASS   │ Matches API │
│ Performance: Response < 200ms   │ PASS   │ Avg: 45ms   │
│ Performance: DB query < 100ms   │ PASS   │ Avg: 25ms   │
│ Data Integrity: No NULLs        │ PASS   │ All valid   │
│ Data Integrity: No orphans      │ PASS   │ All valid   │
└─────────────────────────────────┴────────┴─────────────┘

SUMMARY:
Total Tests: 16
Passed: 15
Failed: 0
Success Rate: 93.75%

ISSUES FOUND:
None

LIMITATIONS:
- PUT endpoint not implemented (not required)

SIGN-OFF:
Tester Signature: ________________
Date: ________________
Status: ☑ APPROVED  ☐ NEEDS FIXES
```

---

**Document Version**: 1.0  
**Last Updated**: April 12, 2026  
**Status**: ✅ Ready for Testing
