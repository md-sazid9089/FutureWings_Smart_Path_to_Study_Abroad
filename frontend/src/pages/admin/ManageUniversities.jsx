import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getUniversities, createUniversity, updateUniversity, deleteUniversity, getCountries } from '../../api/adminService';
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
import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlinePlus, HiOutlineBuildingLibrary } from 'react-icons/hi2';

const emptyForm = { universityName: '', countryId: '', type: '', city: '' };

export default function ManageUniversities() {
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
      const [uRes, cRes] = await Promise.all([getUniversities(), getCountries()]);
      setItems(uRes.data.data);
      setCountries(cRes.data.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return items.filter((u) => {
      const matchSearch = u.universityName.toLowerCase().includes(search.toLowerCase()) ||
        (u.city || '').toLowerCase().includes(search.toLowerCase());
      const matchCountry = !countryFilter || u.country?.id === Number(countryFilter);
      return matchSearch && matchCountry;
    });
  }, [items, search, countryFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      universityName: u.universityName,
      countryId: u.country?.id || '',
      type: u.type || '',
      city: u.city || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.universityName.trim()) return toast.error('University name is required');
    if (!form.countryId) return toast.error('Please select a country');
    setSaving(true);
    try {
      const payload = {
        universityName: form.universityName.trim(),
        countryId: Number(form.countryId),
        type: form.type.trim() || null,
        city: form.city.trim() || null,
      };
      if (editing) {
        await updateUniversity(editing.id, payload);
        toast.success('University updated');
      } else {
        await createUniversity(payload);
        toast.success('University created');
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
      await deleteUniversity(deleteTarget.id);
      toast.success('University deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <>
      <PageHeader title="Manage Universities" subtitle={`${items.length} universities total`}>
        <PrimaryButton onClick={openCreate}><HiOutlinePlus className="w-4 h-4" /> Add University</PrimaryButton>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <TextField placeholder="Search by name or city…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <SelectField value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-48">
          <option value="">All Countries</option>
          {countries.map((c) => <option key={c.id} value={c.id}>{c.countryName}</option>)}
        </SelectField>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={HiOutlineBuildingLibrary} title="No universities found" />
      ) : (
        <GlassTable headers={['ID', 'University Name', 'Country', 'Type', 'City', 'Actions']}>
          {filtered.map((u) => (
            <tr key={u.id} className="hover:bg-white/30 transition-colors">
              <Td>{u.id}</Td>
              <Td className="font-semibold">{u.universityName}</Td>
              <Td>{u.country?.countryName || '—'}</Td>
              <Td>{u.type || '—'}</Td>
              <Td>{u.city || '—'}</Td>
              <Td>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-white/50 text-secondary transition-colors" title="Edit"><HiOutlinePencilSquare className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-lg hover:bg-red-50 text-danger transition-colors" title="Delete"><HiOutlineTrash className="w-4 h-4" /></button>
                </div>
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit University' : 'Add University'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="University Name *" value={form.universityName} onChange={(e) => setForm({ ...form, universityName: e.target.value })} />
          <SelectField label="Country *" value={form.countryId} onChange={(e) => setForm({ ...form, countryId: e.target.value })}>
            <option value="">Select country…</option>
            {countries.map((c) => <option key={c.id} value={c.id}>{c.countryName}</option>)}
          </SelectField>
          <TextField label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g. Public, Private" />
          <TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Cambridge" />
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
        title="Delete University"
        message={`Are you sure you want to delete "${deleteTarget?.universityName}"?`}
        loading={deleting}
        danger
      />
    </>
  );
}
