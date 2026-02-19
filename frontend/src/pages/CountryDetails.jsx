import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { PageHeader, SectionTitle } from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { HiOutlineBuildingLibrary, HiOutlineBanknotes, HiOutlineCalendar } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function CountryDetails() {
  const { id } = useParams();
  const [universities, setUniversities] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uniRes, schRes] = await Promise.all([
          API.get(`/api/countries/${id}/universities`),
          API.get(`/api/scholarships/country/${id}`),
        ]);
        setUniversities(uniRes.data.data);
        setScholarships(schRes.data.data);
      } catch {
        toast.error('Failed to load country details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <>
      <PageHeader title="Country Details" subtitle="Universities and scholarships" />

      {/* Universities Section */}
      <section className="mb-10">
        <SectionTitle className="mb-4">
          <span className="flex items-center gap-2">
            <HiOutlineBuildingLibrary className="w-5 h-5 text-primary" /> Universities
          </span>
        </SectionTitle>

        {universities.length === 0 ? (
          <EmptyState icon={HiOutlineBuildingLibrary} title="No universities listed" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((uni) => (
              <GlassCard key={uni.id}>
                <h3 className="text-lg font-bold text-text mb-1">{uni.name}</h3>
                <p className="text-sm text-text-muted mb-1">{uni.location || 'Location N/A'}</p>
                {uni.ranking && (
                  <p className="text-xs font-semibold text-primary mb-3">Ranking: #{uni.ranking}</p>
                )}
                <Link to={`/universities/${uni.id}`}>
                  <PrimaryButton className="text-xs px-4 py-1.5">View Programs</PrimaryButton>
                </Link>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {/* Scholarships Section */}
      <section>
        <SectionTitle className="mb-4">
          <span className="flex items-center gap-2">
            <HiOutlineBanknotes className="w-5 h-5 text-primary" /> Scholarships
          </span>
        </SectionTitle>

        {scholarships.length === 0 ? (
          <EmptyState icon={HiOutlineBanknotes} title="No scholarships available" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((s) => (
              <GlassCard key={s.id}>
                <h3 className="text-lg font-bold text-text mb-2">{s.name}</h3>
                {s.amount && (
                  <p className="text-sm font-semibold text-success mb-1">${s.amount.toLocaleString()}</p>
                )}
                {s.eligibility && <p className="text-sm text-text-muted mb-1">{s.eligibility}</p>}
                {s.deadline && (
                  <p className="flex items-center gap-1 text-xs text-text-light mt-2">
                    <HiOutlineCalendar className="w-3.5 h-3.5" />
                    Deadline: {new Date(s.deadline).toLocaleDateString()}
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
