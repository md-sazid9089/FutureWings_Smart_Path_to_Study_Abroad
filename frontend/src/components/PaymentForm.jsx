import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm = ({ amount = 5000, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe is not loaded.');
      setLoading(false);
      return;
    }

    const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (methodError) {
      setError(methodError.message);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id, amount }),
      });
      const paymentIntent = await response.json();

      if (!paymentIntent.client_secret) {
        setError('Failed to create payment intent.');
        setLoading(false);
        return;
      }

      const { error: stripeError } = await stripe.confirmCardPayment(paymentIntent.client_secret);

      if (stripeError) {
        setError(stripeError.message);
      } else {
        setPaymentSuccess(true);
        // Fetch user status after payment
        try {
          const res = await fetch('/api/user/me');
          const data = await res.json();
          if (data.success && data.data && data.data.isPremium) {
            setPremiumUnlocked(true);
            if (onSuccess) onSuccess();
          } else {
            setPremiumUnlocked(false);
          }
        } catch (e) {
          setPremiumUnlocked(false);
        }
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Complete Your Payment</h2>
      {paymentSuccess ? (
        premiumUnlocked ? (
          <div style={{ color: 'green', fontWeight: 'bold' }}>Payment Successful! Premium Features Unlocked!</div>
        ) : (
          <div style={{ color: 'orange', fontWeight: 'bold' }}>Payment Successful! (But premium not unlocked, please contact support.)</div>
        )
      ) : (
        <form onSubmit={handleSubmit}>
          <CardElement options={{ hidePostalCode: true }} />
          <button type="submit" disabled={!stripe || loading} style={{ marginTop: 16 }}>
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </form>
      )}
    </div>
  );
};

export default PaymentForm;
