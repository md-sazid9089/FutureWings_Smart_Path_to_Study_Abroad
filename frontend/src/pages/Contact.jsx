import { useState } from 'react';
import { HiOutlineEnvelope, HiOutlineMapPin, HiOutlinePhone } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Footer from '../components/home/Footer';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-20">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-3">
            Contact
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text">
            Get In Touch
          </h1>
          <p className="text-text-muted mt-4 text-lg max-w-lg mx-auto">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <HiOutlineEnvelope className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-text text-sm">Email</h4>
                <p className="text-sm text-text-muted">futurewingshelp@gmail.com</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <HiOutlinePhone className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-text text-sm">Phone</h4>
                <p className="text-sm text-text-muted">01973685515</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <HiOutlineMapPin className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold text-text text-sm">Office</h4>
                <p className="text-sm text-text-muted">San Francisco, CA, USA</p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="irfan Zahir"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/50 text-sm text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="futurewingshelp@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/50 text-sm text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what's on your mind..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/50 text-sm text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-200 hover:scale-[1.03]"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
