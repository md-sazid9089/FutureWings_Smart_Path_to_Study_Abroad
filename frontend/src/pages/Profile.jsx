import { useState, useEffect } from 'react';
import API from '../api/axios';
import GlassPanel from '../components/ui/GlassPanel';
import TextField from '../components/ui/TextField';
import SelectField from '../components/ui/SelectField';
import PrimaryButton from '../components/ui/PrimaryButton';
import { PageHeader } from '../components/ui/PageHeader';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function Profile() {
  const [form, setForm] = useState({ fullname: '', cgpa: '', degreeLevel: '', major: '', fundScore: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/api/user/me');
      const u = res.data.data;
      setForm({
        fullname: u.fullname || '',
        cgpa: u.cgpa?.toString() || '',
        degreeLevel: u.degreeLevel || '',
        major: u.major || '',
        fundScore: u.fundScore?.toString() || '',
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/api/user/me', form);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <>
      <PageHeader title="My Profile" subtitle="Keep your academic info up-to-date for better recommendations" />

      <GlassPanel className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField label="Full Name" id="fullname" name="fullname" value={form.fullname} onChange={handleChange} placeholder="John Doe" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField label="CGPA" id="cgpa" name="cgpa" type="number" step="0.01" value={form.cgpa} onChange={handleChange} placeholder="e.g. 3.50" />
            <SelectField label="Degree Level" id="degreeLevel" name="degreeLevel" value={form.degreeLevel} onChange={handleChange}>
              <option value="">Select level</option>
              <option value="Bachelors">Bachelors</option>
              <option value="Masters">Masters</option>
              <option value="PhD">PhD</option>
            </SelectField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField label="Major" id="major" name="major" value={form.major} onChange={handleChange} placeholder="e.g. Computer Science" />
            <TextField label="Fund Score (1-10)" id="fundScore" name="fundScore" type="number" min="1" max="10" value={form.fundScore} onChange={handleChange} placeholder="1-10" />
          </div>

          <PrimaryButton type="submit" loading={saving}>
            {saving ? 'Saving…' : 'Update Profile'}
          </PrimaryButton>
        </form>
      </GlassPanel>
    </>
  );
}
