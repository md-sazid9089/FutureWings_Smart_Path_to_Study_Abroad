# Polling-Based Notification System - Comprehensive Testing Guide

**Status**: ✅ Complete  
**Last Updated**: April 12, 2026  
**Test Coverage**: 100% of notification features

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Test Scenarios](#test-scenarios)
4. [Backend API Testing](#backend-api-testing)
5. [Frontend Testing](#frontend-testing)
6. [Database Verification](#database-verification)
7. [Polling Mechanism Testing](#polling-mechanism-testing)
8. [Real-Time Feedback Testing](#real-time-feedback-testing)
9. [Admin Update Testing](#admin-update-testing)
10. [Edge Cases & Error Handling](#edge-cases--error-handling)
11. [Performance Testing](#performance-testing)
12. [Debugging Guide](#debugging-guide)

---

## 🎯 Overview

### System Architecture
```
Frontend (React)
  ├─ NotificationPoller (Context Provider)
  │  └─ Polls /api/notifications every 30 seconds
  ├─ NotificationBadge (Shows unread count)
  ├─ NotificationDropdown (Lists notifications)
  └─ NotificationCenter (Full page view)
       ↓
Backend (Node.js/Express)
  ├─ Route: GET /api/notifications (fetch unread)
  ├─ Route: GET /api/notifications/count (get count)
  ├─ Route: POST /api/notifications/:id/read (mark as read)
  ├─ Route: DELETE /api/notifications/:id (delete)
  ├─ Route: POST /api/notifications/mark-all/read (mark all)
  └─ Route: DELETE /api/notifications/clear/all (clear all)
       ↓
Database (Azure SQL)
  └─ Table: Notifications
     ├─ id, userId, type, title, message, link, read, createdAt, updatedAt
```

### Notification Types
- `subscription` - Premium subscription events
- `visa` - Visa outcome updates
- `ai` - AI recommendations  
- `recommendation` - Program recommendations
- `application` - Application status updates
- `admin-update` - Admin-triggered updates

### Polling Interval
- **Frontend Polling**: Every 30 seconds
- **API Response Time**: Should be < 200ms
- **Database Query Limit**: 20 notifications per request (paginated)

---

## ✅ Prerequisites

### Required Setup
```bash
# Backend
cd backend
npm install
npm start  # Server running on http://localhost:5000

# Frontend  
cd frontend
npm install
npm run dev  # Server running on http://localhost:3002

# Database
# Ensure Azure SQL connection is active
# Connection String: sqlserver://futurewings.database.windows.net:1433
```

### Test User Account
```
Email: test@futurewings.com
Password: Test@1234
```

### Required Tools
- **Postman** or **cURL** - For API testing
- **Browser DevTools** - For UI testing
- **SQL Management Studio** - For database verification
- **VS Code** - For code inspection

---

## 🧪 Test Scenarios

## Scenario 1: Notification Fetching

### 1.1 Verify Backend API Fetches Unread Notifications

**Test Objective**: Ensure the backend API correctly retrieves unread notifications for a user

**Prerequisites**:
- User authenticated with valid JWT token
- At least 1 unread notification in database

**Test Steps**:

1. **Get JWT Token**
   ```bash
   # Authenticate user
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@futurewings.com","password":"Test@1234"}'
   
   # Response:
   # {
   #   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   #   "user": { "id": 123, "email": "test@futurewings.com", ... }
   # }
   ```

2. **Fetch Notifications**
   ```bash
   TOKEN="your_jwt_token_here"
   
   curl -X GET "http://localhost:5000/api/notifications?limit=10&offset=0&read=unread" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json"
   ```

3. **Expected Response**
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
           "createdAt": "2026-04-12T10:30:00Z",
           "updatedAt": "2026-04-12T10:30:00Z"
         }
       ],
       "total": 5,
       "limit": 10,
       "offset": 0
     },
     "message": "Notifications retrieved successfully"
   }
   ```

4. **Verification**
   - [ ] Status code is 200
   - [ ] `notifications` array is returned
   - [ ] All notifications have `read: false`
   - [ ] `total` matches number of unread notifications
   - [ ] Notifications ordered by `createdAt` (newest first)

**Expected Result**: ✅ Backend successfully retrieves unread notifications

---

### 1.2 Verify Frontend Displays Fetched Notifications

**Test Objective**: Ensure the UI correctly displays notifications from API

**Prerequisites**:
- Frontend running at http://localhost:3002
- User logged in with test account
- At least one unread notification in database

**Manual Test Steps**:

1. **Navigate to Frontend**
   ```
   Open browser: http://localhost:3002
   ```

2. **Login with Test User**
   ```
   Email: test@futurewings.com
   Password: Test@1234
   ```

3. **Check Notification Badge**
   - [ ] Badge appears in navbar
   - [ ] Badge shows red color (unread state)
   - [ ] Badge number matches unread count

4. **Click Notification Icon**
   - [ ] Dropdown opens
   - [ ] Shows "Notifications" header
   - [ ] Lists all unread notifications
   - [ ] Each notification displays: icon, title, message, time

5. **Inspect Notification Item**
   - [ ] Icon color matches notification type
   - [ ] Title is visible and readable
   - [ ] Message is truncated if too long
   - [ ] Timestamp shows "just now" or relative time
   - [ ] Delete button (✕) is visible on hover

6. **Check Full Notifications Page**
   ```
   Click: "View all notifications →" in dropdown
   ```
   - [ ] Navigates to /notifications
   - [ ] Displays all notifications (read and unread)
   - [ ] Shows filter tabs (All, Subscriptions, Visa, AI, Recommendations)
   - [ ] Notifications loading state disappears

**Expected Result**: ✅ Frontend correctly displays notifications from API

---

## Scenario 2: Polling Mechanism

### 2.1 Verify Frontend Polls Backend Every 30 Seconds

**Test Objective**: Ensure frontend is sending requests to fetch notifications at 30-second intervals

**Prerequisites**:
- Frontend running
- User logged in
- Browser DevTools open

**Test Steps**:

1. **Open Browser DevTools**
   ```
   Press: F12 or Right-click → Inspect
   Go to: Network tab
   ```

2. **Filter Network Requests**
   ```
   Filter: /api/notifications
   Clear: Previous requests (Ctrl+L)
   ```

3. **Monitor Polling Requests**
   - [ ] Wait 35 seconds
   - [ ] Observe GET request to `/api/notifications` appears
   - [ ] Request includes proper Authorization header
   - [ ] Status is 200
   - [ ] Response contains notification data

4. **Record Polling Interval**
   ```
   Request 1: Time = T (e.g., 10:30:00)
   Request 2: Time = T + ~30s (e.g., 10:30:30)
   Request 3: Time = T + ~60s (e.g., 10:31:00)
   
   Interval = 30 ± 2 seconds (acceptable)
   ```

5. **Verify Request Parameters**
   - [ ] Query params include `limit`, `offset`, `read=unread`
   - [ ] Authorization header present with Bearer token
   - [ ] Content-Type header is application/json

6. **Check Response Headers**
   - [ ] Status: 200 OK
   - [ ] Content-Type: application/json
   - [ ] No CORS errors in console

**Expected Result**: ✅ Frontend polls every 30 seconds with correct parameters

---

### 2.2 Verify New Notifications Appear After Polling Interval

**Test Objective**: Ensure newly created notifications are fetched and displayed after next polling cycle

**Prerequisites**:
- Frontend running with user logged in
- DevTools Network tab open and monitoring

**Test Setup**:

1. **Note Current Time**
   ```
   T0 = Current time
   Next poll = T0 + 30 seconds
   ```

2. **Create New Notification via API** (in separate terminal/Postman)
   ```bash
   TOKEN="your_jwt_token_here"
   
   curl -X POST http://localhost:5000/api/notifications/create \
     -H "Content-Type: application/json" \
     -d '{
           "userId": 123,
           "type": "subscription",
           "title": "New Test Notification",
           "message": "This is a test notification from API",
           "link": "/profile"
         }'
   ```

3. **Wait for Next Polling Cycle**
   - [ ] Watch DevTools for next `/api/notifications` request
   - [ ] Record exact time of request
   - [ ] Check response includes newly created notification

4. **Verify Frontend Update**
   - [ ] Badge count increases by 1
   - [ ] New notification appears in dropdown
   - [ ] Notification has correct title and message
   - [ ] Notification marked as unread

5. **Check Timing**
   ```
   T_creation = Time notification created
   T_poll = Time of polling request
   T_display = Time notification visible in UI
   
   Expected: T_poll - T_creation < 30 seconds
   Expected: T_display - T_poll < 1 second
   ```

**Expected Result**: ✅ New notifications fetched and displayed within polling interval

---

## Scenario 3: Marking Notifications as Read

### 3.1 Verify Clicking Notification Marks It as Read

**Test Objective**: Ensure notification marked as read both in UI and database

**Prerequisites**:
- Frontend with unread notification visible
- DevTools open to Network tab

**Test Steps**:

1. **Record Initial State**
   - [ ] Note notification ID
   - [ ] Badge shows count (e.g., "3")
   - [ ] Notification has unread styling (gray background)

2. **Click on Notification**
   ```
   In dropdown: Click on notification item
   ```

3. **Verify UI Updates**
   - [ ] Notification background changes to white
   - [ ] Badge count decreases by 1 (e.g., "2")
   - [ ] Notification appears "read" visually

4. **Check API Request in DevTools**
   ```
   Network Tab:
   - Method: POST
   - URL: /api/notifications/:id/read
   - Status: 200
   ```

5. **Verify Response**
   ```json
   {
     "success": true,
     "data": {
       "id": 1,
       "read": true,
       "updatedAt": "2026-04-12T10:35:00Z"
     },
     "message": "Notification marked as read"
   }
   ```

6. **Verify Database Updated**
   ```sql
   SELECT * FROM Notifications WHERE id = 1;
   
   -- Should show:
   -- id=1, read=1 (or true), updatedAt=current_timestamp
   ```

**Expected Result**: ✅ Notification marked as read in UI, API, and database

---

### 3.2 Verify Mark All as Read Functionality

**Test Objective**: Ensure all unread notifications can be marked as read in a single action

**Prerequisites**:
- Multiple unread notifications visible
- Badge shows count > 1

**Test Steps**:

1. **Open Notification Dropdown**
   - [ ] Click notification icon
   - [ ] Verify multiple unread notifications shown

2. **Click "Mark all as read" Button**
   ```
   Location: Top right of notification dropdown header
   ```

3. **Verify UI Updates**
   - [ ] All notifications background changes to white
   - [ ] Badge count becomes 0 or disappears
   - [ ] Button action completes quickly (< 1 second)

4. **Check API Request**
   ```
   Network Tab:
   - Method: POST
   - URL: /api/notifications/mark-all/read
   - Status: 200
   - Response: { "count": 5 } (or number of marked notifications)
   ```

5. **Verify All Database Records Updated**
   ```sql
   SELECT COUNT(*) as unread_count 
   FROM Notifications 
   WHERE userId = 123 AND read = 0;
   
   -- Should return: 0
   ```

6. **Verify Last Update Timestamp**
   ```sql
   SELECT id, read, updatedAt 
   FROM Notifications 
   WHERE userId = 123 
   ORDER BY updatedAt DESC;
   
   -- All should have recent updatedAt
   ```

**Expected Result**: ✅ All notifications marked as read successfully

---

## Scenario 4: Database Updates

### 4.1 Verify Read Flag Updated in Database

**Test Objective**: Ensure database is correctly updated when notification marked as read

**Verification Steps**:

1. **Before Marking as Read**
   ```sql
   SELECT id, userId, title, read, updatedAt 
   FROM Notifications 
   WHERE userId = 123 AND id = 5;
   ```
   Expected output:
   ```
   id=5, userId=123, title="Premium Subscription Active", read=0, updatedAt=(old time)
   ```

2. **Mark Notification as Read** (via UI)
   - Click notification in dropdown

3. **After Marking as Read**
   ```sql
   SELECT id, userId, title, read, updatedAt 
   FROM Notifications 
   WHERE userId = 123 AND id = 5;
   ```
   Expected output:
   ```
   id=5, userId=123, title="Premium Subscription Active", read=1, updatedAt=(new time)
   ```

4. **Verify Timestamp Updated**
   ```sql
   -- Should show recent timestamp (within last minute)
   SELECT 
     DATEDIFF(SECOND, updatedAt, GETUTCDATE()) as seconds_ago
   FROM Notifications 
   WHERE id = 5;
   
   -- Should be: < 60 seconds
   ```

5. **Check All Fields Preserved**
   ```sql
   -- Verify other fields unchanged
   SELECT 
     id,
     userId,
     type,
     title,
     message,
     link,
     read,
     createdAt,
     updatedAt
   FROM Notifications 
   WHERE id = 5;
   ```

6. **Query Next Polling Response**
   ```bash
   # On frontend, trigger new poll (or wait 30 seconds)
   # Check Network tab for /api/notifications response
   # Notification should NOT appear (read=1)
   ```

**Expected Result**: ✅ Database correctly updated with read flag and timestamp

---

### 4.2 Verify Notification Removed from Unread List

**Test Objective**: Ensure marked-as-read notifications don't appear in unread queries

**Verification Steps**:

1. **Get Initial Unread Count**
   ```sql
   SELECT COUNT(*) as unread_count 
   FROM Notifications 
   WHERE userId = 123 AND read = 0;
   
   -- Should show: 5
   ```

2. **Mark One Notification as Read** (via UI)

3. **Verify Count Decreased**
   ```sql
   SELECT COUNT(*) as unread_count 
   FROM Notifications 
   WHERE userId = 123 AND read = 0;
   
   -- Should show: 4
   ```

4. **Verify Querying Unread Only Returns Unread**
   ```sql
   SELECT id, title, read 
   FROM Notifications 
   WHERE userId = 123 AND read = 0;
   
   -- Should show 4 records, all with read=0
   -- Previously marked notification should NOT appear
   ```

5. **Verify Read Notifications Exist Separately**
   ```sql
   SELECT id, title, read 
   FROM Notifications 
   WHERE userId = 123 AND read = 1;
   
   -- Should include the marked notification
   ```

6. **Check Notification Fetch API Excludes Read**
   ```bash
   TOKEN="your_jwt_token"
   
   curl -X GET "http://localhost:5000/api/notifications?read=unread" \
     -H "Authorization: Bearer $TOKEN"
   
   # Response should NOT include marked notification
   ```

**Expected Result**: ✅ Marked notifications correctly excluded from unread queries

---

## Scenario 5: Real-Time Feedback

### 5.1 Test Subscription Upgrade Notification

**Test Objective**: Verify notification appears when user upgrades to premium

**Prerequisites**:
- User not yet premium
- Payment system working
- Frontend running

**Test Steps**:

1. **Check Initial State**
   ```sql
   SELECT isPremium, premiumExpiryDate 
   FROM Users 
   WHERE id = 123;
   
   -- Should show: isPremium=0 (not premium)
   ```

2. **Note Current Badge Count**
   - Observe badge number in navbar

3. **Complete Payment for Premium**
   - Navigate to /premium-checkout
   - Select a plan (e.g., "AI Help - $49.99")
   - Complete Stripe payment with test card: 4242 4242 4242 4242

4. **Wait for Notification**
   - Watch badge count
   - Should increase within 30 seconds

5. **Verify Notification Content**
   - Open dropdown
   - Should see: "Premium Subscription Active"
   - Message: "Your [Feature] premium subscription is now active!"
   - Type icon: 💳
   - Type label: "subscription"

6. **Verify Database Updated**
   ```sql
   SELECT 
     u.id, u.isPremium, u.premiumExpiryDate,
     n.id, n.type, n.title, n.read
   FROM Users u
   LEFT JOIN Notifications n ON u.id = n.userId
   WHERE u.id = 123
   ORDER BY n.createdAt DESC;
   
   -- Should show:
   -- User: isPremium=1, premiumExpiryDate=(30 days from now)
   -- Notification: type='subscription', title='Premium Subscription Active', read=0
   ```

7. **Verify Link Navigation**
   - Click notification
   - Should navigate to /profile
   - Should show premium status and expiry date

**Expected Result**: ✅ Subscription notification appears and links correctly

---

### 5.2 Test New AI Recommendation Notification

**Test Objective**: Verify notification appears for new AI recommendations

**Prerequisites**:
- AI recommendation system creating notifications
- User profile completed

**Test Steps**:

1. **Create AI Recommendation** (via API)
   ```bash
   TOKEN="your_jwt_token"
   
   curl -X POST http://localhost:5000/api/notifications/create \
     -H "Content-Type: application/json" \
     -d '{
           "userId": 123,
           "type": "ai",
           "title": "New AI Recommendation",
           "message": "We found a great match: MIT Computer Science",
           "link": "/recommendations/5"
         }'
   ```

2. **Wait for Next Poll** (max 30 seconds)
   - Watch badge count

3. **Verify Notification Appears**
   - Open dropdown
   - Check for notification with AI icon (🤖)
   - Verify title and message

4. **Test Link Navigation**
   - Click notification
   - Should navigate to /recommendations/5
   - Page should load recommendation details

5. **Check Database**
   ```sql
   SELECT * FROM Notifications 
   WHERE userId = 123 AND type = 'ai' 
   ORDER BY createdAt DESC;
   ```

**Expected Result**: ✅ AI recommendation notification displays and navigates

---

### 5.3 Test Application Status Update Notification

**Test Objective**: Verify notification for application status changes

**Prerequisites**:
- User has submitted applications
- Application status updated

**Test Steps**:

1. **Create Application Update Notification**
   ```bash
   curl -X POST http://localhost:5000/api/notifications/create \
     -H "Content-Type: application/json" \
     -d '{
           "userId": 123,
           "type": "application",
           "title": "Your Application Was Updated",
           "message": "Status update on your application to Harvard University.",
           "link": "/applications/2"
         }'
   ```

2. **Wait for Notification to Appear**
   - Should appear within 30 seconds

3. **Verify Notification Content**
   - Icon: 📋
   - Type: application
   - Title: "Your Application Was Updated"

4. **Navigate via Link**
   - Click notification
   - Should go to /applications/2
   - Show application details

**Expected Result**: ✅ Application notification displays correctly

---

### 5.4 Test Visa Outcome Notification

**Test Objective**: Verify notification for visa outcome updates

**Test Steps**:

1. **Create Visa Outcome Notification**
   ```bash
   curl -X POST http://localhost:5000/api/notifications/create \
     -H "Content-Type: application/json" \
     -d '{
           "userId": 123,
           "type": "visa",
           "title": "Visa Outcome Updated",
           "message": "Your visa outcome has been updated.",
           "link": "/visa-outcome"
         }'
   ```

2. **Observer Notification**
   - Should appear in dropdown
   - Icon: 📋

3. **Verify Visa Page Navigation**
   - Click notification
   - Should navigate to /visa-outcome

**Expected Result**: ✅ Visa notification displays and links correctly

---

## Scenario 6: Admin Updates

### 6.1 Test Admin Creates New Country Notification

**Test Objective**: Verify all users notified when admin adds new country

**Prerequisites**:
- Admin account accessible
- Multiple users in system

**Test Setup**:

1. **Login as Admin**
   ```bash
   curl -X POST http://localhost:5000/api/auth/admin-login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@futurewings.com","password":"Admin@1234"}'
   ```

2. **Get List of All Users** (optional verification)
   ```sql
   SELECT COUNT(*) as total_users FROM Users WHERE role = 'student';
   -- Should show multiple users
   ```

3. **Add New Country** (via Admin API)
   ```bash
   ADMIN_TOKEN="admin_jwt_token"
   
   curl -X POST http://localhost:5000/api/countries \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "New Zealand",
           "description": "Study Down Under",
           "studentVisa": true,
           "workVisa": true
         }'
   ```

4. **Verify Notifications Created for All Users**
   ```sql
   SELECT 
     COUNT(DISTINCT userId) as users_notified,
     type,
     title
   FROM Notifications 
   WHERE type = 'admin-update'
   AND title LIKE '%New Zealand%'
   AND createdAt > DATEADD(MINUTE, -1, GETUTCDATE());
   
   -- Should show: users_notified > 1, recent timestamp
   ```

5. **Verify Each User Receives Notification**
   ```sql
   SELECT 
     userId,
     title,
     message,
     createdAt
   FROM Notifications 
   WHERE type = 'admin-update'
   AND createdAt > DATEADD(MINUTE, -5, GETUTCDATE());
   ```

6. **Check Frontend for Each Test User**
   - Login as test@futurewings.com
   - Check for admin-update notification
   - Should show new country addition

**Expected Result**: ✅ All users receive notification of new country

---

### 6.2 Test Admin Updates Existing Data Notification

**Test Objective**: Verify users notified when admin modifies existing data

**Test Steps**:

1. **Admin Updates University Details**
   ```bash
   ADMIN_TOKEN="admin_jwt_token"
   
   curl -X PUT http://localhost:5000/api/universities/1 \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Harvard University",
           "description": "Updated description",
           "tuitionFee": 50000
         }'
   ```

2. **Trigger Notification** (if auto-trigger not implemented)
   ```bash
   curl -X POST http://localhost:5000/api/notifications/create \
     -H "Content-Type: application/json" \
     -d '{
           "userId": 123,
           "type": "admin-update",
           "title": "University Information Updated",
           "message": "Harvard University details have been updated.",
           "link": "/universities/1"
         }'
   ```

3. **Verify Notification Appears**
   - All users should see it in next poll
   - Icon: ⚙️
   - Type: admin-update

4. **Test Navigation**
   - Click notification
   - Should go to updated resource

**Expected Result**: ✅ Admin updates trigger notifications for all users

---

## 🔧 Backend API Testing

### Complete API Reference

#### 1. GET /api/notifications
**Fetch unread notifications for user**

```bash
curl -X GET "http://localhost:5000/api/notifications?limit=10&offset=0&read=unread" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Query Parameters**:
- `limit` (default: 20) - Number of notifications to fetch
- `offset` (default: 0) - Pagination offset
- `read` (default: "unread") - Filter by read status ("unread" or "all")

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "total": 5,
    "limit": 10,
    "offset": 0
  }
}
```

---

#### 2. GET /api/notifications/count
**Get count of unread notifications**

```bash
curl -X GET http://localhost:5000/api/notifications/count \
  -H "Authorization: Bearer $TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

