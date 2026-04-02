import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import StatusPill from '../components/ui/StatusPill';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { HiOutlineGlobeAlt, HiOutlineArrowRight, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const TIER_THEME = {
  1: {
    badge: 'bg-primary/15 text-primary border-primary/25',
    bar: 'bg-primary',
    glow: 'bg-primary/15 group-hover:bg-primary/25',
  },
  2: {
    badge: 'bg-accent/15 text-accent border-accent/25',
    bar: 'bg-accent',
    glow: 'bg-accent/15 group-hover:bg-accent/25',
  },
  3: {
    badge: 'bg-secondary/15 text-secondary border-secondary/25',
    bar: 'bg-secondary',
    glow: 'bg-secondary/15 group-hover:bg-secondary/25',
  },
};

function getTierTheme(tierLevel) {
  return TIER_THEME[tierLevel] || TIER_THEME[3];
}

export default function Recommendations() {
  const [data, setData] = useState({ tier: null, countries: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const filteredCountries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return data.countries;

    return data.countries.filter((country) => {
      const name = (country.countryName || '').toLowerCase();
      const region = (country.region || '').toLowerCase();
      const currency = (country.currency || '').toLowerCase();
      const tierText = `tier ${country.tierLevel}`.toLowerCase();

      return (
        name.includes(query) ||
        region.includes(query) ||
        currency.includes(query) ||
        tierText.includes(query)
      );
    });
  }, [data.countries, searchTerm]);

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
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by country, region, currency, or tier"
                className="w-full rounded-xl border border-white/20 bg-white/40 py-2.5 pl-10 pr-3 text-sm text-text placeholder:text-text-muted/70 backdrop-blur-md outline-none transition focus:border-primary/35 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="text-sm text-text-muted">
              Showing {filteredCountries.length} of {data.countries.length} destinations
            </p>
          </div>

          {filteredCountries.length === 0 ? (
            <EmptyState
              icon={HiOutlineGlobeAlt}
              title="No matching destinations"
              message={`No results for "${searchTerm}". Try country name, region, currency, or tier.`}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCountries.map((country, index) => {
                const tierTheme = getTierTheme(country.tierLevel);

                return (
                  <Link key={country.id} to={`/countries/${country.id}`}>
                    <GlassCard className="h-full group relative overflow-hidden border border-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                      <div className={`absolute -top-12 -right-12 h-28 w-28 rounded-full blur-2xl transition-colors ${tierTheme.glow}`} />

                      <div className="relative flex h-full flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-text">
                              #{index + 1}
                            </span>
                            <span className="text-[11px] uppercase tracking-wider text-text-muted">Recommended</span>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${tierTheme.badge}`}>
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
                              className={`h-full rounded-full transition-all duration-500 ${tierTheme.bar}`}
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
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}
