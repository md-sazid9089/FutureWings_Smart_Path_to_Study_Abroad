/**
 * Payment Cancel Page
 * Displayed when user cancels Stripe checkout
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { GlassNavbar } from "../components/GlassNavbar";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <GlassNavbar />

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
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
                <path d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>

          <p className="text-lg text-gray-600 mb-2">
            Your payment has been cancelled.
          </p>

          <p className="text-gray-600 mb-8">
            No charges have been made to your account. You can try again whenever
            you're ready.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/premium-checkout")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Back to Premium Plans
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Go to Dashboard
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Need help?</strong> If you have any questions about our
              premium plans, feel free to contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
