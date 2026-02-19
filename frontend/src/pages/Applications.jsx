import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import StatusPill from '../components/ui/StatusPill';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { HiOutlineClipboardDocumentList, HiOutlineArrowRight } from 'react-icons/hi2';

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await API.get('/api/applications');
        setApps(res.data.data);
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    fetchApps();
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="My Applications" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2].map(i => <CardSkeleton key={i} />)}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="My Applications" subtitle="Track your study abroad applications" />

      {apps.length === 0 ? (
        <EmptyState icon={HiOutlineClipboardDocumentList} title="No applications yet" message="Browse programs and apply to get started" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {apps.map((app) => (
            <Link key={app.id} to={`/applications/${app.id}`}>
              <GlassCard className="group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                    {app.program?.name || 'Application'}
                  </h3>
                  <StatusPill status={app.status?.name || 'Pending'} />
                </div>
                <div className="space-y-1 text-sm text-text-muted">
                  {app.country?.name && <p>Country: {app.country.name}</p>}
                  {app.intakeApplied && <p>Intake: {app.intakeApplied}</p>}
                  <p>Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 text-primary text-sm font-medium mt-4">
                  View Details <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