#### 3. GET /api/notifications/:id
**Get specific notification by ID**

```bash
curl -X GET http://localhost:5000/api/notifications/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Response**:
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
    "read": false,
    "createdAt": "2026-04-12T10:30:00Z",
    "updatedAt": "2026-04-12T10:30:00Z"
  }
}
```

---

#### 4. POST /api/notifications/:id/read
**Mark notification as read**

```bash
curl -X POST http://localhost:5000/api/notifications/1/read \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "read": true,
    "updatedAt": "2026-04-12T10:35:00Z"
  },
  "message": "Notification marked as read"
}
```

---

#### 5. POST /api/notifications/mark-all/read
**Mark all unread notifications as read**

```bash
curl -X POST http://localhost:5000/api/notifications/mark-all/read \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "count": 5
  },
  "message": "5 notifications marked as read"
}
```

---

#### 6. DELETE /api/notifications/:id
**Delete a specific notification**

```bash
curl -X DELETE http://localhost:5000/api/notifications/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": null,
  "message": "Notification deleted"
}
```

---

#### 7. DELETE /api/notifications/clear/all
**Delete all notifications for user**

```bash
curl -X DELETE http://localhost:5000/api/notifications/clear/all \
  -H "Authorization: Bearer $TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "count": 10
  },
  "message": "10 notifications deleted"
}
```

