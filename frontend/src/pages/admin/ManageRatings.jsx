import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassTable, { Td } from '../../components/ui/GlassTable';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { HiOutlineStar } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function ManageRatings() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await API.get('/api/admin/ratings');
        setRatings(res.data.data);
      } catch { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    fetchRatings();
  }, []);

  return (
    <>
      <PageHeader title="Ratings Moderation" subtitle="Review student feedback" />

      {loading ? <LoadingSkeleton rows={4} /> : ratings.length === 0 ? (
        <EmptyState icon={HiOutlineStar} title="No ratings yet" />
      ) : (
        <GlassTable headers={['ID', 'User', 'Country', 'Rating', 'Comments', 'Date']}>
          {ratings.map((r) => (
            <tr key={r.id} className="hover:bg-white/20 transition-colors">
              <Td>{r.id}</Td>
              <Td>{r.user?.fullname || r.user?.email}</Td>
              <Td>{r.country?.name}</Td>
              <Td>
                <span className="text-amber-500 tracking-wide">
                  {'★'.repeat(r.ratingValue)}{'☆'.repeat(5 - r.ratingValue)}
                </span>
              </Td>
              <Td className="max-w-xs truncate text-text-muted">{r.comments || '—'}</Td>
              <Td>{new Date(r.createdAt).toLocaleDateString()}</Td>
            </tr>
          ))}
        </GlassTable>
      )}
    </>
  );
}
