import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassPanel from '../../components/ui/GlassPanel';
import GlassTable, { Td } from '../../components/ui/GlassTable';
import TextField from '../../components/ui/TextField';
import SelectField from '../../components/ui/SelectField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function ManagePrograms() {
  const [items, setItems] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [form, setForm] = useState({ name: '', universityId: '', degreeLevel: '', duration: '', tuitionFee: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    API.get('/api/admin/universities').then(r => setUniversities(r.data.data)).catch(() => {});
  }, []);

  const fetchAll = async () => {
    try { const res = await API.get('/api/admin/programs'); setItems(res.data.data); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await API.put(`/api/admin/programs/${editing}`, form); toast.success('Updated'); }
      else { await API.post('/api/admin/programs', form); toast.success('Created'); }
      setForm({ name: '', universityId: '', degreeLevel: '', duration: '', tuitionFee: '', description: '' });
      setEditing(null);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name, universityId: String(p.universityId), degreeLevel: p.degreeLevel,
      duration: p.duration || '', tuitionFee: p.tuitionFee ? String(p.tuitionFee) : '', description: p.description || '',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await API.delete(`/api/admin/programs/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <>
      <PageHeader title="Manage Programs" />

      <GlassPanel className="mb-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <TextField label="Name" id="progName" name="name" value={form.name} onChange={handleChange} required />
          <SelectField label="University" id="universityId" name="universityId" value={form.universityId} onChange={handleChange} required>
            <option value="">Select</option>
            {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </SelectField>
          <TextField label="Degree Level" id="degreeLevel" name="degreeLevel" value={form.degreeLevel} onChange={handleChange} required placeholder="Bachelors / Masters" />
          <TextField label="Duration" id="duration" name="duration" value={form.duration} onChange={handleChange} />
          <TextField label="Tuition Fee" id="tuitionFee" name="tuitionFee" type="number" value={form.tuitionFee} onChange={handleChange} />
          <TextField label="Description" id="progDesc" name="description" value={form.description} onChange={handleChange} />
          <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
            <PrimaryButton type="submit">{editing ? 'Update' : 'Create'}</PrimaryButton>
            {editing && <SecondaryButton type="button" onClick={() => { setEditing(null); setForm({ name: '', universityId: '', degreeLevel: '', duration: '', tuitionFee: '', description: '' }); }}>Cancel</SecondaryButton>}
          </div>
        </form>
      </GlassPanel>

      {loading ? <LoadingSkeleton rows={4} /> : (
        <GlassTable headers={['ID', 'Name', 'University', 'Degree', 'Tuition', 'Actions']}>
          {items.map((p) => (
            <tr key={p.id} className="hover:bg-white/20 transition-colors">
              <Td>{p.id}</Td>
              <Td className="font-medium">{p.name}</Td>
              <Td>{p.university?.name}</Td>
              <Td>{p.degreeLevel}</Td>
              <Td>{p.tuitionFee ? `$${p.tuitionFee.toLocaleString()}` : '—'}</Td>
              <Td>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg hover:bg-white/40 text-secondary transition-colors"><HiOutlinePencilSquare className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-danger transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                </div>
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}
    </>
  );
}
