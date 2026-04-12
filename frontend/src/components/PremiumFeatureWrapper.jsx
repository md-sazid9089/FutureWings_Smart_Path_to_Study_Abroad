/**
 * Premium Feature Wrapper
 * Shows page with transparent overlay if user doesn't have premium access
 * Displays upgrade prompt overlaid on the page
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineSparkles, HiOutlineLockClosed } from "react-icons/hi2";
import PrimaryButton from "./ui/PrimaryButton";

const PremiumFeatureWrapper = ({ children, feature }) => {
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();

    // Listen for premium status updates after payment
    window.addEventListener("userUpdated", checkPremiumStatus);
    return () => window.removeEventListener("userUpdated", checkPremiumStatus);
  }, []);

  const checkPremiumStatus = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        
        // Check if user is premium and has the right feature
        const hasPremium =
          user.isPremium &&
          (feature === "PREMIUM_BUNDLE" ||
            (user.premiumFeatures && user.premiumFeatures.includes(feature)));
        
        setIsPremium(hasPremium);
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">{children}</div>;
  }

  if (!isPremium) {
    return (
      <div className="relative">
        {/* Page content with reduced opacity */}
        <div className="pointer-events-none select-none opacity-40 blur-sm">
          {children}
        </div>

        {/* Premium upgrade overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Lock icon */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
                  <HiOutlineLockClosed className="w-16 h-16 text-blue-600 relative z-10" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Premium Feature
              </h2>

              {/* Description */}
              <p className="text-slate-600 mb-2">
                This feature is exclusively available to premium members.
              </p>
              <p className="text-slate-500 text-sm mb-8">
                Upgrade now to unlock {feature === "AI_HELP" && "AI-powered assistance"} 
                {feature === "SOP_TESTING" && "SOP review and testing"}
                {feature === "VISA_CONSULTANCY" && "expert visa consultancy"}
                {feature === "PREMIUM_BUNDLE" && "all premium features"} and more.
              </p>

              {/* Benefits */}
              <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <HiOutlineSparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Unlimited requests</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <HiOutlineSparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Expert-level assistance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <HiOutlineSparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">30 days of access</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <PrimaryButton
                onClick={() => navigate("/premium-checkout")}
                className="w-full mb-3"
              >
                Upgrade to Premium
              </PrimaryButton>

              <button
                onClick={() => navigate("/ai-assistant")}
                className="w-full px-4 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition text-sm font-medium"
              >
                Continue as Free User
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is premium - show page normally
  return <div>{children}</div>;
};

export default PremiumFeatureWrapper;
