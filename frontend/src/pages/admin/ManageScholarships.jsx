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

export default function ManageScholarships() {
  const [items, setItems] = useState([]);
  const [countries, setCountries] = useState([]);
  const [form, setForm] = useState({ name: '', countryId: '', amount: '', eligibility: '', deadline: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    API.get('/api/admin/countries').then(r => setCountries(r.data.data)).catch(() => {});
  }, []);

  const fetchAll = async () => {
    try { const res = await API.get('/api/admin/scholarships'); setItems(res.data.data); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await API.put(`/api/admin/scholarships/${editing}`, form); toast.success('Updated'); }
      else { await API.post('/api/admin/scholarships', form); toast.success('Created'); }
      setForm({ name: '', countryId: '', amount: '', eligibility: '', deadline: '' });
      setEditing(null);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const startEdit = (s) => {
    setEditing(s.id);
    setForm({
      name: s.name, countryId: String(s.countryId), amount: s.amount ? String(s.amount) : '',
      eligibility: s.eligibility || '', deadline: s.deadline ? s.deadline.split('T')[0] : '',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await API.delete(`/api/admin/scholarships/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <>
      <PageHeader title="Manage Scholarships" />

      <GlassPanel className="mb-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <TextField label="Name" id="schName" name="name" value={form.name} onChange={handleChange} required />
          <SelectField label="Country" id="schCountryId" name="countryId" value={form.countryId} onChange={handleChange} required>
            <option value="">Select</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectField>
          <TextField label="Amount" id="amount" name="amount" type="number" value={form.amount} onChange={handleChange} />
          <TextField label="Eligibility" id="eligibility" name="eligibility" value={form.eligibility} onChange={handleChange} />
          <TextField label="Deadline" id="deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange} />
          <div className="flex gap-2">
            <PrimaryButton type="submit">{editing ? 'Update' : 'Create'}</PrimaryButton>
            {editing && <SecondaryButton type="button" onClick={() => { setEditing(null); setForm({ name: '', countryId: '', amount: '', eligibility: '', deadline: '' }); }}>Cancel</SecondaryButton>}
          </div>
        </form>
      </GlassPanel>

      {loading ? <LoadingSkeleton rows={4} /> : (
        <GlassTable headers={['ID', 'Name', 'Country', 'Amount', 'Deadline', 'Actions']}>
          {items.map((s) => (
            <tr key={s.id} className="hover:bg-white/20 transition-colors">
              <Td>{s.id}</Td>
              <Td className="font-medium">{s.name}</Td>
              <Td>{s.country?.name}</Td>
              <Td>{s.amount ? `$${s.amount.toLocaleString()}` : '—'}</Td>
              <Td>{s.deadline ? new Date(s.deadline).toLocaleDateString() : '—'}</Td>
              <Td>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(s)} className="p-1.5 rounded-lg hover:bg-white/40 text-secondary transition-colors"><HiOutlinePencilSquare className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-danger transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                </div>
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}
    </>
  );
}
