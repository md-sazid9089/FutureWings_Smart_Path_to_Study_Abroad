# 🔐 Stripe Payment Integration - Complete Verification Guide

## Current Setup Status ✅
- Backend: Payments route configured with Stripe
- Frontend: Premium Checkout pages created  
- Database: Payment & VisaConsultancy tables added
- Environment: Stripe keys configured in `.env` files

---

## Part 1: Environment Verification

### Backend (.env)
```env
STRIPE_SECRET_KEY=sk_test_... ✅ Configured
STRIPE_PUBLIC_KEY=pk_test_... ✅ Configured
STRIPE_WEBHOOK_SECRET=whsec_... ✅ Configured
FRONTEND_URL=http://localhost:3000 ✅ Set
```

### Frontend (.env)
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_... ✅ Configured
VITE_API_BASE_URL=http://localhost:5000 ✅ Set
```

---

## Part 2: Backend API Verification

### 2.1 Check Payment Routes
All endpoints should be functioning:

```bash
# Check application startup logs
npm start
# Should see: "✓ Backend running on http://localhost:5000"
```

**Endpoints Ready:**
- ✅ POST `/api/payments/create-checkout-session`
- ✅ GET `/api/payments/status`
- ✅ GET `/api/payments/history`
- ✅ GET `/api/payments/verify-session/:sessionId`
- ✅ POST `/api/payments/webhook`

### 2.2 Database Schema Verification

Check if Payment table exists:

```sql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Payment'

-- Should return: Payment table exists
```

Expected columns:
- `id` - Primary Key
- `userId` - Foreign Key to User
- `stripeSessionId` - Stripe checkout session ID
- `stripePaymentId` - Stripe payment ID
- `amount` - In cents (e.g., 4999 = $49.99)
- `currency` - Default 'USD'
- `featureType` - AI_HELP, SOP_TESTING, VISA_CONSULTANCY, PREMIUM_BUNDLE
- `status` - PENDING, SUCCESS, FAILED
- `createdAt` - Timestamp
- `completedAt` - Timestamp after payment

---

## Part 3: Frontend Setup Verification

### 3.1 Routes Configuration
Check that the following routes are available:

```javascript
// Expected routes in App.jsx:
/premium-checkout      - Premium plans page
/payment-success       - After successful payment
/payment-cancel        - If payment cancelled
/api-assistant         - AI Help (Premium feature)
/profile               - User profile with premium status
```

### 3.2 Test User Authentication
1. Navigate to `http://localhost:3000/signup`
2. Create test account:
   - Email: `test@futurewings.com`
   - Password: `Test@1234`
   - Full Name: `Test User`
3. Login with credentials
4. Verify JWT token in localStorage

---

## Part 4: Payment Flow Testing

### 4.1 Test 1: Premium Access Flow (AI Help)

**Steps:**
1. Login with test account
2. Navigate to `/premium-checkout`
3. View available plans:
   - AI Help: $49.99
   - SOP Testing: $49.99
   - Visa Consultancy: $99.99
   - Premium Bundle: $149.99
4. Click "Upgrade to Premium" for AI Help
5. Verify redirect to Stripe Checkout

**Expected Result:** 
- ✅ Stripeayment form displays
- ✅ Amount shows $49.99
- ✅ Session ID created in database

**Verification Queries:**
```sql
-- Check payment record created
SELECT * FROM Payment 
WHERE userId = [YOUR_USER_ID] 
AND featureType = 'AI_HELP'
ORDER BY createdAt DESC

-- Should show: status = 'PENDING'
```

### 4.2 Test Stripe Test Card Payment

**Using Stripe Test Cards:**

| Scenario | Card Number | Expiry | CVC |
|----------|------------|--------|-----|
| Success | 4242 4242 4242 4242 | 12/25 | 123 |
| Decline | 4000 0000 0000 0002 | 12/25 | 123 |
| Auth Required | 4000 0025 0000 3155 | 12/25 | 123 |

**Steps:**
1. In Stripe Checkout form, enter:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - Email: your email
   - Name: your name
2. Click "Pay"
3. Wait for confirmation

**Expected Result:**
- ✅ Payment processed successfully
- ✅ Redirect to `/payment-success?session_id=cs_test_...`
- ✅ Success message displayed

### 4.3 Database Verification After Successful Payment

```sql
-- Check payment status updated to SUCCESS
SELECT * FROM Payment 
WHERE stripeSessionId = '[SESSION_ID]'

-- Should show:
-- - status = 'SUCCESS'
-- - completedAt = [timestamp]

-- Check user premium status updated
SELECT isPremium, premiumFeatures, premiumExpiryDate, stripeCustomerId 
FROM [User] 
WHERE id = [YOUR_USER_ID]

-- Should show:
-- - isPremium = 1 (true)
-- - premiumFeatures = 'AI_HELP'
-- - premiumExpiryDate = [date 30 days from now]
-- - stripeCustomerId = 'cus_...'
```

### 4.4 Test 2: Feature Access Verification

**After Premium Payment:**

