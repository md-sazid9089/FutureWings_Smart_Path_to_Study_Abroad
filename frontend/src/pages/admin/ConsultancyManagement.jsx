/**
 * Admin Consultancy Management Page
 * Allows admins to add, edit, delete visa consultancy agencies
 */

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminConsultancyManagement = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    agencyName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    website: "",
    description: "",
    specializations: "",
    rating: 0,
  });

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await axios.get("/api/consultancy/admin/all-agencies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgencies(response.data.data || []);
    } catch (error) {
      console.error("Error fetching agencies:", error);
      toast.error("Failed to load agencies");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agencyName.trim()) {
      toast.error("Agency name is required");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const headers = { Authorization: `Bearer ${token}` };

      if (editingId) {
        // Update existing
        await axios.put(
          `/api/consultancy/agencies/${editingId}`,
          formData,
          { headers }
        );
        toast.success("Agency updated successfully");
      } else {
        // Create new
        await axios.post("/api/consultancy/agencies", formData, { headers });
        toast.success("Agency created successfully");
      }

      resetForm();
      fetchAgencies();
    } catch (error) {
      console.error("Error saving agency:", error);
      toast.error(
        error.response?.data?.error?.message || "Failed to save agency"
      );
    }
  };

  const handleEdit = (agency) => {
    setFormData({
      agencyName: agency.agencyName,
      email: agency.email || "",
      phone: agency.phone || "",
      country: agency.country || "",
      city: agency.city || "",
      website: agency.website || "",
      description: agency.description || "",
      specializations: agency.specializations || "",
      rating: agency.rating || 0,
    });
    setEditingId(agency.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agency?")) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      await axios.delete(`/api/consultancy/agencies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Agency deleted successfully");
      fetchAgencies();
    } catch (error) {
      console.error("Error deleting agency:", error);
      toast.error("Failed to delete agency");
    }
  };

  const resetForm = () => {
    setFormData({
      agencyName: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      website: "",
      description: "",
      specializations: "",
      rating: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleBulkImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.csv";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        let data;

        if (file.name.endsWith(".json")) {
          data = JSON.parse(text);
        } else if (file.name.endsWith(".csv")) {
          // Simple CSV parser
          const lines = text.split("\n");
          const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
          data = lines.slice(1).map((line) => {
            const values = line.split(",");
            const obj = {};
            headers.forEach((header, i) => {
              obj[header] = values[i]?.trim() || "";
            });
            return obj;
          });
        }

        const token = localStorage.getItem("auth_token");
        await axios.post(
          "/api/consultancy/bulk-import",
          { agencies: data },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(`Successfully imported ${data.length} agencies`);
        fetchAgencies();
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import file");
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Visa Consultancy Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage visa consultancy agencies available to premium users
            </p>
          </div>
          <div className="space-x-2">
            <button
              onClick={handleBulkImport}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Import (JSON/CSV)
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              + Add Agency
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Agency" : "Add New Agency"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="agencyName"
                placeholder="Agency Name *"
                value={formData.agencyName}
                onChange={handleInputChange}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleInputChange}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                name="website"
                placeholder="Website URL"
                value={formData.website}
                onChange={handleInputChange}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="md:col-span-2">
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <input
                type="text"
                name="specializations"
                placeholder="Specializations (comma-separated: UK, USA, Canada)"
                value={formData.specializations}
                onChange={handleInputChange}
                className="md:col-span-2 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[0, 1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    Rating: {r}/5
                  </option>
                ))}
              </select>
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {editingId ? "Update" : "Create"} Agency
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Agencies Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading agencies...</p>
          </div>
        ) : agencies.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No agencies yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Agency Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {agencies.map((agency) => (
                  <tr key={agency.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-900">
                      <strong>{agency.agencyName}</strong>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {agency.city}, {agency.country}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {agency.email && (
                        <a
                          href={`mailto:${agency.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {agency.email}
                        </a>
                      )}
                      {agency.phone && <div className="text-sm">{agency.phone}</div>}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      ⭐ {agency.rating}/5
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          agency.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {agency.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(agency)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(agency.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConsultancyManagement;
