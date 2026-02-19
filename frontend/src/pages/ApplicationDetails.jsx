import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassPanel from '../components/ui/GlassPanel';
import StatusPill from '../components/ui/StatusPill';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { HiOutlineShieldCheck, HiOutlineStar } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function ApplicationDetails() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await API.get(`/api/applications/${id}`);
        setApp(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  if (loading) return <LoadingSkeleton rows={4} />;
  if (!app) return <p className="text-center text-text-muted py-12">Application not found.</p>;

  return (
    <>
      <PageHeader title={`Application #${app.id}`} subtitle={app.program?.name} />

      <GlassPanel className="max-w-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Detail label="Status"><StatusPill status={app.status?.name} /></Detail>
          <Detail label="Country">{app.country?.name}</Detail>
          <Detail label="Program">{app.program?.name}</Detail>
          <Detail label="University">{app.program?.university?.name || 'N/A'}</Detail>
          <Detail label="Degree">{app.program?.degreeLevel}</Detail>
          <Detail label="Intake">{app.intakeApplied}</Detail>
          <Detail label="Applied On">{new Date(app.createdAt).toLocaleDateString()}</Detail>
        </div>

        {app.visaOutcome && (
          <div className="border-t border-white/30 pt-4 mt-4">
            <h3 className="text-sm font-bold text-secondary mb-2">Visa Outcome</h3>
            <div className="flex items-center gap-3">
              <StatusPill status={app.visaOutcome.outcome} />
              {app.visaOutcome.note && <span className="text-sm text-text-muted">{app.visaOutcome.note}</span>}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-4">
          <Link to={`/applications/${app.id}/visa-outcome`}>
            <PrimaryButton className="text-xs">
              <HiOutlineShieldCheck className="w-4 h-4" /> Visa Status
            </PrimaryButton>
          </Link>
          {app.visaOutcome && (
            <Link to={`/rating/${app.id}`}>
              <SecondaryButton className="text-xs">
                <HiOutlineStar className="w-4 h-4" /> Rate Experience
              </SecondaryButton>
            </Link>
          )}
        </div>
      </GlassPanel>
    </>
  );
}

function Detail({ label, children }) {
  return (
    <div>
      <span className="block text-xs font-medium text-text-light uppercase tracking-wider">{label}</span>
      <span className="text-text font-medium">{children}</span>
    </div>
  );
}
