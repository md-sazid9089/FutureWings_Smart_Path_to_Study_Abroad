import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    content: 'The UK government has announced a significant change to its post-study work visa scheme. Starting from September 2026, all international students who complete a Masters degree in the UK will be eligible to stay and work for up to 3 years, up from the current 2-year limit.\n\nThis extension is part of the government\'s broader effort to attract top international talent and boost the UK economy. Universities across the country have welcomed this decision, stating that it will make their institutions more competitive in attracting global talent.\n\nThe policy applies to students from all countries and all fields of study. To qualify, students must have completed their degree at a UK university recognized by the UKVI (UK Visas and Immigration).\n\nExperts believe this change will particularly benefit STEM (Science, Technology, Engineering, Mathematics) graduates who will have more time to gain work experience and contribute to the UK job market.',
    icon: HiOutlineGlobeAlt,
    color: 'emerald',
  },
  {
    id: 2,
    title: 'New Scholarship Programs Launch for Asian Students in Europe',
    date: 'Mar 25, 2026',
    category: 'Scholarships',
    excerpt: 'Over 15 European universities have partnered to offer fully-funded scholarships specifically for students from Asia. Applications open next month.',
    content: 'A consortium of 15 leading European universities has announced the launch of the "Bridge to Europe" scholarship program, designed specifically for high-achieving students from Asian countries.\n\nThe program offers fully-funded scholarships covering tuition fees, accommodation, and monthly living allowances for the duration of the Masters program. Recipients will also receive mentorship from faculty members and access to professional networking events.\n\nEligible countries include India, Pakistan, Bangladesh, Indonesia, Philippines, Vietnam, Thailand, Malaysia, Singapore, and Sri Lanka. The program prioritizes students from disadvantaged backgrounds and first-generation graduates.\n\nApplications will open on May 1, 2026, and the deadline is July 31, 2026. Selected candidates will begin their studies in September 2026.\n\nThis initiative is expected to open doors for hundreds of talented Asian students who previously faced financial barriers to studying in Europe.',
    icon: HiOutlineBanknotes,
    color: 'blue',
  },
  {
    id: 3,
    title: 'Top 10 Universities Ranked by International Student Satisfaction 2026',
    date: 'Mar 22, 2026',
    category: 'Rankings',
    excerpt: 'A comprehensive survey of over 50,000 international students reveals which universities provide the best overall experience for study abroad aspirants.',
    content: 'FutureWings has released the 2026 International Student Experience Index, based on a comprehensive survey of over 50,000 international students studying across more than 200 universities worldwide.\n\nThe rankings evaluate universities based on academic quality, support services, career outcomes, cultural integration, safety, and overall satisfaction.\n\nTop 3 Universities:\n1. ETH Zurich (Switzerland) - 9.1/10\n2. University of Melbourne (Australia) - 8.9/10\n3. University of Cambridge (UK) - 8.8/10\n\nKey findings show that students value:\n- Strong career placement support (85% of respondents)\n- Good on-campus facilities (78% of respondents)\n- Supportive peer community (82% of respondents)\n- Reasonable cost of living (71% of respondents)\n\nThe complete ranking and detailed analysis is available on our research portal. Universities featured in the top 50 have already begun promoting their strong international student experience.',
    icon: HiOutlineAcademicCap,
    color: 'purple',
  },
  {
    id: 4,
    title: 'Canada Increases International Student Intake Quotas',
    date: 'Mar 18, 2026',
    category: 'Policy Update',
    excerpt: 'In response to labor market demands, Canada has announced increased quotas for international student admissions, opening more opportunities for global learners.',
    content: 'Immigration, Refugees and Citizenship Canada (IRCC) has announced an increase in the Permit Holder Limit (PHL) for international student admissions in 2026.\n\nThe new quotas represent a 15% increase from 2025 levels, with provinces receiving increased allocations as follows:\n- Ontario: +12,000 permits\n- British Columbia: +8,000 permits\n- Alberta: +6,000 permits\n- Quebec: +5,000 permits\n\nThis expansion reflects Canada\'s need for skilled workers and recognition of international education\'s economic benefits. The country attracted over 1 million international students in 2025.\n\nCanadian universities have welcomed the announcement, noting that it will help them meet the strong global demand for Canadian education. Premier institutions like University of Toronto, McGill, and UBC are already preparing for the increased enrollment.\n\nThe enhanced quotas take effect immediately, with applications being processed on a rolling basis throughout 2026.',
    icon: HiOutlineGlobeAlt,
    color: 'amber',
  },
  {
    id: 5,
    title: 'AI in University Admissions: What You Need to Know',
    date: 'Mar 15, 2026',
    category: 'Trends',
    excerpt: 'More universities are adopting AI tools for initial application screening. Learn how this impacts your chances and how to optimize your profile.',
    content: 'An increasing number of universities are integrating artificial intelligence into their admissions processes. A 2026 survey found that over 60% of top-tier universities now use AI for initial application screening.\n\nHow AI is Being Used:\n- Application scanning and keyword matching\n- Automatic GPA and test score evaluation\n- Essay analysis for language quality and coherence\n- Resume parsing for relevant experience\n\nWhat This Means for Applicants:\nWhile AI makes the initial screening faster and more objective, it\'s crucial to:\n1. Use clear language and proper formatting in your applications\n2. Include relevant keywords from the job description\n3. Ensure all required fields are completed\n4. Proofread carefully - AI can catch typos\n5. Highlight quantifiable achievements\n\nConcerns and Counterpoints:\nSome educators worry that AI screening might miss exceptional candidates with unique profiles. However, most universities emphasize that AI is only the first filter - human reviewers still evaluate promising applications.\n\nExperts recommend applicants focus on authentic, well-crafted applications regardless of AI screening processes.',
    icon: HiOutlineNewspaper,
    color: 'rose',
  },
  {
    id: 6,
    title: 'Germany\'s Tuition-Free Masters Programs See 40% Rise in International Applications',
    date: 'Mar 12, 2026',
    category: 'Opportunities',
    excerpt: 'The popularity of German universities continues to soar as more students discover high-quality education at minimal cost. Here\'s your guide to applying.',
    content: 'German universities have experienced unprecedented interest from international applicants, with a 40% year-over-year increase in Master\'s program applications in 2026.\n\nWhy Germany is Attractive:\n- Most public universities charge no tuition fees\n- Only a student fee of 200-300 per semester\n- High-quality education and strong academic reputation\n- Excellent post-study work opportunities\n- Affordable cost of living compared to other European countries\n\nTop Programs for International Students:\n- Engineering and Technology (TU Munich, TU Berlin)\n- Business and Economics (HU Berlin, Cologne)\n- Natural Sciences (Heidelberg, Bonn)\n- Computer Science (Technical University of Darmstadt)\n\nApplication Timeline:\n- Applications typically open: December-January\n- Deadlines: January-July (varies by university)\n- Intake: September (most programs)\n\nLanguage Requirements:\nWhile many programs are taught in English, some require basic German proficiency. Consider taking a German language course before applying.\n\nWith the German government\'s continued commitment to free higher education and growing international recognition, Germany remains one of the most affordable options for quality Masters education.',
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
                  <Link to={`/news/${article.id}`} className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                    Read More →
                  </Link>
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

export { newsArticles };
