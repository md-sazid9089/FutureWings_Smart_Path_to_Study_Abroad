import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getStats } from '../../api/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassTable, { Td } from '../../components/ui/GlassTable';
import StatusPill from '../../components/ui/StatusPill';
import StatCard from '../../components/ui/StatCard';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import {
  HiOutlineUsers,
  HiOutlineGlobeAlt,
  HiOutlineBuildingLibrary,
  HiOutlineAcademicCap,
  HiOutlineBanknotes,
  HiOutlineClipboardDocumentList,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getStats()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton rows={6} />;

  const c = data?.counts || {};

  const cards = [
    { icon: HiOutlineUsers, label: 'Total Users', value: c.totalUsers, color: 'text-blue-600' },
    { icon: HiOutlineGlobeAlt, label: 'Countries', value: c.totalCountries, color: 'text-emerald-600' },
    { icon: HiOutlineBuildingLibrary, label: 'Universities', value: c.totalUniversities, color: 'text-violet-600' },
    { icon: HiOutlineAcademicCap, label: 'Programs', value: c.totalPrograms, color: 'text-indigo-600' },
    { icon: HiOutlineBanknotes, label: 'Scholarships', value: c.totalScholarships, color: 'text-amber-600' },
    { icon: HiOutlineClipboardDocumentList, label: 'Applications', value: c.totalApplications, color: 'text-primary' },
    { icon: HiOutlineDocumentText, label: 'Pending Docs', value: c.pendingDocuments, color: 'text-rose-600' },
    { icon: HiOutlineShieldCheck, label: 'Visa Outcomes', value: c.totalVisaOutcomes, color: 'text-teal-600' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of FutureWings platform" />

      {/* ─── Stat Cards ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ─── Status Breakdown ────────────────────── */}
      {data?.statusBreakdown?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-text mb-3">Application Status Breakdown</h3>
          <div className="flex flex-wrap gap-3">
            {data.statusBreakdown.map((s) => (
              <div key={s.status} className="glass rounded-xl px-5 py-3 text-center min-w-30">
                <p className="text-xl font-extrabold text-text">{s.count}</p>
                <StatusPill status={s.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Recent Applications ─────────────────── */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-text mb-3">Recent Applications</h3>
        {data?.recentApplications?.length > 0 ? (
          <GlassTable headers={['User', 'Country', 'Program', 'Status', 'Date']}>
            {data.recentApplications.map((app) => (
              <tr
                key={app.id}
                className="hover:bg-white/30 cursor-pointer transition-colors"
                onClick={() => navigate('/admin/applications')}
              >
                <Td>{app.user?.fullName || app.user?.email}</Td>
                <Td>{app.country?.countryName}</Td>
                <Td>{app.program?.programName}</Td>
                <Td><StatusPill status={app.status?.statusName} /></Td>
                <Td>{new Date(app.appliedDate).toLocaleDateString()}</Td>
              </tr>
            ))}
          </GlassTable>
        ) : (
          <EmptyState title="No applications yet" />
        )}
      </div>

      {/* ─── Pending Documents ───────────────────── */}
      <div>
        <h3 className="text-lg font-bold text-text mb-3">Pending Document Verifications</h3>
        {data?.recentDocuments?.length > 0 ? (
          <GlassTable headers={['User', 'File', 'Type', 'Uploaded']}>
            {data.recentDocuments.map((doc) => (
              <tr
                key={doc.id}
                className="hover:bg-white/30 cursor-pointer transition-colors"
                onClick={() => navigate('/admin/documents')}
              >
                <Td>{doc.user?.fullName || doc.user?.email}</Td>
                <Td className="max-w-50 truncate">{doc.filePath}</Td>
                <Td>{doc.fileType || '-'}</Td>
                <Td>{new Date(doc.uploadedAt).toLocaleDateString()}</Td>
              </tr>
            ))}
          </GlassTable>
        ) : (
          <EmptyState title="No pending documents" message="All documents have been reviewed" />
        )}
      </div>
    </>
  );
}