1. Navigate to `/ai-assistant` (or AI Help feature)
2. Should show:
   - ✅ Premium content unlocked
   - ✅ No "Upgrade" button displayed
   - ✅ Feature fully functional

3. Navigate to `/profile`
4. Should show:
   - ✅ Premium status: "Active"
   - ✅ Subscription expires: [date]
   - ✅ Features: AI Help, SOP Testing (if purchased)

---

## Part 5: Webhook Testing

### 5.1 Setup Webhook Locally (Optional but Recommended)

**Using Stripe CLI:**

```bash
# 1. Download Stripe CLI
# Windows: https://github.com/stripe/stripe-cli/releases
# Or use: choco install stripe-cli

# 2. Login to Stripe
stripe login

# 3. Forward events to local backend
stripe listen --forward-to localhost:5000/api/payments/webhook

# Output: Webhook signing secret: whsec_test_1234...
# IMPORTANT: Copy and update STRIPE_WEBHOOK_SECRET in .env
```

### 5.2 Manually Test Webhook Event

```bash
# In another terminal, after stripe listen is running:
stripe trigger checkout.session.completed

# Should see:
# Backend logs: "Webhook received: checkout.session.completed"
# Database: Payment status updates to SUCCESS
# User: isPremium set to true
```

### 5.3 Webhook Events Handled

The backend automatically handles:

**`checkout.session.completed`**
- Updates Payment status to SUCCESS
- Sets user.isPremium = true
- Records purchased features in user.premiumFeatures
- Sets premiumExpiryDate to 30 days from now

**`charge.failed`**
- Updates Payment status to FAILED
- User remains non-premium
- Logs error for debugging

---

## Part 6: Visa Consultancy Payment Test

### 6.1 Admin Setup: Add Agencies

**Steps:**
1. Login as admin account
2. Navigate to Admin Dashboard → Consultancy Management
3. Click "Add Agency"
4. Enter agency details:
   - Agency Name: `Global Visa Consultants`
   - Email: `info@globalvisa.com`
   - Phone: `+1-555-0123`
   - Country: `USA`
   - City: `New York`
   - Website: `https://globalvisa.com`
   - Specializations: `USA,Canada,UK`
5. Click "Save"

**Database Verification:**
```sql
SELECT * FROM VisaConsultancy 
WHERE agencyName = 'Global Visa Consultants'

-- Should return: Record created with isActive=1
```

### 6.2 Student: Purchase Visa Consultancy

**Steps:**
1. Logout and login as student account
2. Navigate to `/visa-consultancy`
3. If not premium, see "Unlock Visa Consultancy" message
4. Click "Upgrade to Visa Consultancy"
5. Complete payment ($99.99)
6. After payment, see agency list:
   - Agency names with contact details
   - Links to browse

**Expected Result:**
- ✅ Payment processed for VISA_CONSULTANCY
- ✅ User.premiumFeatures includes VISA_CONSULTANCY
- ✅ Can see all active agencies

---

## Part 7: Edge Cases Testing

### 7.1 Failed Payment Scenario

**Using Decline Card:**
1. Navigate to Premium Checkout
2. Start payment
3. Use card: `4000 0000 0000 0002`
4. Submit payment

**Expected Result:**
- ✅ Payment fails
- ✅ User redirected to `/payment-cancel`
- ✅ Error message displayed
- ✅ Database shows Payment status = FAILED

**Database Check:**
```sql
SELECT * FROM Payment 
WHERE userId = [ID] 
AND status = 'FAILED'

-- Should show: recent failed payment record
```

### 7.2 Duplicate Payment Prevention

**Steps:**
1. Complete payment
2. User becomes premium
3. Try to purchase same feature again
4. Should show: "Already purchased" message

**Code Check:**
```javascript
// Frontend should check if user already has feature
if (userStatus.isPremium && userStatus.premiumFeatures.includes(featureType)) {
  showMessage("Already purchased - Enjoy your premium features!");
  disableCheckoutButton();
}
```

### 7.3 Subscription Expiry Test

**Manual Test:**
```sql
-- Set premiumExpiryDate to past date
UPDATE [User] 
SET premiumExpiryDate = DATEADD(DAY, -1, GETDATE())
WHERE id = [YOUR_USER_ID]

-- Visit feature page
-- Should show: "Subscription expired - Upgrade to Premium"
```

---

## Part 8: Payment History & Analytics

### 8.1 View Payment History

**Endpoint:** `GET /api/payments/history`

```bash
# Requires authentication
curl -H "Authorization: Bearer [TOKEN]" \
  http://localhost:5000/api/payments/history

# Response should show:
# {
#   "status": "success",
#   "data": {
#     "payments": [
#       {
#         "id": 1,
#         "amount": 4999,
#         "featureType": "AI_HELP",
#         "status": "SUCCESS",
#         "createdAt": "2026-04-12T15:30:00Z"
#       },
#       ...
#     ],
#     "total": 1,
#     "totalSpent": 4999
#   }
# }
```

