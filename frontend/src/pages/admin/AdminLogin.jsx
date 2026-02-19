import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import GlassPanel from '../../components/ui/GlassPanel';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/api/auth/login', form);
      const { token, user } = res.data.data;
      if (user.role !== 'ADMIN') {
        toast.error('Access denied – admin only');
        return;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
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
          <span className="text-4xl">🛡️</span>
          <h1 className="text-2xl font-extrabold text-text mt-2">Admin Login</h1>
          <p className="text-text-muted text-sm mt-1">FutureWings Control Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField label="Email" id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="admin@futurewings.com" />
          <TextField label="Password" id="password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
          <PrimaryButton type="submit" loading={loading} className="w-full">
            {loading ? 'Signing in…' : 'Admin Login'}
          </PrimaryButton>
        </form>
      </GlassPanel>
    </div>
  );
}
