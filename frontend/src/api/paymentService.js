/**
 * Payment Service - API calls for payment operations
 */

import API from "./axios";

const paymentService = {
  /**
   * Create a checkout session with Stripe
   */
  createCheckoutSession: async (featureType) => {
    try {
      const response = await API.post(
        "/api/payments/create-checkout-session",
        { featureType }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user's premium subscription status
   */
  getSubscriptionStatus: async () => {
    try {
      const response = await API.get("/api/payments/status");
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user's payment history
   */
  getPaymentHistory: async () => {
    try {
      const response = await API.get("/api/payments/history");
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Verify a payment session
   */
  verifySession: async (sessionId) => {
    try {
      const response = await API.get(`/api/payments/verify-session/${sessionId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Check if user has a specific feature
   */
  hasFeature: async (featureType) => {
    try {
      const status = await paymentService.getSubscriptionStatus();
      return (
        status.isPremium && status.features.includes(featureType)
      );
    } catch (error) {
      return false;
    }
  },

  /**
   * Check if subscription is still valid
   */
  isSubscriptionValid: async () => {
    try {
      const status = await paymentService.getSubscriptionStatus();
      return status.isPremium && status.daysRemaining > 0;
    } catch (error) {
      return false;
    }
  },
};

export default paymentService;
