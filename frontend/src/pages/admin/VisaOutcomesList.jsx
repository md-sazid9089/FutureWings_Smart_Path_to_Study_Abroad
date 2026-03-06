import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getVisaOutcomes } from '../../api/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassTable, { Td } from '../../components/ui/GlassTable';
import TextField from '../../components/ui/TextField';
import SelectField from '../../components/ui/SelectField';
import StatusPill from '../../components/ui/StatusPill';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { HiOutlineShieldCheck, HiOutlinePencilSquare } from 'react-icons/hi2';

export default function VisaOutcomesList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getVisaOutcomes();
        setItems(res.data.data);
      } catch {
        toast.error('Failed to load visa outcomes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((v) => {
      const matchSearch =
        (v.application?.user?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.application?.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.reasonTitle || '').toLowerCase().includes(search.toLowerCase());
      const matchDecision = !decisionFilter || v.decision === decisionFilter;
      return matchSearch && matchDecision;
    });
  }, [items, search, decisionFilter]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <>
      <PageHeader title="Visa Outcomes" subtitle={`${items.length} outcomes total`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <TextField placeholder="Search by user or reason…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <SelectField value={decisionFilter} onChange={(e) => setDecisionFilter(e.target.value)} className="w-44">
          <option value="">All Decisions</option>
          <option value="APPROVED">Approved</option>
          <option value="DENIED">Denied</option>
        </SelectField>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={HiOutlineShieldCheck} title="No visa outcomes found" />
      ) : (
        <GlassTable headers={['ID', 'Applicant', 'Country', 'Program', 'Decision', 'Reason', 'Date', 'Actions']}>
          {filtered.map((v) => (
            <tr key={v.id} className="hover:bg-white/30 transition-colors">
              <Td>{v.id}</Td>
              <Td>
                <div>
                  <div className="font-semibold">{v.application?.user?.fullName || '—'}</div>
                  <div className="text-xs text-gray-500">{v.application?.user?.email}</div>
                </div>
              </Td>
              <Td>{v.application?.country?.countryName || '—'}</Td>
              <Td>{v.application?.program?.programName || '—'}</Td>
              <Td>
                <StatusPill
                  status={v.decision}
                  color={v.decision === 'APPROVED' ? 'green' : 'red'}
                />
              </Td>
              <Td><span className="text-sm truncate max-w-37.5 inline-block">{v.reasonTitle || '—'}</span></Td>
              <Td>{fmtDate(v.destinationDate || v.createdAt)}</Td>
              <Td>
                <button
                  onClick={() => navigate(`/admin/applications/${v.applicationId}/visa-outcome`)}
                  className="p-1.5 rounded-lg hover:bg-white/50 text-secondary transition-colors"
                  title="Edit"
                >
                  <HiOutlinePencilSquare className="w-4 h-4" />
                </button>
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}
    </>
  );
}
