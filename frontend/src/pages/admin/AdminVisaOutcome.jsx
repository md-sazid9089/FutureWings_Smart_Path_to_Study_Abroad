import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createVisaOutcome, getApplications } from '../../api/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import TextField from '../../components/ui/TextField';
import SelectField from '../../components/ui/SelectField';
import StatusPill from '../../components/ui/StatusPill';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export default function AdminVisaOutcome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    decision: '',
    reasonTitle: '',
    notes: '',
    destinationDate: '',
  });

  useEffect(() => {
    const loadApp = async () => {
      try {
        const res = await getApplications();
        const found = res.data.data.find((a) => a.id === Number(id));
        if (found) {
          setApp(found);
          if (found.visaOutcome) {
            setForm({
              decision: found.visaOutcome.decision || '',
              reasonTitle: found.visaOutcome.reasonTitle || '',
              notes: found.visaOutcome.notes || '',
              destinationDate: found.visaOutcome.destinationDate
                ? found.visaOutcome.destinationDate.slice(0, 10)
                : '',
            });
          }
        } else {
          toast.error('Application not found');
        }
      } catch {
        toast.error('Failed to load application');
      } finally {
        setLoading(false);
      }
    };
    loadApp();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.decision) return toast.error('Decision is required');
    setSaving(true);
    try {
      await createVisaOutcome(id, {
        decision: form.decision,
        reasonTitle: form.reasonTitle.trim() || null,
        notes: form.notes.trim() || null,
        destinationDate: form.destinationDate || null,
      });
      toast.success('Visa outcome saved');
      navigate('/admin/applications');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={4} />;
  if (!app) return <div className="text-center py-12 text-gray-500">Application not found</div>;

  return (
    <>
      <PageHeader title="Visa Outcome" subtitle={`Application #${app.id}`}>
        <SecondaryButton onClick={() => navigate('/admin/applications')}>← Back</SecondaryButton>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Details */}
        <GlassCard className="p-6 space-y-3">
          <h3 className="text-lg font-semibold mb-3">Application Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium text-gray-600">Applicant:</span> {app.user?.fullName || '-'}</p>
            <p><span className="font-medium text-gray-600">Email:</span> {app.user?.email || '-'}</p>
            <p><span className="font-medium text-gray-600">Country:</span> {app.country?.countryName || '-'}</p>
            <p><span className="font-medium text-gray-600">Program:</span> {app.program?.programName || '-'}</p>
            <p><span className="font-medium text-gray-600">Applied:</span> {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '-'}</p>
            <p className="flex items-center gap-2">
              <span className="font-medium text-gray-600">Status:</span>
              <StatusPill status={app.status?.statusName || 'Unknown'} />
            </p>
            {app.visaOutcome && (
              <p className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Current Decision:</span>
                <StatusPill
                  status={app.visaOutcome.decision}
                  color={app.visaOutcome.decision === 'APPROVED' ? 'green' : 'red'}
                />
              </p>
            )}
          </div>
        </GlassCard>

        {/* Visa Outcome Form */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {app.visaOutcome ? 'Update Visa Outcome' : 'Create Visa Outcome'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <SelectField label="Decision *" value={form.decision} onChange={(e) => setForm({ ...form, decision: e.target.value })}>
              <option value="">Select decision…</option>
              <option value="APPROVED">✅ Approved</option>
              <option value="DENIED">❌ Denied</option>
            </SelectField>
            <TextField label="Reason Title" value={form.reasonTitle} onChange={(e) => setForm({ ...form, reasonTitle: e.target.value })} placeholder="e.g. Strong academic profile" />
            <TextField label="Destination Date" type="date" value={form.destinationDate} onChange={(e) => setForm({ ...form, destinationDate: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-xl border border-white/30 bg-white/40 backdrop-blur-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all min-h-25"
                placeholder="Additional notes about the visa decision…"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <SecondaryButton type="button" onClick={() => navigate('/admin/applications')}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" loading={saving}>
                {app.visaOutcome ? 'Update Outcome' : 'Save Outcome'}
              </PrimaryButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </>
  );
}
