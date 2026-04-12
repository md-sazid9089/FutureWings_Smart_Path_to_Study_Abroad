/**
 * Premium Upgrade Button Component
 * Shows upgrade button if user doesn't have premium access
 * Shows the locked feature if user doesn't have premium
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const PremiumUpgradeButton = ({
  featureType = "PREMIUM_BUNDLE",
  className = "",
  size = "md",
}) => {
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
    
    // Listen for user data updates (e.g., after payment)
    const handleUserUpdate = () => {
      checkPremiumStatus();
    };
    
    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      // First check if user data is in localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.isPremium) {
          setIsPremium(true);
          setLoading(false);
          return;
        }
      }

      // If not in localStorage, fetch from API
      const response = await axios.get("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = response.data.data;
      
      // Check if premium and has the feature or is PREMIUM_BUNDLE
      const hasPremium =
        user.isPremium &&
        (featureType === "PREMIUM_BUNDLE" ||
          (user.premiumFeatures &&
            user.premiumFeatures.includes(featureType)));

      setIsPremium(hasPremium);
      
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Premium check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  if (loading) return null;

  if (isPremium) return null;

  return (
    <button
      onClick={() => navigate("/premium-checkout")}
      className={`
        bg-gradient-to-r from-blue-600 to-purple-600 
        hover:from-blue-700 hover:to-purple-700
        text-white font-semibold rounded-lg 
        transition-all duration-200 transform hover:scale-105
        flex items-center gap-2
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
      Upgrade to Premium
    </button>
  );
};

export const PremiumBadge = ({ feature, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 ${className}`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      Premium
    </span>
  );
};

export const PremiumFeatureGuard = ({
  children,
  featureType = "PREMIUM_BUNDLE",
  fallback = null,
}) => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
    
    // Listen for user data updates (e.g., after payment)
    const handleUserUpdate = () => {
      checkPremiumStatus();
    };
    
    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, [featureType]);

  const checkPremiumStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      // First check if user data is in localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.isPremium) {
          // Check if user has the specific feature or has PREMIUM_BUNDLE
          const hasPremium =
            featureType === "PREMIUM_BUNDLE" ||
            (user.premiumFeatures &&
              user.premiumFeatures.includes(featureType));
          
          setIsPremium(hasPremium);
          setLoading(false);
          return;
        }
      }

      // If not in localStorage, fetch from API
      const response = await axios.get("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = response.data.data;
      
      // Check if premium and has the feature or is PREMIUM_BUNDLE
      const hasPremium =
        user.isPremium &&
        (featureType === "PREMIUM_BUNDLE" ||
          (user.premiumFeatures &&
            user.premiumFeatures.includes(featureType)));

      setIsPremium(hasPremium);
      
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Premium check error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded h-20"></div>;
  }

  if (!isPremium) {
    return fallback || <PremiumUpgradeButton featureType={featureType} />;
  }

  return children;
};

export default { PremiumUpgradeButton, PremiumBadge, PremiumFeatureGuard };
