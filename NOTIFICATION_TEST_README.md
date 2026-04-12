# Notification System - Complete Testing Package

## 📋 Quick Start

This package provides everything you need to thoroughly test the FutureWings notification system. Choose your preferred testing method and follow the guide.

### **Option 1: Automated Scripts (Fastest - 5 minutes)**

**Windows Users:**
```batch
notification_test.bat
```

**Linux/Mac Users:**
```bash
bash notification_test.sh
```

**What it does:**
- ✅ Automates all 12 test scenarios
- ✅ Tests authentication, GET, POST, error handling
- ✅ Verifies response structures
- ✅ Measures performance
- ✅ Generates summary report

---

### **Option 2: Postman Collection (Visual - 20 minutes)**

1. Open Postman
2. Import: `NOTIFICATION_POSTMAN_COLLECTION.json`
3. Click "Run" to execute all requests
4. Review test assertions and responses

**Benefits:**
- Visual interface
- Built-in test assertions
- Easy to understand API flow
- Can re-run individual tests

---

### **Option 3: Manual cURL Commands (Detailed - 30 minutes)**

See `NOTIFICATION_QUICK_REFERENCE.md` for step-by-step cURL commands.

**Benefits:**
- Full control
- Learn exact API behavior
- Debug specific issues
- Educational

---

### **Option 4: Manual Step-by-Step (Comprehensive - 90 minutes)**

Follow `NOTIFICATION_API_ENDPOINT_TESTING.md` for detailed procedures.

**Benefits:**
- Understand every step
- Database verification included
- Troubleshooting guidance
- Professional test documentation

---

## 📁 Documentation Files

### **Core Testing Guides**

| File | Purpose | Time | Level |
|------|---------|------|-------|
| `notification_test.bat` | Windows automated script | 5 min | Beginner |
| `notification_test.sh` | Linux/Mac automated script | 5 min | Beginner |
| `NOTIFICATION_QUICK_REFERENCE.md` | cURL commands cheat sheet | 10 min | Intermediate |
| `NOTIFICATION_API_ENDPOINT_TESTING.md` | Detailed step-by-step guide | 90 min | Advanced |
| `NOTIFICATION_POSTMAN_COLLECTION.json` | Postman collection | 20 min | Intermediate |

### **Supporting Reference**

| File | Purpose | Content |
|------|---------|---------|
| `NOTIFICATION_DATABASE_QUERIES.sql` | Database verification | 400+ SQL queries |
| `NOTIFICATION_API_TEST.js` | Node.js automated tests | 12 scenarios |
| `NOTIFICATION_TESTING_GUIDE.md` | Comprehensive guide | 2000+ lines |
| `NOTIFICATION_TESTING_PACKAGE.md` | Package overview | Navigation |

---

## 🧪 What Gets Tested

### **API Endpoints**
- ✅ `GET /api/notifications` - Fetch notifications
- ✅ `GET /api/notifications/count` - Get unread count
- ✅ `GET /api/notifications/:id` - Get single notification
- ✅ `POST /api/notifications/:id/read` - Mark as read
- ✅ `POST /api/notifications/mark-all/read` - Mark all as read
- ✅ `DELETE /api/notifications/:id` - Delete notification
- ✅ `POST /api/notifications/create` - Create notification

### **Test Scenarios (12 Total)**

1. **Authentication** - Login and JWT token
2. **GET Notifications** - Fetch with pagination
3. **GET Count** - Unread count verification
4. **Mark as Read** - Single notification
5. **Mark All as Read** - Batch operation
6. **Error 404** - Invalid notification ID
7. **Error 401** - Missing auth header
8. **Error 401** - Invalid token
9. **Response Time** - Performance check
10. **Pagination** - Limit and offset
11. **Create Notification** - New notification
12. **Server Availability** - Health check

### **Error Handling**
- ✅ 400 Bad Request - Invalid data
- ✅ 401 Unauthorized - Missing/invalid token
- ✅ 403 Forbidden - Access denied
- ✅ 404 Not Found - Resource not found
- ✅ 405 Method Not Allowed
- ✅ 500 Server Error

### **Database Verification**
- ✅ Read flag updates
- ✅ Timestamp changes
- ✅ Data integrity
- ✅ Orphaned records
- ✅ Count consistency

---

## 🚀 How to Run

### **Method 1: Automated Script (RECOMMENDED)**

**Windows:**
```batch
cd e:\sd\database\FutureWings_Smart_Path_to_Study_Abroad
notification_test.bat
```

