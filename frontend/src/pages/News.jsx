import { useState } from 'react';
import Footer from '../components/home/Footer';
import {
  HiOutlineNewspaper,
  HiOutlineAcademicCap,
  HiOutlineBanknotes,
  HiOutlineGlobeAlt,
} from 'react-icons/hi2';

const newsArticles = [
  {
    id: 1,
    title: 'UK Extends Post-Study Work Visa to 3 Years for Masters Graduates',
    date: 'Mar 28, 2026',
    category: 'Policy Update',
    excerpt: 'The UK government has announced an extension of the post-study work visa validity period, making the UK an even more attractive destination for international students.',
    icon: HiOutlineGlobeAlt,
    color: 'emerald',
  },
  {
    id: 2,
    title: 'New Scholarship Programs Launch for Asian Students in Europe',
    date: 'Mar 25, 2026',
    category: 'Scholarships',
    excerpt: 'Over 15 European universities have partnered to offer fully-funded scholarships specifically for students from Asia. Applications open next month.',
    icon: HiOutlineBanknotes,
    color: 'blue',
  },
  {
    id: 3,
    title: 'Top 10 Universities Ranked by International Student Satisfaction 2026',
    date: 'Mar 22, 2026',
    category: 'Rankings',
    excerpt: 'A comprehensive survey of over 50,000 international students reveals which universities provide the best overall experience for study abroad aspirants.',
    icon: HiOutlineAcademicCap,
    color: 'purple',
  },
  {
    id: 4,
    title: 'Canada Increases International Student Intake Quotas',
    date: 'Mar 18, 2026',
    category: 'Policy Update',
    excerpt: 'In response to labor market demands, Canada has announced increased quotas for international student admissions, opening more opportunities for global learners.',
    icon: HiOutlineGlobeAlt,
    color: 'amber',
  },
  {
    id: 5,
    title: 'AI in University Admissions: What You Need to Know',
    date: 'Mar 15, 2026',
    category: 'Trends',
    excerpt: 'More universities are adopting AI tools for initial application screening. Learn how this impacts your chances and how to optimize your profile.',
    icon: HiOutlineNewspaper,
    color: 'rose',
  },
  {
    id: 6,
    title: 'Germany\'s Tuition-Free Masters Programs See 40% Rise in International Applications',
    date: 'Mar 12, 2026',
    category: 'Opportunities',
    excerpt: 'The popularity of German universities continues to soar as more students discover high-quality education at minimal cost. Here\'s your guide to applying.',
    icon: HiOutlineAcademicCap,
    color: 'cyan',
  },
];

const categoryConfig = {
  'Policy Update': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Scholarships': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Rankings': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Trends': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'Opportunities': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
};

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredNews = selectedCategory
    ? newsArticles.filter((n) => n.category === selectedCategory)
    : newsArticles;

  const categories = [...new Set(newsArticles.map((n) => n.category))];

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-20">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
            Latest Updates
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text">
            Study Abroad News
          </h1>
          <p className="text-text-muted mt-4 text-lg max-w-2xl mx-auto">
            Stay informed about policy changes, scholarship opportunities, and trends in international education.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedCategory === null
                ? 'bg-primary text-white shadow-lg'
                : 'glass hover:bg-white/60'
            }`}
          >
            All News
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-lg'
                  : 'glass hover:bg-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {filteredNews.map((article) => {
            const Icon = article.icon;
            const config = categoryConfig[article.category] || {
              bg: 'bg-gray-100',
              text: 'text-gray-700',
            };

            return (
              <article
                key={article.id}
                className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:bg-white/50 flex flex-col group"
              >
                {/* Icon and Category */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.bg} ${config.text}`}
                  >
                    {article.category}
                  </span>
                </div>

                {/* Content */}
                <h2 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors leading-tight flex-grow">
                  {article.title}
                </h2>
                <p className="text-sm text-text-muted mb-4 flex-grow">
                  {article.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/30">
                  <span className="text-xs text-text-light">{article.date}</span>
                  <button className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                    Read More →
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* No Results */}
        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted text-lg">No news in this category yet.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="glass-strong rounded-3xl p-8 text-center mt-16">
          <h2 className="text-2xl font-bold text-text mb-3">
            Never Miss an Update
          </h2>
          <p className="text-text-muted mb-6 max-w-xl mx-auto">
            Subscribe to our newsletter to receive the latest news on scholarships, policy changes, and study abroad opportunities.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/50 border border-white/50 text-sm placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
            />
            <button className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
