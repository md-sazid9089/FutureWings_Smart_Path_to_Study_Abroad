import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassPanel from '../components/ui/GlassPanel';
import SelectField from '../components/ui/SelectField';
import PrimaryButton from '../components/ui/PrimaryButton';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { HiOutlineStar } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Rating() {
  const { applicationId } = useParams();
  const [visaExists, setVisaExists] = useState(false);
  const [appData, setAppData] = useState(null);
  const [form, setForm] = useState({ ratingValue: '5', comments: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const appRes = await API.get(`/api/applications/${applicationId}`);
        setAppData(appRes.data.data);
        if (appRes.data.data.visaOutcome) setVisaExists(true);
      } catch {
        toast.error('Failed to load application data');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [applicationId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/api/ratings', {
        applicationId: parseInt(applicationId),
        countryId: appData.countryId,
        ratingValue: parseInt(form.ratingValue),
        comments: form.comments,
      });
      toast.success('Rating submitted!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={3} />;

  return (
    <>
      <PageHeader title="Rate Your Experience" subtitle={appData?.program?.name} />

      {!visaExists ? (
        <EmptyState icon={HiOutlineStar} title="Rating unavailable" message="A visa outcome must be recorded before you can rate this experience" />
      ) : (
        <GlassPanel className="max-w-lg">
          <div className="flex gap-4 text-sm text-text-muted mb-6">
            <p><span className="font-medium text-secondary">Country:</span> {appData?.country?.name}</p>
            <p><span className="font-medium text-secondary">Program:</span> {appData?.program?.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <SelectField label="Rating (1-5)" id="ratingValue" name="ratingValue" value={form.ratingValue} onChange={handleChange}>
              {[1, 2, 3, 4, 5].map((v) => (
                <option key={v} value={v}>{'★'.repeat(v)}{'☆'.repeat(5 - v)} ({v})</option>
              ))}
            </SelectField>

            <div className="space-y-1.5">
              <label htmlFor="comments" className="block text-sm font-medium text-secondary">Comments</label>
              <textarea
                id="comments"
                name="comments"
                value={form.comments}
                onChange={handleChange}
                rows="4"
                placeholder="Share your experience…"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 border border-white/50 transition-all duration-200 placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none"
              />
            </div>

            <PrimaryButton type="submit" loading={submitting}>
              {submitting ? 'Submitting…' : 'Submit Rating'}
            </PrimaryButton>
          </form>
        </GlassPanel>
      )}
    </>
  );
}
