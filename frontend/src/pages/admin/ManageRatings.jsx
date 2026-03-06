import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getRatings, getCountries } from '../../api/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassTable, { Td } from '../../components/ui/GlassTable';
import TextField from '../../components/ui/TextField';
import SelectField from '../../components/ui/SelectField';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { HiOutlineStar } from 'react-icons/hi2';

const Stars = ({ count }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <HiOutlineStar
        key={i}
        className={`w-4 h-4 ${i <= count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

export default function ManageRatings() {
  const [items, setItems] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (countryFilter) params.countryId = countryFilter;
      const [rRes, cRes] = await Promise.all([getRatings(params), getCountries()]);
      setItems(rRes.data.data);
      setCountries(cRes.data.data);
    } catch {
      toast.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [countryFilter]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((r) =>
      (r.user?.fullName || '').toLowerCase().includes(q) ||
      (r.user?.email || '').toLowerCase().includes(q) ||
      (r.comment || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const avg = useMemo(() => {
    if (items.length === 0) return 0;
    const total = items.reduce((s, r) => s + (r.rating || 0), 0);
    return (total / items.length).toFixed(1);
  }, [items]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <>
      <PageHeader title="Ratings & Reviews" subtitle={`${items.length} ratings · Avg ${avg}/5`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <TextField placeholder="Search by user, email, or comment…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <SelectField value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-52">
          <option value="">All Countries</option>
          {countries.map((c) => <option key={c.id} value={c.id}>{c.countryName}</option>)}
        </SelectField>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={HiOutlineStar} title="No ratings found" />
      ) : (
        <GlassTable headers={['ID', 'User', 'Country', 'Rating', 'Comment', 'Date']}>
          {filtered.map((r) => (
            <tr key={r.id} className="hover:bg-white/30 transition-colors">
              <Td>{r.id}</Td>
              <Td>
                <div>
                  <div className="font-semibold">{r.user?.fullName || '—'}</div>
                  <div className="text-xs text-gray-500">{r.user?.email}</div>
                </div>
              </Td>
              <Td>{r.country?.countryName || '—'}</Td>
              <Td><Stars count={r.rating} /></Td>
              <Td>
                <span className="text-sm text-gray-600 truncate max-w-xs inline-block">
                  {r.comment || '—'}
                </span>
              </Td>
              <Td>{fmtDate(r.createdAt)}</Td>
            </tr>
          ))}
        </GlassTable>
      )}
    </>
  );
}
