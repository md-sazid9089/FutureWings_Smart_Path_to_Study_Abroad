import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { HiOutlineBuildingLibrary, HiOutlineGlobeAlt } from 'react-icons/hi2';

export default function Universities() {
  const { countryId } = useParams();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnis = async () => {
      try {
        const res = await API.get(`/api/countries/${countryId}/universities`);
        setUniversities(res.data.data);
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    fetchUnis();
  }, [countryId]);

  if (loading) {
    return (
      <>
        <PageHeader title="Universities" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Universities" subtitle="Browse and select a university" />

      {universities.length === 0 ? (
        <EmptyState icon={HiOutlineBuildingLibrary} title="No universities found" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities.map((uni) => (
            <GlassCard key={uni.id} className="flex flex-col">
              <h3 className="text-lg font-bold text-text mb-1">{uni.name}</h3>
              <p className="text-sm text-text-muted mb-1">{uni.location || ''}</p>
              {uni.ranking && <p className="text-xs text-primary font-semibold mb-1">Ranking: #{uni.ranking}</p>}
              {uni.website && (
                <a href={uni.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mb-3">
                  <HiOutlineGlobeAlt className="w-3.5 h-3.5" /> Website
                </a>
              )}
              <div className="mt-auto">
                <Link to={`/programs/${uni.id}`}>
                  <PrimaryButton className="text-xs px-4 py-1.5">Programs</PrimaryButton>
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </>
  );
}
