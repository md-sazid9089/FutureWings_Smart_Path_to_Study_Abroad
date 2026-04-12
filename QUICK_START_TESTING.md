# 🚀 Notification Testing - Quick Execution Guide

## Choose Your Method

### **OPTION A: Fastest (5 minutes)**
You are on Windows → Run this now:

```batch
cd e:\sd\database\FutureWings_Smart_Path_to_Study_Abroad
notification_test.bat
```

**What happens:**
1. Script launches
2. Logs in with test user
3. Runs 12 automated tests
4. Shows results (PASS/FAIL)
5. Auto-cleanup

**Expected output example:**
```
============================================================================
TEST SUMMARY
============================================================================

Total Tests: 12
Passed: 12
Failed: 0
Success Rate: 100%

[+] ALL TESTS PASSED
```

---

### **OPTION B: Visual (20 minutes)**

**Step 1: Import Postman Collection**
1. Open Postman desktop app
2. Click File → Import
3. Select: `NOTIFICATION_POSTMAN_COLLECTION.json`
4. Click "Import"

**Step 2: Run All Tests**
1. Click collection folder "FutureWings Notifications"
2. Click arrow → "Run"
3. Click "Run Notification Tests"
4. Wait for all requests to complete

**Step 3: Review Results**
- Green checkmarks = PASSING
- Red X = FAILING
- Each request shows: Status, Response Time, Test Results

---

### **OPTION C: Manual cURL (30 minutes)**

**Step 1: Get Test Token**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@futurewings.com\",\"password\":\"Test@1234\"}"
```

**Save the token from response (looks like):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Set `TOKEN=your_token_here`

**Step 2: Test Each Endpoint**

**a) Get Notifications:**
```bash
curl -X GET "http://localhost:5000/api/notifications?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**b) Get Count:**
```bash
curl -X GET "http://localhost:5000/api/notifications/count" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**c) Mark as Read (use ID from step 2a):**
```bash
NOTIF_ID=123  # Replace with actual ID
curl -X POST "http://localhost:5000/api/notifications/$NOTIF_ID/read" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**d) Test Error (should return 404):**
```bash
curl -X POST "http://localhost:5000/api/notifications/99999/read" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

### **OPTION D: Comprehensive (90 minutes)**

Follow: `NOTIFICATION_API_ENDPOINT_TESTING.md`

**Includes:**
- 5 detailed test scenarios
- Database verification with SQL
- Expected responses for each HTTP status
- Troubleshooting guide
- Professional test report template

---

## ✅ Pre-Flight Checklist

Before starting, verify:

```bash
# 1. Backend running?
curl http://localhost:5000/api/health
# Expected: 200 OK response (or {"message":"ok"})

# 2. Database connected?
# Check backend/.env contains:
# - DATABASE_URL with valid connection string
# - JWT_SECRET set

# 3. Test user exists?
# Login should work with: test@futurewings.com / Test@1234
```

---

## 🎬 Running the Tests (Windows)

**STEP 1: Open Command Prompt**
```
Press Windows Key → Type: cmd → Press Enter
```

**STEP 2: Navigate to project**
```bash
cd e:\sd\database\FutureWings_Smart_Path_to_Study_Abroad
```

**STEP 3: Run the test**
```batch
notification_test.bat
```

**STEP 4: Watch the output**
- Should show "TEST 1: AUTHENTICATION" → [+] SUCCESS
- Should show "TEST 2: GET /api/notifications → [+] SUCCESS"
- ... and so on for all 12 tests
- Should end with "[+] ALL TESTS PASSED"

---

## 🎬 Running the Tests (Linux/Mac)

**STEP 1: Open Terminal**

**STEP 2: Navigate to project**
```bash
cd /path/to/FutureWings_Smart_Path_to_Study_Abroad
```

**STEP 3: Make script executable**
```bash
chmod +x notification_test.sh
```

**STEP 4: Run the test**
```bash
./notification_test.sh
```

---

## 📊 Reading Test Results

### **When Tests PASS ✅**

```
TEST 1: AUTHENTICATION
[+] SUCCESS: Authentication successful
[i] User ID: 123
[i] Token obtained (length: 256)

