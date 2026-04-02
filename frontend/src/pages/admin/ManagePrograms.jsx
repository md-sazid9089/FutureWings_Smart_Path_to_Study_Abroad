import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getPrograms, createProgram, updateProgram, deleteProgram, getUniversities } from '../../api/adminService';
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
import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlinePlus, HiOutlineAcademicCap } from 'react-icons/hi2';

const emptyForm = {
  programName: '',
  universityId: '',
  level: '',
  tuitionPerYear: '',
  durationMonths: '',
  intakeSeasons: '',
  programOverview: '',
};

export default function ManagePrograms() {
  const [items, setItems] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uniFilter, setUniFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, uRes] = await Promise.all([getPrograms(), getUniversities()]);
      setItems(pRes.data.data);
      setUniversities(uRes.data.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const levels = useMemo(() => {
    const set = new Set(items.map((p) => p.level).filter(Boolean));
    return [...set].sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchSearch = p.programName.toLowerCase().includes(search.toLowerCase());
      const matchUni = !uniFilter || p.university?.id === Number(uniFilter);
      const matchLevel = !levelFilter || p.level === levelFilter;
      return matchSearch && matchUni && matchLevel;
    });
  }, [items, search, uniFilter, levelFilter]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      programName: p.programName,
      universityId: p.university?.id || '',
      level: p.level || '',
      tuitionPerYear: p.tuitionPerYear ?? '',
      durationMonths: p.durationMonths ?? '',
      intakeSeasons: p.intakeSeasons || '',
      programOverview: p.programOverview || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.programName.trim()) return toast.error('Program name is required');
    if (!form.universityId) return toast.error('Please select a university');
    setSaving(true);
    try {
      const payload = {
        programName: form.programName.trim(),
        universityId: Number(form.universityId),
        level: form.level.trim() || null,
        tuitionPerYear: form.tuitionPerYear !== '' ? Number(form.tuitionPerYear) : null,
        durationMonths: form.durationMonths !== '' ? Number(form.durationMonths) : null,
        intakeSeasons: form.intakeSeasons.trim() || null,
        programOverview: form.programOverview.trim() || null,
      };
      if (editing) {
        await updateProgram(editing.id, payload);
        toast.success('Program updated');
      } else {
        await createProgram(payload);
        toast.success('Program created');
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
      await deleteProgram(deleteTarget.id);
      toast.success('Program deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const fmtCurrency = (v) => v != null ? `$${Number(v).toLocaleString()}` : '-';

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <>
      <PageHeader title="Manage Programs" subtitle={`${items.length} programs total`}>
        <PrimaryButton onClick={openCreate}><HiOutlinePlus className="w-4 h-4" /> Add Program</PrimaryButton>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <TextField placeholder="Search by program name…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <SelectField value={uniFilter} onChange={(e) => setUniFilter(e.target.value)} className="w-52">
          <option value="">All Universities</option>
          {universities.map((u) => <option key={u.id} value={u.id}>{u.universityName}</option>)}
        </SelectField>
        <SelectField value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="w-40">
          <option value="">All Levels</option>
          {levels.map((l) => <option key={l} value={l}>{l}</option>)}
        </SelectField>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={HiOutlineAcademicCap} title="No programs found" />
      ) : (
        <GlassTable headers={['ID', 'Program Name', 'University', 'Level', 'Duration', 'Intake', 'Tuition/Year', 'Actions']}>
          {filtered.map((p) => (
            <tr key={p.id} className="hover:bg-white/30 transition-colors">
              <Td>{p.id}</Td>
              <Td className="font-semibold">{p.programName}</Td>
              <Td>{p.university?.universityName || '-'}</Td>
              <Td>{p.level || '—'}</Td>
              <Td>{p.durationMonths ? `${p.durationMonths} mo` : '—'}</Td>
              <Td>{p.intakeSeasons || '—'}</Td>
              <Td>{fmtCurrency(p.tuitionPerYear)}</Td>
              <Td>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white/50 text-secondary transition-colors" title="Edit"><HiOutlinePencilSquare className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-danger transition-colors" title="Delete"><HiOutlineTrash className="w-4 h-4" /></button>
                </div>
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Program' : 'Add Program'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Program Name *" value={form.programName} onChange={(e) => setForm({ ...form, programName: e.target.value })} />
          <SelectField label="University *" value={form.universityId} onChange={(e) => setForm({ ...form, universityId: e.target.value })}>
            <option value="">Select university…</option>
            {universities.map((u) => <option key={u.id} value={u.id}>{u.universityName}</option>)}
          </SelectField>
          <TextField label="Level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="e.g. Masters, Bachelors, PhD" />
          <TextField label="Duration (Months)" type="number" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} placeholder="e.g. 24" />
          <TextField label="Intake Seasons" value={form.intakeSeasons} onChange={(e) => setForm({ ...form, intakeSeasons: e.target.value })} placeholder="e.g. Fall, Spring" />
          <TextField label="Tuition Per Year ($)" type="number" value={form.tuitionPerYear} onChange={(e) => setForm({ ...form, tuitionPerYear: e.target.value })} placeholder="e.g. 35000" />
          <TextField label="Program Overview" value={form.programOverview} onChange={(e) => setForm({ ...form, programOverview: e.target.value })} placeholder="Short summary of the program" />
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
        title="Delete Program"
        message={`Are you sure you want to delete "${deleteTarget?.programName}"?`}
        loading={deleting}
        danger
      />
    </>
  );
}
