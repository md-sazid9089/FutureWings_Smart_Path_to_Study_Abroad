# Notification System Implementation Checklist

## ✅ Backend Implementation Status

### Completed
- [x] Prisma schema updated with Notification model
- [x] Database migration applied: `20260412161145_add_notifications`
- [x] Backend API routes created in `backend/src/routes/notifications.js`
- [x] Routes registered in `server.js`
- [x] Notification utility created: `backend/src/utils/notifications.js`

### To Do
- [ ] Add notification triggers to payments route
- [ ] Add notification triggers to ai-assistant/recommendations route
- [ ] Add notification triggers to applications route
- [ ] Add notification triggers to admin routes (countries, consultancy)
- [ ] Add notification triggers to visa-outcomes route
- [ ] Test all endpoints with Postman/Thunder Client
- [ ] Verify database records are being created

---

## 🎯 Frontend Implementation Status

### Completed
- [x] Notification service layer: `frontend/src/api/notificationService.js`
- [x] Notification components: `frontend/src/components/NotificationCenter.jsx`
- [x] Notifications page: `frontend/src/pages/Notifications.jsx`

### To Do
- [ ] Wrap App component with `NotificationPoller`
- [ ] Import and add `NotificationBadge` to navbar
- [ ] Import and integrate `NotificationDropdown` in navbar
- [ ] Add notifications route to React Router
- [ ] Test notification polling in browser console
- [ ] Verify badge shows unread count
- [ ] Test dropdown functionality
- [ ] Test full notifications page

---

## 📋 Step-by-Step Integration Guide

### Phase 1: Frontend App Setup (30 minutes)

#### Step 1: Wrap App with NotificationPoller
**File**: `frontend/src/App.jsx` or `frontend/src/main.jsx`

```javascript
import { NotificationPoller } from "./components/NotificationCenter";

// Wrap your entire app
function App() {
  return (
    <NotificationPoller>
      {/* Your existing components */}
      <Router>
        {/* routes */}
      </Router>
    </NotificationPoller>
  );
}
```

#### Step 2: Add Notifications Route
**File**: `frontend/src/App.jsx` (in your Router)

```javascript
import Notifications from "./pages/Notifications";

// Add to your routes:
<Route 
  path="/notifications" 
  element={<ProtectedRoute><Notifications /></ProtectedRoute>} 
/>
```

#### Step 3: Update Navbar Component
**File**: `frontend/src/components/Navbar.jsx` (or your navbar component)

Add notification button with badge and dropdown:

```javascript
import { useState } from "react";
import { NotificationBadge, NotificationDropdown } from "./NotificationCenter";

export function Navbar() {
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* Existing navbar items */}

      {/* Add notification button */}
      <div className="relative">
        <button
          onClick={() => setNotificationOpen(!notificationOpen)}
          className="relative p-2 hover:bg-gray-100 rounded-lg transition"
        >
          🔔
          <NotificationBadge className="absolute -top-1 -right-1" />
        </button>

        {/* Dropdown */}
        <NotificationDropdown 
          isOpen={notificationOpen}
          onClose={() => setNotificationOpen(false)}
        />
      </div>

      {/* Link to full page */}
      <Link to="/notifications" className="text-sm text-Gray-600">
        All Notifications
      </Link>
    </nav>
  );
}
```

#### Step 4: Test Frontend Setup
- [ ] Start frontend: `npm run dev`
- [ ] Check browser console for any errors
- [ ] Look for polling requests every 30 seconds (open DevTools → Network)
- [ ] Badge should appear in navbar (may show 0 initially)
- [ ] Dropdown should open/close when clicking icon
- [ ] /notifications route should load without errors

**Expected Console Logs**:
```
GET http://localhost:5000/api/notifications 30 seconds
GET http://localhost:5000/api/notifications/count 30 seconds
```

---

### Phase 2: Backend Notification Triggers (45 minutes)