TEST 2: GET /api/notifications
[+] SUCCESS: GET /api/notifications returned data
[i] Total unread notifications: 5
[i] First notification ID: 456
```

**Meaning:** Endpoint returned expected response, data is valid

---

### **When Tests FAIL ❌**

```
TEST 1: AUTHENTICATION
[-] FAILED: Authentication failed
Error: 401 Unauthorized
```

**Next Steps:**
1. Check backend is running: `npm start` in backend/
2. Verify test user exists
3. Check `.env` credentials
4. See Troubleshooting section below

---

## 🔧 Quick Troubleshooting

### **Problem: "Backend server not responding"**
```bash
# Solution: Start backend
cd backend
npm install
npm start
# Wait ~10 seconds until "Server running on port 5000"
```

### **Problem: "Authentication failed (401)"**
```bash
# Solution 1: Check env variables
type backend\.env | find "JWT_SECRET"

# Solution 2: Verify test user in database
# (Contact admin or check database directly)
```

### **Problem: "Notification not found (404)"**
- This might be expected if there are no notifications
- Script creates test notification automatically
- If still failing, check database has data

### **Problem: "Connection refused"**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# If yes, kill the process:
taskkill /PID [PID_NUMBER] /F

# Then restart:
cd backend && npm start
```

---

## 📝 Saving Test Results

### **Windows: Save to file**
```batch
notification_test.bat > test_results.txt 2>&1
```

### **Linux/Mac: Save to file**
```bash
./notification_test.sh | tee test_results.txt
```

---

## 🎯 Success Criteria

You're done when you see:

```
============================================================================
TEST SUMMARY
============================================================================

Total Tests: 12
Passed: 12
Failed: 0
Success Rate: 100%

[+] ALL TESTS PASSED
```

Then press any key to exit.

---

## 📋 If Some Tests Fail

1. **Run again** - Sometimes network issues
2. **Check backend logs** - See `npm start` output
3. **Check database** - Is Azure SQL connected?
4. **Read the error message** - Usually tells what's wrong
5. **Refer to troubleshooting section** - See above

---

## 🚦 Traffic Light Summary

| Result | What to Do |
|--------|-----------|
| 🟢 **All 12 PASS** | ✅ Great! System is working. Ready for production. |
| 🟡 **10-11 PASS, 1-2 FAIL** | Review which tests failed. Usually minor config issue. |
| 🔴 **Less than 10 PASS** | Check backend is running and database is connected. |

---

## 📚 For More Details

- **Quick reference:** `NOTIFICATION_QUICK_REFERENCE.md` (1 page)
- **Detailed procedures:** `NOTIFICATION_API_ENDPOINT_TESTING.md` (750+ lines)
- **Complete guide:** `NOTIFICATION_TESTING_GUIDE.md` (2000+ lines)
- **Database queries:** `NOTIFICATION_DATABASE_QUERIES.sql` (400+ queries)
- **Full package overview:** `NOTIFICATION_TEST_README.md`

---

## ⏰ Estimated Times

- **Fastest:** Automated script = 5 minutes
- **Quickest Visual:** Postman = 20 minutes
- **Manual:** cURL commands = 30 minutes
- **Thorough:** Complete step-by-step = 90 minutes

---

## 🎓 What Each Test Verifies

| Test # | What It Tests | Why It Matters |
|--------|---------------|----------------|
| 1 | Authentication | Can users log in? |
| 2 | GET notifications | Can we fetch data? |
| 3 | GET count | Is count calculation correct? |
| 4 | Mark as read | Does database update? |
| 5 | Mark all read | Does batch operation work? |
| 6 | Error 404 | Does system handle missing IDs? |
| 7 | Error 401 no auth | Does system require login? |
| 8 | Error 401 bad token | Does system validate tokens? |
| 9 | Response time | Is system performant? |
| 10 | Pagination | Can we limit results? |
| 11 | Create notification | Can we add new items? |
| 12 | Server health | Is backend running? |

---

**Ready? Start with your preferred option above! 🚀**
