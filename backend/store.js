// ═══════════════════════════════════════════════════════════
// In-memory dummy data store — no database required
// ═══════════════════════════════════════════════════════════

const users = [
  { id: 1, email: "demo@futurewings.com", password: "demo123", role: "USER", fullname: "Demo User", cgpa: 3.5, degreeLevel: "Masters", major: "Computer Science", fundScore: 7 },
  { id: 2, email: "admin@futurewings.com", password: "admin123", role: "ADMIN", fullname: "Admin User", cgpa: null, degreeLevel: null, major: null, fundScore: null },
];

const countries = [
  { id: 1, name: "United States", code: "US", tier: 1, isActive: true, description: "Top-ranked universities worldwide" },
  { id: 2, name: "United Kingdom", code: "GB", tier: 1, isActive: true, description: "World-class education heritage" },
  { id: 3, name: "Canada", code: "CA", tier: 1, isActive: true, description: "Inclusive and affordable options" },
  { id: 4, name: "Germany", code: "DE", tier: 2, isActive: true, description: "Low-tuition STEM powerhouse" },
  { id: 5, name: "Australia", code: "AU", tier: 1, isActive: true, description: "High quality of life & research" },
  { id: 6, name: "Japan", code: "JP", tier: 2, isActive: true, description: "Innovation meets tradition" },
];

const universities = [
  { id: 1, name: "MIT", countryId: 1, ranking: 1, website: "https://mit.edu" },
  { id: 2, name: "Stanford University", countryId: 1, ranking: 3, website: "https://stanford.edu" },
  { id: 3, name: "University of Oxford", countryId: 2, ranking: 2, website: "https://ox.ac.uk" },
  { id: 4, name: "University of Cambridge", countryId: 2, ranking: 4, website: "https://cam.ac.uk" },
  { id: 5, name: "University of Toronto", countryId: 3, ranking: 18, website: "https://utoronto.ca" },
  { id: 6, name: "TU Munich", countryId: 4, ranking: 30, website: "https://tum.de" },
  { id: 7, name: "University of Melbourne", countryId: 5, ranking: 14, website: "https://unimelb.edu.au" },
  { id: 8, name: "University of Tokyo", countryId: 6, ranking: 28, website: "https://u-tokyo.ac.jp" },
];

const programs = [
  { id: 1, name: "MS Computer Science", universityId: 1, degreeLevel: "Masters", tuitionFee: 55000, duration: "2 years" },
  { id: 2, name: "MS Data Science", universityId: 2, degreeLevel: "Masters", tuitionFee: 52000, duration: "2 years" },
  { id: 3, name: "MSc AI", universityId: 3, degreeLevel: "Masters", tuitionFee: 35000, duration: "1 year" },
  { id: 4, name: "MPhil Engineering", universityId: 4, degreeLevel: "Masters", tuitionFee: 38000, duration: "1 year" },
  { id: 5, name: "MS Software Engineering", universityId: 5, degreeLevel: "Masters", tuitionFee: 28000, duration: "2 years" },
  { id: 6, name: "MSc Informatics", universityId: 6, degreeLevel: "Masters", tuitionFee: 500, duration: "2 years" },
  { id: 7, name: "MS CS", universityId: 7, degreeLevel: "Masters", tuitionFee: 42000, duration: "2 years" },
  { id: 8, name: "ME Information Science", universityId: 8, degreeLevel: "Masters", tuitionFee: 8000, duration: "2 years" },
];

const scholarships = [
  { id: 1, name: "Fulbright Scholarship", countryId: 1, amount: 50000, deadline: "2026-10-01", description: "Fully funded for graduate students" },
  { id: 2, name: "Chevening Scholarship", countryId: 2, amount: 40000, deadline: "2026-11-01", description: "UK government scholarship" },
  { id: 3, name: "Vanier Canada", countryId: 3, amount: 50000, deadline: "2026-09-15", description: "For doctoral students" },
  { id: 4, name: "DAAD Scholarship", countryId: 4, amount: 15000, deadline: "2026-08-01", description: "German academic exchange" },
  { id: 5, name: "Endeavour Award", countryId: 5, amount: 30000, deadline: "2026-06-30", description: "Australian government merit-based" },
  { id: 6, name: "MEXT Scholarship", countryId: 6, amount: 20000, deadline: "2026-04-15", description: "Japanese government scholarship" },
];

const statuses = [
  { id: 1, name: "Pending" },
  { id: 2, name: "Processing" },
  { id: 3, name: "Accepted" },
  { id: 4, name: "Rejected" },
  { id: 5, name: "Completed" },
];

const applications = [
  { id: 1, userId: 1, programId: 1, statusId: 1, createdAt: "2026-01-15T10:00:00Z" },
  { id: 2, userId: 1, programId: 3, statusId: 3, createdAt: "2026-01-20T12:00:00Z" },
];

const visaOutcomes = [
  { id: 1, applicationId: 2, decision: "Approved", notes: "Visa granted for UK", createdAt: "2026-02-10T09:00:00Z" },
];

const countryRatings = [
  { id: 1, userId: 1, countryId: 2, rating: 5, review: "Amazing experience in the UK!", createdAt: "2026-02-15T11:00:00Z" },
];

const userDocuments = [
  { id: 1, userId: 1, docType: "Transcript", filename: "transcript.pdf", status: "Verified", createdAt: "2026-01-10T08:00:00Z" },
  { id: 2, userId: 1, docType: "SOP", filename: "sop.pdf", status: "Pending", createdAt: "2026-01-12T09:00:00Z" },
];

const nextId = {
  user: 100,
  country: 100,
  university: 100,
  program: 100,
  scholarship: 100,
  application: 100,
  visa: 100,
  rating: 100,
  document: 100,
};

// Helpers
const getCountry = (id) => countries.find((c) => c.id === id);
const getUniversity = (id) => universities.find((u) => u.id === id);
const getProgram = (id) => programs.find((p) => p.id === id);
const getStatus = (id) => statuses.find((s) => s.id === id);
const getStatusByName = (name) => statuses.find((s) => s.name === name);
const getUser = (id) => users.find((u) => u.id === id);

module.exports = {
  users, countries, universities, programs, scholarships, statuses,
  applications, visaOutcomes, countryRatings, userDocuments, nextId,
  getCountry, getUniversity, getProgram, getStatus, getStatusByName, getUser,
};
