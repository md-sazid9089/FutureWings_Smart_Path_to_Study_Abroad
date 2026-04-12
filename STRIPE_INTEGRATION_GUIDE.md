# Stripe Payment Integration - Complete Setup Guide

## Overview
This document explains the complete Stripe payment integration for the FutureWings platform, including premium features (AI Help, SOP Testing, Visa Consultancy) and admin consultancy agency management.

## Table of Contents
1. [Setup Instructions](#setup-instructions)
2. [Environment Variables](#environment-variables)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Webhook Configuration](#webhook-configuration)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)

---

## Setup Instructions

### Backend Setup

#### 1. Install Dependencies
Already installed using:
```bash
npm install stripe
```

#### 2. Environment Variables (.env)
Add the following to your `.backend/.env` file:
```
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLIC_KEY=pk_test_your_public_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL (for redirect after payment)
FRONTEND_URL=http://localhost:3000
```

#### 3. Database Migration
Already completed. The migration adds:
- `Payment` table - tracks all payments
- `VisaConsultancy` table - stores consultancy agency information
- Updates to `User` table - adds isPremium, premiumFeatures, premiumExpiryDate, stripeCustomerId

#### 4. Verify Routes are Registered
Check that these routes are mounted in `backend/server.js`:
- `/api/payments` - payment routes
- `/api/consultancy` - consultancy management routes

### Frontend Setup

#### 1. Install Dependencies
Already installed using:
```bash
npm install @stripe/react-stripe-js stripe
```

#### 2. Environment Variables (.env)
Add to your `frontend/.env`:
```
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_public_key_here
REACT_APP_API_URL=http://localhost:5000/api
```

#### 3. Update App.jsx Routes
Add the new routes to your React Router configuration:
```jsx
import PremiumCheckout from './pages/PremiumCheckout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import VisaConsultancy from './pages/VisaConsultancy';
import AdminConsultancyManagement from './pages/admin/ConsultancyManagement';

// In your route configuration:
<Route path="/premium-checkout" element={<PremiumCheckout />} />
<Route path="/payment-success" element={<PaymentSuccess />} />
<Route path="/payment-cancel" element={<PaymentCancel />} />
<Route path="/visa-consultancy" element={<VisaConsultancy />} />
<Route path="/admin/consultancy" element={<AdminRoute><AdminConsultancyManagement /></AdminRoute>} />
```

---

## Environment Variables

### Backend

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Secret key from Stripe dashboard | `sk_test_51234...` |
| `STRIPE_PUBLIC_KEY` | Public key from Stripe dashboard | `pk_test_51234...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook endpoint secret | `whsec_1234...` |
| `FRONTEND_URL` | Frontend URL for redirects | `http://localhost:3000` |

### Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_STRIPE_PUBLIC_KEY` | Public key from Stripe | `pk_test_51234...` |
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |

---

## Database Schema

### User Table (Updated)
```sql
ALTER TABLE Users ADD (
    isPremium BIT DEFAULT 0,
    premiumFeatures NVARCHAR(100),  -- "AI_HELP,SOP_TESTING,VISA_CONSULTANCY"
    premiumExpiryDate DATETIME,
    stripeCustomerId NVARCHAR(255)
);
```

### Payment Table (New)
```sql
CREATE TABLE Payments (
    id INT PRIMARY KEY IDENTITY,
    userId INT NOT NULL,
    stripeSessionId NVARCHAR(255) NOT NULL,
    stripePaymentId NVARCHAR(255),
    amount INT NOT NULL,  -- in cents
    currency NVARCHAR(10) DEFAULT 'USD',
    featureType NVARCHAR(50),  -- "AI_HELP", "SOP_TESTING", "VISA_CONSULTANCY", "PREMIUM_BUNDLE"
    status NVARCHAR(20) DEFAULT 'PENDING',  -- "PENDING", "SUCCESS", "FAILED"
    createdAt DATETIME DEFAULT GETDATE(),
    completedAt DATETIME,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);
```

### VisaConsultancy Table (New)
```sql
CREATE TABLE VisaConsultancies (
    id INT PRIMARY KEY IDENTITY,
    agencyName NVARCHAR(200) NOT NULL,
    email NVARCHAR(255),
    phone NVARCHAR(20),
    country NVARCHAR(100),
    city NVARCHAR(100),
    website NVARCHAR(500),
    description NVARCHAR(1000),
    specializations NVARCHAR(500),  -- "UK,USA,Canada"
    rating FLOAT DEFAULT 0.0,
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
```

---

## API Endpoints

### Payment Endpoints

#### 1. Create Checkout Session
**POST** `/api/payments/create-checkout-session`
- **Auth**: Required (Bearer token)
- **Body**:
```json
{
  "featureType": "AI_HELP|SOP_TESTING|VISA_CONSULTANCY|PREMIUM_BUNDLE"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/pay/cs_test_",
    "paymentId": 1
  }
}
```

#### 2. Get Subscription Status
**GET** `/api/payments/status`
- **Auth**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "isPremium": true,
    "features": ["AI_HELP", "SOP_TESTING"],
    "expiryDate": "2026-05-12T...",
    "daysRemaining": 30
  }
}
```

#### 3. Get Payment History
**GET** `/api/payments/history`
- **Auth**: Required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "featureType": "AI_HELP",
      "amount": 4999,
      "status": "SUCCESS",
      "createdAt": "2026-04-12T...",
      "completedAt": "2026-04-12T..."
    }
  ]
}
```

