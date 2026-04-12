/**
 * Example: How to Use Premium Features in Your App
 * 
 * This file shows practical examples of how to implement
 * Stripe premium features throughout your application.
 */

// ============================================
// Example 1: Protecting a Feature with Premium Guard
// ============================================

import React from 'react';
import { PremiumFeatureGuard, PremiumUpgradeButton } from '../components/PremiumComponents';

// your-ai-assistant-page.jsx
export function AIAssistantPage() {
  return (
    <PremiumFeatureGuard 
      featureType="AI_HELP"
      fallback={
        <div className="text-center p-8">
          <h2>Unlock AI-Powered Assistance</h2>
          <p>Get expert guidance for your applications</p>
          <PremiumUpgradeButton featureType="AI_HELP" size="lg" />
        </div>
      }
    >
      {/* This content only shows if user has AI_HELP premium feature */}
      <AIAssistantContent />
    </PremiumFeatureGuard>
  );
}

// ============================================
// Example 2: Using Payment Service to Check Status
// ============================================

import paymentService from '../api/paymentService';

export function ProfilePage() {
  const [isPremium, setIsPremium] = React.useState(false);
  const [daysRemaining, setDaysRemaining] = React.useState(0);

  React.useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const status = await paymentService.getSubscriptionStatus();
      setIsPremium(status.isPremium);
      setDaysRemaining(status.daysRemaining);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  return (
    <div>
      {isPremium ? (
        <div className="bg-green-50 p-4 rounded">
          <p>✓ Premium Member - {daysRemaining} days remaining</p>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded">
          <PremiumUpgradeButton />
        </div>
      )}
    </div>
  );
}

// ============================================
// Example 3: Adding Premium Features to Navbar
// ============================================

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-items">
        <a href="/">Home</a>
        <a href="/applications">Applications</a>
        
        {/* Premium Feature Links */}
        <a href="/ai-assistant" className="premium-link">
          🤖 AI Assistant
        </a>
        <a href="/sop-review" className="premium-link">
          📝 SOP Testing
        </a>
        <a href="/visa-consultancy" className="premium-link">
          🌍 Visa Consultancy
        </a>

        {/* Premium Upgrade CTA */}
        <a href="/premium-checkout" className="btn-primary">
          ⭐ Go Premium
        </a>
      </div>
    </nav>
  );
}

// ============================================
// Example 4: Component with Conditional Premium Features
// ============================================

export function ApplicationCard({ application }) {
  const [hasAIHelp, setHasAIHelp] = React.useState(false);

  React.useEffect(() => {
    checkFeature();
  }, []);

  const checkFeature = async () => {
    try {
      const hasFeature = await paymentService.hasFeature('AI_HELP');
      setHasAIHelp(hasFeature);
    } catch (error) {
      console.error('Failed to check feature:', error);
    }
  };

  return (
    <div className="card">
      <h3>{application.programName}</h3>
      <p>{application.university}</p>

      <div className="card-actions">
        <button>View Details</button>
        
        {/* Show AI Review button only if user has AI_HELP feature */}
        {hasAIHelp && (
          <button className="btn-premium">
            🤖 Get AI Review
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Example 5: Admin Feature - Consultancy Management
// ============================================

import axios from 'axios';
import { AdminRoute } from '../components/AdminRoute';

export function AdminDashboard() {
  const handleAddConsultancy = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        '/api/consultancy/agencies',
        {
          agencyName: 'New Agency',
          email: 'contact@agency.com',
          country: 'USA',
          specializations: 'USA,Canada,UK',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Agency created:', response.data);
    } catch (error) {
      console.error('Failed to add consultancy:', error);
    }
  };

  return (
    <AdminRoute>
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        
        {/* Admin can manage consultancy agencies */}
        <section>
          <h2>Consultancy Management</h2>
          <a href="/admin/consultancy" className="btn">
            Manage Agencies
          </a>
        </section>

        {/* Quick action to add consultancy */}
        <button onClick={handleAddConsultancy} className="btn-primary">
          + Add Consultancy
        </button>
      </div>
    </AdminRoute>
  );
}

// ============================================
// Example 6: Handling Checkout and Success
// ============================================

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function CheckoutButton({ featureType }) {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const response = await paymentService.createCheckoutSession(featureType);
      
      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout} 
      disabled={loading}
      className="btn-primary"
    >
      {loading ? 'Loading...' : `Upgrade - $${pricing[featureType]}`}
    </button>
  );
}

const pricing = {
  AI_HELP: '49.99',
  SOP_TESTING: '49.99',
  VISA_CONSULTANCY: '99.99',
  PREMIUM_BUNDLE: '149.99',
};

// ============================================
// Example 7: App.jsx Route Configuration
// ============================================

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PremiumCheckout from './pages/PremiumCheckout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import VisaConsultancy from './pages/VisaConsultancy';
import AdminConsultancyManagement from './pages/admin/ConsultancyManagement';
import AIAssistantPage from './pages/AIAssistant';
import SopReviewPage from './pages/SopReview';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Premium Feature Routes */}
        <Route path="/premium-checkout" element={<PremiumCheckout />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
        
        {/* Protected Premium Features */}
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/sop-review" element={<SopReviewPage />} />
        <Route path="/visa-consultancy" element={<VisaConsultancy />} />

        {/* Admin Routes */}
        <Route 
          path="/admin/consultancy" 
          element={
            <AdminRoute>
              <AdminConsultancyManagement />
            </AdminRoute>
          } 
        />

        {/* Other routes... */}
      </Routes>
    </Router>
  );
}

