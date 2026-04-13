import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import AdminLayout from './layouts/AdminLayout';

// ─── Loading Component ─────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white/50 backdrop-blur-sm">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// ─── Public pages ────────────────────────────────────────
const HomePage = lazy(() => import('./pages/HomePage'));
const InlinePaymentPage = lazy(() => import('./pages/InlinePaymentPage'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const News = lazy(() => import('./pages/News'));
const NewsArticle = lazy(() => import('./pages/NewsArticle'));
const Contact = lazy(() => import('./pages/Contact'));

// ─── User pages ──────────────────────────────────────────
const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const Documents = lazy(() => import('./pages/Documents'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const PremiumCheckout = lazy(() => import('./pages/PremiumCheckout'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const CountryDetails = lazy(() => import('./pages/CountryDetails'));
const Universities = lazy(() => import('./pages/Universities'));
const Programs = lazy(() => import('./pages/Programs'));
const Applications = lazy(() => import('./pages/Applications'));
const ApplicationDetails = lazy(() => import('./pages/ApplicationDetails'));
const VisaOutcome = lazy(() => import('./pages/VisaOutcome'));
const Rating = lazy(() => import('./pages/Rating'));
const SopReview = lazy(() => import('./pages/SopReview'));

// ─── Admin pages ─────────────────────────────────────────
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageCountries = lazy(() => import('./pages/admin/ManageCountries'));
const ManageUniversities = lazy(() => import('./pages/admin/ManageUniversities'));
const ManagePrograms = lazy(() => import('./pages/admin/ManagePrograms'));
const ManageScholarships = lazy(() => import('./pages/admin/ManageScholarships'));
const ManageDocuments = lazy(() => import('./pages/admin/ManageDocuments'));
const ManageApplications = lazy(() => import('./pages/admin/ManageApplications'));
const AdminVisaOutcome = lazy(() => import('./pages/admin/AdminVisaOutcome'));
const ManageRatings = lazy(() => import('./pages/admin/ManageRatings'));
const VisaOutcomesList = lazy(() => import('./pages/admin/VisaOutcomesList'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));

/* Redirect logged-in users away from auth pages */
function GuestOnly({ children }) {
  const token = localStorage.getItem('token');
  if (token) return <Navigate to="/recommendations" replace />;
  return children;
}

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public routes with navbar ────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsArticle />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/inline-payment" element={<InlinePaymentPage />} />
          </Route>

          {/* ── Auth routes (guest only) ────────── */}
          <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ── Protected user routes (with navbar layout) ── */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/premium-checkout" element={<PremiumCheckout />} />
            <Route path="/countries/:id" element={<CountryDetails />} />
            <Route path="/universities/:countryId" element={<Universities />} />
            <Route path="/programs/:universityId" element={<Programs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/:id" element={<ApplicationDetails />} />
            <Route path="/applications/:id/visa-outcome" element={<VisaOutcome />} />
            <Route path="/rating/:applicationId" element={<Rating />} />
            <Route path="/sop-rating" element={<SopReview />} />
          </Route>

          {/* ── Payment Success (protected, full-page) ── */}
          <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />

          {/* ── Admin routes (with sidebar layout) ──── */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/countries" element={<ManageCountries />} />
            <Route path="/admin/universities" element={<ManageUniversities />} />
            <Route path="/admin/programs" element={<ManagePrograms />} />
            <Route path="/admin/scholarships" element={<ManageScholarships />} />
            <Route path="/admin/documents" element={<ManageDocuments />} />
            <Route path="/admin/applications" element={<ManageApplications />} />
            <Route path="/admin/visa-outcomes" element={<VisaOutcomesList />} />
            <Route path="/admin/applications/:id/visa-outcome" element={<AdminVisaOutcome />} />
            <Route path="/admin/ratings" element={<ManageRatings />} />
          </Route>

          {/* ── Fallback ──────────────────────────── */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="glass-strong rounded-3xl p-12 text-center">
                <h2 className="text-5xl font-extrabold text-primary mb-2">404</h2>
                <p className="text-text-muted">Page not found</p>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