**Expected Output:**
```
============================================================================
NOTIFICATION SYSTEM - API ENDPOINT TESTING
============================================================================

Backend URL: http://localhost:5000
Test User: test@futurewings.com

============================================================================
TEST 1: AUTHENTICATION
============================================================================

[*] Logging in test user...
[+] SUCCESS: Authentication successful
[i] User ID: 123
[i] Token obtained (length: 256)

[... more tests ...]

============================================================================
TEST SUMMARY
============================================================================

Total Tests: 12
Passed: 12
Failed: 0
Success Rate: 100%

[+] ALL TESTS PASSED
```

**Troubleshooting:**
- If backend not found: Ensure `npm start` is running in backend folder
- If auth fails: Check `.env` file contains correct credentials
- If jq not found: Install jq or use Windows batch version

---

### **Method 2: Postman Collection**

**Steps:**
1. Open Postman
2. Click "File" → "Import"
3. Select `NOTIFICATION_POSTMAN_COLLECTION.json`
4. Click the arrow next to collection name → "Run"
5. Select "Run Notification Tests"
6. View results with built-in assertions

**Features:**
- 30+ pre-configured requests
- Automatic token handling
- Built-in test assertions
- Response validation
- Visual test results

---

### **Method 3: Manual Named cURL**

**Step 1: Extract and store token**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@futurewings.com","password":"Test@1234"}'

# Extract token from response - store as $TOKEN
TOKEN="your_token_here"
```

**Step 2: Test GET endpoint**
```bash
curl -X GET "http://localhost:5000/api/notifications?limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
```

**Step 3: Mark notification as read**
```bash
NOTIF_ID=123  # Replace with actual ID
curl -X POST "http://localhost:5000/api/notifications/$NOTIF_ID/read" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
```

**See `NOTIFICATION_QUICK_REFERENCE.md` for all commands**

---

### **Method 4: Complete Manual Testing**

**Full guide:** `NOTIFICATION_API_ENDPOINT_TESTING.md`

**Includes:**
- 5 detailed test scenarios (20 steps total)
- Validation checklists
- Database verification
- Expected responses
- Troubleshooting guide

**Time required:** ~90 minutes for complete verification

---

## ✅ Pre-Test Checklist

Before running tests, verify:

- [ ] **Backend running**: `npm start` in `backend/` folder (port 5000)
- [ ] **Frontend running**: `npm run dev` in `frontend/` folder (port 3002)
- [ ] **Database accessible**: Azure SQL Server connection verified
- [ ] **Environment variables set**: Check `backend/.env`:
  - [ ] `DATABASE_URL` configured
  - [ ] `JWT_SECRET` set to `"futurewings_jwt_secret_2026"`
  - [ ] `NODE_ENV` is not "production"
- [ ] **Test user account exists**: `test@futurewings.com` / `Test@1234`
- [ ] **Required tools installed**:
  - [ ] cURL (built-in on Windows 10+, Linux, Mac)
  - [ ] jq (for JSON parsing) - install with `brew install jq` or `choco install jq`
  - [ ] Postman (optional, for visual testing)

---

## 📊 Expected Results

### **Minimum Success Criteria**
- ✅ All 12 tests pass
- ✅ All 200 status codes for successful requests
- ✅ All 4xx status codes for error cases
- ✅ Response time < 200ms
- ✅ Database updates verified

### **Performance Benchmarks**
| Operation | Target | Acceptable |
|-----------|--------|------------|
| GET notifications | < 100ms | < 200ms |
| Mark as read | < 50ms | < 100ms |
| Count query | < 50ms | < 100ms |
| Authentication | < 100ms | < 200ms |

---

## 🔧 Troubleshooting

### **Issue: "Backend server not responding"**
**Solution:**
```bash
# Check if server is running
curl http://localhost:5000/api/health

# If not running, start it
cd backend
npm install
npm start
```

### **Issue: "Authentication failed"**
**Solution:**
```bash
# Verify credentials in .env
cat backend/.env | grep "JWT_SECRET"

# Verify test user exists in database
# Check: backend/prisma/schema.prisma - User model
```

### **Issue: "401 Unauthorized"**
**Solution:**
- Verify Bearer token format: `Bearer YOUR_TOKEN`
- Check token is not expired (typical: 24 hours)
- Verify token doesn't have extra spaces or line breaks

### **Issue: "404 Not Found"**
**Solution:**
- Verify notification ID exists: `GET /api/notifications`
- Check notification belongs to logged-in user
- Verify ID is a valid number

### **Issue: "Slow response time"**
**Solution:**
```sql
-- Check database indexes
SELECT * FROM sys.indexes 
WHERE OBJECT_ID = OBJECT_ID('Notifications');

