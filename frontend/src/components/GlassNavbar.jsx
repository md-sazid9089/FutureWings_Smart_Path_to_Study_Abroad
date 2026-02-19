import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiOutlineBars3, HiOutlineXMark, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';

const navLinks = [
  { to: '/recommendations', label: 'Explore' },
  { to: '/applications', label: 'Applications' },
  { to: '/documents', label: 'Documents' },
  { to: '/profile', label: 'Profile' },
];

export default function GlassNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4">
      <nav className="glass-nav rounded-full px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/recommendations" className="flex items-center gap-2 text-primary font-extrabold text-lg tracking-tight select-none">
          <span className="text-2xl">✈</span> FutureWings
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-secondary hover:bg-white/40'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs text-text-muted truncate max-w-[140px]">{user.email}</span>
          <button onClick={logout} className="p-2 rounded-full hover:bg-white/40 text-secondary transition-colors" title="Logout">
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-full hover:bg-white/40 text-secondary">
          {open ? <HiOutlineXMark className="w-5 h-5" /> : <HiOutlineBars3 className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-2 glass-nav rounded-2xl p-4 space-y-1 animate-in fade-in slide-in-from-top-2">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-secondary hover:bg-white/40'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <hr className="border-white/30 my-2" />
          <button onClick={logout} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-colors">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
