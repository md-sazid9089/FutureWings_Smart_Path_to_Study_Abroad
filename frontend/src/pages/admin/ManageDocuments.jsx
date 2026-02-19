import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassTable, { Td } from '../../components/ui/GlassTable';
import SelectField from '../../components/ui/SelectField';
import StatusPill from '../../components/ui/StatusPill';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function ManageDocuments() {
  const [docs, setDocs] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDocs(); }, [filter]);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/admin/documents?status=${filter}`);
      setDocs(res.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleVerify = async (docId, status) => {
    const note = prompt('Add a note (optional):') || '';
    try {
      await API.put(`/api/admin/documents/${docId}/verify`, { status, note });
      toast.success(`Document ${status.toLowerCase()}`);
      fetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <>
      <PageHeader title="Verify Documents">
        <SelectField id="docFilter" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Rejected">Rejected</option>
        </SelectField>
      </PageHeader>

      {loading ? <LoadingSkeleton rows={4} /> : docs.length === 0 ? (
        <EmptyState icon={HiOutlineDocumentText} title="No documents" message={`No ${filter.toLowerCase()} documents found`} />
      ) : (
        <GlassTable headers={['ID', 'User', 'File', 'Type', 'Status', 'Actions']}>
          {docs.map((d) => (
            <tr key={d.id} className="hover:bg-white/20 transition-colors">
              <Td>{d.id}</Td>
              <Td>{d.user?.fullname || d.user?.email}</Td>
              <Td className="font-medium">{d.fileName}</Td>
              <Td>{d.fileType}</Td>
              <Td><StatusPill status={d.status} /></Td>
              <Td>
                {d.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleVerify(d.id, 'Verified')} className="p-1.5 rounded-lg hover:bg-emerald-50 text-success transition-colors" title="Verify">
                      <HiOutlineCheckCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleVerify(d.id, 'Rejected')} className="p-1.5 rounded-lg hover:bg-red-50 text-danger transition-colors" title="Reject">
                      <HiOutlineXCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}
    </>
  );
}
