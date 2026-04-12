/**
 * Premium Checkout Page
 * Displays premium feature options and initiates Stripe checkout
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { HiOutlineSparkles, HiOutlineCheckCircle, HiOutlineArrowLeft } from "react-icons/hi2";
import { PageHeader } from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import PrimaryButton from "../components/ui/PrimaryButton";

const PremiumCheckout = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [userStatus, setUserStatus] = useState(null);

  useEffect(() => {
    checkCurrentStatus();
  }, []);

  const checkCurrentStatus = async () => {
    try {
      const response = await API.get("/api/payments/status");

      const status = response.data.data;
      setUserStatus(status);

      if (status.isPremium) {
        toast.success("You already have premium access!");
        navigate("/ai-assistant");
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const handlePayment = async (featureType) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await API.post("/api/payments/create-checkout-session", {
        featureType,
      });

      if (response.data.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.data.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.error?.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: "AI_HELP",
      name: "AI Writing Assistant",
      price: 49.99,
      duration: "30 days",
      description: "Get AI-powered assistance for your SOP and applications",
      features: [
        "AI-powered SOP writing",
        "Grammar & style suggestions",
        "24/7 instant support",
        "Unlimited revisions",
      ],
    },
    {
      id: "SOP_TESTING",
      name: "SOP Review & Testing",
      price: 49.99,
      duration: "30 days",
      description: "Professional review and testing of your Statement of Purpose",
      features: [
        "Expert SOP review",
        "Detailed feedback",
        "Multiple versions support",
        "Interview preparation",
      ],
    },
    {
      id: "VISA_CONSULTANCY",
      name: "Visa Consultancy",
      price: 99.99,
      duration: "30 days",
      description: "Expert visa guidance and document preparation support",
      features: [
        "Visa requirement guide",
        "Document checklist",
        "Expert one-on-one consultation",
        "Priority email support",
      ],
    },
    {
      id: "PREMIUM_BUNDLE",
      name: "Premium Bundle",
      price: 149.99,
      duration: "30 days",
      description: "All premium features combined at a discounted price",
      features: [
        "AI Writing Assistant",
        "SOP Review & Testing",
        "Visa Consultancy",
        "24/7 Priority support",
      ],
      recommended: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Unlock Premium Features"
        subtitle="Enhance your study abroad journey with AI-powered tools and expert guidance"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <button
          onClick={() => navigate("/ai-assistant")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          Back to AI Assistant
        </button>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <GlassCard
              key={plan.id}
              className={`flex flex-col h-full transition transform ${
                plan.recommended ? "ring-2 ring-blue-400 scale-105" : ""
              }`}
            >
              {/* Recommended badge */}
              {plan.recommended && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <HiOutlineSparkles className="w-4 h-4" />
                    Recommended
                  </span>
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {plan.name}
              </h3>

              {/* Description */}
              <p className="text-slate-600 text-sm mb-4 flex-grow">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    ${plan.price}
                  </span>
                  <span className="text-slate-600 text-sm">/ {plan.duration}</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <PrimaryButton
                onClick={() => handlePayment(plan.id)}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Get Started"}
              </PrimaryButton>
            </GlassCard>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Is my payment secure?",
                a: "Yes! We use Stripe, a level 1 PCI-DSS compliant payment processor trusted by millions of businesses worldwide.",
              },
              {
                q: "What happens after I purchase?",
                a: "Your premium access will be activated immediately. You'll be redirected to your dashboard where you can start using premium features.",
              },
              {
                q: "How long is the access valid?",
                a: "Premium access is valid for 30 days from the date of purchase. You can renew your subscription anytime.",
              },
              {
                q: "Do you offer refunds?",
                a: "We offer full refunds within 48 hours of purchase if you're not satisfied with our service.",
              },
            ].map((item, idx) => (
              <GlassCard key={idx} className="p-6">
                <h4 className="font-semibold text-slate-900 mb-3">{item.q}</h4>
                <p className="text-slate-600 text-sm">{item.a}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumCheckout;
