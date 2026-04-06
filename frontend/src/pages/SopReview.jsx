import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowPath,
  HiOutlineChartBarSquare,
  HiOutlineCheckCircle,
  HiOutlineClipboardDocument,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineLightBulb,
  HiOutlineRocketLaunch,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineStar,
} from 'react-icons/hi2';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import GlassPanel from '../components/ui/GlassPanel';
import PrimaryButton from '../components/ui/PrimaryButton';

const sampleSop = `I am applying for a master's degree in data science because I want to build practical systems that help students make better decisions. During my undergraduate studies in computer science, I became interested in the way data can improve education, healthcare, and public services.

My final-year project on predictive analytics taught me how to work with real datasets, clean noisy information, and present findings clearly. I also completed an internship where I supported a small analytics team, which showed me the importance of disciplined problem-solving and collaboration.

I now want to study abroad to gain advanced technical skills, broader research exposure, and an international perspective. I believe this program will help me grow into a professional who can contribute meaningfully to technology-driven decision-making in my home country.`;

const quickChecks = [
  { label: 'Clarity and structure', icon: HiOutlineDocumentText },
  { label: 'Academic motivation', icon: HiOutlineRocketLaunch },
  { label: 'Authenticity and specificity', icon: HiOutlineShieldCheck },
  { label: 'Grammar and readability', icon: HiOutlineCheckCircle },
  { label: 'Country and program fit', icon: HiOutlineChartBarSquare },
];

function toneForScore(score) {
  if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 70) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-200';
}

function formatPercent(value) {
  return `${Math.max(0, Math.min(100, Number(value) || 0))}%`;
}

function scoreMeta(score) {
  if (score >= 85) {
    return {
      label: 'Submission-ready',
      chip: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      bar: 'bg-emerald-500',
    };
  }

  if (score >= 70) {
    return {
      label: 'Strong draft',
      chip: 'bg-amber-100 text-amber-700 border-amber-200',
      bar: 'bg-amber-500',
    };
  }

  return {
    label: 'Needs revision',
    chip: 'bg-rose-100 text-rose-700 border-rose-200',
    bar: 'bg-rose-500',
  };
}

