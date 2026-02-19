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

export default function ManageUniversities() {
  const [items, setItems] = useState([]);
  const [countries, setCountries] = useState([]);
  const [form, setForm] = useState({ name: '', countryId: '', location: '', ranking: '', website: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    API.get('/api/admin/countries').then(r => setCountries(r.data.data)).catch(() => {});
  }, []);

  const fetchAll = async () => {
    try { const res = await API.get('/api/admin/universities'); setItems(res.data.data); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await API.put(`/api/admin/universities/${editing}`, form); toast.success('Updated'); }
      else { await API.post('/api/admin/universities', form); toast.success('Created'); }
      setForm({ name: '', countryId: '', location: '', ranking: '', website: '' });
      setEditing(null);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const startEdit = (u) => {
    setEditing(u.id);
    setForm({ name: u.name, countryId: String(u.countryId), location: u.location || '', ranking: u.ranking ? String(u.ranking) : '', website: u.website || '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await API.delete(`/api/admin/universities/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <>
      <PageHeader title="Manage Universities" />

      <GlassPanel className="mb-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <TextField label="Name" id="uniName" name="name" value={form.name} onChange={handleChange} required />
          <SelectField label="Country" id="countryId" name="countryId" value={form.countryId} onChange={handleChange} required>
            <option value="">Select</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectField>
          <TextField label="Location" id="location" name="location" value={form.location} onChange={handleChange} />
          <TextField label="Ranking" id="ranking" name="ranking" type="number" value={form.ranking} onChange={handleChange} />
          <TextField label="Website" id="website" name="website" value={form.website} onChange={handleChange} />
          <div className="flex gap-2">
            <PrimaryButton type="submit">{editing ? 'Update' : 'Create'}</PrimaryButton>
            {editing && <SecondaryButton type="button" onClick={() => { setEditing(null); setForm({ name: '', countryId: '', location: '', ranking: '', website: '' }); }}>Cancel</SecondaryButton>}
          </div>
        </form>
      </GlassPanel>

      {loading ? <LoadingSkeleton rows={4} /> : (
        <GlassTable headers={['ID', 'Name', 'Country', 'Location', 'Ranking', 'Actions']}>
          {items.map((u) => (
            <tr key={u.id} className="hover:bg-white/20 transition-colors">
              <Td>{u.id}</Td>
              <Td className="font-medium">{u.name}</Td>
              <Td>{u.country?.name}</Td>
              <Td>{u.location || '—'}</Td>
              <Td>{u.ranking || '—'}</Td>
              <Td>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(u)} className="p-1.5 rounded-lg hover:bg-white/40 text-secondary transition-colors"><HiOutlinePencilSquare className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-danger transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                </div>
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}
    </>
  );
}
