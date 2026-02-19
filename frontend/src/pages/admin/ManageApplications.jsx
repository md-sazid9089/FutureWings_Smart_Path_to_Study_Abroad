import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassTable, { Td } from '../../components/ui/GlassTable';
import StatusPill from '../../components/ui/StatusPill';
import PrimaryButton from '../../components/ui/PrimaryButton';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function ManageApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const res = await API.get('/api/admin/applications');
      setApps(res.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (appId, statusName) => {
    try {
      await API.put(`/api/admin/applications/${appId}/status`, { statusName });
      toast.success('Status updated');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <>
      <PageHeader title="Manage Applications" />

      {loading ? <LoadingSkeleton rows={5} /> : (
        <GlassTable headers={['ID', 'User', 'Country', 'Program', 'Intake', 'Status', 'Visa', 'Actions']}>
          {apps.map((a) => (
            <tr key={a.id} className="hover:bg-white/20 transition-colors">
              <Td>{a.id}</Td>
              <Td>{a.user?.fullname || a.user?.email}</Td>
              <Td>{a.country?.name}</Td>
              <Td className="font-medium">{a.program?.name}</Td>
              <Td>{a.intakeApplied}</Td>
              <Td><StatusPill status={a.status?.name} /></Td>
              <Td>{a.visaOutcome ? <StatusPill status={a.visaOutcome.outcome} /> : <span className="text-text-light">—</span>}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue=""
                    onChange={(e) => { if (e.target.value) handleStatusChange(a.id, e.target.value); }}
                    className="px-2 py-1 rounded-lg text-xs bg-white/50 border border-white/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="" disabled>Change</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  {!a.visaOutcome && (
                    <Link to={`/admin/applications/${a.id}/visa-outcome`}>
                      <PrimaryButton className="text-xs px-3 py-1">+ Visa</PrimaryButton>
                    </Link>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}
    </>
  );
}
