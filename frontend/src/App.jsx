import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AppLayout from './layouts/AppLayout';
import AdminLayout from './layouts/AdminLayout';

// ─── User pages ──────────────────────────────────────────
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Documents from './pages/Documents';
import Recommendations from './pages/Recommendations';
import CountryDetails from './pages/CountryDetails';
import Universities from './pages/Universities';
import Programs from './pages/Programs';
import Applications from './pages/Applications';
import ApplicationDetails from './pages/ApplicationDetails';
import VisaOutcome from './pages/VisaOutcome';
import Rating from './pages/Rating';

// ─── Admin pages ─────────────────────────────────────────
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ManageCountries from './pages/admin/ManageCountries';
import ManageUniversities from './pages/admin/ManageUniversities';
import ManagePrograms from './pages/admin/ManagePrograms';
import ManageScholarships from './pages/admin/ManageScholarships';
import ManageDocuments from './pages/admin/ManageDocuments';
import ManageApplications from './pages/admin/ManageApplications';
import AdminVisaOutcome from './pages/admin/AdminVisaOutcome';
import ManageRatings from './pages/admin/ManageRatings';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '16px',
            fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          },
        }}
      />
      <Routes>
        {/* ── Public auth ───────────────────────── */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ── Protected user routes (with navbar layout) ── */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/countries/:id" element={<CountryDetails />} />
          <Route path="/universities/:countryId" element={<Universities />} />
          <Route path="/programs/:universityId" element={<Programs />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:id" element={<ApplicationDetails />} />
          <Route path="/applications/:id/visa-outcome" element={<VisaOutcome />} />
          <Route path="/rating/:applicationId" element={<Rating />} />
        </Route>

        {/* ── Admin routes (with sidebar layout) ──── */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/countries" element={<ManageCountries />} />
          <Route path="/admin/universities" element={<ManageUniversities />} />
          <Route path="/admin/programs" element={<ManagePrograms />} />
          <Route path="/admin/scholarships" element={<ManageScholarships />} />
          <Route path="/admin/documents" element={<ManageDocuments />} />
          <Route path="/admin/applications" element={<ManageApplications />} />
          <Route path="/admin/applications/:id/visa-outcome" element={<AdminVisaOutcome />} />
          <Route path="/admin/ratings" element={<ManageRatings />} />
        </Route>

        {/* ── Fallback ──────────────────────────── */}
        <Route path="/" element={<Login />} />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="glass-strong rounded-3xl p-12 text-center">
              <h2 className="text-5xl font-extrabold text-primary mb-2">404</h2>
              <p className="text-text-muted">Page not found</p>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
