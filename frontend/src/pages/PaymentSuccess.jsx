/**
 * Payment Success Page
 * Displayed after successful Stripe checkout
 */

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { GlassNavbar } from "../components/GlassNavbar";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [paymentDetails, setPaymentDetails] = useState(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    verifyPayment();
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      const token = localStorage.getItem("auth_token");
      const response = await axios.get(
        `/api/payments/verify-session/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data.data;
      setPaymentDetails(data);

      if (data.status === "SUCCESS" || data.paymentStatus === "paid") {
        setStatus("success");
      } else {
        setStatus("pending");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setStatus("error");
    }
  };

  const getFeatureName = (featureType) => {
    const names = {
      AI_HELP: "AI Help",
      SOP_TESTING: "SOP Testing",
      VISA_CONSULTANCY: "Visa Consultancy",
      PREMIUM_BUNDLE: "Premium Bundle",
    };
    return names[featureType] || featureType;
  };

  const handleContinue = () => {
    const featureRedirects = {
      AI_HELP: "/ai-assistant",
      SOP_TESTING: "/sop-review",
      VISA_CONSULTANCY: "/visa-outcome",
      PREMIUM_BUNDLE: "/dashboard",
    };

    const redirectUrl =
      featureRedirects[paymentDetails?.featureType] || "/dashboard";
    navigate(redirectUrl);
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Verifying your payment...</p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
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
