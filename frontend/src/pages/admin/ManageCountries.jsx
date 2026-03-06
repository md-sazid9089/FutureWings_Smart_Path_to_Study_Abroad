import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getCountries, createCountry, updateCountry, deleteCountry } from '../../api/adminService';
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
import ConfirmModal from '../../components/ui/ConfirmModal';
import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlinePlus, HiOutlineGlobeAlt } from 'react-icons/hi2';

const emptyForm = { countryName: '', region: '', currency: '', tierLevel: 3, isActive: true };

export default function ManageCountries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    getCountries()
      .then((res) => setCountries(res.data.data))
      .catch(() => toast.error('Failed to load countries'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      const matchSearch = c.countryName.toLowerCase().includes(search.toLowerCase()) ||
        (c.region || '').toLowerCase().includes(search.toLowerCase());
      const matchTier = !tierFilter || c.tierLevel === Number(tierFilter);
      return matchSearch && matchTier;
    });
  }, [countries, search, tierFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      countryName: c.countryName,
      region: c.region || '',
      currency: c.currency || '',
      tierLevel: c.tierLevel,
      isActive: c.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.countryName.trim()) return toast.error('Country name is required');
    setSaving(true);
    try {
      const payload = {
        countryName: form.countryName.trim(),
        region: form.region.trim() || null,
        currency: form.currency.trim() || null,
        tierLevel: Number(form.tierLevel),
        isActive: form.isActive,
      };
      if (editing) {
        await updateCountry(editing.id, payload);
        toast.success('Country updated');
      } else {
        await createCountry(payload);
        toast.success('Country created');
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
      await deleteCountry(deleteTarget.id);
      toast.success('Country deleted');
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
      <PageHeader title="Manage Countries" subtitle={`${countries.length} countries total`}>
        <PrimaryButton onClick={openCreate}><HiOutlinePlus className="w-4 h-4" /> Add Country</PrimaryButton>
      </PageHeader>

      {/* ─── Filters ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <TextField
          placeholder="Search by name or region…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <SelectField value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="w-40">
          <option value="">All Tiers</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </SelectField>
      </div>

      {/* ─── Table ──────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState icon={HiOutlineGlobeAlt} title="No countries found" message={search ? 'Try a different search term' : 'Create your first country'} />
      ) : (
        <GlassTable headers={['ID', 'Country Name', 'Region', 'Currency', 'Tier', 'Status', 'Actions']}>
          {filtered.map((c) => (
            <tr key={c.id} className="hover:bg-white/30 transition-colors">
              <Td>{c.id}</Td>
              <Td className="font-semibold">{c.countryName}</Td>
              <Td>{c.region || '—'}</Td>
              <Td>{c.currency || '—'}</Td>
              <Td><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">T{c.tierLevel}</span></Td>
              <Td><StatusPill status={c.isActive ? 'Accepted' : 'Rejected'} /></Td>
              <Td>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-white/50 text-secondary transition-colors" title="Edit"><HiOutlinePencilSquare className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-red-50 text-danger transition-colors" title="Delete"><HiOutlineTrash className="w-4 h-4" /></button>
                </div>
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}

      {/* ─── Create / Edit Modal ────────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Country' : 'Add Country'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Country Name *" value={form.countryName} onChange={(e) => setForm({ ...form, countryName: e.target.value })} />
          <TextField label="Region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="e.g. North America" />
          <TextField label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="e.g. USD" />
          <SelectField label="Tier Level" value={form.tierLevel} onChange={(e) => setForm({ ...form, tierLevel: Number(e.target.value) })}>
            <option value={1}>Tier 1 (Top)</option>
            <option value={2}>Tier 2 (Mid)</option>
            <option value={3}>Tier 3 (Standard)</option>
          </SelectField>
          {editing && (
            <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              Active
            </label>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <SecondaryButton type="button" onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton type="submit" loading={saving}>{editing ? 'Update' : 'Create'}</PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirm ─────────────────────── */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Country"
        message={`Are you sure you want to delete "${deleteTarget?.countryName}"? This action cannot be undone.`}
        loading={deleting}
        danger
      />
    </>
  );
}
