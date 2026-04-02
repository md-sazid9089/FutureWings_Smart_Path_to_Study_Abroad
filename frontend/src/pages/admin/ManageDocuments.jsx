import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getDocuments, verifyDocument } from '../../api/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassTable, { Td } from '../../components/ui/GlassTable';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import TextField from '../../components/ui/TextField';
import SelectField from '../../components/ui/SelectField';
import StatusPill from '../../components/ui/StatusPill';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';

const STATUS_OPTIONS = ['PENDING', 'VERIFIED', 'REJECTED'];

const statusColor = (s) => {
  switch (s) {
    case 'VERIFIED': return 'green';
    case 'REJECTED': return 'red';
    default: return 'yellow';
  }
};

export default function ManageDocuments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ verificationStatus: '', adminNote: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getDocuments(statusFilter || undefined);
      setItems(res.data.data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((d) =>
      (d.documentType || '').toLowerCase().includes(q) ||
      (d.user?.fullName || '').toLowerCase().includes(q) ||
      (d.user?.email || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const openReview = (doc) => {
    setSelected(doc);
    setForm({ verificationStatus: '', adminNote: '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.verificationStatus) return toast.error('Please select a status');
    setSaving(true);
    try {
      await verifyDocument(selected.id, {
        verificationStatus: form.verificationStatus,
        adminNote: form.adminNote.trim() || null,
      });
      toast.success(`Document ${form.verificationStatus.toLowerCase()}`);
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Verification failed');
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '-';

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <>
      <PageHeader title="Document Verification" subtitle={`${items.length} documents`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <TextField placeholder="Search by type, name, or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </SelectField>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={HiOutlineDocumentText} title="No documents found" />
      ) : (
        <GlassTable headers={['ID', 'User', 'Document Type', 'Uploaded', 'Status', 'Admin Note', 'Actions']}>
          {filtered.map((d) => (
            <tr key={d.id} className="hover:bg-white/30 transition-colors">
              <Td>{d.id}</Td>
              <Td>
                <div>
                  <div className="font-semibold">{d.user?.fullName || '-'}</div>
                  <div className="text-xs text-gray-500">{d.user?.email}</div>
                </div>
              </Td>
              <Td>{d.documentType || '-'}</Td>
              <Td>{fmtDate(d.uploadedAt)}</Td>
              <Td><StatusPill status={d.verificationStatus} color={statusColor(d.verificationStatus)} /></Td>
              <Td><span className="text-xs text-gray-500 truncate max-w-37.5 inline-block">{d.adminNote || '-'}</span></Td>
              <Td>
                <div className="flex gap-2">
                  <button onClick={() => openReview(d)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="Verify">
                    <HiOutlineCheckCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setSelected(d); setForm({ verificationStatus: 'REJECTED', adminNote: '' }); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-red-50 text-danger transition-colors" title="Reject">
                    <HiOutlineXCircle className="w-4 h-4" />
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Review Document">
        {selected && (
          <div className="space-y-4">
            <div className="p-3 bg-white/30 rounded-xl space-y-1 text-sm">
              <p><span className="font-medium">User:</span> {selected.user?.fullName} ({selected.user?.email})</p>
              <p><span className="font-medium">Type:</span> {selected.documentType}</p>
              <p><span className="font-medium">Current Status:</span> {selected.verificationStatus}</p>
              {selected.filePath && (
                <p><span className="font-medium">File:</span>{' '}
                  <a href={selected.filePath} target="_blank" rel="noreferrer" className="text-primary underline">View File</a>
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <SelectField label="Decision *" value={form.verificationStatus} onChange={(e) => setForm({ ...form, verificationStatus: e.target.value })}>
                <option value="">Select decision…</option>
                <option value="VERIFIED">✅ Verify</option>
                <option value="REJECTED">❌ Reject</option>
              </SelectField>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
                <textarea
                  value={form.adminNote}
                  onChange={(e) => setForm({ ...form, adminNote: e.target.value })}
                  className="w-full rounded-xl border border-white/30 bg-white/40 backdrop-blur-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all min-h-20"
                  placeholder="Optional note for the user…"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <SecondaryButton type="button" onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
                <PrimaryButton type="submit" loading={saving}>Submit</PrimaryButton>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </>
  );
}
