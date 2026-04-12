# Notification System Testing - Quick Reference Guide

**Print this guide for quick access during testing!**

---

## 🚀 Quick Start

### Prerequisites
- Backend: `http://localhost:5000` ✓
- Frontend: `http://localhost:3002` ✓
- Test User: `test@futurewings.com / Test@1234`
- Tools: Postman, Browser DevTools, SQL Manager

---

## 📋 Test Checklist

### Test Suite 1: Notification Fetching (5 mins)
- [ ] API returns unread notifications: `GET /api/notifications`
- [ ] Badge shows correct count
- [ ] Pagination works (limit=10, offset=0)
- [ ] All notifications show `read: false`
- [ ] Dropdown displays notifications correctly

### Test Suite 2: Polling Mechanism (5 mins)
- [ ] DevTools shows request every ~30 seconds
- [ ] New notifications appear after poll
- [ ] Response time < 200ms
- [ ] No CORS or auth errors

### Test Suite 3: Mark as Read (5 mins)
- [ ] Single notification marked as read
- [ ] Badge count decreases
- [ ] UI updates immediately
- [ ] Notification removed from unread list
- [ ] Mark all as read works

### Test Suite 4: Database Verification (5 mins)
- [ ] Read flag updated in DB
- [ ] Timestamp updated
- [ ] Query returns 0 unread for that user
- [ ] No orphaned records

### Test Suite 5: Real-Time Notifications (5 mins)
- [ ] Subscription notification triggers
- [ ] AI recommendation notification appears
- [ ] Application update shows correctly
- [ ] Visa outcome notification works

### Test Suite 6: Admin Updates (5 mins)
- [ ] Admin-triggered notification sent to all users
- [ ] Multiple users receive same notification
- [ ] Type shows as "admin-update"

### Test Suite 7: Error Handling (3 mins)
- [ ] 401 error with invalid token
- [ ] 404 error with invalid ID
- [ ] 500 handled gracefully

---

## 🔑 Key Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/notifications` | Fetch unread | Yes |
| GET | `/api/notifications/count` | Get count | Yes |
| GET | `/api/notifications/:id` | Get one | Yes |
| POST | `/api/notifications/:id/read` | Mark read | Yes |
| POST | `/api/notifications/mark-all/read` | Mark all | Yes |
| DELETE | `/api/notifications/:id` | Delete | Yes |
| DELETE | `/api/notifications/clear/all` | Clear all | Yes |
| POST | `/api/notifications/create` | Create | No |

---

## 📊 SQL Quick Queries

```sql
-- Count total
SELECT COUNT(*) FROM Notifications;

-- Count unread
SELECT COUNT(*) FROM Notifications WHERE read = 0;

-- For test user
SELECT * FROM Notifications WHERE userId = 123 ORDER BY id DESC;

-- Check by type
SELECT type, COUNT(*) FROM Notifications GROUP BY type;

-- Recent notifications
SELECT TOP 10 id, title, read, createdAt FROM Notifications ORDER BY id DESC;
```

---

## 🌐 Frontend Testing Paths

| Feature | URL | Expected |
|---------|-----|----------|
| Navbar Badge | Any page | Shows count if > 0 |
| Dropdown | Click icon | Opens dropdown, lists notifications |
| Full Page | `/notifications` | Shows all (read + unread) |
| Links | Click notif | Navigates to `notification.link` |

---

## ⏱️ Polling Verification Steps

1. **Open DevTools** → F12
2. **Go to Network Tab**
3. **Filter**: `/api/notifications`
4. **Clear** history (Ctrl+L)
5. **Wait 35 seconds**
6. **Observe**: New GET request should appear
7. **Check**: Status 200, response has notifications

---

## 🧪 Create Test Notifications (via Postman/curl)

### Subscription Notification
```json
{
  "userId": 123,
  "type": "subscription",
  "title": "Premium Subscription Active",
  "message": "Your AI Help premium subscription is now active!",
  "link": "/profile"
}
```

### AI Recommendation
```json
{
  "userId": 123,
  "type": "ai",
  "title": "New AI Recommendation",
  "message": "We found a great match: MIT Computer Science",
  "link": "/recommendations/5"
}
```

### Visa Outcome
```json
{
  "userId": 123,
  "type": "visa",
  "title": "Visa Outcome Updated",
  "message": "Your visa outcome has been updated.",
  "link": "/visa-outcome"
}
```

### Application Update
```json
{
  "userId": 123,
  "type": "application",
  "title": "Your Application Was Updated",
  "message": "Status update on your application to Harvard University.",
  "link": "/applications/2"
}
```

### Admin Update (Broadcast)
```json
{
  "userId": 123,
  "type": "admin-update",
  "title": "New Country Added",
  "message": "Check out New Zealand!",
  "link": "/countries"
}
```

---

## 🐛 Quick Debugging

**Notifications not showing?**
1. Check token: `localStorage.getItem('token')`
2. Check DB: `SELECT * FROM Notifications WHERE userId = 123;`
3. Check console: F12 → Console tab for errors
4. Check network: DevTools → Network → filter `/api/notifications`

**Polling not working?**
1. DevTools → Network → filter `/api/notifications`
2. Leave page open 40 seconds
3. Should see 2+ requests
4. Check for 401 errors

**Not marked as read?**
1. Check request: Network tab → POST to `/:id/read`
2. Check response: Should return `read: true`
3. Check DB: `SELECT * FROM Notifications WHERE id = X;`

---

## 📈 Expected Metrics

| Metric | Expected | Status |
|--------|----------|--------|
| API Response Time | < 200ms | ✓ |
| Database Query | < 100ms | ✓ |
| Polling Interval | ~30s | ✓ |
| Badge Updates | < 1s | ✓ |
| Error Rate | < 1% | ✓ |

---

## 🎯 Test Scenarios - 30 Min Sprint

**Total Time: 30 minutes**

| Time | Task | Status |
|------|------|--------|
| 0-5 | Notification Fetching | ⏱ |
| 5-10 | Polling Mechanism | ⏱ |
| 10-15 | Mark as Read | ⏱ |
| 15-20 | Database Verification | ⏱ |
| 20-25 | Real-Time Updates | ⏱ |
| 25-30 | Admin Updates + Errors | ⏱ |

---

## 🔗 Useful Resources

- **Testing Guide**: `NOTIFICATION_TESTING_GUIDE.md`
- **Database Queries**: `NOTIFICATION_DATABASE_QUERIES.sql`
- **API Tests**: `NOTIFICATION_API_TEST.js`
- **Postman Collection**: `NOTIFICATION_POSTMAN_COLLECTION.json`

---

## 📱 Browser Console Commands

```javascript
// Get JWT token
localStorage.getItem('token')

// Fetch notifications
fetch('/api/notifications', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
}).then(r => r.json()).then(d => console.log(d))

// Get unread count
fetch('/api/notifications/count', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
}).then(r => r.json()).then(d => console.log(d))

// Mark as read
fetch('/api/notifications/1/read', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
}).then(r => r.json()).then(d => console.log(d))
```

---

## ✅ Final Checklist

- [ ] All 7 test suites completed
- [ ] 0 test failures
- [ ] No CORS errors
- [ ] No 401/403 errors
- [ ] Database verified
- [ ] Performance metrics acceptable
- [ ] Documentation complete
- [ ] Ready for production

---

## 📞 Support

**Issues?**
1. Check error message in DevTools Console
2. Verify JWT token is valid
3. Check database connection
4. Review logs in backend terminal
5. Consult main testing guide

---

**Last Updated**: April 12, 2026  
**Status**: ✅ Ready for Testing  
**Approver**: QA Lead
