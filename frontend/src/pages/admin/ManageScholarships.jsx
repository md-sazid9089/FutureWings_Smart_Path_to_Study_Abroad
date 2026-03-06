import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getScholarships, createScholarship, updateScholarship, deleteScholarship, getCountries } from '../../api/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassTable, { Td } from '../../components/ui/GlassTable';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import TextField from '../../components/ui/TextField';
import SelectField from '../../components/ui/SelectField';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlinePlus, HiOutlineTrophy } from 'react-icons/hi2';

const emptyForm = { scholarshipName: '', countryId: '', eligibilityCriteria: '', applyLink: '', deadline: '', amount: '' };

export default function ManageScholarships() {
  const [items, setItems] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([getScholarships(), getCountries()]);
      setItems(sRes.data.data);
      setCountries(cRes.data.data);
    } catch {
      toast.error('Failed to load scholarships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return items.filter((s) => {
      const matchSearch = s.scholarshipName.toLowerCase().includes(search.toLowerCase()) ||
        (s.eligibilityCriteria || '').toLowerCase().includes(search.toLowerCase());
      const matchCountry = !countryFilter || s.country?.id === Number(countryFilter);
      return matchSearch && matchCountry;
    });
  }, [items, search, countryFilter]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      scholarshipName: s.scholarshipName,
      countryId: s.country?.id || '',
      eligibilityCriteria: s.eligibilityCriteria || '',
      applyLink: s.applyLink || '',
      deadline: s.deadline ? s.deadline.slice(0, 10) : '',
      amount: s.amount ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.scholarshipName.trim()) return toast.error('Scholarship name is required');
    if (!form.countryId) return toast.error('Please select a country');
    setSaving(true);
    try {
      const payload = {
        scholarshipName: form.scholarshipName.trim(),
        countryId: Number(form.countryId),
        eligibilityCriteria: form.eligibilityCriteria.trim() || null,
        applyLink: form.applyLink.trim() || null,
        deadline: form.deadline || null,
        amount: form.amount !== '' ? Number(form.amount) : null,
      };
      if (editing) {
        await updateScholarship(editing.id, payload);
        toast.success('Scholarship updated');
      } else {
        await createScholarship(payload);
        toast.success('Scholarship created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteScholarship(deleteTarget.id);
      toast.success('Scholarship deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';
  const fmtAmount = (v) => v != null ? `$${Number(v).toLocaleString()}` : '—';

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <>
      <PageHeader title="Manage Scholarships" subtitle={`${items.length} scholarships total`}>
        <PrimaryButton onClick={openCreate}><HiOutlinePlus className="w-4 h-4" /> Add Scholarship</PrimaryButton>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <TextField placeholder="Search by name or criteria…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <SelectField value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-52">
          <option value="">All Countries</option>
          {countries.map((c) => <option key={c.id} value={c.id}>{c.countryName}</option>)}
        </SelectField>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={HiOutlineTrophy} title="No scholarships found" />
      ) : (
        <GlassTable headers={['ID', 'Scholarship', 'Country', 'Amount', 'Deadline', 'Actions']}>
          {filtered.map((s) => (
            <tr key={s.id} className="hover:bg-white/30 transition-colors">
              <Td>{s.id}</Td>
              <Td>
                <div>
                  <div className="font-semibold">{s.scholarshipName}</div>
                  {s.eligibilityCriteria && <div className="text-xs text-gray-500 truncate max-w-xs">{s.eligibilityCriteria}</div>}
                </div>
              </Td>
              <Td>{s.country?.countryName || '—'}</Td>
              <Td>{fmtAmount(s.amount)}</Td>
              <Td>{fmtDate(s.deadline)}</Td>
              <Td>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-white/50 text-secondary transition-colors" title="Edit"><HiOutlinePencilSquare className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg hover:bg-red-50 text-danger transition-colors" title="Delete"><HiOutlineTrash className="w-4 h-4" /></button>
                </div>
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Scholarship' : 'Add Scholarship'} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Scholarship Name *" value={form.scholarshipName} onChange={(e) => setForm({ ...form, scholarshipName: e.target.value })} />
          <SelectField label="Country *" value={form.countryId} onChange={(e) => setForm({ ...form, countryId: e.target.value })}>
            <option value="">Select country…</option>
            {countries.map((c) => <option key={c.id} value={c.id}>{c.countryName}</option>)}
          </SelectField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Amount ($)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 10000" />
            <TextField label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <TextField label="Apply Link" value={form.applyLink} onChange={(e) => setForm({ ...form, applyLink: e.target.value })} placeholder="https://…" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria</label>
            <textarea
              value={form.eligibilityCriteria}
              onChange={(e) => setForm({ ...form, eligibilityCriteria: e.target.value })}
              className="w-full rounded-xl border border-white/30 bg-white/40 backdrop-blur-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all min-h-20"
              placeholder="Describe eligibility requirements…"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <SecondaryButton type="button" onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton type="submit" loading={saving}>{editing ? 'Update' : 'Create'}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Scholarship"
        message={`Are you sure you want to delete "${deleteTarget?.scholarshipName}"?`}
        loading={deleting}
        danger
      />
    </>
  );
}