// ============================================
// Example 8: Environment Variables (.env)
// ============================================

/*
BACKEND (.env in backend/ directory):
================================================

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuv
STRIPE_PUBLIC_KEY=pk_test_51234567890abcdefghijklmnopqrstuv
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuv

# App URLs
FRONTEND_URL=http://localhost:3000
DATABASE_URL=sqlserver://server:port;database=db;user=user;password=pass

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Node Environment
NODE_ENV=development
PORT=5000


FRONTEND (.env in frontend/ directory):
================================================

# Stripe
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_51234567890abcdefghijklmnopqrstuv

# API
REACT_APP_API_URL=http://localhost:5000/api

# Environment
REACT_APP_ENV=development
*/

// ============================================
// Example 9: Testing Payment Flow (Jest/Vitest)
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import paymentService from '../api/paymentService';

describe('Premium Feature Flow', () => {
  beforeEach(() => {
    localStorage.setItem('auth_token', 'test_token');
  });

  it('should create checkout session', async () => {
    const response = await paymentService.createCheckoutSession('AI_HELP');
    
    expect(response).toHaveProperty('data.sessionId');
    expect(response).toHaveProperty('data.url');
  });

  it('should get subscription status', async () => {
    const status = await paymentService.getSubscriptionStatus();
    
    expect(status).toHaveProperty('isPremium');
    expect(status).toHaveProperty('features');
    expect(status).toHaveProperty('daysRemaining');
  });

  it('should check specific feature', async () => {
    const hasFeature = await paymentService.hasFeature('AI_HELP');
    
    expect(typeof hasFeature).toBe('boolean');
  });

  it('should verify session status', async () => {
    const result = await paymentService.verifySession('cs_test_123');
    
    expect(result).toHaveProperty('status');
    expect(['SUCCESS', 'PENDING', 'FAILED']).toContain(result.status);
  });
});

// ============================================
// Example 10: Troubleshooting Common Issues
// ============================================

/*
ISSUE 1: "Cannot read property 'data' of undefined"
- SOLUTION: Check that API endpoint is returning { success: true, data: {...} }
- Check backend response format in paymentService.js

ISSUE 2: "Premium guard always shows upgrade button"
- SOLUTION: Check localStorage has 'auth_token'
- Check API call to /api/payments/status returns correct data
- Verify user has isPremium=true in database

ISSUE 3: "Webhook not being called"
- SOLUTION: Start Stripe CLI: stripe listen --forward-to localhost:5000/api/payments/webhook
- Verify STRIPE_WEBHOOK_SECRET in .env matches Stripe Dashboard
- Check that endpoint is receiving requests in Stripe Dashboard logs

ISSUE 4: "User can't see premium content after payment"
- SOLUTION: Check Payment table status is "SUCCESS"
- Verify User.isPremium=1 and premiumFeatures populated
- Refresh page - browser cache might need clearing
- Check premiumExpiryDate is in future

ISSUE 5: "Admin can't add consultancy agencies"
- SOLUTION: Verify user role is "ADMIN" not "USER"
- Check auth token is valid and sent in headers
- Verify CORS is enabled for your frontend URL
*/

// ============================================
// Example 11: Payment History Component
// ============================================

export function PaymentHistory() {
  const [payments, setPayments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const history = await paymentService.getPaymentHistory();
      setPayments(history);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="payment-history">
      <h2>Payment History</h2>
      
      {payments.length === 0 ? (
        <p>No payments yet. <a href="/premium-checkout">Upgrade now</a></p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.featureType.replace(/_/g, ' ')}</td>
                <td>${(payment.amount / 100).toFixed(2)}</td>
                <td>
                  <span className={`badge badge-${payment.status.toLowerCase()}`}>
                    {payment.status}
                  </span>
                </td>
                <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ============================================
// Example 12: Feature Availability Hook
// ============================================

export function useFeatureAccess(featureType) {
  const [hasAccess, setHasAccess] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    checkAccess();
  }, [featureType]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      const hasFeature = await paymentService.hasFeature(featureType);
      setHasAccess(hasFeature);
    } catch (err) {
      setError(err);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  return { hasAccess, loading, error };
}

// Usage:
export function MyComponent() {
  const { hasAccess, loading } = useFeatureAccess('AI_HELP');

  if (loading) return <div>Checking access...</div>;
  
  if (!hasAccess) {
    return <PremiumUpgradeButton featureType="AI_HELP" />;
  }

  return <YourPremiumComponent />;
}