export default function SopReview() {
  const [sopText, setSopText] = useState('');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);

  const wordCount = sopText.trim() ? sopText.trim().split(/\s+/).length : 0;

  const handleReview = async () => {
    const trimmed = sopText.trim();

    if (!trimmed) {
      toast.error('Paste your SOP first');
      return;
    }

    if (trimmed.length < 150) {
      toast.error('Please paste a longer SOP for a useful review');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/ai-assistant/sop-review', { sopText: trimmed });
      setReview(res?.data?.data?.review || null);
      toast.success('SOP reviewed successfully');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to review SOP');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setSopText(sampleSop);
    setReview(null);
  };

  const clearForm = () => {
    setSopText('');
    setReview(null);
  };

  const score = Number(review?.score) || 0;
  const progress = Math.min(100, Math.round((wordCount / 700) * 100));
  const scoreDetails = scoreMeta(score);
  const gauge = `conic-gradient(from 0deg, rgba(255,107,61,0.95) ${score * 3.6}deg, rgba(255,255,255,0.4) ${score * 3.6}deg)`;

  return (
    <div className="space-y-7">
      <PageHeader
        title="SOP Rating"
        subtitle="Paste your statement of purpose and get a Gemini review with a score, strengths, and fixes"
        children={(
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
            <HiOutlineSparkles className="w-4 h-4" />
            AI SOP analysis
          </div>
        )}
      />

      <GlassPanel className="relative overflow-hidden border border-white/25 p-6 sm:p-8 shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <HiOutlineSparkles className="h-4 w-4" />
              Gemini SOP Studio
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-text">Turn your SOP into an application-ready draft</h2>
            <p className="max-w-2xl text-sm leading-6 text-text-muted">
              Get instant quality scoring and practical rewrite ideas focused on admissions impact, not just grammar corrections.
            </p>
            <div className="space-y-2 rounded-2xl border border-white/30 bg-white/45 p-4">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                <span>Draft length signal</span>
                <span>{wordCount} words</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/50">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-text-muted">Recommended: 500-800 words for a balanced SOP.</p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {quickChecks.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/55 px-4 py-3 text-sm text-text shadow-sm">
                <div className="rounded-xl bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <GlassPanel className="space-y-6 border border-white/20 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <HiOutlineDocumentText className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Editor</span>
              </div>
              <p className="text-sm text-text-muted max-w-2xl leading-6">
                Paste your latest draft. The model analyzes structure, motivation, fit, and clarity in one pass.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              <span className="rounded-full border border-white/30 bg-white/50 px-3 py-1">{wordCount} words</span>
              <span className="rounded-full border border-white/30 bg-white/50 px-3 py-1">Max 20,000 chars</span>
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="sopText" className="block text-sm font-medium text-secondary">
              SOP text
            </label>
            <textarea
              id="sopText"
              value={sopText}
              onChange={(e) => setSopText(e.target.value)}
              rows={16}
              placeholder="Paste your SOP here..."
              className="w-full rounded-3xl border border-white/40 bg-white/60 px-5 py-4 text-sm leading-7 text-text outline-none transition placeholder:text-text-light focus:border-primary/40 focus:ring-2 focus:ring-primary/20 resize-y min-h-95"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton type="button" onClick={handleReview} loading={loading} className="min-w-40">
              {loading ? 'Reviewing...' : 'Review SOP'}
            </PrimaryButton>
            <button
              type="button"
              onClick={loadSample}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/50 px-5 py-2.5 text-sm font-semibold text-secondary transition hover:bg-white/70"
            >
              <HiOutlineClipboardDocument className="h-4 w-4" />
              Load sample
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/40 px-5 py-2.5 text-sm font-semibold text-secondary transition hover:bg-white/60"
            >
              <HiOutlineArrowPath className="h-4 w-4" />
              Reset
            </button>
          </div>
        </GlassPanel>

        <div className="space-y-6">
          <GlassCard className="border border-white/20 p-5">
            <div className="flex items-center gap-2 text-primary mb-3">
              <HiOutlineLightBulb className="h-5 w-5" />
              <h2 className="text-sm font-semibold uppercase tracking-wide">Best workflow</h2>
            </div>
            <ol className="space-y-2 text-sm leading-6 text-text-muted">
              <li>1. Paste your draft and run review.</li>
              <li>2. Fix low-scoring sections first.</li>
              <li>3. Re-run until verdict is strong.</li>
            </ol>
          </GlassCard>

          <GlassCard className="border border-white/20 p-5">
            <div className="flex items-center gap-2 text-primary mb-3">
              <HiOutlineShieldCheck className="h-5 w-5" />
              <h2 className="text-sm font-semibold uppercase tracking-wide">Review style</h2>
            </div>
            <p className="text-sm leading-6 text-text-muted">
              Strict admissions lens, concise action points, and practical rewrites aligned to study-abroad applications.
            </p>
          </GlassCard>
        </div>
      </div>

      {review && (
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <GlassCard className={`border p-6 ${toneForScore(score)} xl:sticky xl:top-24 h-fit`}>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Overall score</p>
            <div className="mt-4 flex items-center justify-center">
              <div
                className="relative grid h-32 w-32 place-items-center rounded-full border border-white/40 p-3"
                style={{ background: gauge }}
              >
                <div className="grid h-full w-full place-items-center rounded-full bg-white/90 text-text shadow-inner">
                  <span className="text-2xl font-black tracking-tight">{formatPercent(score)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center">
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${scoreDetails.chip}`}>{scoreDetails.label}</span>
            </div>

            <div className="mt-4 space-y-2 text-center">
              <p className="text-lg font-semibold text-text">{review.verdict}</p>
              <p className="text-sm leading-6 text-text-muted">{review.summary}</p>
            </div>

            <div className="mt-5 space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/55">
                <div className={`h-full rounded-full ${scoreDetails.bar}`} style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
              </div>
              <p className="text-xs text-text-muted">Live score bar</p>
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="border border-white/20 p-6">
              <div className="flex items-center gap-2 text-primary mb-4">
                <HiOutlineSparkles className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Strengths and fixes</h3>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-semibold text-text">Strengths</p>
                  <ul className="space-y-2">
                    {(review.strengths || []).map((item) => (
                      <li key={item} className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-text">
                        <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-text">Improvements</p>
                  <ul className="space-y-2">
                    {(review.improvements || []).map((item) => (
                      <li key={item} className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-text">
                        <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="border border-white/20 p-6">
              <div className="flex items-center gap-2 text-primary mb-4">
                <HiOutlineStar className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Section breakdown</h3>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {(review.sectionScores || []).map((section) => (
                  <div key={section.section} className="rounded-2xl border border-white/25 bg-white/45 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text">{section.section}</p>
                        <p className="mt-1 text-xs text-text-muted leading-5">{section.feedback}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        {formatPercent(section.score)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="border border-white/20 p-6">
              <div className="flex items-center gap-2 text-primary mb-4">
                <HiOutlineDocumentText className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Rewrite suggestions</h3>
              </div>

              <div className="grid gap-2">
                {(review.rewriteSuggestions || []).map((item) => (
                  <div key={item} className="rounded-2xl border border-white/25 bg-white/45 px-4 py-3 text-sm leading-6 text-text">
                    {item}
                  </div>
                ))}
              </div>

              {review.closingAdvice && (
                <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/8 px-4 py-4 text-sm leading-6 text-text-muted">
                  <span className="font-semibold text-text">Closing advice: </span>
                  {review.closingAdvice}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}