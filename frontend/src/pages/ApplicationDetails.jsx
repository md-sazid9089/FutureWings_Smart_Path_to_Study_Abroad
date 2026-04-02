import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassPanel from '../components/ui/GlassPanel';
import GlassCard from '../components/ui/GlassCard';
import StatusPill from '../components/ui/StatusPill';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { HiOutlineBanknotes, HiOutlineCalendarDays, HiOutlineGlobeAlt, HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineStar } from 'react-icons/hi2';
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
        toast.error(err.response?.data?.error?.message || 'Failed to load application');
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
      <PageHeader title={`Application #${app.id}`} subtitle={app.program?.programName} />

      <GlassCard className="relative overflow-hidden border border-white/20 mb-8">
        <div className="absolute -top-14 -right-10 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-2 rounded-2xl border border-white/20 bg-white/45 p-5">
            <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
              <HiOutlineSparkles className="w-4 h-4" />
              Application Snapshot
            </div>
            <h2 className="text-2xl font-extrabold text-text mb-2">{app.program?.programName || 'Program'}</h2>
            <p className="text-sm text-text-muted leading-6">
              Track your progress, review financial details, and follow visa decisions from one detailed view.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
            <p className="text-xs uppercase tracking-wide text-text-muted">Status</p>
            <div className="mt-2">
              <StatusPill status={app.status?.statusName || 'Pending'} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
              <HiOutlineCalendarDays className="w-4 h-4" /> Applied On
            </div>
            <p className="text-lg font-bold text-text mt-2">{new Date(app.appliedDate).toLocaleDateString()}</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
              <HiOutlineGlobeAlt className="w-4 h-4" /> Country
            </div>
            <p className="text-lg font-bold text-text mt-2">{app.country?.countryName || 'N/A'}</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
              <HiOutlineBanknotes className="w-4 h-4" /> Tuition
            </div>
            <p className="text-lg font-bold text-text mt-2">
              {app.program?.tuitionPerYear ? `$${Number(app.program.tuitionPerYear).toLocaleString()}` : 'N/A'}
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassPanel className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <Detail label="Application ID">#{app.id}</Detail>
          <Detail label="Program">{app.program?.programName || 'N/A'}</Detail>
          <Detail label="Degree Level">{app.program?.level || 'N/A'}</Detail>
          <Detail label="Intake Applied">{app.intakeApplied || 'N/A'}</Detail>
          <Detail label="Region">{app.country?.region || 'N/A'}</Detail>
          <Detail label="Currency">{app.country?.currency || 'N/A'}</Detail>
          <Detail label="Applicant">{app.user?.fullName || app.user?.email || 'N/A'}</Detail>
        </div>

        {app.visaOutcome ? (
          <div className="border-t border-white/30 pt-5 mt-2">
            <h3 className="text-sm font-bold text-secondary mb-3">Visa Outcome</h3>
            <div className="flex items-center gap-3 mb-3">
              <StatusPill status={app.visaOutcome.decision} />
              {app.visaOutcome.reasonTitle && (
                <span className="text-sm text-text-muted">{app.visaOutcome.reasonTitle}</span>
              )}
            </div>
            {app.visaOutcome.notes && (
              <p className="text-sm text-text-muted leading-6">{app.visaOutcome.notes}</p>
            )}
          </div>
        ) : (
          <div className="border-t border-white/30 pt-5 mt-2">
            <h3 className="text-sm font-bold text-secondary mb-2">Visa Outcome</h3>
            <p className="text-sm text-text-muted">No visa decision has been published yet.</p>
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
