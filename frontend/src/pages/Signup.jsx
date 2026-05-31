import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import logo from '../asset/logo.png';
import GlassPanel from '../components/ui/GlassPanel';
import TextField from '../components/ui/TextField';
import SelectField from '../components/ui/SelectField';
import PrimaryButton from '../components/ui/PrimaryButton';
import toast from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', fullname: '', cgpa: '', degreeLevel: '', major: '', fundScore: '', preferredCountry: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { syncPremiumStatus } = useAuth();

  const validateField = (name, value) => {
    let error = '';
    if (name === 'fullname') {
      if (value) {
        const words = value.trim().split(/\s+/);
        if (words.length > 15) error = 'Name must not exceed 15 words';
      }
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = 'Email is required';
      else if (!emailRegex.test(value)) error = 'Invalid email format';
    } else if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
      else if (!/[A-Z]/.test(value)) error = 'Password must contain uppercase letter';
      else if (!/[a-z]/.test(value)) error = 'Password must contain lowercase letter';
      else if (!/\d/.test(value)) error = 'Password must contain number';
      else if (!/[!@#$%^&*]/.test(value)) error = 'Password must contain special character (!@#$%^&*)';
    }
    else if (name === 'cgpa') {
      if (value !== '' && value !== null) {
        const n = parseFloat(value);
        if (isNaN(n) || n < 0 || n > 4.0) error = 'CGPA must be a number between 0 and 4.0';
      }
    } else if (name === 'fundScore') {
      if (value !== '' && value !== null) {
        const n = Number(value);
        if (isNaN(n) || n < 0 || n > 10) error = 'Fund Score must be a number between 0 and 10';
      }
    }
    return error;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleBlur = (e) => {
    const error = validateField(e.target.name, e.target.value);
    setErrors({ ...errors, [e.target.name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/api/auth/signup', form);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      // Sync premium status from backend after signup
      await syncPremiumStatus();
      toast.success('Account created!');
      navigate('/recommendations');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <GlassPanel className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="FutureWings Logo" className="w-12 h-12 mx-auto" />
          <h1 className="text-2xl font-extrabold text-text mt-2">Create Account</h1>
          <p className="text-text-muted text-sm mt-1">Start your journey with FutureWings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField label="Full Name" id="fullname" name="fullname" value={form.fullname} onChange={handleChange} onBlur={handleBlur} error={errors.fullname} placeholder="John Doe" />
          <TextField label="Email" id="email" name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} required placeholder="you@email.com" />
          <TextField label="Password" id="password" name="password" type="password" value={form.password} onChange={handleChange} onBlur={handleBlur} error={errors.password} required placeholder="Min 6 characters" />
          <PrimaryButton type="submit" loading={loading} className="w-full">
            {loading ? 'Creating...' : 'Sign Up'}
          </PrimaryButton>

          <div className="pt-6">
            <h3 className="text-sm font-semibold text-text mb-2">Academic Profile (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField label="CGPA (optional)" id="cgpa" name="cgpa" type="number" step="0.01" value={form.cgpa} onChange={handleChange} onBlur={handleBlur} error={errors.cgpa} placeholder="e.g. 3.50" />
              <TextField label="Fund Score (optional)" id="fundScore" name="fundScore" type="number" min="0" max="10" value={form.fundScore} onChange={handleChange} onBlur={handleBlur} error={errors.fundScore} placeholder="0-10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <SelectField label="Degree Level (optional)" id="degreeLevel" name="degreeLevel" value={form.degreeLevel} onChange={handleChange}>
                <option value="">Select level</option>
                <option value="Bachelors">Bachelors</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
              </SelectField>
              <SelectField label="Preferred Country (optional)" id="preferredCountry" name="preferredCountry" value={form.preferredCountry} onChange={handleChange}>
                <option value="">Select country</option>
                {['United States','United Kingdom','Canada','Australia','Germany','France','Netherlands','Sweden','Norway','Denmark','Finland','New Zealand','Ireland','Switzerland','Austria','Belgium','Japan','South Korea','Singapore','Malaysia','Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </SelectField>
            </div>
            <div className="mt-3">
              <TextField label="Major (optional)" id="major" name="major" value={form.major} onChange={handleChange} placeholder="e.g. Computer Science" />
            </div>
          </div>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
        <p className="text-center text-xs text-text-light mt-3">
          <Link to="/" className="hover:text-primary transition-colors"> Back to Home</Link>
        </p>
      </GlassPanel>
    </div>
  );
}