#### Step 5: Add Notifications to Payments Route
**File**: `backend/src/routes/payments.js`

Add at top:
```javascript
const { createNotification } = require("../utils/notifications");
```

Find the webhook handler for `checkout.session.completed` and add:

```javascript
if (event.type === "checkout.session.completed") {
  // ... existing code ...

  // ADD THIS:
  try {
    const user = await prisma.user.findUnique({
      where: { stripeId: session.customer },
    });

    if (user) {
      await createNotification(
        user.id,
        "subscription",
        "✨ Premium Subscription Activated",
        "Your premium subscription is now active!",
        "/profile?tab=subscription"
      );
    }
  } catch (err) {
    console.error("Notification error:", err);
  }
}
```

**Test**:
- [ ] Create a test payment (use Stripe test card: 4242 4242 4242 4242)
- [ ] Check database: `SELECT * FROM Notifications WHERE type='subscription'`
- [ ] Should see notification in dropdown on frontend

---

#### Step 6: Add Notifications to AI/Recommendations Route
**File**: `backend/src/routes/recommendations.js` or `backend/src/routes/ai-assistant.js`

```javascript
const { createNotification } = require("../utils/notifications");

// In your recommendation generation endpoint:
if (generatedRecommendation) {
  try {
    await createNotification(
      userId,
      "ai",
      "🎯 New AI Recommendation",
      `${generatedRecommendation.universityName} matches your profile!`,
      `/programs/${generatedRecommendation.programId}`
    );
  } catch (err) {
    console.error("Notification error:", err);
  }
}
```

---

#### Step 7: Add Notifications to Applications Route
**File**: `backend/src/routes/applications.js`

When application status changes:

```javascript
const { createNotification } = require("../utils/notifications");

// In status update endpoint:
await prisma.application.update({
  where: { id },
  data: { status: newStatus }
});

try {
  await createNotification(
    userId,
    "application",
    `Application ${newStatus}`,
    `Your application to ${universityName} was ${newStatus}`,
    `/applications/${id}`
  );
} catch (err) {
  console.error("Notification error:", err);
}
```

---

#### Step 8: Test Backend Triggers
- [ ] Test payment webhook (create test payment)
- [ ] Test AI recommendation generation
- [ ] Test application status update
- [ ] Verify notifications appear in database
- [ ] Verify notifications appear on frontend within 30 seconds

**Database Test Queries**:
```sql
-- View all notifications
SELECT * FROM Notifications ORDER BY createdAt DESC;

-- View unread notifications for a user
SELECT * FROM Notifications WHERE userId=1 AND read=0;

-- Count by type
SELECT type, COUNT(*) as count FROM Notifications GROUP BY type;
```

---

### Phase 3: Optional Enhancements (30 minutes)

#### Option 1: Add Admin Notifications
**File**: `backend/src/routes/admin.js`

When admin adds new country:
```javascript
const { createBulkNotifications } = require("../utils/notifications");

// After creating country:
const users = await prisma.user.findMany({ 
  where: { role: "user" },
  select: { id: true }
});

await createBulkNotifications(
  users.map(u => u.id),
  "admin-update",
  "🌍 New Country Available",
  `${countryName} has been added to our platform!`,
  `/countries/${countryId}`
);
```

#### Option 2: Customize Notification Styles
**File**: `frontend/src/api/notificationService.js`

Edit the `getNotificationStyle` function to customize colors and icons per notification type.

#### Option 3: Add Notification Sound
Add to `NotificationPoller` useEffect:
```javascript
// Play sound when new notification arrives
if (notifications.length > prevLength) {
  const audio = new Audio('/notification-sound.mp3');
  audio.play();
}
```

