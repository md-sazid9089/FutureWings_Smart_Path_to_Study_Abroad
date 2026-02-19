import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import { HiOutlineGlobeAlt, HiOutlineBuildingLibrary, HiOutlineAcademicCap, HiOutlineDocumentText } from 'react-icons/hi2';

const shortcuts = [
  { to: '/admin/countries', label: 'Countries', icon: HiOutlineGlobeAlt, color: 'text-blue-500' },
  { to: '/admin/universities', label: 'Universities', icon: HiOutlineBuildingLibrary, color: 'text-purple-500' },
  { to: '/admin/programs', label: 'Programs', icon: HiOutlineAcademicCap, color: 'text-emerald-500' },
  { to: '/admin/documents', label: 'Documents', icon: HiOutlineDocumentText, color: 'text-amber-500' },
];

export default function Dashboard() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Welcome to the FutureWings Admin Panel" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {shortcuts.map((s) => (
          <Link key={s.to} to={s.to}>
            <GlassCard className="flex items-center gap-4 group">
              <div className={`p-3 rounded-xl bg-white/50 ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-text group-hover:text-primary transition-colors">{s.label}</span>
            </GlassCard>
          </Link>
        ))}
      </div>

      <GlassCard className="mt-8" hover={false}>
        <h3 className="text-lg font-bold text-text mb-2">Quick Start</h3>
        <p className="text-sm text-text-muted">
          Use the sidebar to manage countries, universities, programs, scholarships, verify documents, 
          process applications, add visa outcomes, and moderate ratings.
        </p>
      </GlassCard>
    </>
  );
}
