import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { HiOutlineAcademicCap, HiOutlineBanknotes, HiOutlineBuildingLibrary, HiOutlineSparkles } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Programs() {
  const { universityId } = useParams();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    const fetchProgs = async () => {
      try {
        const res = await API.get(`/api/universities/${universityId}/programs`);
        setPrograms(res.data.data);
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    fetchProgs();
  }, [universityId]);

  const handleApply = async (program) => {
    const intake = prompt('Enter intake period (e.g. Fall 2026):');
    if (!intake) return;
    setApplying(program.id);
    try {
      await API.post('/api/applications', {
        countryId: program.countryId,
        programId: program.id,
        intakeApplied: intake,
      });
      toast.success(`Applied to ${program.programName}!`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Application failed');
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Programs" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={programs[0]?.universityName ? `${programs[0].universityName} Programs` : 'Programs'}
        subtitle="Discover program details and apply in one click"
      />

      {programs.length > 0 && (
        <GlassCard className="relative overflow-hidden border border-white/20 mb-8">
          <div className="absolute -top-14 -right-10 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-2 rounded-2xl border border-white/20 bg-white/45 p-5">
              <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
                <HiOutlineSparkles className="w-4 h-4" />
                Program Intelligence
              </div>
              <h2 className="text-2xl font-extrabold text-text mb-2">{programs[0].universityName}</h2>
              <p className="text-sm text-text-muted leading-6">
                Compare degree levels, estimate annual tuition, and submit your application directly from this page.
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
              <p className="text-xs uppercase tracking-wide text-text-muted">Total Programs</p>
              <p className="text-3xl font-extrabold text-text mt-2">{programs.length}</p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
              <p className="text-xs uppercase tracking-wide text-text-muted">Avg Tuition</p>
              <p className="text-2xl font-extrabold text-primary mt-2">
                {(() => {
                  const tuitionPrograms = programs.filter((p) => p.tuitionPerYear);
                  if (tuitionPrograms.length === 0) return 'N/A';
                  const avg = tuitionPrograms.reduce((sum, p) => sum + Number(p.tuitionPerYear), 0) / tuitionPrograms.length;
                  return `$${Math.round(avg).toLocaleString()}`;
                })()}
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
              <p className="text-xs uppercase tracking-wide text-text-muted">City</p>
              <p className="text-2xl font-extrabold text-text mt-2">{programs[0]?.universityCity || 'N/A'}</p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
              <p className="text-xs uppercase tracking-wide text-text-muted">University Type</p>
              <p className="text-2xl font-extrabold text-accent mt-2">{programs[0]?.universityType || 'N/A'}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {programs.length === 0 ? (
        <EmptyState icon={HiOutlineAcademicCap} title="No programs found" message="No program records are available for this university yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p, index) => (
            <GlassCard key={p.id} className="h-full group relative overflow-hidden border border-white/10 hover:border-primary/25 flex flex-col">
              <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/40 text-xs font-bold text-text">
                    #{index + 1}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-text-muted">Program</span>
                </div>

                <h3 className="text-lg font-bold text-text mb-3 leading-snug">{p.programName}</h3>

                <div className="space-y-2 mb-5">
                  <p className="text-sm text-text-muted flex items-center gap-2">
                    <HiOutlineAcademicCap className="w-4 h-4 text-primary" />
                    <span><span className="font-medium text-secondary">Level:</span> {p.level || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-text-muted flex items-center gap-2">
                    <HiOutlineBanknotes className="w-4 h-4 text-primary" />
                    <span>
                      <span className="font-medium text-secondary">Tuition/year:</span>{' '}
                      {p.tuitionPerYear ? `$${Number(p.tuitionPerYear).toLocaleString()}` : 'N/A'}
                    </span>
                  </p>
                  <p className="text-sm text-text-muted flex items-center gap-2">
                    <HiOutlineBuildingLibrary className="w-4 h-4 text-primary" />
                    <span><span className="font-medium text-secondary">University:</span> {p.universityName || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-text-muted">
                    <span className="font-medium text-secondary">Duration:</span> {p.durationMonths ? `${p.durationMonths} months` : 'N/A'}
                  </p>
                  <p className="text-sm text-text-muted">
                    <span className="font-medium text-secondary">Intake:</span> {p.intakeSeasons || 'N/A'}
                  </p>
                </div>

                {p.programOverview && (
                  <p className="text-sm text-text-muted leading-6 mb-5 line-clamp-3">
                    {p.programOverview}
                  </p>
                )}

                <div className="mt-auto">
                <PrimaryButton
                  onClick={() => handleApply(p)}
                  disabled={!p.countryId}
                  loading={applying === p.id}
                  className="w-full text-xs px-4 py-2"
                >
                    {applying === p.id ? 'Applying…' : 'Apply Now'}
                </PrimaryButton>
                  {!p.countryId && (
                    <p className="mt-2 text-[11px] text-danger">Cannot apply: country mapping unavailable.</p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </>
  );
}