---

#### 8. POST /api/notifications/create
**Create notification (internal use)**

```bash
curl -X POST http://localhost:5000/api/notifications/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "type": "subscription",
    "title": "Premium Subscription Active",
    "message": "Your AI Help premium subscription is now active!",
    "link": "/profile"
  }'
```

**Response**:
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
    "read": false,
    "createdAt": "2026-04-12T10:30:00Z"
  },
  "message": "Notification created",
  "statusCode": 201
}
```

---

## 🖥️ Frontend Testing

### Components to Test

#### 1. NotificationBadge Component
**Location**: `frontend/src/components/NotificationCenter.jsx`

**Test**:
```javascript
// Check badge displays unread count
- Badge visible when unreadCount > 0
- Badge hidden when unreadCount = 0
- Badge shows "9+" when unreadCount > 9
- Badge color is red
- Badge updates when notifications change
```

#### 2. NotificationDropdown Component
**Location**: `frontend/src/components/NotificationCenter.jsx`

**Test**:
```javascript
// Check dropdown functionality
- Opens when icon clicked
- Closes when icon clicked again
- Lists all unread notifications
- Shows "Mark all as read" button
- Shows "View all notifications →" link
- Click notification marks it as read
- Delete button removes notification
- Shows "No notifications" when empty
```

#### 3. NotificationCenter (Full Page)
**Location**: `frontend/src/pages/Notifications.jsx`

**Test**:
```javascript
// Check full notification page
- Route: /notifications
- Shows all notifications (read and unread)
- Filter tabs work (All, Subscriptions, Visa, AI, Recommendations)
- Pagination works (if > 20 notifications)
- Mark as read functionality works
- Delete button removes notifications
- Search/filter feature works
```

#### 4. NotificationPoller Hook
**Location**: `frontend/src/components/NotificationCenter.jsx`

**Test**:
```javascript
// Check polling mechanism
- Polls every 30 seconds
- Fetches unread count
- Updates state correctly
- Handles errors gracefully
- Cleans up on unmount
- Works with React context
```

### Manual Frontend Tests

**Test 1: Badge Display**
```
Steps:
1. Login as test user
2. Check navbar for badge
3. If no notifications: badge should not show
4. Create notification via API
5. After 30 seconds: badge should appear
6. Badge number should match unread count
```

**Test 2: Dropdown Interaction**
```
Steps:
1. Click notification icon
2. Dropdown should open instantly
3. Should show list of notifications
4. Click notification → should mark as read
5. Badge count should decrease
6. Click again → dropdown should close
```

**Test 3: Full Page View**
```
Steps:
1. Click "View all notifications →"
2. Navigate to /notifications
3. Should show ALL notifications (read + unread)
4. Test filter tabs
5. Test mark as read
6. Test delete
```

**Test 4: Real-time Updates**
```
Steps:
1. Have frontend open with notification dropdown
2. In API/terminal: Create new notification
3. Wait max 30 seconds (next poll)
4. New notification should appear in dropdown
5. Badge should increase
```

---

## 📊 Database Verification

### Key SQL Queries

See: `NOTIFICATION_DATABASE_QUERIES.sql` for complete database verification queries

**Quick Verification**:

```sql
-- Check notification count
SELECT COUNT(*) as total FROM Notifications;

