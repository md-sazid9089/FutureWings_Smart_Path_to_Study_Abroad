import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassPanel from '../../components/ui/GlassPanel';
import SelectField from '../../components/ui/SelectField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import toast from 'react-hot-toast';

export default function AdminVisaOutcome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ outcome: 'Approved', note: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/api/admin/applications/${id}/visa-outcome`, form);
      toast.success('Visa outcome saved');
      navigate('/admin/applications');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add visa outcome');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Add Visa Outcome" subtitle={`Application #${id}`} />

      <GlassPanel className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <SelectField label="Outcome" id="outcome" name="outcome" value={form.outcome} onChange={handleChange}>
            <option value="Approved">Approved</option>
            <option value="Denied">Denied</option>
          </SelectField>

          <div className="space-y-1.5">
            <label htmlFor="note" className="block text-sm font-medium text-secondary">Note (optional)</label>
            <textarea
              id="note"
              name="note"
              value={form.note}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 border border-white/50 transition-all duration-200 placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none"
            />
          </div>

          <PrimaryButton type="submit" loading={loading}>
            {loading ? 'Saving…' : 'Save Visa Outcome'}
          </PrimaryButton>
        </form>
      </GlassPanel>
    </>
  );
}
