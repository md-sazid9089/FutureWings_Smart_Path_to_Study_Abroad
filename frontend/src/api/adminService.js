/**
 * Admin API Service
 * Centralized API calls for the admin panel
 */
import API from './axios';

// ─── Dashboard ───────────────────────────────────────────
export const getStats = () => API.get('/api/admin/stats');

// ─── Users ───────────────────────────────────────────────
export const getUsers = (params) =>
  API.get('/api/admin/users', { params });

// ─── Countries ───────────────────────────────────────────
export const getCountries = () => API.get('/api/admin/countries');
export const createCountry = (data) => API.post('/api/admin/countries', data);
export const updateCountry = (id, data) => API.put(`/api/admin/countries/${id}`, data);
export const deleteCountry = (id) => API.delete(`/api/admin/countries/${id}`);

// ─── Universities ────────────────────────────────────────
export const getUniversities = () => API.get('/api/admin/universities');
export const createUniversity = (data) => API.post('/api/admin/universities', data);
export const updateUniversity = (id, data) => API.put(`/api/admin/universities/${id}`, data);
export const deleteUniversity = (id) => API.delete(`/api/admin/universities/${id}`);

// ─── Programs ────────────────────────────────────────────
export const getPrograms = () => API.get('/api/admin/programs');
export const createProgram = (data) => API.post('/api/admin/programs', data);
export const updateProgram = (id, data) => API.put(`/api/admin/programs/${id}`, data);
export const deleteProgram = (id) => API.delete(`/api/admin/programs/${id}`);

// ─── Scholarships ────────────────────────────────────────
export const getScholarships = () => API.get('/api/admin/scholarships');
export const createScholarship = (data) => API.post('/api/admin/scholarships', data);
export const updateScholarship = (id, data) => API.put(`/api/admin/scholarships/${id}`, data);
export const deleteScholarship = (id) => API.delete(`/api/admin/scholarships/${id}`);

// ─── Documents ───────────────────────────────────────────
export const getDocuments = (status) =>
  API.get('/api/admin/documents', { params: status ? { status } : {} });
export const verifyDocument = (id, data) =>
  API.put(`/api/admin/documents/${id}/verify`, data);

// ─── Applications ────────────────────────────────────────
export const getApplications = (params) =>
  API.get('/api/admin/applications', { params });
export const updateApplicationStatus = (id, statusName) =>
  API.put(`/api/admin/applications/${id}/status`, { statusName });
export const createVisaOutcome = (id, data) =>
  API.post(`/api/admin/applications/${id}/visa-outcome`, data);

// ─── Visa Outcomes ───────────────────────────────────────
export const getVisaOutcomes = () => API.get('/api/admin/visa-outcomes');

// ─── Ratings ─────────────────────────────────────────────
export const getRatings = (params) =>
  API.get('/api/admin/ratings', { params });