### 8.2 Admin Analytics

**Database Queries:**

```sql
-- Total revenue
SELECT 
  SUM(amount) as total_revenue,
  COUNT(*) as total_payments,
  COUNT(CASE WHEN status='SUCCESS' THEN 1 END) as successful_payments
FROM Payment

-- Revenue by feature
SELECT 
  featureType,
  COUNT(*) as count,
  SUM(amount) as revenue
FROM Payment
WHERE status = 'SUCCESS'
GROUP BY featureType

-- Revenue by time period
SELECT 
  CAST(createdAt as DATE) as date,
  SUM(amount) as daily_revenue
FROM Payment
WHERE status = 'SUCCESS'
GROUP BY CAST(createdAt as DATE)
```

---

## Part 9: Production Deployment Checklist

### 9.1 Before Going Live

- [ ] Update `.env` with live Stripe keys (sk_live_, pk_live_)
- [ ] Configure webhook endpoint with live URL (not localhost/ngrok)
- [ ] Set `NODE_ENV=production`
- [ ] Update FRONTEND_URL to production domain
- [ ] Enable HTTPS for webhook endpoint
- [ ] Test payment with live card (use $0.50 charge to test)
- [ ] Verify SSL certificate valid
- [ ] Set up error monitoring (Sentry)
- [ ] Configure email notifications for failed payments
- [ ] Review Stripe documentation for compliance

### 9.2 Stripe Live Mode Setup

1. Go to Stripe Dashboard
2. Activate Live Mode
3. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/payments/webhook`
   - Events: `checkout.session.completed`, `charge.failed`
4. Copy live signing secret
5. Update `.env` with live keys and secrets

---

## Part 10: Troubleshooting

### Issue: "Webhook not triggering after payment"
**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` in .env matches Stripe Dashboard
2. Check backend logs for webhook requests
3. Use Stripe CLI to test: `stripe trigger checkout.session.completed`
4. Verify Payment table has entry with correct sessionId

### Issue: "User doesn't get premium after payment"
**Solution:**
1. Check Payment table: status should be 'SUCCESS'
2. Check User table: isPremium should be 1 (true)
3. Check backend logs for webhook processing errors
4. Verify database connection in webhook handler

### Issue: "Stripe Checkout redirects to wrong page"
**Solution:**
1. Check FRONTEND_URL in `.env`
2. Verify redirect URLs in Stripe Checkout settings:
   - Success URL: `{FRONTEND_URL}/payment-success`
   - Cancel URL: `{FRONTEND_URL}/payment-cancel`
3. Clear browser cache and try again

### Issue: "CORS errors when calling payment API"
**Solution:**
1. Verify FRONTEND_URL matches frontend origin
2. Check CORS middleware in server.js allows frontend origin
3. Ensure credentials: true is set in axios requests

### Issue: "Currency not USD"
**Solution:**
1. Hardcoded to USD in payments.js
2. To change: Edit `STRIPE_CURRENCY = 'usd'` in payments.js
3. Update pricing constants accordingly

---

## Part 11: Testing Command Summary

### Quick Test Script
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend  
cd frontend
npm run dev

# Terminal 3 (Optional): Stripe Webhook Testing
stripe listen --forward-to localhost:5000/api/payments/webhook
stripe trigger checkout.session.completed
```

### Database Verification Script
```sql
-- Create this script to verify after payments:

-- 1. Check payment created
SELECT COUNT(*) as payment_count FROM Payment;

-- 2. Check user premium status
SELECT email, isPremium, premiumFeatures, premiumExpiryDate 
FROM [User] 
WHERE isPremium = 1;

-- 3. Check most recent payments
SELECT TOP 10 * FROM Payment 
ORDER BY createdAt DESC;

-- 4. Revenue summary
SELECT 
  FeatureType,
  Status,
  COUNT(*) as count,
  SUM(Amount) as total_revenue
FROM Payment
GROUP BY FeatureType, Status;
```

---

## Success Criteria ✅

After completing all tests, you should have:

✅ Backend endpoint successfully creates Stripe checkout sessions  
✅ Frontend redirects to Stripe Checkout  
✅ Payment processing works with test card  
✅ Webhook correctly updates payment status  
✅ User.isPremium = true after successful payment  
✅ Premium features accessible post-payment  
✅ Payment data persisted in database  
✅ Failed payments handled gracefully  
✅ Visa agencies visible after consultancy payment  
✅ Payment history accessible  
✅ Admin can manage agencies  

---

## Next Steps

1. **Follow testing sequence:** Part 1 → 2 → 3 → 4 → 5 → 6 → 7
2. **Document any issues** found and check troubleshooting
3. **Deploy to production** using checklist in Part 9
4. **Monitor payments** in Stripe Dashboard and database

For detailed implementation info, see:
- `STRIPE_INTEGRATION_GUIDE.md` - Complete API reference
- `IMPLEMENTATION_COMPLETE_SUMMARY.md` - Architecture overview
- `STRIPE_INTEGRATION_QUICK_START.md` - Quick reference
