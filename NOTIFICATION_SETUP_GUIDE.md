# Notification System Integration Guide

## Overview

The notification system uses **polling** to keep users informed about important events:
- Premium subscription changes
- Payment processing updates  
- AI recommendations
- Application status changes
- Visa consultancy updates
- Admin-triggered updates

**Polling Interval**: Every 30 seconds  
**Notification Types**: subscription, visa, ai, admin-update, recommendation, application

---

## Backend Setup

### 1. Notification Utility (`backend/src/utils/notifications.js`)

Use the utility functions to create notifications throughout your routes:

```javascript
const { createNotification, notificationTemplates } = require("../utils/notifications");

// Basic usage
await createNotification(
  userId,
  "subscription",
  "Premium Subscription Active",
  "Your subscription is now active!"
);

// With link
await createNotification(
  userId,
  "ai",
  "New Recommendation",
  "Check out this great program!",
  "/programs/123"
);

// Bulk notifications to multiple users
const { createBulkNotifications } = require("../utils/notifications");

await createBulkNotifications(
  [userId1, userId2, userId3],
  "admin-update",
  "New Country Available",
  "Canada has been added to the platform!",
  "/countries/canada"
);
```

### 2. Using Templates

Pre-built templates for common notifications:

```javascript
const { notificationTemplates } = require("../utils/notifications");

// Subscription upgraded
const template = notificationTemplates.SUBSCRIPTION_UPGRADED;
await createNotification(
  userId,
  template.type,
  template.title,
  template.message("AI Assistant")  // "Your AI Assistant premium subscription is now active!"
);

// Payment failed
const failTemplate = notificationTemplates.PAYMENT_FAILED;
await createNotification(userId, failTemplate.type, failTemplate.title, failTemplate.message);

// New AI recommendation
const aiTemplate = notificationTemplates.NEW_AI_RECOMMENDATION;
await createNotification(
  userId,
  aiTemplate.type,
  aiTemplate.title,
  aiTemplate.message("Harvard University"),
  "/programs/harvard-123"
);
```

---

## Integration Examples

### Payment Route (`backend/src/routes/payments.js`)

When a user completes checkout:

```javascript
const { createNotification } = require("../utils/notifications");

// In webhook handler for checkout.session.completed
const user = await prisma.user.findUnique({ where: { stripeId } });

// Create subscription notification
await createNotification(
  user.id,
  "subscription",
  "Premium Subscription Activated",
  `Your ${features.join(", ")} subscription is now active! Enjoy premium features.`,
  "/profile"
);
```

When payment fails:

```javascript
// In webhook handler for charge.failed
await createNotification(
  user.id,
  "subscription",
  "Payment Failed",
  "Your payment could not be processed. Please update your payment method.",
  "/premium"
);
```

### AI Assistant Route

When generating recommendations:

```javascript
// In recommendations endpoint
const { createNotification } = require("../utils/notifications");

const recommendation = await aiService.generateRecommendation(userId);

if (recommendation) {
  await createNotification(
    userId,
    "ai",
    "New Recommendation Found",
    `${recommendation.universityName} matches your profile!`,
    `/programs/${recommendation.programId}`
  );
}
```

### Applications Route

When application status changes:

```javascript
// In application update endpoint
const { createNotification } = require("../utils/notifications");

await prisma.application.update({
  where: { id: applicationId },
  data: { status: newStatus },
});

await createNotification(
  userId,
  "application",
  "Application Status Updated",
  `Your application to ${universityName} is now ${newStatus}`,
  `/applications/${applicationId}`
);
```

### Countries Route

When admin adds new country (admin endpoint):

```javascript
// In admin countries endpoint
const { createBulkNotifications } = require("../utils/notifications");

// Notify all users about new country
const allUsers = await prisma.user.findMany({ select: { id: true } });
const userIds = allUsers.map(u => u.id);

await createBulkNotifications(
  userIds,
  "admin-update",
  "New Country Available",
  `${countryName} has been added to our platform!`,
  `/countries/${countryId}`
);
```

### Visa Consultancy Integration

When consultancy becomes available:

```javascript
// In consultancy route
const { createNotification } = require("../utils/notifications");

// When creating new consultancy
await createNotification(
  userId,
  "visa",
  "Consultancy Service Available",
  `Visa consultancy is now available for ${countryName}`,
  `/visa-consultancy/${countryId}`
);
```

---

## Frontend Setup

### 1. Wrap App with NotificationPoller

In `frontend/src/main.jsx` or `App.jsx`:

```javascript
import { NotificationPoller } from "./components/NotificationCenter";

function App() {
  return (
    <NotificationPoller>
      {/* Your app components */}
      <Router>
        {/* routes */}
      </Router>
    </NotificationPoller>
  );
}
```

