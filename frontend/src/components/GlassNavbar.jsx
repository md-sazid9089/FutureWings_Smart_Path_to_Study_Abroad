import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../asset/logo.png';
import {
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineArrowRightOnRectangle,
  HiOutlineUserCircle,
  HiOutlineDocumentText,
  HiOutlineChevronDown,
} from 'react-icons/hi2';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const userLinks = [
  { to: '/recommendations', label: 'Explore' },
  { to: '/applications', label: 'Applications' },
];

export default function GlassNavbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = !!token;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setDropdownOpen(false);
    navigate('/');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = isLoggedIn ? [...publicLinks, ...userLinks] : publicLinks;

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4">
      <nav className="glass-nav rounded-full px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary font-extrabold text-lg tracking-tight select-none">
          <img src={logo} alt="FutureWings Logo" className="w-8 h-8" /> FutureWings
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
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
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/40 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {(user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <HiOutlineChevronDown className={`w-3.5 h-3.5 text-secondary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 glass-strong rounded-2xl p-2 shadow-xl">
                  <p className="px-3 py-2 text-xs text-text-muted truncate border-b border-white/20 mb-1">
                    {user.email}
                  </p>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-secondary hover:bg-white/50 transition-colors"
                  >
                    <HiOutlineUserCircle className="w-4 h-4" /> Profile
                  </Link>
                  <Link
                    to="/documents"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-secondary hover:bg-white/50 transition-colors"
                  >
                    <HiOutlineDocumentText className="w-4 h-4" /> Documents
                  </Link>
                  <hr className="border-white/20 my-1" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-danger hover:bg-red-50 transition-colors"
                  >
                    <HiOutlineArrowRightOnRectangle className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-5 py-1.5 rounded-full text-sm font-medium text-secondary hover:bg-white/40 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-1.5 rounded-full text-sm font-medium bg-primary text-white shadow-sm hover:bg-primary-dark transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-full hover:bg-white/40 text-secondary">
          {open ? <HiOutlineXMark className="w-5 h-5" /> : <HiOutlineBars3 className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-2 glass-nav rounded-2xl p-4 space-y-1">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
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
          {isLoggedIn ? (
            <>
              <NavLink to="/profile" onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-secondary hover:bg-white/40 transition-colors">
                Profile
              </NavLink>
              <NavLink to="/documents" onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-secondary hover:bg-white/40 transition-colors">
                Documents
              </NavLink>
              <button onClick={logout} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2 px-2 pt-1">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium text-secondary glass transition-colors">
                Log In
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-white transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
