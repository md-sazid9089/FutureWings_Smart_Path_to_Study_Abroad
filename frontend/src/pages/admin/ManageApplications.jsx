import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getApplications, updateApplicationStatus, getCountries } from '../../api/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassTable, { Td } from '../../components/ui/GlassTable';
import SecondaryButton from '../../components/ui/SecondaryButton';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import SelectField from '../../components/ui/SelectField';
import StatusPill from '../../components/ui/StatusPill';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useNavigate } from 'react-router-dom';
import { HiOutlineClipboardDocumentList, HiOutlineEye } from 'react-icons/hi2';

const STATUS_NAMES = ['Pending', 'Processing', 'Accepted', 'Rejected'];

const statusColor = (s) => {
  const n = s?.toLowerCase();
  if (n === 'accepted') return 'green';
  if (n === 'rejected') return 'red';
  if (n === 'processing') return 'blue';
  return 'yellow';
};

export default function ManageApplications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (countryFilter) params.countryId = countryFilter;
      const [aRes, cRes] = await Promise.all([getApplications(params), getCountries()]);
      setItems(aRes.data.data);
      setCountries(cRes.data.data);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter, countryFilter]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((a) =>
      (a.user?.fullName || '').toLowerCase().includes(q) ||
      (a.user?.email || '').toLowerCase().includes(q) ||
      (a.program?.programName || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const openStatus = (app) => {
    setSelected(app);
    setNewStatus(app.status?.statusName || '');
    setModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus) return toast.error('Select a status');
    setSaving(true);
    try {
      await updateApplicationStatus(selected.id, newStatus);
      toast.success(`Status changed to ${newStatus}`);
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <>
      <PageHeader title="Manage Applications" subtitle={`${items.length} applications`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <TextField placeholder="Search by user, email, or program…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
          <option value="">All Status</option>
          {STATUS_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
        </SelectField>
        <SelectField value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-52">
          <option value="">All Countries</option>
          {countries.map((c) => <option key={c.id} value={c.id}>{c.countryName}</option>)}
        </SelectField>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={HiOutlineClipboardDocumentList} title="No applications found" />
      ) : (
        <GlassTable headers={['ID', 'User', 'Country', 'Program', 'Applied', 'Status', 'Visa', 'Actions']}>
          {filtered.map((a) => (
            <tr key={a.id} className="hover:bg-white/30 transition-colors">
              <Td>{a.id}</Td>
              <Td>
                <div>
                  <div className="font-semibold">{a.user?.fullName || '—'}</div>
                  <div className="text-xs text-gray-500">{a.user?.email}</div>
                </div>
              </Td>
              <Td>{a.country?.countryName || '—'}</Td>
              <Td>{a.program?.programName || '—'}</Td>
              <Td>{fmtDate(a.appliedDate)}</Td>
              <Td><StatusPill status={a.status?.statusName || 'Unknown'} color={statusColor(a.status?.statusName)} /></Td>
              <Td>
                {a.visaOutcome ? (
                  <StatusPill
                    status={a.visaOutcome.decision}
                    color={a.visaOutcome.decision === 'APPROVED' ? 'green' : 'red'}
                  />
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </Td>
              <Td>
                <div className="flex gap-2">
                  <button onClick={() => openStatus(a)} className="p-1.5 rounded-lg hover:bg-white/50 text-secondary transition-colors" title="Update Status">
                    <HiOutlineClipboardDocumentList className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigate(`/admin/applications/${a.id}/visa-outcome`)} className="p-1.5 rounded-lg hover:bg-white/50 text-primary transition-colors" title="Visa Outcome">
                    <HiOutlineEye className="w-4 h-4" />
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Update Application Status">
        {selected && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="p-3 bg-white/30 rounded-xl space-y-1 text-sm">
              <p><span className="font-medium">Applicant:</span> {selected.user?.fullName}</p>
              <p><span className="font-medium">Program:</span> {selected.program?.programName}</p>
              <p><span className="font-medium">Country:</span> {selected.country?.countryName}</p>
              <p><span className="font-medium">Current Status:</span>{' '}
                <StatusPill status={selected.status?.statusName} color={statusColor(selected.status?.statusName)} />
              </p>
            </div>
            <SelectField label="New Status *" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="">Select…</option>
              {STATUS_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
            </SelectField>
            <div className="flex justify-end gap-3 pt-2">
              <SecondaryButton type="button" onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" loading={saving}>Update Status</PrimaryButton>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