#### Option 4: Email Notifications
Add to backend utils:
```javascript
// Send email for important notifications
if (['subscription', 'visa'].includes(type)) {
  await sendEmail({
    to: user.email,
    subject: title,
    body: message
  });
}
```

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] Create notification via API: `POST /api/notifications/create`
- [ ] Fetch notifications: `GET /api/notifications`
- [ ] Get count: `GET /api/notifications/count`
- [ ] Mark as read: `POST /api/notifications/:id/read`
- [ ] Mark all as read: `POST /api/notifications/mark-all/read`
- [ ] Delete notification: `DELETE /api/notifications/:id`
- [ ] Clear all: `DELETE /api/notifications/clear/all`

### Frontend Testing
- [ ] Polling starts on app load
- [ ] Badge shows correct count
- [ ] Dropdown displays notifications
- [ ] Click notification marks as read
- [ ] Mark all as read works
- [ ] Delete button removes notification
- [ ] Full page loads and filters work
- [ ] Links in notifications navigate correctly

### Database Testing
- [ ] Notifications table has records
- [ ] User relationship works (CASCADE delete)
- [ ] Indexes are created (userId, read)
- [ ] No duplicate entries

---

## 📊 Monitoring & Maintenance

### Check Polling Health
```javascript
// In browser console
// Should see GET requests every 30 seconds
// Filter Network tab: /api/notifications
```

### Monitor Database Growth
```sql
-- Check table size
SELECT COUNT(*) as total_notifications FROM Notifications;

-- Check read vs unread
SELECT read, COUNT(*) FROM Notifications GROUP BY read;

-- Check by type
SELECT type, COUNT(*) FROM Notifications GROUP BY type;
```

### Performance Optimization
If database grows large:
1. Add cleanup job: Delete notifications older than 90 days
2. Archive old notifications to separate table
3. Adjust polling interval (currently 30 seconds)
4. Add pagination limits (currently 10/20)

---

## 🔧 Troubleshooting

### Problem: Notifications not showing in dropdown
**Solution**:
1. Check NotificationPoller wraps your app
2. Verify backend is returning data: `GET /api/notifications`
3. Check browser console for errors
4. Verify JWT token is valid

### Problem: Polling not happening
**Solution**:
1. Check Network tab in DevTools
2. Verify useNotifications hook is from NotificationCenter
3. Ensure component is inside NotificationPoller
4. Check for console errors

### Problem: Database not updated
**Solution**:
1. Verify createNotification is being called
2. Check Prisma client is initialized
3. Try manual insert: `INSERT INTO Notifications (...)`
4. Check database connection in backend

### Problem: High API calls/database load
**Solution**:
1. Increase polling interval (change 30000 to 60000)
2. Implement Redis caching for count
3. Archive old notifications
4. Add rate limiting to API

---

## 📝 Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `backend/src/utils/notifications.js` | Utility functions | ✅ Created |
| `backend/src/routes/notifications.js` | API endpoints | ✅ Created |
| `frontend/src/api/notificationService.js` | Service layer | ✅ Created |
| `frontend/src/components/NotificationCenter.jsx` | React components | ✅ Created |
| `frontend/src/pages/Notifications.jsx` | Full page view | ✅ Created |
| `frontend/src/App.jsx` | Wrapper with NotificationPoller | ⏳ To Update |
| `frontend/src/components/Navbar.jsx` | Add badge & dropdown | ⏳ To Update |

---

## 🚀 Quick Start Commands

```bash
# Start backend (ensure migration ran)
cd backend
npm run dev

# Start frontend (with NotificationPoller wrapper)
cd frontend
npm run dev

# Test backend endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/notifications

# Check database
sqlite3 database.db "SELECT * FROM Notifications LIMIT 5;"
```

---

## 📞 Need Help?

Refer to:
- `NOTIFICATION_SETUP_GUIDE.md` - Complete setup documentation
- `NOTIFICATION_INTEGRATION_EXAMPLES.md` - Code examples for each route
- Check console logs: `[NOTIFICATION]` prefix shows notification operations

**Version**: 1.0.0  
**Last Updated**: Today  
**Status**: 🟡 Ready for Frontend Integration
