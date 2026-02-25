import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../asset/logo.png';
import {
  HiOutlineGlobeAlt,
  HiOutlineBuildingLibrary,
  HiOutlineAcademicCap,
  HiOutlineBanknotes,
  HiOutlineDocumentText,
  HiOutlineClipboardDocumentList,
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineArrowRightOnRectangle,
  HiOutlineSquares2X2,
} from 'react-icons/hi2';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: HiOutlineSquares2X2 },
  { to: '/admin/countries', label: 'Countries', icon: HiOutlineGlobeAlt },
  { to: '/admin/universities', label: 'Universities', icon: HiOutlineBuildingLibrary },
  { to: '/admin/programs', label: 'Programs', icon: HiOutlineAcademicCap },
  { to: '/admin/scholarships', label: 'Scholarships', icon: HiOutlineBanknotes },
  { to: '/admin/documents', label: 'Documents', icon: HiOutlineDocumentText },
  { to: '/admin/applications', label: 'Applications', icon: HiOutlineClipboardDocumentList },
  { to: '/admin/visa-outcome', label: 'Visa Outcomes', icon: HiOutlineShieldCheck },
  { to: '/admin/ratings', label: 'Ratings', icon: HiOutlineStar },
];

export default function GlassSidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <aside className="glass-sidebar w-64 min-h-screen flex flex-col py-6 px-4">
      {/* Logo */}
      <div className="px-3 mb-8">
        <div className="flex items-center gap-2 text-primary font-extrabold text-lg tracking-tight select-none">
          <img src={logo} alt="FutureWings Logo" className="w-8 h-8" />Admin
        </div>
      </div>

      {/* Links */}
      <nav className="flex-1 space-y-1">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-secondary hover:bg-white/40 hover:text-text'
              }`
            }
          >
            <l.icon className="w-5 h-5 flex-shrink-0" />
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-colors mt-4"
      >
        <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );
}
