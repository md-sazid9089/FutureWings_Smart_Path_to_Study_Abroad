# Stripe Payment Integration - Quick Reference Card

## 🚀 5-MIN STARTUP
```bash
# Terminal 1: Backend
cd backend && npm start
# Output: ✓ Backend running on http://localhost:5000

# Terminal 2: Frontend  
cd frontend && npm run dev
# Output: ✓ Frontend running on http://localhost:3000

# Terminal 3 (Optional): Stripe Webhook
stripe listen --forward-to localhost:5000/api/payments/webhook
```

## 🧪 PAYMENT TEST FLOW

| Step | Action | Expected |
|------|--------|----------|
| 1 | Signup at `/signup` | Account created |
| 2 | Navigate to `/premium-checkout` | Plans displayed |
| 3 | Click "Upgrade to Premium" | Stripe Checkout loads |
| 4 | Card: `4242 4242 4242 4242` | Payment form ready |
| 5 | Expiry: `12/25`, CVC: `123` | Fields accepted |
| 6 | Click "Pay" | Processing... |
| 7 | Redirect to `/payment-success` | ✅ Success! |
| 8 | Check `/profile` | isPremium = true |
| 9 | Database check | Payment status = SUCCESS |

## 💳 TEST CARDS
| Card | Purpose | Card Number |
|------|---------|-------------|
| ✅ Success | Normal payment | 4242 4242 4242 4242 |
| ❌ Decline | Failed payment | 4000 0000 0000 0002 |
| 🔐 Auth | Requires 3D Secure | 4000 0025 0000 3155 |

## 🗄️ DATABASE CHECKS

```sql
-- Payment record created?
SELECT * FROM Payment WHERE userId = 1 ORDER BY createdAt DESC
-- Expected: One row with status = 'SUCCESS'

-- User upgraded?
SELECT isPremium, premiumFeatures FROM [User] WHERE id = 1
-- Expected: isPremium = 1, premiumFeatures = 'AI_HELP'

-- Agency list?
SELECT * FROM VisaConsultancy WHERE isActive = 1
-- Expected: List of agencies (if visa consultancy purchased)
```

## 🔌 API ENDPOINTS

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments/create-checkout-session` | Start checkout |
| GET | `/api/payments/status` | Check user premium status |
| GET | `/api/payments/history` | Payment transactions |
| GET | `/api/payments/verify-session/:id` | Verify payment |
| POST | `/api/payments/webhook` | Stripe webhook (auto) |
| GET | `/api/consultancy/agencies` | List agencies |
| POST | `/api/consultancy/agencies` | Add agency (admin) |

## 💰 PRICING

| Feature | Price | Duration |
|---------|-------|----------|
| AI Help | $49.99 | 30 days |
| SOP Testing | $49.99 | 30 days |
| Visa Consultancy | $99.99 | 30 days |
| Premium Bundle | $149.99 | 30 days |

## 📁 KEY FILES

| File | Purpose |
|------|---------|
| `backend/.env` | Stripe keys configuration |
| `frontend/.env` | Public key + API URL |
| `backend/src/routes/payments.js` | Payment logic |
| `frontend/src/pages/PremiumCheckout.jsx` | Checkout UI |
| `STRIPE_VERIFICATION_GUIDE.md` | Full testing guide |
| `STRIPE_DATABASE_QUERIES.sql` | DB verification |

## 🧾 PAYMENT RECORD STRUCTURE

```javascript
{
  id: 1,
  userId: 123,
  stripeSessionId: "cs_test_...",
  stripePaymentId: "pi_test_...",
  amount: 4999,        // in cents
  currency: "USD",
  featureType: "AI_HELP",
  status: "SUCCESS",   // or PENDING, FAILED
  createdAt: "2026-04-12T15:30:00Z",
  completedAt: "2026-04-12T15:32:00Z"
}
```

## 👤 USER PREMIUM STATUS

```javascript
{
  id: 123,
  email: "user@example.com",
  isPremium: 1,        // boolean (1/0)
  premiumFeatures: "AI_HELP",
  premiumExpiryDate: "2026-05-12",
  stripeCustomerId: "cus_...",
  createdAt: "2026-04-01T..."
}
```

## ⚠️ QUICK TROUBLESHOOT

| Issue | Fix |
|-------|-----|
| No Stripe Checkout | Check `STRIPE_SECRET_KEY` in `.env` |
| Payment not updating DB | Verify webhook is running + `STRIPE_WEBHOOK_SECRET` correct |
| User not becoming premium | Check `Payment.status = 'SUCCESS'` and webhook logs |
| CORS error | Verify `FRONTEND_URL` in `.env` matches frontend origin |
| Can't create payment | Check JWT token is valid (Bearer token) |
| Agencies not showing | Complete visa consultancy payment first |

## 🎯 VERIFICATION CHECKLIST

- [ ] Backend starts successfully
- [ ] Frontend loads at localhost:3000
- [ ] Can signup/login
- [ ] Can reach `/premium-checkout`
- [ ] Stripe Checkout loads when clicking "Upgrade"
- [ ] Can complete payment with test card
- [ ] Redirected to success page
- [ ] User shows isPremium = true
- [ ] Payment in database with status = SUCCESS
- [ ] Premium features accessible
- [ ] Payment history shows transaction

## 📞 WEBHOOK TESTING

```bash
# Listen for local webhook events
stripe listen --forward-to localhost:5000/api/payments/webhook

# In another terminal, trigger test event
stripe trigger checkout.session.completed

# Expected output in backend logs:
# "Webhook received: checkout.session.completed"
# "Payment confirmed for user X"
```

## 🔐 SECURITY NOTES

✅ Never expose `STRIPE_SECRET_KEY` in frontend  
✅ Always verify JWT tokens before processing  
✅ Webhook signatures verified with `STRIPE_WEBHOOK_SECRET`  
✅ Payments marked with user ID for ownership  
✅ Admin endpoints require ADMIN role  
✅ All endpoints use HTTPS in production  

## 📊 TESTING TOOLS

1. **Postman**: Import `STRIPE_POSTMAN_COLLECTION.json`
2. **Script**: Run `STRIPE_API_TEST.js` with Node.js
3. **SQL**: Execute `STRIPE_DATABASE_QUERIES.sql` in Azure SQL
4. **Guide**: Follow `STRIPE_VERIFICATION_GUIDE.md` step-by-step

## 🚢 PRODUCTION DEPLOYMENT

```env
# Change these for live:
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_PUBLIC_KEY=pk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_live_secret
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

Then:
1. Configure webhook in Stripe Dashboard
2. Test with $0.50 transaction first
3. Monitor payment logs
4. Enable error notifications

## 🆘 HELP RESOURCES

| Resource | Location |
|----------|----------|
| Full Testing Guide | `STRIPE_VERIFICATION_GUIDE.md` |
| DB Query Guide | `STRIPE_DATABASE_QUERIES.sql` |
| Testing Summary | `PAYMENT_TESTING_SUMMARY.md` |
| Postman Collection | `STRIPE_POSTMAN_COLLECTION.json` |
| API Docs | `STRIPE_INTEGRATION_GUIDE.md` |
| Stripe CLI | https://github.com/stripe/stripe-cli |
| Stripe Docs | https://stripe.com/docs |

---

**Print this for quick reference! 📋**
