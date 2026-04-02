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
  const [data, setData] = useState({ tier: null, countries: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await API.get('/api/recommendations/countries');
        setData(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.error?.message || 'Failed to load recommendations');
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
        {data.tier && (
          <StatusPill status={`Your Tier ${data.tier}`} />
        )}
      </PageHeader>

      {data.countries.length === 0 ? (
        <EmptyState icon={HiOutlineGlobeAlt} title="No recommendations" message="Complete your profile with CGPA to get personalized recommendations" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.countries.map((country, index) => (
            <Link key={country.id} to={`/countries/${country.id}`}>
              <GlassCard className="h-full group relative overflow-hidden border border-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-primary/15 blur-2xl group-hover:bg-primary/25 transition-colors" />

                <div className="relative flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-text">
                        #{index + 1}
                      </span>
                      <span className="text-[11px] uppercase tracking-wider text-text-muted">Recommended</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/15 text-primary border border-primary/25">
                      Required Tier {country.tierLevel}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors">
                      {country.countryName}
                    </h3>
                    <p className="text-sm text-text-muted mt-1">Plan your next move with a tier-matched destination.</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-text">{country.region || 'Global'}</span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-text">{country.currency || 'N/A'} Currency</span>
                  </div>

                  <div className="mt-auto pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                      <span>Tier Readiness</span>
                      <span>{country.tierLevel}/3</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${(country.tierLevel / 3) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-primary text-sm font-semibold">
                    Explore Path <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
