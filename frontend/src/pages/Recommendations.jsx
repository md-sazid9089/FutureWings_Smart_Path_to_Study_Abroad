import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import StatusPill from '../components/ui/StatusPill';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { HiOutlineGlobeAlt, HiOutlineArrowRight } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Recommendations() {
  const [data, setData] = useState({ userTier: null, countries: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await API.get('/api/recommendations/countries');
        setData(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="Explore Countries" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Explore Countries" subtitle="Recommended destinations based on your profile">
        {data.userTier && (
          <StatusPill status={`Tier ${data.userTier}`} />
        )}
      </PageHeader>

      {data.countries.length === 0 ? (
        <EmptyState icon={HiOutlineGlobeAlt} title="No recommendations" message="Complete your profile with CGPA to get personalized recommendations" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.countries.map((country) => (
            <Link key={country.id} to={`/countries/${country.id}`}>
              <GlassCard className="h-full group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">{country.name}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    Tier {country.tier}
                  </span>
                </div>
                {country.description && (
                  <p className="text-sm text-text-muted line-clamp-3 mb-4">{country.description}</p>
                )}
                <div className="flex items-center gap-1 text-primary text-sm font-medium mt-auto">
                  Explore <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
