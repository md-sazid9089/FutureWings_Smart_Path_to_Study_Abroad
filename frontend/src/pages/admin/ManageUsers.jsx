import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getUsers } from '../../api/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassTable, { Td } from '../../components/ui/GlassTable';
import TextField from '../../components/ui/TextField';
import SelectField from '../../components/ui/SelectField';
import StatusPill from '../../components/ui/StatusPill';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { HiOutlineUsers, HiOutlineEye } from 'react-icons/hi2';

export default function ManageUsers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const params = {};
        if (roleFilter) params.role = roleFilter;
        const res = await getUsers(params);
        setItems(res.data.data);
      } catch {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    load();
  }, [roleFilter]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((u) =>
      (u.fullName || '').toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.major || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <>
      <PageHeader title="Users" subtitle={`${items.length} users total`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <TextField placeholder="Search by name, email, or major…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <SelectField value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-36">
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </SelectField>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={HiOutlineUsers} title="No users found" />
      ) : (
        <GlassTable headers={['ID', 'Name', 'Email', 'Role', 'CGPA', 'Degree', 'Apps', 'Docs', 'Joined', 'Actions']}>
          {filtered.map((u) => (
            <tr key={u.id} className="hover:bg-white/30 transition-colors">
              <Td>{u.id}</Td>
              <Td className="font-semibold">{u.fullName || '—'}</Td>
              <Td>{u.email}</Td>
              <Td>
                <StatusPill
                  status={u.role}
                  color={u.role === 'ADMIN' ? 'blue' : 'green'}
                />
              </Td>
              <Td>{u.cgpa ?? '—'}</Td>
              <Td>{u.degreeLevel || '—'}</Td>
              <Td>{u._count?.applications ?? 0}</Td>
              <Td>{u._count?.documents ?? 0}</Td>
              <Td>{fmtDate(u.createdAt)}</Td>
              <Td>
                <button
                  onClick={() => setSelected(u)}
                  className="p-1.5 rounded-lg hover:bg-white/50 text-secondary transition-colors"
                  title="View Details"
                >
                  <HiOutlineEye className="w-4 h-4" />
                </button>
              </Td>
            </tr>
          ))}
        </GlassTable>
      )}

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="User Details">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Full Name</span>
                <p className="font-medium">{selected.fullName || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Email</span>
                <p className="font-medium">{selected.email}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Role</span>
                <p><StatusPill status={selected.role} color={selected.role === 'ADMIN' ? 'blue' : 'green'} /></p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Joined</span>
                <p className="font-medium">{fmtDate(selected.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">CGPA</span>
                <p className="font-medium">{selected.cgpa ?? '—'}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Degree Level</span>
                <p className="font-medium">{selected.degreeLevel || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Major</span>
                <p className="font-medium">{selected.major || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Fund Score</span>
                <p className="font-medium">{selected.fundScore ?? '—'}</p>
              </div>
            </div>

            <div className="flex gap-6 pt-2 border-t border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{selected._count?.applications ?? 0}</p>
                <p className="text-xs text-gray-500">Applications</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{selected._count?.documents ?? 0}</p>
                <p className="text-xs text-gray-500">Documents</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
