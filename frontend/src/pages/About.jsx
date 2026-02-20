import { Link } from 'react-router-dom';
import Footer from '../components/home/Footer';
import {
  HiOutlineGlobeAlt,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineHeart,
} from 'react-icons/hi2';

const values = [
  { icon: HiOutlineGlobeAlt, title: 'Global Access', desc: 'We connect students worldwide with opportunities in top study destinations.' },
  { icon: HiOutlineAcademicCap, title: 'Smart Matching', desc: 'Our tier system ensures the best fit between your profile and institutions.' },
  { icon: HiOutlineUserGroup, title: 'Community', desc: 'Join a community of students who share their journeys and support each other.' },
  { icon: HiOutlineHeart, title: 'Free Forever', desc: 'Core features will always be free — education access is our mission.' },
];

export default function About() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-20">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            About Us
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text">
            Our Mission
          </h1>
          <p className="text-text-muted mt-4 text-lg max-w-2xl mx-auto">
            FutureWings was created to democratize study abroad access. We believe every talented student
            deserves the chance to study at their dream university, regardless of background.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {values.map((v, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <v.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-text mb-1">{v.title}</h3>
              <p className="text-sm text-text-muted">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass-strong rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold text-text mb-3">Want to contribute?</h2>
          <p className="text-text-muted mb-6">We're always looking for partners, universities, and contributors.</p>
          <Link to="/contact" className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-colors">
            Get in Touch
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
