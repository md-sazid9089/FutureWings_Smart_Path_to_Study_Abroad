import { Link } from 'react-router-dom';

const destinations = [
  { name: 'United States', tier: 'Tier 1', emoji: '🇺🇸', tagline: 'Top-ranked universities worldwide', color: 'bg-blue-100 text-blue-700' },
  { name: 'United Kingdom', tier: 'Tier 1', emoji: '🇬🇧', tagline: 'World-class education heritage', color: 'bg-red-100 text-red-700' },
  { name: 'Canada', tier: 'Tier 1', emoji: '🇨🇦', tagline: 'Inclusive and affordable options', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Germany', tier: 'Tier 2', emoji: '🇩🇪', tagline: 'Low-tuition STEM powerhouse', color: 'bg-amber-100 text-amber-700' },
  { name: 'Australia', tier: 'Tier 1', emoji: '🇦🇺', tagline: 'High quality of life & research', color: 'bg-purple-100 text-purple-700' },
  { name: 'Japan', tier: 'Tier 2', emoji: '🇯🇵', tagline: 'Innovation meets tradition', color: 'bg-rose-100 text-rose-700' },
];

export default function PopularDestinations() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-3">
            Destinations
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text">
            Popular Destinations
          </h2>
          <p className="text-text-muted mt-3 max-w-lg mx-auto">
            Explore top-rated countries chosen by thousands of students.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((d, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{d.emoji}</span>
                <div>
                  <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">{d.name}</h3>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${d.color}`}>
                    {d.tier}
                  </span>
                </div>
              </div>
              <p className="text-sm text-text-muted mb-5">{d.tagline}</p>
              <Link
                to={isLoggedIn ? '/recommendations' : '/signup'}
                className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