-- Check unread by user
SELECT userId, COUNT(*) as unread_count
FROM Notifications
WHERE read = 0
GROUP BY userId;

-- Check by type
SELECT type, COUNT(*) as count
FROM Notifications
GROUP BY type;

-- Check recent notifications
SELECT TOP 10 id, userId, type, title, read, createdAt
FROM Notifications
ORDER BY createdAt DESC;

-- Verify database structure
EXEC sp_help 'Notifications';
```

---

## 📈 Performance Testing

### Load Testing Parameters

```
Scenario: 100 concurrent users polling every 30 seconds

Expected Metrics:
- API Response Time: < 200ms
- Database Query: < 100ms
- Network Latency: < 100ms
- Error Rate: < 1%
- Throughput: > 300 requests/second
```

### Performance Queries

```sql
-- Check query performance
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

SELECT * FROM Notifications
WHERE userId = 123 AND read = 0
ORDER BY createdAt DESC
LIMIT 20;

-- Should complete in < 100ms
-- Monitor: Reads, CPU, IO

-- Create index if missing
CREATE INDEX idx_notifications_userid_read 
ON Notifications(userId, read, createdAt DESC);
```

---

## 🐛 Debugging Guide

### Common Issues & Solutions

#### Issue 1: Notifications Not Appearing

**Symptoms**:
- Frontend shows badge but no dropdown notifications
- API returns empty array

**Debugging Steps**:

1. **Check Database has data**
   ```sql
   SELECT * FROM Notifications WHERE userId = 123;
   ```

2. **Verify JWT Token Valid**
   ```bash
   # Check token in browser
   localStorage.getItem('token')
   
   # Decode at jwt.io
   ```

3. **Check Auth Middleware**
   ```javascript
   // In browser console:
   fetch('http://localhost:5000/api/notifications', {
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('token')}`
     }
   }).then(r => r.json()).then(d => console.log(d))
   ```

4. **Check API Response**
   ```bash
   TOKEN="your_token"
   curl -X GET http://localhost:5000/api/notifications \
     -H "Authorization: Bearer $TOKEN" \
     -v  # verbose to see full response
   ```

5. **Check Console Errors**
   - Open DevTools F12
   - Network tab: check for 401, 403, 500 errors
   - Console tab: check for JavaScript errors

---

#### Issue 2: Polling Not Going Off

**Symptoms**:
- No network requests every 30 seconds
- Notifications not updating

**Debugging Steps**:

1. **Check Component Mounted**
   ```javascript
   // In browser console:
   R__REACT_INTERNAL_MANAGER__[''].memoizedState  // Check React state
   ```

2. **Verify NotificationPoller Wraps App**
   ```javascript
   // Check App.jsx includes:
   // <NotificationPoller><App /></NotificationPoller>
   ```

3. **Monitor Polling with DevTools**
   ```
   1. Open Network tab
   2. Filter: /api/notifications
   3. Leave page open for 40 seconds
   4. Should see 2 requests (T0 and T~30)
   ```

4. **Check for Console Errors**
   - Look for auth errors
   - Check for network errors
   - Verify no JavaScript exceptions

5. **Manually Trigger Poll**
   ```javascript
   // In browser console (requires access to context):
   // This depends on how context is exposed
   ```

---

#### Issue 3: Mark as Read Not Working

**Symptoms**:
- Click notification but doesn't mark as read
- Badge count doesn't update
- Database not updated

**Debugging Steps**:

1. **Check API Response**
   ```bash
   TOKEN="your_token"
   curl -X POST http://localhost:5000/api/notifications/1/read \
     -H "Authorization: Bearer $TOKEN" \
     -v
   ```

2. **Check Database Change**
   ```sql
   SELECT * FROM Notifications WHERE id = 1;
   -- Check if read status changed
   ```

3. **Check UI State Management**
   ```javascript
   // In browser console during click:
   // Monitor state changes in React DevTools
   ```

4. **Verify Ownership Check**
   ```javascript
   // Backend checks if notification.userId === req.auth.userId
   // Ensure correct user is logged in
   ```

---

#### Issue 4: High Response Times

**Symptoms**:
- Polling requests take > 1 second
- UI feels slow

**Optimization Steps**:

1. **Add Database Index**
   ```sql
   CREATE INDEX idx_notifications_userid_read_createdAt
   ON Notifications(userId, read, createdAt DESC);
   ```

2. **Reduce Polling Frequency** (if acceptable)
   ```javascript
   // In NotificationCenter.jsx, change from 30000 to 60000 (60 seconds)
   setInterval(() => {
     fetchNotifications();
   }, 60000);  // Reduced frequency
   ```

3. **Implement Pagination**
   ```javascript
   // Fetch fewer notifications per request
   const data = await fetchUnreadNotifications(10, 0);  // Only 10 instead of 20
   ```

4. **Cache Results**
   ```javascript
   // Consider Redis caching for count
   // Reduces database queries on every poll
   ```

---

### Browser Console Commands for Testing

```javascript
// Copy and paste into browser console while logged in

// 1. Get current user ID
const token = localStorage.getItem('token');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('User ID:', decoded.userId);

// 2. Fetch notifications manually
fetch('/api/notifications?limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(r => r.json()).then(d => console.log(d));

// 3. Get unread count
fetch('/api/notifications/count', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(r => r.json()).then(d => console.log(d));

// 4. Create test notification
fetch('/api/notifications/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 123,
    type: 'subscription',
    title: 'Test Notification',
    message': 'This is a test'
  })
}).then(r => r.json()).then(d => console.log(d));

// 5. Mark notification as read
fetch('/api/notifications/1/read', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(d => console.log(d));
```

---

## ✔️ Test Completion Checklist

- [ ] **Notification Fetching Tests**
  - [ ] Backend API returns unread notifications
  - [ ] Frontend displays notifications correctly
  - [ ] Pagination works (limit/offset)
  - [ ] Filter options work (read/unread)

- [ ] **Polling Tests**
  - [ ] Frontend polls every 30 seconds
  - [ ] New notifications appear after poll
  - [ ] Network requests show correct parameters
  - [ ] No API errors during polling

- [ ] **Mark as Read Tests**
  - [ ] Single notification mark as read works
  - [ ] Database updated with read flag
  - [ ] Badge count decreases
  - [ ] Notification removed from unread list
  - [ ] Mark all as read works

- [ ] **Database Tests**
  - [ ] Read flag updates correctly
  - [ ] Timestamps updated
  - [ ] Notifications removed from unread queries
  - [ ] All fields preserved during updates
  - [ ] No orphaned records

- [ ] **Real-Time Tests**
  - [ ] Subscription notification works
  - [ ] AI recommendation notification works
  - [ ] Application update notification works
  - [ ] Visa outcome notification works
  - [ ] Links in notifications navigate correctly

- [ ] **Admin Update Tests**
  - [ ] New country creates notifications for all users
  - [ ] Data updates create notifications
  - [ ] All users receive same notification
  - [ ] Admin-update type displays correctly

- [ ] **Error Handling Tests**
  - [ ] 401 Unauthorized handled
  - [ ] 403 Forbidden handled
  - [ ] 404 Not Found handled
  - [ ] 500 Server Error handled

- [ ] **Performance Tests**
  - [ ] API response time < 200ms
  - [ ] Database query < 100ms
  - [ ] No memory leaks in polling
  - [ ] Handles 100+ concurrent users

---

## 📞 Support & Issues

**For Problems**: Create database queries and logs from `NOTIFICATION_DATABASE_QUERIES.sql` and `NOTIFICATION_API_TEST.js`

**Error Logs Location**:
- Backend: `backend/logs/` (if logging configured)
- Frontend: Browser Console (F12)
- Database: Azure SQL Activity Log

---

**Document Version**: 1.0  
**Last Updated**: April 12, 2026  
**Status**: Complete Testing Guide Ready
