import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader, SectionTitle } from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { HiOutlineArrowTopRightOnSquare, HiOutlineBanknotes, HiOutlineBuildingLibrary, HiOutlineCalendar, HiOutlineSparkles } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function CountryDetails() {
  const { id } = useParams();
  const countryId = Number(id);
  const [country, setCountry] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  const upcomingScholarships = useMemo(
    () => scholarships.filter((s) => s.deadline && new Date(s.deadline) > new Date()).length,
    [scholarships]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, uniRes, schRes] = await Promise.all([
          API.get('/api/countries'),
          API.get(`/api/countries/${id}/universities`),
          API.get(`/api/scholarships/country/${id}`),
        ]);

        const selectedCountry = countriesRes.data.data.find((c) => c.id === countryId) || null;
        setCountry(selectedCountry);
        setUniversities(uniRes.data.data);
        setScholarships(schRes.data.data);
      } catch {
        toast.error('Failed to load country details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, countryId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={country?.countryName || 'Country Details'}
        subtitle={country ? `${country.region || 'Global region'} • ${country.currency || 'Currency not listed'}` : 'Universities and scholarships'}
      />

      <GlassCard className="relative overflow-hidden border border-white/20 mb-8">
        <div className="absolute -top-14 -right-10 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-2 rounded-2xl border border-white/20 bg-white/45 p-5">
            <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
              <HiOutlineSparkles className="w-4 h-4" />
              Smart Country Snapshot
            </div>
            <h2 className="text-2xl font-extrabold text-text mb-2">{country?.countryName || 'Destination'}</h2>
            <p className="text-sm text-text-muted leading-6">
              Explore top-fit universities, find scholarship opportunities, and plan your next academic steps from one place.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
            <p className="text-xs uppercase tracking-wide text-text-muted">Universities</p>
            <p className="text-3xl font-extrabold text-text mt-2">{universities.length}</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
            <p className="text-xs uppercase tracking-wide text-text-muted">Scholarships</p>
            <p className="text-3xl font-extrabold text-text mt-2">{scholarships.length}</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
            <p className="text-xs uppercase tracking-wide text-text-muted">Tier</p>
            <p className="text-3xl font-extrabold text-primary mt-2">{country?.tierLevel || 'N/A'}</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/45 p-5">
            <p className="text-xs uppercase tracking-wide text-text-muted">Open Deadlines</p>
            <p className="text-3xl font-extrabold text-accent mt-2">{upcomingScholarships}</p>
          </div>
        </div>
      </GlassCard>

      <section className="mb-10">
        <SectionTitle className="mb-4">
          <span className="flex items-center gap-2">
            <HiOutlineBuildingLibrary className="w-5 h-5 text-primary" /> Universities
          </span>
        </SectionTitle>

        {universities.length === 0 ? (
          <EmptyState icon={HiOutlineBuildingLibrary} title="No universities listed" message="No university records are available for this country yet." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((uni, index) => (
              <GlassCard key={uni.id} className="h-full group relative overflow-hidden border border-white/10 hover:border-primary/25">
                <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors" />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/40 text-xs font-bold text-text">
                      #{index + 1}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-text-muted">University</span>
                  </div>

                  <h3 className="text-lg font-bold text-text mb-1">{uni.universityName}</h3>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="rounded-full bg-white/40 border border-white/20 px-2.5 py-1 text-xs font-medium text-text-muted">
                      {uni.city || 'City N/A'}
                    </span>
                    <span className="rounded-full bg-white/40 border border-white/20 px-2.5 py-1 text-xs font-medium text-text-muted">
                      {uni.type || 'Type N/A'}
                    </span>
                  </div>

                  <p className="text-sm text-text-muted mb-5 leading-6">
                    Compare programs and choose the best-fit path based on your profile, goals, and destination strategy.
                  </p>

                  <div className="mt-auto">
                    <Link to={`/programs/${uni.id}`}>
                      <PrimaryButton className="w-full text-xs px-4 py-2">
                        View Programs
                      </PrimaryButton>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle className="mb-4">
          <span className="flex items-center gap-2">
            <HiOutlineBanknotes className="w-5 h-5 text-primary" /> Scholarships
          </span>
        </SectionTitle>

        {scholarships.length === 0 ? (
          <EmptyState icon={HiOutlineBanknotes} title="No scholarships available" message="No funding opportunities are listed for this country yet." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((s, index) => (
              <GlassCard key={s.id} className="h-full group relative overflow-hidden border border-white/10 hover:border-accent/25">
                <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-accent/10 blur-2xl group-hover:bg-accent/20 transition-colors" />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/40 text-xs font-bold text-text">
                      #{index + 1}
                    </span>
                    <span className="rounded-full bg-accent/12 border border-accent/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
                      Funding
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-text mb-2">{s.scholarshipName}</h3>

                  {s.amount && (
                    <p className="text-sm font-semibold text-success mb-2">
                      {`$${Number(s.amount).toLocaleString()}`}
                    </p>
                )}

                  {s.eligibilityCriteria && (
                    <p className="text-sm text-text-muted leading-6 mb-3">
                      {s.eligibilityCriteria}
                    </p>
                  )}

                {s.deadline && (
                    <p className="flex items-center gap-1 text-xs text-text-light mt-auto mb-4">
                    <HiOutlineCalendar className="w-3.5 h-3.5" />
                    Deadline: {new Date(s.deadline).toLocaleDateString()}
                  </p>
                )}

                  {s.applyLink ? (
                    <a href={s.applyLink} target="_blank" rel="noreferrer" className="inline-flex w-full">
                      <PrimaryButton className="w-full text-xs px-4 py-2">
                        Apply Now <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                      </PrimaryButton>
                    </a>
                  ) : (
                    <div className="rounded-xl border border-white/20 bg-white/35 px-3 py-2 text-xs text-text-muted">
                      Application link not available
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
