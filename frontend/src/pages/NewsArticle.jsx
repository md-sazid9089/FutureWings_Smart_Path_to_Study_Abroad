import { useParams, useNavigate, Link } from 'react-router-dom';
import Footer from '../components/home/Footer';
import { newsArticles } from './News';
import { HiOutlineArrowLeft } from 'react-icons/hi2';

export default function NewsArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = newsArticles.find((a) => a.id === parseInt(id));

  if (!article) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 pt-12 pb-20">
          <button
            onClick={() => navigate('/news')}
            className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors mb-8"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Back to News
          </button>
          <div className="glass-strong rounded-3xl p-8 text-center">
            <h1 className="text-3xl font-bold text-text mb-3">Article Not Found</h1>
            <p className="text-text-muted mb-6">The article you are looking for does not exist.</p>
            <Link to="/news" className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-colors inline-block">
              Return to News
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const Icon = article.icon;
  const relatedArticles = newsArticles.filter(
    (a) => a.category === article.category && a.id !== article.id
  ).slice(0, 3);

  const categoryConfig = {
    'Policy Update': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    'Scholarships': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'Rankings': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'Trends': { bg: 'bg-rose-100', text: 'text-rose-700' },
    'Opportunities': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  };

  const config = categoryConfig[article.category] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 pt-12 pb-20">
        {/* Back Button */}
        <button
          onClick={() => navigate('/news')}
          className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors mb-8"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          Back to News
        </button>

        {/* Article Header */}
        <article className="glass-strong rounded-3xl p-8 md:p-12 mb-12">
          {/* Category and Date */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
              {article.category}
            </span>
            <span className="text-sm text-text-light">{article.date}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-text mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
            <Icon className="w-8 h-8 text-primary" />
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none text-text-muted leading-relaxed space-y-4">
            {article.content.split('\n\n').map((paragraph, idx) => (
              paragraph.includes(':') && !paragraph.startsWith('Top 3') ? (
                <div key={idx} className="space-y-2">
                  {paragraph.split('\n').map((line, lineIdx) => (
                    <p key={lineIdx} className="text-base">
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <p key={idx} className="text-base">
                  {paragraph}
                </p>
              )
            ))}
          </div>

          {/* Article Metadata */}
          <div className="border-t border-white/30 pt-6 mt-8">
            <p className="text-sm text-text-light">
              Published on {new Date(article.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-text mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map((relArticle) => {
                const RelIcon = relArticle.icon;
                const relConfig = categoryConfig[relArticle.category] || {
                  bg: 'bg-gray-100',
                  text: 'text-gray-700',
                };

                return (
                  <Link
                    key={relArticle.id}
                    to={`/news/${relArticle.id}`}
                    className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:bg-white/50 group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <RelIcon className="w-5 h-5 text-primary" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${relConfig.bg} ${relConfig.text}`}>
                        {relArticle.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {relArticle.title}
                    </h3>
                    <p className="text-sm text-text-muted mb-3 line-clamp-2">
                      {relArticle.excerpt}
                    </p>
                    <span className="text-xs text-text-light">{relArticle.date}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="glass-strong rounded-3xl p-8 text-center mt-16">
          <h2 className="text-2xl font-bold text-text mb-3">
            Stay Updated with Study Abroad News
          </h2>
          <p className="text-text-muted mb-6 max-w-xl mx-auto">
            Get the latest articles, policy updates, and opportunities delivered to your inbox.
          </p>
          <Link to="/news" className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-colors inline-block">
            View All News
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
