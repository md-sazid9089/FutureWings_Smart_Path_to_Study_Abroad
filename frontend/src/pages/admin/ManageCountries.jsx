import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassPanel from '../../components/ui/GlassPanel';
import GlassTable, { Td } from '../../components/ui/GlassTable';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SecondaryButton from '../../components/ui/SecondaryButton';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function ManageCountries() {
  const [countries, setCountries] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', description: '', tier: '1' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const res = await API.get('/api/admin/countries');
      setCountries(res.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/api/admin/countries/${editing}`, form);
        toast.success('Country updated');
      } else {
        await API.post('/api/admin/countries', form);
        toast.success('Country created');
      }
      setForm({ name: '', code: '', description: '', tier: '1' });
      setEditing(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const startEdit = (c) => {
    setEditing(c.id);
    setForm({ name: c.name, code: c.code, description: c.description || '', tier: String(c.tier) });
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this country?')) return;
    try { await API.delete(`/api/admin/countries/${id}`); toast.success('Deactivated'); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <>
      <PageHeader title="Manage Countries" />

      <GlassPanel className="mb-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <TextField label="Name" id="name" name="name" value={form.name} onChange={handleChange} required />
          <TextField label="Code" id="code" name="code" value={form.code} onChange={handleChange} required placeholder="US" />
          <TextField label="Description" id="description" name="description" value={form.description} onChange={handleChange} />
          <TextField label="Tier" id="tier" name="tier" type="number" value={form.tier} onChange={handleChange} />
          <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
            <PrimaryButton type="submit">{editing ? 'Update' : 'Create'}</PrimaryButton>
            {editing && <SecondaryButton type="button" onClick={() => { setEditing(null); setForm({ name: '', code: '', description: '', tier: '1' }); }}>Cancel</SecondaryButton>}
          </div>
        </form>
      </GlassPanel>

      {loading ? <LoadingSkeleton rows={4} /> : (
        <GlassTable headers={['ID', 'Name', 'Code', 'Tier', 'Active', 'Actions']}>
          {countries.map((c) => (
            <tr key={c.id} className="hover:bg-white/20 transition-colors">
              <Td>{c.id}</Td>
              <Td className="font-medium">{c.name}</Td>
              <Td>{c.code}</Td>
              <Td>{c.tier}</Td>
              <Td><span className={c.isActive ? 'text-success' : 'text-danger'}>{c.isActive ? 'Yes' : 'No'}</span></Td>
              <Td>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg hover:bg-white/40 text-secondary transition-colors"><HiOutlinePencilSquare className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-danger transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                </div>
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}
    </>
  );
}