#### 4. Verify Session
**GET** `/api/payments/verify-session/:sessionId`
- **Auth**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "status": "SUCCESS",
    "featureType": "AI_HELP",
    "amount": 4999,
    "paymentStatus": "paid"
  }
}
```

#### 5. Webhook (Stripe Events)
**POST** `/api/payments/webhook`
- **Headers**: `stripe-signature: ...`
- **Raw Body Required** (not JSON parsed)
- **Handles**:
  - `checkout.session.completed` - updates payment status, grants premium features
  - `charge.failed` - marks payment as failed

---

### Consultancy Endpoints

#### 1. List All Active Agencies
**GET** `/api/consultancy/agencies`
- **Auth**: Not required (public)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "agencyName": "Global Visa Solutions",
      "email": "contact@globalvisa.com",
      "phone": "+1234567890",
      "country": "USA",
      "city": "New York",
      "website": "https://globalvisa.com",
      "description": "Expert visa consultancy...",
      "specializations": "UK,USA,Canada",
      "rating": 4.5,
      "isActive": true,
      "createdAt": "2026-04-12T..."
    }
  ]
}
```

#### 2. Get Agency by Country
**GET** `/api/consultancy/agencies-by-country/:country`
- **Auth**: Not required
- **Response**: Same as above, filtered by country

#### 3. Create Agency (Admin)
**POST** `/api/consultancy/agencies`
- **Auth**: Required + ADMIN role
- **Body**:
```json
{
  "agencyName": "Global Visa Solutions",
  "email": "contact@globalvisa.com",
  "phone": "+1234567890",
  "country": "USA",
  "city": "New York",
  "website": "https://globalvisa.com",
  "description": "Expert visa consultancy...",
  "specializations": "UK,USA,Canada"
}
```

#### 4. Update Agency (Admin)
**PUT** `/api/consultancy/agencies/:id`
- **Auth**: Required + ADMIN role
- **Body**: Same as create

#### 5. Delete Agency (Admin - Soft Delete)
**DELETE** `/api/consultancy/agencies/:id`
- **Auth**: Required + ADMIN role

#### 6. Bulk Import (Admin)
**POST** `/api/consultancy/bulk-import`
- **Auth**: Required + ADMIN role
- **Body**:
```json
{
  "agencies": [
    {
      "agencyName": "Agency 1",
      "email": "email1@example.com",
      ...
    },
    {
      "agencyName": "Agency 2",
      ...
    }
  ]
}
```

