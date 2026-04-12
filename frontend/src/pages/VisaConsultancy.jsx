/**
 * Visa Consultancy Agencies Page
 * Display list of visa consultants agencies (premium feature)
 */

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { GlassNavbar } from "../components/GlassNavbar";
import { PremiumFeatureGuard, PremiumUpgradeButton } from "../components/PremiumComponents";

const VisaConsultancy = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchAgencies();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchAgenciesByCountry(selectedCountry);
    } else {
      fetchAgencies();
    }
  }, [selectedCountry]);

  const fetchAgencies = async () => {
    try {
      const response = await axios.get("/api/consultancy/agencies");
      setAgencies(response.data.data || []);
    } catch (error) {
      console.error("Error fetching agencies:", error);
      toast.error("Failed to load agencies");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgenciesByCountry = async (country) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/consultancy/agencies-by-country/${country}`);
      setAgencies(response.data.data || []);
    } catch (error) {
      console.error("Error fetching agencies by country:", error);
      toast.error("Failed to load agencies for this country");
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get("/api/countries");
      const uniqueCountries = Array.from(
        new Set(response.data.data.map((c) => c.countryName))
      );
      setCountries(uniqueCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const handleContactAgency = (agency) => {
    // You could implement contact form or email integration here
    if (agency.email) {
      window.location.href = `mailto:${agency.email}`;
    } else if (agency.website) {
      window.open(agency.website, "_blank");
    } else {
      toast.info("No contact information available");
    }
  };

  const PremiumContent = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <GlassNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Visa Consultancy Agencies
          </h1>
          <p className="text-lg text-gray-600">
            Connect with trusted visa consultants around the world
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Filter by Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Agencies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : agencies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No agencies found for the selected criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencies.map((agency) => (
              <div
                key={agency.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {agency.agencyName}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(agency.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {agency.rating.toFixed(1)}/5
                    </span>
                  </div>

                  {/* Location */}
                  {(agency.city || agency.country) && (
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {agency.city}, {agency.country}
                    </p>
                  )}

                  {/* Description */}
                  {agency.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {agency.description}
                    </p>
                  )}

                  {/* Specializations */}
                  {agency.specializations && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Specializations:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {agency.specializations.split(",").map((spec, i) => (
                          <span
                            key={i}
                            className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold"
                          >
                            {spec.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Button */}
                  <button
                    onClick={() => handleContactAgency(agency)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Contact Agency
                  </button>

                  {/* Website Link */}
                  {agency.website && (
                    <a
                      href={agency.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center text-blue-600 hover:text-blue-700 text-sm mt-2 underline"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PremiumFeatureGuard
      featureType="VISA_CONSULTANCY"
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <GlassNavbar />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <svg
                className="w-20 h-20 mx-auto mb-4 text-yellow-500"
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Access Visa Consultancy Agencies
              </h1>
              <p className="text-gray-600 mb-8 text-lg">
                Unlock premium access to connect with expert visa consultancy agencies
                around the world.
              </p>
              <PremiumUpgradeButton
                featureType="VISA_CONSULTANCY"
                size="lg"
                className="mx-auto"
              />
            </div>
          </div>
        </div>
      }
    >
      <PremiumContent />
    </PremiumFeatureGuard>
  );
};

export default VisaConsultancy;
