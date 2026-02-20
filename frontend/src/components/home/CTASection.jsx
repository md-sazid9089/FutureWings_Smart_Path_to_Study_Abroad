import { Link } from 'react-router-dom';

export default function CTASection() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative glass-strong rounded-3xl p-10 md:p-16 text-center overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-accent/10 blur-[50px] pointer-events-none" />

          <h2 className="relative text-3xl md:text-4xl font-extrabold text-text mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="relative text-text-muted text-lg mb-8 max-w-lg mx-auto">
            Join thousands of students who have already found their dream university through FutureWings.
          </p>
          <Link
            to={isLoggedIn ? '/recommendations' : '/signup'}
            className="relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-200 hover:scale-[1.03] text-lg"
          >
            Create Free Account →
          </Link>
        </div>
      </div>
    </section>
  );
}
