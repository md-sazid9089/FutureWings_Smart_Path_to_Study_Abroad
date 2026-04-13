import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '../components/PaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51Sc8PBQLjELYOwcwzCAF7n2NbGiwglkfyOQWmF6AViXFP3s4BQR6nSH8RATKYzQXpZ3VSPeqCeKOzUIue7OiZdGE0013d9AGHN');

const PremiumContent = () => (
  <div style={{ marginTop: 32, padding: 16, background: '#f0f8ff', borderRadius: 8 }}>
    <h2>Welcome to Premium Content!</h2>
    <p>Enjoy AI-powered recommendations and more!</p>
  </div>
);

const InlinePaymentPage = () => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);

  const handleGetStartedClick = async () => {
    try {
      // Call backend to instantly unlock premium
      const res = await fetch('/api/user/get-started', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        // Optionally show a toast or message here
      }
    } catch (e) {
      // Optionally handle error
    }
    setShowPaymentForm(true);
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 32 }}>
      {!showPaymentForm && !premiumUnlocked && (
        <button onClick={handleGetStartedClick} style={{ fontSize: 18, padding: '12px 32px' }}>
          Get Started
        </button>
      )}
      {showPaymentForm && !premiumUnlocked && (
        <Elements stripe={stripePromise}>
          <PaymentForm amount={5000} onSuccess={() => setPremiumUnlocked(true)} />
        </Elements>
      )}
      {premiumUnlocked && <PremiumContent />}
    </div>
  );
};

export default InlinePaymentPage;
