import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import GlassPanel from '../components/ui/GlassPanel';
import TextField from '../components/ui/TextField';
import PrimaryButton from '../components/ui/PrimaryButton';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/api/auth/login', form);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      toast.success('Welcome back!');
      navigate('/recommendations');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <GlassPanel className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">✈</span>
          <h1 className="text-2xl font-extrabold text-text mt-2">Welcome Back</h1>
          <p className="text-text-muted text-sm mt-1">Sign in to FutureWings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField label="Email" id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" />
          <TextField label="Password" id="password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
          <PrimaryButton type="submit" loading={loading} className="w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </PrimaryButton>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          No account?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </p>
        <p className="text-center text-xs text-text-light mt-3">
          <Link to="/" className="hover:text-primary transition-colors">← Back to Home</Link>
        </p>
      </GlassPanel>
    </div>
  );
}