#### 7. Get All Agencies (Admin)
**GET** `/api/consultancy/admin/all-agencies`
- **Auth**: Required + ADMIN role
- **Response**: All agencies including inactive ones

---

## Frontend Components

### 1. PremiumCheckout Component (`/pages/PremiumCheckout.jsx`)
Displays available premium plans and handles checkout initiation.

**Props**: None
**Features**:
- Shows 4 plans: AI Help, SOP Testing, Visa Consultancy, Premium Bundle
- Displays current subscription status if user is premium
- Redirects to Stripe Checkout on plan selection

### 2. PaymentSuccess Component (`/pages/PaymentSuccess.jsx`)
Displayed after successful Stripe checkout.

**Query Params**:
- `session_id`: Checkout session ID

**Features**:
- Verifies payment completion
- Shows payment details
- Provides navigation to feature

### 3. PaymentCancel Component (`/pages/PaymentCancel.jsx`)
Displayed when user cancels checkout.

**Features**:
- Allows retry
- Navigation back to plans

### 4. PremiumComponents (`/components/PremiumComponents.jsx`)
**Exports**:
- `PremiumUpgradeButton`: Button to upgrade to premium
- `PremiumBadge`: Visual badge showing premium status
- `PremiumFeatureGuard`: Wrapper that shows upgrade if not premium

**Usage**:
```jsx
<PremiumFeatureGuard featureType="AI_HELP">
  <AIAssistant />
</PremiumFeatureGuard>
```

### 5. Payment Service (`/api/paymentService.js`)
Centralized API calls for payment operations.

**Methods**:
- `createCheckoutSession(featureType)`
- `getSubscriptionStatus()`
- `getPaymentHistory()`
- `verifySession(sessionId)`
- `hasFeature(featureType)`
- `isSubscriptionValid()`

### 6. Visa Consultancy Page (`/pages/VisaConsultancy.jsx`)
Shows list of consultancy agencies (premium feature).

**Features**:
- Filter by country
- View agency details
- Contact agency
- Shows upgrade prompt if not premium

### 7. Admin Consultancy Management (`/pages/admin/ConsultancyManagement.jsx`)
Admin interface for managing agencies.

**Features**:
- Add new agencies
- Edit existing agencies
- Delete agencies
- Bulk import (JSON/CSV)
- View all agencies

---

## Webhook Configuration

### Setting Up Stripe Webhook

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Click "Add endpoint"**
3. **Enter endpoint URL**:
   ```
   https://yourdomain.com/api/payments/webhook
   ```
   For local development with ngrok:
   ```
   https://your-ngrok-url.ngrok.io/api/payments/webhook
   ```

4. **Select events to listen for**:
   - `checkout.session.completed`
   - `charge.failed`

5. **Copy webhook secret** and add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret
   ```

### Testing Webhook Locally

Use Stripe CLI:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Listen for webhook events
stripe listen --forward-to localhost:5000/api/payments/webhook

# Forward event in another terminal
stripe trigger checkout.session.completed
```

---

## Testing Guide

### 1. End-to-End Payment Flow

1. **Create Account & Login**
2. **Navigate to `/premium-checkout`**
3. **Click "Choose Plan"** (e.g., "AI Help")
4. **Complete Stripe Checkout** (use test card: 4242 4242 4242 4242)
5. **Verify in Stripe Dashboard**: look for new payment intent
6. **Check Database**: verify Payment entry with status="SUCCESS"
7. **Check User**: verify isPremium=1, premiumFeatures includes selected feature
8. **Navigate to restricted feature** - should now have access

### 2. Test Payment Artifacts

**Test Cards**:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Auth: `4000 0025 0000 3155`

**Sample Expiry**: Any future date (e.g., 12/25)
**CVC**: Any 3 digits (e.g., 123)

### 3. Verify Webhook Handling

