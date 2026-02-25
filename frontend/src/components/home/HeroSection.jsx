import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineAcademicCap, HiOutlineSparkles } from 'react-icons/hi2';

const degreeOptions = ['Bachelors', 'Masters', 'PhD'];
const budgetOptions = ['Low', 'Medium', 'High', 'Full Scholarship'];

export default function HeroSection() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const [form, setForm] = useState({ degree: '', major: '', cgpa: '', budget: '' });

  const handleGetTier = () => {
    if (isLoggedIn) navigate('/recommendations');
    else navigate('/signup');
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-20 md:pt-16 md:pb-32">
      {/* Decorative blurred shapes */}
      <div className="absolute -top-30 -left-20 w-100 h-100 rounded-full bg-primary/15 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-25 -right-15 w-87.5 h-87.5 rounded-full bg-accent/10 blur-[90px] pointer-events-none" />
      <div className="absolute top-[40%] left-[55%] w-62.5 h-62.5 rounded-full bg-primary-light/10 blur-[80px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Top badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium text-secondary">
            <HiOutlineSparkles className="w-4 h-4 text-primary" />
            AI-Powered Study Abroad Matching
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-center text-text leading-tight tracking-tight">
          Plan Your{' '}
          <span className="bg-linear-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Study Abroad
          </span>{' '}
          Journey
        </h1>

        <p className="mt-5 text-center text-lg md:text-xl text-text-muted max-w-2xl mx-auto">
          Find the best destination countries, scholarships, and track your application — all in one place.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link
            to={isLoggedIn ? '/recommendations' : '/signup'}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-200 hover:scale-[1.03]"
          >
            <HiOutlineAcademicCap className="w-5 h-5" />
            Get Recommendations
          </Link>
          <Link
            to={isLoggedIn ? '/recommendations' : '/signup'}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full glass font-semibold text-secondary hover:bg-white/60 transition-all duration-200"
          >
            Explore Countries
          </Link>
        </div>

        {/* Glass search card */}
        <div className="mt-14 max-w-3xl mx-auto">
          <div className="glass-strong rounded-3xl p-6 md:p-8">
            <p className="text-sm font-semibold text-text-muted mb-5 text-center uppercase tracking-wide">
              Quick Eligibility Check
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Degree Level</label>
                <select
                  value={form.degree}
                  onChange={e => setForm({ ...form, degree: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/50 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                >
                  <option value="">Select</option>
                  {degreeOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Major</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={form.major}
                  onChange={e => setForm({ ...form, major: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/50 text-sm text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  placeholder="e.g. 3.5"
                  value={form.cgpa}
                  onChange={e => setForm({ ...form, cgpa: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/50 text-sm text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Budget</label>
                <select
                  value={form.budget}
                  onChange={e => setForm({ ...form, budget: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/50 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                >
                  <option value="">Select</option>
                  {budgetOptions.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleGetTier}
                className="px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-200 hover:scale-[1.03]"
              >
                Get My Tier →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
