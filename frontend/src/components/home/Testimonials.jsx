import { useState, useEffect, useCallback } from 'react';
import { HiOutlineStar } from 'react-icons/hi2';

const testimonials = [
  {
    name: 'Ayesha Khan',
    country: 'Pakistan → Canada',
    avatar: '🧕',
    stars: 5,
    text: 'FutureWings helped me find the perfect master\'s program in Toronto. The tier-based recommendation was spot-on for my profile!',
  },
  {
    name: 'Daniel Osei',
    country: 'Ghana → Germany',
    avatar: '👨‍🎓',
    stars: 5,
    text: 'I got a fully-funded scholarship in Munich thanks to the country-specific scholarship feature. Couldn\'t have done it without this platform.',
  },
  {
    name: 'Priya Sharma',
    country: 'India → Australia',
    avatar: '👩‍💻',
    stars: 4,
    text: 'The application tracking and document verification saved me so much time. Everything was organized and transparent from day one.',
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive(prev => (prev + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const t = testimonials[active];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold uppercase tracking-wider mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text">
            Student Stories
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="glass-strong rounded-3xl p-8 md:p-10 text-center transition-all duration-500">
            <span className="text-5xl mb-4 block">{t.avatar}</span>
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <HiOutlineStar
                  key={i}
                  className={`w-5 h-5 ${i < t.stars ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <blockquote className="text-text text-lg leading-relaxed mb-6 italic">
              &ldquo;{t.text}&rdquo;
            </blockquote>
            <p className="font-bold text-text">{t.name}</p>
            <p className="text-sm text-text-muted">{t.country}</p>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? 'bg-primary w-7'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
