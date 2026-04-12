/**
 * Stripe Checkout Page
 * Displays premium feature options and initiates Stripe checkout
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { GlassNavbar } from "../components/GlassNavbar";

const PremiumCheckout = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState(null);

  useEffect(() => {
    fetchUserStatus();
  }, []);

  const fetchUserStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await axios.get("/api/payments/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserStatus(response.data.data);
    } catch (error) {
      console.error("Failed to fetch user status:", error);
    }
  };

  const plans = [
    {
      id: "AI_HELP",
      name: "AI Help",
      price: 49.99,
      description: "Get AI-powered assistance with your applications",
      features: ["AI Assistant", "Application Review", "Personalized Guidance"],
    },
    {
      id: "SOP_TESTING",
      name: "SOP Testing",
      price: 49.99,
      description: "Test and refine your Statement of Purpose",
      features: ["SOP Evaluation", "Writing Tips", "Multiple Revisions"],
    },
    {
      id: "VISA_CONSULTANCY",
      name: "Visa Consultancy",
      price: 99.99,
      description: "Connect with expert visa consultants",
      features: ["Access to Agencies", "Expert Consultations", "Visa Guidance"],
    },
    {
      id: "PREMIUM_BUNDLE",
      name: "Premium Bundle",
      price: 149.99,
      description: "Get all premium features for one month",
      features: ["All Features", "Priority Support", "Best Value"],
      isPopular: true,
    },
  ];

  const handleCheckout = async (planId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      const response = await axios.post(
        "/api/payments/create-checkout-session",
        { featureType: planId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Redirect to Stripe Checkout
      if (response.data.data.url) {
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.error?.message || "Failed to initiate checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <GlassNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Unlock Premium Features
          </h1>
          <p className="text-xl text-gray-600">
            Elevate your study abroad journey with our premium services
          </p>
          {userStatus?.isPremium && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg inline-block">
              <p className="text-green-800">
                ✓ You have premium access until {new Date(userStatus.expiryDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                plan.isPopular ? "ring-2 ring-blue-500 lg:scale-105" : ""
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  Popular
                </div>
              )}

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-blue-600">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-300 ${
                    plan.isPopular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? "Processing..." : "Choose Plan"}
                </button>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <span className="mr-2 text-blue-500">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="group cursor-pointer">
              <summary className="flex justify-between items-center font-semibold text-gray-900">
                How long is the subscription valid?
                <span className="group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="mt-2 text-gray-600">
                All premium subscriptions are valid for 30 days from the date of purchase.
              </p>
            </details>

            <details className="group cursor-pointer">
              <summary className="flex justify-between items-center font-semibold text-gray-900">
                Can I cancel my subscription?
                <span className="group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="mt-2 text-gray-600">
                You can cancel anytime from your account settings. Your access will remain valid
                until the end of your subscription period.
              </p>
            </details>

            <details className="group cursor-pointer">
              <summary className="flex justify-between items-center font-semibold text-gray-900">
                Is my payment secure?
                <span className="group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="mt-2 text-gray-600">
                Yes! We use Stripe for payment processing, which is PCI DSS compliant and uses
                industry-leading security standards.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumCheckout;