### 2. Add Notification Badge to Navbar

In your navbar component (e.g., `Navbar.jsx`):

```javascript
import { NotificationBadge } from "../components/NotificationCenter";

function Navbar() {
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* Other navbar items */}
      
      <div className="relative">
        <button
          onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
          className="relative p-2"
        >
          🔔
          <NotificationBadge className="absolute -top-1 -right-1" />
        </button>
        
        {/* Notification Dropdown */}
        <NotificationDropdown 
          isOpen={notificationDropdownOpen}
          onClose={() => setNotificationDropdownOpen(false)}
        />
      </div>
    </nav>
  );
}

export default Navbar;
```

### 3. Add Notifications Page

In router configuration:

```javascript
import Notifications from "./pages/Notifications";

// In your routes
<Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
```

### 4. Use Notifications Hook in Components

To access notification context anywhere:

```javascript
import { useNotifications } from "../components/NotificationCenter";

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    deleteNotification 
  } = useNotifications();

  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      {notifications.map(notif => (
        <div key={notif.id}>
          {notif.title}
          <button onClick={() => markAsRead(notif.id)}>Mark as read</button>
        </div>
      ))}
    </div>
  );
}
```

---

## API Endpoints Reference

All endpoints require authentication via JWT token in `Authorization: Bearer <token>` header.

### Fetch Notifications
```
GET /api/notifications?limit=10&offset=0&read=false
Response: { data: [notification], total, hasMore }
```

### Get Unread Count
```
GET /api/notifications/count
Response: { data: { count: number } }
```

### Get Single Notification
```
GET /api/notifications/:id
Response: { data: notification }
```

### Mark as Read
```
POST /api/notifications/:id/read
Response: { data: updatedNotification }
```

### Mark All as Read
```
POST /api/notifications/mark-all/read
Response: { success: true, updated: number }
```

### Delete Notification
```
DELETE /api/notifications/:id
Response: { success: true }
```

### Clear All
```
DELETE /api/notifications/clear/all
Response: { success: true, deleted: number }
```

### Create Notification (Internal)
```
POST /api/notifications/create
Body: { userId, type, title, message, link? }
Response: { data: createdNotification }
```

---

## Notification Types & Icons

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| subscription | 💳 | Blue | Payment & subscription events |
| visa | 📋 | Green | Visa updates & consultancy |
| ai | 🤖 | Purple | AI recommendations |
| recommendation | ⭐ | Yellow | Program & scholarship matches |
| application | 📄 | Indigo | Application status updates |
| admin-update | ⚙️ | Red | Admin announcements |

---

## Styling Customization

Notification styles are defined in `getNotificationStyle()` function:

```javascript
{
  subscription: {
    icon: "💳",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-900",
    badgeColor: "bg-blue-500"
  },
  // ... other types
}
```

Customize by editing `frontend/src/api/notificationService.js`

---

## Best Practices

1. **Use Templates**: Use predefined templates from `notificationTemplates` for consistency
2. **Clear Messages**: Keep messages < 500 chars and user-friendly
3. **Include Links**: Always provide relevant links where possible
4. **Batch Operations**: Use `createBulkNotifications` for mass updates
5. **Clean Up**: Expired notifications are auto-deleted after 90 days (implement cleanup job)
6. **Test Polling**: Open browser console to verify polling requests every 30 seconds

---

## Troubleshooting

### Notifications not appearing
1. Check browser console for API errors
2. Verify JWT token is valid
3. Confirm backend notifications route is registered in `server.js`
4. Check database for records in Notifications table

### Polling stops working
1. Check if NotificationPoller is wrapping your app
2. Verify component uses `useNotifications()` hook correctly
3. Check for console errors or component unmounting issues

### High database load
1. Reduce polling frequency (change interval from 30000ms)
2. Implement notification pagination (already done with limit/offset)
3. Archive old notifications (implement cleanup job)

---

## Database Schema

```prisma
model Notification {
  id        Int       @id @default(autoincrement())
  userId    Int
  type      String    @db.NVarChar(50)
  title     String    @db.NVarChar(200)
  message   String    @db.NVarChar(500)
  read      Boolean   @default(false)
  link      String?   @db.NVarChar(500)
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([read])
  @@map("Notifications")
}
```

---

## Files Created

### Backend
- `backend/src/utils/notifications.js` - Utility functions & templates
- `backend/src/routes/notifications.js` - API endpoints (already created)

### Frontend  
- `frontend/src/api/notificationService.js` - API service layer
- `frontend/src/components/NotificationCenter.jsx` - React components
- `frontend/src/pages/Notifications.jsx` - Full-page notifications view

---

**Last Updated**: Today  
**Version**: 1.0.0  
**Status**: Ready for integration
