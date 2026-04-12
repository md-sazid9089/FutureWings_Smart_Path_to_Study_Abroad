/**
 * Payment Success Page
 * Displayed after successful Stripe checkout
 * CRITICAL: Refreshes user data to update premium status
 */

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
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

  const verifyPaymentAndRefreshUser = async () => {
    try {
      if (!sessionId) {
        setStatus("error");
        toast.error("No session ID found");
        setTimeout(() => navigate("/ai-assistant"), 3000);
        return;
      }

      const token = localStorage.getItem("token");
      
      // Step 1: Verify payment
      const paymentResponse = await axios.get(
        `/api/payments/verify-session/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const paymentData = paymentResponse.data.data;
      setPaymentDetails(paymentData);

      // Step 2: CRITICAL - Refresh user data from backend
      // This is essential to get the updated isPremium, premiumFeatures, and premiumExpiryDate
      const userResponse = await axios.get("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = userResponse.data.data;

      // Step 3: Update local storage with new user data
      localStorage.setItem("user", JSON.stringify(userData));

      // Step 4: Emit custom event to notify other components of the update
      window.dispatchEvent(new Event("userUpdated"));

      if (paymentData.status === "SUCCESS" || paymentData.paymentStatus === "paid") {
        setStatus("success");
        toast.success("🎉 Premium features activated!");
      } else {
        setStatus("pending");
        toast.loading("Payment is being processed...");
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
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Your payment has been processed successfully.
            </p>

            {paymentDetails && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Details
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Feature:</span>
                    <span className="font-semibold">
                      {getFeatureName(paymentDetails.featureType)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Amount:</span>
                    <span className="font-semibold">
                      ${(paymentDetails.amount / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Status:</span>
                    <span className="font-semibold text-green-600">
                      ✓ Completed
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-8">
              Your premium features are now active! You can start using them
              immediately.
            </p>

            <button
              onClick={handleContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Continue to {paymentDetails && getFeatureName(paymentDetails.featureType)}
            </button>
          </div>
        );

      case "pending":
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Processing
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your payment is being processed. This usually takes a few seconds.
              Please wait...
            </p>

            <button
              onClick={verifyPayment}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Refresh Status
            </button>
          </div>
        );

      case "error":
      default:
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Error
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              We couldn't verify your payment. Please try again or contact support.
            </p>

            <div className="space-x-4">
              <button
                onClick={() => navigate("/premium-checkout")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <GlassNavbar />

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