1. **Set up Stripe CLI** (see Webhook Configuration)
2. **Trigger test event**:
   ```bash
   stripe trigger checkout.session.completed
   ```
3. **Check logs**: should see payment update and premium status change
4. **Check Database**: verify Payment status changed and User updated

### 4. Test Admin Features

1. **Login as admin**
2. **Navigate to `/admin/consultancy`**
3. **Add agency** with test data
4. **Verify in database**: check VisaConsultancy table
5. **Edit agency**: change rating, status
6. **Test bulk import**: import JSON/CSV with multiple agencies
7. **Delete agency**: should soft delete (isActive=0)

### 5. Test Premium Feature Guards

1. **As non-premium user**:
   - Navigate to `/visa-consultancy`
   - Should see upgrade button instead of content

2. **After premium purchase**:
   - Refresh `/visa-consultancy`
   - Should see full agency list

---

## Troubleshooting

### Payment shows "PENDING" indefinitely

**Cause**: Webhook not configured correctly
**Solution**:
1. Verify webhook URL is correct
2. Check `STRIPE_WEBHOOK_SECRET` in .env
3. Confirm webhook is receiving events (Stripe Dashboard → Logs)
4. Use Stripe CLI to test webhook locally

### User doesn't get premium access after payment

**Cause**: Webhook not being called or database error
**Solution**:
1. Check `payments` table: verify status is "SUCCESS"
2. Check backend logs for errors
3. Verify database connection
4. Ensure user ID is correct in payment record

### Stripe Checkout shows incorrect domain

**Cause**: `FRONTEND_URL` not set correctly
**Solution**:
1. Update `.env`: `FRONTEND_URL=http://localhost:3000`
2. Restart backend server

### CORS errors when calling payment API

**Cause**: Origin not whitelisted
**Solution**:
1. Check backend CORS config in `server.js`
2. Update `origin` to match frontend URL
3. Restart backend

### Stripe customer creation fails

**Cause**: Missing or invalid Stripe API key
**Solution**:
1. Verify `STRIPE_SECRET_KEY` is set
2. Check key isn't expired in Stripe Dashboard
3. Ensure it's the test key, not live key

### Cannot delete/edit agency (403 error)

**Cause**: Not authenticated as admin
**Solution**:
1. Verify auth token exists
2. Check user role is "ADMIN" in database
3. Verify Bearer token in request header

---

## Feature Pricing

| Feature | Price | Duration |
|---------|-------|----------|
| AI Help | $49.99 | 1 month |
| SOP Testing | $49.99 | 1 month |
| Visa Consultancy | $99.99 | 1 month |
| Premium Bundle | $149.99 | 1 month |

---

## File Locations

### Backend
- Routes: `backend/src/routes/payments.js`, `backend/src/routes/consultancy.js`
- Schema: `backend/prisma/schema.prisma`
- Server: `backend/server.js`

### Frontend
- Pages: `frontend/src/pages/PremiumCheckout.jsx`, `PaymentSuccess.jsx`, `PaymentCancel.jsx`, `VisaConsultancy.jsx`
- Components: `frontend/src/components/PremiumComponents.jsx`
- Services: `frontend/src/api/paymentService.js`
- Admin: `frontend/src/pages/admin/ConsultancyManagement.jsx`

---

## Security Considerations

1. **Never expose Stripe secret key** - only use in backend
2. **Use HTTPS** in production for webhook endpoint
3. **Validate webhook signature** - prevents spoofing
4. **Expire premium access** - check expiry date on feature access
5. **Soft delete agencies** - don't permanently remove data
6. **Validate user permissions** - check admin role on sensitive routes

---

## Support

For issues:
1. Check logs: `docker logs <container-id>`
2. Review Stripe Dashboard: https://dashboard.stripe.com
3. Check database: verify Payment and VisaConsultancy entries
4. Test webhook: use Stripe CLI

---

**Last Updated**: 2026-04-12
**Version**: 1.0
