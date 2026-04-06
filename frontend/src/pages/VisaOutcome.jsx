import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassPanel from '../components/ui/GlassPanel';
import GlassCard from '../components/ui/GlassCard';
import StatusPill from '../components/ui/StatusPill';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import { HiOutlineCalendarDays, HiOutlineCheckCircle, HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineXCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

function formatDecision(decision) {
  if (!decision) return 'Unknown';
  if (decision === 'APPROVED') return 'Approved';
  if (decision === 'DENIED') return 'Denied';
  return decision;
}

export default function VisaOutcome() {
  const { id } = useParams();
  const [outcome, setOutcome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchOutcome = async () => {
      try {
        const res = await API.get(`/api/applications/${id}/visa-outcome`);
        setOutcome(res.data.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(err.response?.data?.error?.message || 'Failed to load visa outcome');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOutcome();
  }, [id]);

  if (loading) return <LoadingSkeleton rows={3} />;

  return (
    <>
      <PageHeader title={`Visa Outcome`} subtitle={`Application #${id}`} />

      {notFound ? (
        <EmptyState icon={HiOutlineShieldCheck} title="No visa outcome yet" message="A visa outcome has not been recorded for this application" />
      ) : outcome && (
        <>
          <GlassCard className="relative overflow-hidden border border-white/20 mb-8">
            <div className="absolute -top-14 -right-10 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="xl:col-span-2 rounded-2xl border border-white/20 bg-white/45 p-5">
                <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
                  <HiOutlineSparkles className="w-4 h-4" />
                  Visa Decision Snapshot
                </div>
                <h2 className="text-2xl font-extrabold text-text mb-2">{formatDecision(outcome.decision)}</h2>
                <p className="text-sm text-text-muted leading-6">
                  Review your decision summary and next steps for travel preparation or reapplication planning.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
                <p className="text-xs uppercase tracking-wide text-text-muted">Decision</p>
                <div className="mt-2">
                  <StatusPill status={formatDecision(outcome.decision)} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
                  {outcome.decision === 'APPROVED' ? <HiOutlineCheckCircle className="w-4 h-4" /> : <HiOutlineXCircle className="w-4 h-4" />}
                  Status
                </div>
                <p className="text-lg font-bold mt-2 text-text">{outcome.decision === 'APPROVED' ? 'Proceed' : 'Review & Retry'}</p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
                  <HiOutlineCalendarDays className="w-4 h-4" /> Destination Date
                </div>
                <p className="text-lg font-bold mt-2 text-text">
                  {outcome.destinationDate ? new Date(outcome.destinationDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassPanel className="max-w-3xl space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Info label="Application ID" value={`#${id}`} />
              <Info label="Decision" value={formatDecision(outcome.decision)} />
              <Info label="Reason Title" value={outcome.reasonTitle || 'N/A'} />
              <Info
                label="Destination Date"
                value={outcome.destinationDate ? new Date(outcome.destinationDate).toLocaleDateString() : 'N/A'}
              />
            </div>

            <div className="border-t border-white/30 pt-4">
              <span className="block text-xs font-medium text-text-light uppercase tracking-wider mb-2">Detailed Notes</span>
              <p className="text-sm text-text leading-6">
                {outcome.notes || 'No additional notes were provided by the administration.'}
              </p>
            </div>
          </GlassPanel>
        </>
      )}
    </>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <span className="block text-xs font-medium text-text-light uppercase tracking-wider mb-1">{label}</span>
      <p className="text-sm text-text font-medium">{value}</p>
    </div>
  );
}
