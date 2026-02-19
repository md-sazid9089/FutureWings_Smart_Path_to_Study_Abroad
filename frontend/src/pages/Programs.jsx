import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
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
        countryId: program.countryId || 1,
        programId: program.id,
        intakeApplied: intake,
      });
      toast.success(`Applied to ${program.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Application failed');
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
      <PageHeader title="Programs" subtitle="Available academic programs" />

      {programs.length === 0 ? (
        <EmptyState icon={HiOutlineAcademicCap} title="No programs found" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p) => (
            <GlassCard key={p.id} className="flex flex-col">
              <h3 className="text-lg font-bold text-text mb-2">{p.name}</h3>
              <div className="space-y-1 text-sm text-text-muted mb-4">
                <p><span className="font-medium text-secondary">Degree:</span> {p.degreeLevel}</p>
                {p.duration && <p><span className="font-medium text-secondary">Duration:</span> {p.duration}</p>}
                {p.tuitionFee && <p><span className="font-medium text-secondary">Tuition:</span> ${p.tuitionFee.toLocaleString()}</p>}
              </div>
              {p.description && <p className="text-sm text-text-muted line-clamp-2 mb-4">{p.description}</p>}
              <div className="mt-auto">
                <PrimaryButton
                  onClick={() => handleApply(p)}
                  loading={applying === p.id}
                  className="text-xs px-4 py-1.5"
                >
                  {applying === p.id ? 'Applying…' : 'Apply Now'}
                </PrimaryButton>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </>
  );
}
