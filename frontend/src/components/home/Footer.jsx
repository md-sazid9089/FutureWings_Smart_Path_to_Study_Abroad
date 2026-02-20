import { Link } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi2';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Blog', to: '/blog' },
];

const platformLinks = [
  { label: 'Recommendations', to: '/recommendations' },
  { label: 'Applications', to: '/applications' },
  { label: 'Documents', to: '/documents' },
  { label: 'Profile', to: '/profile' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/30 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 text-primary font-extrabold text-lg mb-3">
              <span className="text-2xl">✈</span> FutureWings
            </Link>
            <p className="text-sm text-text-muted leading-relaxed">
              Your smart path to studying abroad. Discover, apply, and track — all in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-text mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-text-muted hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-bold text-text mb-3">Platform</h4>
            <ul className="space-y-2">
              {platformLinks.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-text-muted hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-text mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>hello@futurewings.com</li>
              <li>+1 (555) 123-4567</li>
              <li className="flex gap-3 pt-2">
                <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-primary transition-colors">GitHub</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} FutureWings. All rights reserved.
          </p>
          <p className="text-xs text-text-muted flex items-center gap-1">
            Made with <HiOutlineHeart className="w-3.5 h-3.5 text-primary" /> for students worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
