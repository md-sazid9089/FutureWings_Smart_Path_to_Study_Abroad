import Footer from '../components/home/Footer';

const posts = [
  { title: 'How to Choose the Right Country for Your Masters', date: 'Jan 15, 2026', tag: 'Guide', excerpt: 'Picking the right country is the first and most important step. We break down what to consider — from tuition to culture.' },
  { title: 'Top 5 Scholarships for International Students in 2026', date: 'Feb 1, 2026', tag: 'Scholarships', excerpt: 'Fully funded and partial scholarships that you should be applying to this year.' },
  { title: 'CGPA vs. Work Experience: What Matters More?', date: 'Feb 10, 2026', tag: 'Advice', excerpt: 'Universities weigh different factors. Here\'s how to present your strongest profile.' },
];

const tagColors = {
  Guide: 'bg-blue-100 text-blue-700',
  Scholarships: 'bg-emerald-100 text-emerald-700',
  Advice: 'bg-amber-100 text-amber-700',
};

export default function Blog() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-20">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
            Blog
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text">
            Latest Articles
          </h1>
          <p className="text-text-muted mt-4 text-lg">Insights, tips, and guides for your study abroad journey.</p>
        </div>

        <div className="space-y-6">
          {posts.map((p, i) => (
            <article key={i} className="glass rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${tagColors[p.tag] || 'bg-gray-100 text-gray-700'}`}>
                  {p.tag}
                </span>
                <span className="text-xs text-text-muted">{p.date}</span>
              </div>
              <h2 className="text-xl font-bold text-text mb-2">{p.title}</h2>
              <p className="text-sm text-text-muted leading-relaxed">{p.excerpt}</p>
              <button className="mt-4 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                Read More →
              </button>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-text-muted text-sm">More articles coming soon. Stay tuned!</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
