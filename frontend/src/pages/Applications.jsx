import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import StatusPill from '../components/ui/StatusPill';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { HiOutlineClipboardDocumentList, HiOutlineArrowRight, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineSparkles } from 'react-icons/hi2';

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('All');

  const stats = useMemo(() => {
    const pending = apps.filter((a) => a.status?.statusName === 'Pending' || a.status?.statusName === 'Processing').length;
    const processing = apps.filter((a) => a.status?.statusName === 'Processing').length;
    const accepted = apps.filter((a) => a.status?.statusName === 'Accepted').length;
    const rejected = apps.filter((a) => a.status?.statusName === 'Rejected').length;

    return {
      total: apps.length,
      pending,
      processing,
      accepted,
      rejected,
    };
  }, [apps]);

  const filteredApps = useMemo(() => {
    if (activeTag === 'All') return apps;
    if (activeTag === 'Pending') {
      return apps.filter((a) => a.status?.statusName === 'Pending' || a.status?.statusName === 'Processing');
    }
    return apps.filter((a) => a.status?.statusName === activeTag);
  }, [apps, activeTag]);

  const tagOptions = [
    { label: 'All', count: stats.total },
    { label: 'Pending', count: stats.pending },
    { label: 'Processing', count: stats.processing },
    { label: 'Accepted', count: stats.accepted },
    { label: 'Rejected', count: stats.rejected },
  ];

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

      {apps.length > 0 && (
        <GlassCard className="relative overflow-hidden border border-white/20 mb-8">
          <div className="absolute -top-14 -right-10 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-2 rounded-2xl border border-white/20 bg-white/45 p-5">
              <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
                <HiOutlineSparkles className="w-4 h-4" />
                Application Insights
              </div>
              <h2 className="text-2xl font-extrabold text-text mb-2">Your Application Journey</h2>
              <p className="text-sm text-text-muted leading-6">
                Monitor progress, check decisions, and open each application for full visa and timeline details.
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
              <p className="text-xs uppercase tracking-wide text-text-muted">Total</p>
              <p className="text-3xl font-extrabold text-text mt-2">{stats.total}</p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
              <div className="flex items-center gap-2 text-text-muted text-xs uppercase tracking-wide">
                <HiOutlineClock className="w-4 h-4" /> Pending
              </div>
              <p className="text-3xl font-extrabold text-amber-600 mt-2">{stats.pending}</p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
              <div className="flex items-center gap-2 text-text-muted text-xs uppercase tracking-wide">
                <HiOutlineCheckCircle className="w-4 h-4" /> Accepted
              </div>
              <p className="text-3xl font-extrabold text-emerald-600 mt-2">{stats.accepted}</p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
              <div className="flex items-center gap-2 text-text-muted text-xs uppercase tracking-wide">
                <HiOutlineXCircle className="w-4 h-4" /> Rejected
              </div>
              <p className="text-3xl font-extrabold text-red-600 mt-2">{stats.rejected}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {apps.length === 0 ? (
        <EmptyState icon={HiOutlineClipboardDocumentList} title="No applications yet" message="Browse programs and apply to get started" />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {tagOptions.map((tag) => {
              const selected = activeTag === tag.label;
              return (
                <button
                  key={tag.label}
                  onClick={() => setActiveTag(tag.label)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    selected
                      ? 'border-primary/30 bg-primary/15 text-primary'
                      : 'border-white/30 bg-white/50 text-text-muted hover:border-primary/20 hover:bg-white/70'
                  }`}
                >
                  <span>{tag.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${selected ? 'bg-primary/20 text-primary' : 'bg-white/60 text-text'}`}>
                    {tag.count}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredApps.length === 0 ? (
            <EmptyState
              icon={HiOutlineClipboardDocumentList}
              title={`No ${activeTag.toLowerCase()} applications`}
              message="Try another tag to view your applications."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredApps.map((app, index) => (
            <Link key={app.id} to={`/applications/${app.id}`}>
              <GlassCard className="group h-full relative overflow-hidden border border-white/10 hover:border-primary/25">
                <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors" />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/40 text-xs font-bold text-text">
                      #{index + 1}
                    </span>
                    <StatusPill status={app.status?.statusName || 'Pending'} />
                  </div>

                  <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                    {app.program?.programName || 'Application'}
                  </h3>

                  <div className="space-y-1 text-sm text-text-muted mt-3">
                  {app.country?.countryName && <p>Country: {app.country.countryName}</p>}
                  {app.intakeApplied && <p>Intake: {app.intakeApplied}</p>}
                  <p>Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-1 text-primary text-sm font-semibold mt-auto pt-4">
                    View Details <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