-- Create index if missing
CREATE INDEX idx_userId_read 
ON Notifications(userId, read);
```

---

## 📈 Test Results Template

**Save this template and fill in results:**

```markdown
# Notification System Test Results

**Date:** [DATE]
**Tester:** [TESTER_NAME]
**Backend Version:** [VERSION]
**Frontend Version:** [VERSION]
**Database:** Azure SQL Server

## Test Execution

| Test # | Test Name | Result | Notes |
|--------|-----------|--------|-------|
| 01 | Server Availability | PASS/FAIL | |
| 02 | Authentication | PASS/FAIL | |
| 03 | GET Notifications | PASS/FAIL | |
| 04 | GET Count | PASS/FAIL | |
| 05 | Mark as Read | PASS/FAIL | |
| 06 | Mark All as Read | PASS/FAIL | |
| 07 | Error 404 | PASS/FAIL | |
| 08 | Error 401 (No Auth) | PASS/FAIL | |
| 09 | Error 401 (Bad Token) | PASS/FAIL | |
| 10 | Response Time | PASS/FAIL | |
| 11 | Pagination | PASS/FAIL | |
| 12 | Create Notification | PASS/FAIL | |

## Summary
- Total Tests: 12
- Passed: __/12
- Failed: __/12
- Success Rate: __%

## Performance Metrics
- Avg GET Response Time: __ms
- Avg POST Response Time: __ms
- Avg Error Response Time: __ms

## Issues Found
1. [Description]
2. [Description]

## Sign-Off
- Tested By: ________________
- Date: ________________
- Approved: ________________
```

---

## 🎯 Next Steps After Testing

1. **All Tests Pass? ✅**
   - Move to production deployment
   - Set up monitoring and alerts
   - Configure real-time notifications
   - Test load scenarios

2. **Tests Failed? ❌**
   - Use troubleshooting guide
   - Check `NOTIFICATION_TESTING_GUIDE.md` for solutions
   - Review API logs in backend
   - Verify database state with SQL queries

3. **Performance Issues?**
   - Check database indexes
   - Review API code for optimization
   - Run load testing with higher concurrency
   - Consider caching notifications

---

## 📞 Support

**For detailed guidance:**
- See `NOTIFICATION_TESTING_GUIDE.md` - Comprehensive guide (2000+ lines)
- See `NOTIFICATION_API_ENDPOINT_TESTING.md` - API testing procedures (750+ lines)
- See `NOTIFICATION_DATABASE_QUERIES.sql` - Database verification queries (400+)

**For quick reference:**
- See `NOTIFICATION_QUICK_REFERENCE.md` - One-page cheat sheet

**For automated testing:**
- See `NOTIFICATION_API_TEST.js` - Node.js test script (12 scenarios)

---

## 📝 Files in This Package

```
FutureWings_Smart_Path_to_Study_Abroad/
├── notification_test.bat                    ← Windows automated tests (RUN THIS)
├── notification_test.sh                     ← Linux/Mac tests
├── NOTIFICATION_QUICK_REFERENCE.md          ← cURL commands cheat sheet
├── NOTIFICATION_API_ENDPOINT_TESTING.md     ← Detailed step-by-step (750+ lines)
├── NOTIFICATION_TESTING_GUIDE.md            ← Comprehensive guide (2000+ lines)
├── NOTIFICATION_POSTMAN_COLLECTION.json     ← Postman requests (30+)
├── NOTIFICATION_DATABASE_QUERIES.sql        ← Database queries (400+)
├── NOTIFICATION_API_TEST.js                 ← Automated Node.js tests
├── NOTIFICATION_TESTING_PACKAGE.md          ← Package overview
└── NOTIFICATION_TEST_README.md              ← This file
```

---

## ⏱️ Time Requirements

| Method | Time | Effort | Coverage |
|--------|------|--------|----------|
| Automated Script | 5 min | Minimal | 100% |
| Postman | 20 min | Low | 95% |
| cURL Manual | 30 min | Medium | 80% |
| Full Manual | 90 min | High | 100% |

---

**🚀 Ready to test? Start with: `notification_test.bat` (Windows) or `bash notification_test.sh` (Linux/Mac)**
