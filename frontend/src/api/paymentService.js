/**
 * Payment Service - API calls for payment operations
 */

import axios from "axios";
import { apiClient } from "./axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const paymentService = {
  /**
   * Create a checkout session with Stripe
   */
  createCheckoutSession: async (featureType) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await apiClient.post(
        `${API_BASE}/payments/create-checkout-session`,
        { featureType },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      const token = localStorage.getItem("auth_token");
      const response = await apiClient.get(
        `${API_BASE}/payments/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      const token = localStorage.getItem("auth_token");
      const response = await apiClient.get(
        `${API_BASE}/payments/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      const token = localStorage.getItem("auth_token");
      const response = await apiClient.get(
        `${API_BASE}/payments/verify-session/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
