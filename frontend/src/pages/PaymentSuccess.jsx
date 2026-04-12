/**
 * Payment Success Page
 * Displayed after successful Stripe checkout
 * CRITICAL: Refreshes user data to update premium status
 */

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { HiOutlineCheckCircle, HiOutlineArrowRight } from "react-icons/hi2";
import GlassCard from "../components/ui/GlassCard";
import PrimaryButton from "../components/ui/PrimaryButton";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [paymentDetails, setPaymentDetails] = useState(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    verifyPaymentAndRefreshUser();
  }, [sessionId]);

  const getFeatureRedirectUrl = (featureType) => {
    const redirectMap = {
      AI_HELP: "/ai-assistant",
      SOP_TESTING: "/sop-review",
      VISA_CONSULTANCY: "/visa-outcome",
      PREMIUM_BUNDLE: "/ai-assistant",
    };
    return redirectMap[featureType] || "/dashboard";
  };

  const verifyPaymentAndRefreshUser = async () => {
    try {
      if (!sessionId) {
        setStatus("error");
        toast.error("No session ID found");
        setTimeout(() => navigate("/ai-assistant"), 3000);
        return;
      }

      // Step 1: Verify payment
      const paymentResponse = await API.get(
        `/api/payments/verify-session/${sessionId}`
      );

      const paymentData = paymentResponse.data.data;
      setPaymentDetails(paymentData);

      // Step 2: CRITICAL - Refresh user data from backend
      // This is essential to get the updated isPremium, premiumFeatures, and premiumExpiryDate
      const userResponse = await API.get("/api/user/me");
      const userData = userResponse.data.data;

      // Step 3: Update local storage with new user data
      localStorage.setItem("user", JSON.stringify(userData));

      // Step 4: Emit custom event to notify other components of the update
      window.dispatchEvent(new Event("userUpdated"));

      if (paymentData.status === "SUCCESS" || paymentData.paymentStatus === "paid") {
        setStatus("success");
        toast.success("🎉 Premium features activated!");

        // Step 5: Auto-redirect to feature page after 2 seconds
        setTimeout(() => {
          const redirectUrl = getFeatureRedirectUrl(paymentData.featureType);
          navigate(redirectUrl);
        }, 2000);
      } else {
        setStatus("pending");
        toast.loading("Payment is being processed...");

        // Keep checking every 2 seconds
        setTimeout(() => {
          verifyPaymentAndRefreshUser();
        }, 2000);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setStatus("error");
      toast.error("Failed to verify payment. Redirecting...");
      setTimeout(() => navigate("/ai-assistant"), 3000);
    }
  };

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <GlassCard className="p-12 text-center">
          <div className="animate-spin mb-4">
            <HiOutlineCheckCircle className="w-16 h-16 mx-auto text-blue-500" />
          </div>
          <p className="text-gray-600 text-lg">Verifying your payment...</p>
        </GlassCard>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <GlassCard className="max-w-md w-full p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-slate-600 mb-8">
              We couldn't verify your payment. Please contact support or try again.
            </p>
            <PrimaryButton
              onClick={() => navigate("/ai-assistant")}
              className="w-full"
            >
              Return to AI Assistant
            </PrimaryButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full p-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-pulse"></div>
              <HiOutlineCheckCircle className="w-20 h-20 text-green-500 relative z-10" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {status === "success"
              ? "Payment Successful!"
              : "Payment Received"}
          </h1>

          {/* Message */}
          <p className="text-slate-600 mb-8">
            {status === "success"
              ? "Your premium subscription has been activated. All premium features are now available!"
              : "Your payment has been received. Premium features will be activated shortly."}
          </p>

          {/* Status Details */}
          {paymentDetails && (
            <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-semibold text-slate-900 mb-3">
                Subscription Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Feature Type:</span>
                  <span className="font-semibold text-slate-900">
                    {paymentDetails.featureType?.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount Paid:</span>
                  <span className="font-semibold text-slate-900">
                    ${(paymentDetails.amount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Valid for:</span>
                  <span className="font-semibold text-slate-900">
                    30 days
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mb-8 text-left bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Premium features are now unlocked in your dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Confirmation email sent to your registered email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Valid for 30 days from purchase date</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <PrimaryButton
            onClick={() => navigate("/ai-assistant")}
            className="w-full flex items-center justify-center gap-2 mb-3"
          >
            Start Using AI Assistant
            <HiOutlineArrowRight className="w-5 h-5" />
          </PrimaryButton>

          <button
            onClick={() => navigate("/profile")}
            className="w-full px-4 py-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition text-sm font-medium"
          >
            View Subscription Details
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default PaymentSuccess;
