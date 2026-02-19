import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassPanel from '../components/ui/GlassPanel';
import StatusPill from '../components/ui/StatusPill';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import { HiOutlineShieldCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';

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
          toast.error(err.response?.data?.error || 'Failed to load visa outcome');
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
        <GlassPanel className="max-w-lg space-y-4">
          <div>
            <span className="block text-xs font-medium text-text-light uppercase tracking-wider mb-1">Outcome</span>
            <StatusPill status={outcome.outcome} />
          </div>
          {outcome.note && (
            <div>
              <span className="block text-xs font-medium text-text-light uppercase tracking-wider mb-1">Note</span>
              <p className="text-sm text-text">{outcome.note}</p>
            </div>
          )}
          <div>
            <span className="block text-xs font-medium text-text-light uppercase tracking-wider mb-1">Date</span>
            <p className="text-sm text-text">{new Date(outcome.createdAt).toLocaleDateString()}</p>
          </div>
        </GlassPanel>
      )}
    </>
  );
}
