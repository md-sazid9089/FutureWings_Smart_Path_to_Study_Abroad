import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineSparkles,
  HiOutlineChartBarSquare,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineGlobeAlt,
  HiOutlineBell,
  HiOutlineRocketLaunch,
  HiOutlineLightBulb,
  HiOutlineAcademicCap,
  HiOutlineCurrencyDollar,
  HiOutlineBuildingLibrary,
} from 'react-icons/hi2';
import { PageHeader } from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import GlassPanel from '../components/ui/GlassPanel';
import PrimaryButton from '../components/ui/PrimaryButton';
import CountryBarChart from '../components/charts/CountryBarChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import ScholarshipChart from '../components/charts/ScholarshipChart';

/* -----------------------------------------------------------------------------
   DEMO DATA
   TODO: Replace with API call to /api/insights/country-stats
   ----------------------------------------------------------------------------- */
const countryData = [
  { country: 'Canada',      acceptance: 78, scholarships: 245, avgCost: 18000, trend: 'up'     },
  { country: 'Germany',     acceptance: 65, scholarships: 189, avgCost: 8000,  trend: 'up'     },
  { country: 'Australia',   acceptance: 72, scholarships: 210, avgCost: 22000, trend: 'down'   },
  { country: 'UK',          acceptance: 58, scholarships: 320, avgCost: 28000, trend: 'down'   },
  { country: 'USA',         acceptance: 45, scholarships: 480, avgCost: 35000, trend: 'stable' },
  { country: 'Netherlands', acceptance: 82, scholarships: 95,  avgCost: 12000, trend: 'up'     },
  { country: 'Sweden',      acceptance: 70, scholarships: 78,  avgCost: 9000,  trend: 'up'     },
  { country: 'New Zealand', acceptance: 85, scholarships: 65,  avgCost: 20000, trend: 'stable' },
];

// TODO: Replace with API call to /api/insights/yearly-trends
const yearlyTrends = [
  { year: '2019', Canada: 72, Germany: 60, Australia: 78, UK: 62, USA: 50 },
  { year: '2020', Canada: 68, Germany: 58, Australia: 72, UK: 55, USA: 45 },
  { year: '2021', Canada: 70, Germany: 61, Australia: 68, UK: 52, USA: 43 },
  { year: '2022', Canada: 74, Germany: 63, Australia: 65, UK: 56, USA: 44 },
  { year: '2023', Canada: 76, Germany: 64, Australia: 63, UK: 57, USA: 45 },
  { year: '2024', Canada: 78, Germany: 65, Australia: 60, UK: 58, USA: 45 },
];

const TREND_LINES = [
  { key: 'Canada',    color: '#ff6b3d', label: 'Canada'    },
  { key: 'Germany',   color: '#3b82f6', label: 'Germany'   },
  { key: 'Australia', color: '#10b981', label: 'Australia' },
  { key: 'UK',        color: '#8b5cf6', label: 'UK'        },
  { key: 'USA',       color: '#f59e0b', label: 'USA'       },
];

// TODO: Replace with API call to /api/insights/country-details
const countryDetails = {
  Canada:      { flag: '', bestFor: 'Business, Engineering, Life Sciences'         },
  Germany:     { flag: '', bestFor: 'Engineering, Computer Science, Natural Sciences' },
  Australia:   { flag: '', bestFor: 'Marine Biology, Mining, Business'              },
  UK:          { flag: '', bestFor: 'Law, Finance, Arts & Humanities'               },
  USA:         { flag: '', bestFor: 'Technology, Medicine, Research'                },
  Netherlands: { flag: '', bestFor: 'STEM, Sustainability, Agriculture'             },
  Sweden:      { flag: '', bestFor: 'Innovation, Design, Environment'               },
  'New Zealand':{ flag: '', bestFor: 'Agriculture, Environmental Science, Tourism'  },
};

// TODO: Replace with API call to /api/insights/trend-reasons
const trendReasonCards = [
  {
    country: 'Australia',
    flag: '',
    trendLabel: 'Declining (12% since 2019)',
    trendType: 'down',
    reasons: [
      'Stricter post-study work visa rules introduced in 2023',
      'Higher English proficiency score requirements (IELTS 7.0+)',
      'Increased domestic student intake reducing international seats',
      'Rising living costs reducing overall appeal',
    ],
    recommendation: 'Still a strong option - apply early and target universities outside Sydney/Melbourne for better chances.',
  },
  {
    country: 'UK',
    flag: '',
    trendLabel: 'Declining (4% since 2019)',
    trendType: 'down',
    reasons: [
      'Post-Brexit visa complexity for EU students',
      'Graduate Route visa under political review',
      'Tuition fees increased for international students',
      'Stronger competition from European alternatives (Germany, Netherlands)',
    ],
    recommendation: 'Russell Group universities remain prestigious - focus on specialized programs where UK leads globally.',
  },
  {
    country: 'Netherlands',
    flag: '',
    trendLabel: 'Rising (+12% since 2019)',
    trendType: 'up',
    reasons: [
      'Most programs taught in English',
      'Lower tuition vs UK/Australia',
      'Strong tech and engineering industry',
      'Easy post-study work permit (Orientation Year)',
    ],
    recommendation: 'Highly recommended for STEM students - apply to TU Delft, Eindhoven, or Wageningen.',
  },
];

/* -----------------------------------------------------------------------------
   SUB-COMPONENTS
   ----------------------------------------------------------------------------- */

function SampleDataBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
      Sample Data
    </span>
  );
}

function ChartSection({ title, badge = true, children, className = '' }) {
  return (
    <GlassPanel className={`border border-white/25 p-6 sm:p-8 shadow-xl ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-text">{title}</h2>
        {badge && <SampleDataBadge />}
      </div>
      {children}
    </GlassPanel>
  );
}

function AcceptanceGauge({ value }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  const dashArray = 2 * Math.PI * 42;
  const dashOffset = dashArray * (1 - pct / 100);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-text">{pct}%</span>
        <span className="text-[10px] text-text-muted font-medium leading-tight">Accept.</span>
      </div>
    </div>
  );
}

function TrendPill({ trend }) {
  if (trend === 'up')     return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"><HiOutlineArrowTrendingUp className="w-3.5 h-3.5" />Rising</span>;
  if (trend === 'down')   return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full"><HiOutlineArrowTrendingDown className="w-3.5 h-3.5" />Declining</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full"><i className="ti ti-minus text-gray-500"></i> Stable</span>;
}

function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton rounded-2xl ${className}`} />;
}

/* -----------------------------------------------------------------------------
   MAIN PAGE
   ----------------------------------------------------------------------------- */

export default function SmartInsights() {
  const [selectedCountry, setSelectedCountry] = useState('Canada');
  const [loaded, setLoaded] = useState(false);

  // Simulate a brief load to showcase skeleton UX
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 700);
    return () => clearTimeout(t);
  }, []);

  const selected = countryData.find((d) => d.country === selectedCountry);
  const details  = countryDetails[selectedCountry] || {};

  const handleNotifyMe = () => {
    toast.success("You'll be notified when live data is available!", {
      icon: <HiOutlineBell className="text-primary w-5 h-5" />,
      duration: 4000,
    });
  };

  return (
    <div className="space-y-8">

      {/* -- SECTION 1 - Page Header ------------------------------- */}
      <div>
        <PageHeader
          title="Smart Insights"
          subtitle="Compare countries and scholarships to make the right decision"
        >
          <div className="flex items-center gap-2">
            <HiOutlineChartBarSquare className="w-5 h-5 text-primary" />
          </div>
        </PageHeader>

        {/* Demo data notice banner */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-amber-700 font-semibold">
            <HiOutlineChartBarSquare className="w-5 h-5" />
            Demo Mode - Real data coming soon
          </div>
          <p className="text-sm text-amber-600 sm:ml-auto max-w-xl">
            This feature uses sample data to demonstrate insights. Actual data will be integrated as our platform grows.
          </p>
        </div>
      </div>

      {/* -- SECTION 2 - Country Bar Chart ------------------------- */}
      {!loaded ? (
        <GlassPanel className="border border-white/25 p-8">
          <SkeletonBlock className="h-8 w-72 mb-6" />
          <SkeletonBlock className="h-64 w-full" />
        </GlassPanel>
      ) : (
        <ChartSection title="Top Study Destinations by Student Acceptance Rate">
          <p className="text-sm text-text-muted mb-6 max-w-2xl">
            Compare acceptance rates across top study-abroad destinations. Green bars indicate rising trends,
            red bars signal increasing competition, and grey bars are stable.
          </p>
          <CountryBarChart data={countryData} xKey="country" yKey="acceptance" colorKey="trend" />
        </ChartSection>
      )}

      {/* -- SECTION 3 - Yearly Trend Line Chart ------------------- */}
      {!loaded ? (
        <GlassPanel className="border border-white/25 p-8">
          <SkeletonBlock className="h-8 w-80 mb-6" />
          <SkeletonBlock className="h-64 w-full" />
        </GlassPanel>
      ) : (
        <ChartSection title="Acceptance Rate Trends by Country (20192024)">
          <p className="text-sm text-text-muted mb-6 max-w-2xl">
            Six-year trend lines for the top 5 destinations. Click the country buttons below the chart to
            show or hide individual lines.
          </p>
          <TrendLineChart data={yearlyTrends} lines={TREND_LINES} />
        </ChartSection>
      )}

      {/* -- SECTION 4 - Decrease / Increase Reason Cards ----------- */}
      {loaded && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-text">Why Are Some Countries Getting Harder to Enter?</h2>
            <SampleDataBadge />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {trendReasonCards.map((card) => (
              <GlassCard
                key={card.country}
                className={`border ${card.trendType === 'up' ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'} p-6`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${card.trendType === 'up' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {card.trendType === 'up'
                      ? <HiOutlineArrowTrendingUp className="w-5 h-5 text-emerald-600" />
                      : <HiOutlineExclamationTriangle className="w-5 h-5 text-red-600" />
                    }
                  </div>
                  <div>
                    <p className="font-bold text-text text-base">{card.flag} {card.country}</p>
                    <p className={`text-xs font-semibold ${card.trendType === 'up' ? 'text-emerald-700' : 'text-red-700'}`}>
                      {card.trendLabel}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {card.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-none ${card.trendType === 'up' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {r}
                    </li>
                  ))}
                </ul>

                <div className={`rounded-xl p-3 text-sm leading-relaxed ${card.trendType === 'up' ? 'bg-emerald-100/60 text-emerald-800' : 'bg-amber-50 text-amber-800 border border-amber-100'}`}>
                  <span className="font-semibold"><HiOutlineLightBulb className="inline w-4 h-4 text-amber-500 mb-0.5" /> Recommendation: </span>
                  {card.recommendation}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* -- SECTION 5 - Scholarship Comparison Chart --------------- */}
      {!loaded ? (
        <GlassPanel className="border border-white/25 p-8">
          <SkeletonBlock className="h-8 w-96 mb-6" />
          <SkeletonBlock className="h-64 w-full" />
        </GlassPanel>
      ) : (
        <ChartSection title="Scholarship Availability vs Average Tuition Cost">
          <p className="text-sm text-text-muted mb-6 max-w-2xl">
            Blue bars show how many scholarships each country offers. The orange line tracks average annual
            tuition - lower is better for budget-conscious students.
          </p>
          <ScholarshipChart data={countryData} />
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-800">
            <HiOutlineLightBulb className="w-5 h-5 flex-none text-blue-500 mt-0.5" />
            <span>
              <strong>Germany and Sweden</strong> offer the lowest tuition costs with generous scholarship
              programs - ideal for budget-conscious students.
            </span>
          </div>
        </ChartSection>
      )}

      {/* -- SECTION 6 - Country Filter & Detail Panel -------------- */}
      {loaded && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-text">Explore a Specific Country</h2>
            <SampleDataBadge />
          </div>

          {/* Country selector */}
          <div className="flex flex-wrap gap-2">
            {countryData.map(({ country }) => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  selectedCountry === country
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white/55 text-secondary border-white/40 hover:bg-white/75'
                }`}
              >
                {countryDetails[country]?.flag} {country}
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <GlassPanel className="border border-white/25 p-6 sm:p-8 shadow-xl">
              <div className="grid gap-8 md:grid-cols-[auto_1fr]">
                {/* Left - gauge */}
                <div className="flex flex-col items-center gap-3">
                  <span className="text-5xl">{details.flag}</span>
                  <AcceptanceGauge value={selected.acceptance} />
                  <TrendPill trend={selected.trend} />
                </div>

                {/* Right - stats */}
                <div className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-extrabold text-text">{selected.country}</h3>
                    <p className="text-sm text-text-muted mt-0.5">Study destination overview</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-white/30 bg-white/55 p-4">
                      <div className="flex items-center gap-2 text-primary mb-1">
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Acceptance</span>
                      </div>
                      <p className="text-2xl font-black text-text">{selected.acceptance}%</p>
                    </div>

                    <div className="rounded-2xl border border-white/30 bg-white/55 p-4">
                      <div className="flex items-center gap-2 text-blue-500 mb-1">
                        <HiOutlineBuildingLibrary className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Scholarships</span>
                      </div>
                      <p className="text-2xl font-black text-text">{selected.scholarships}</p>
                    </div>

                    <div className="rounded-2xl border border-white/30 bg-white/55 p-4">
                      <div className="flex items-center gap-2 text-emerald-500 mb-1">
                        <HiOutlineCurrencyDollar className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Avg / Year</span>
                      </div>
                      <p className="text-2xl font-black text-text">${selected.avgCost.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/30 bg-white/55 px-4 py-3">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <HiOutlineAcademicCap className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Best For</span>
                    </div>
                    <p className="text-sm font-semibold text-text">{details.bestFor}</p>
                  </div>
                </div>
              </div>
            </GlassPanel>
          )}
        </div>
      )}

      {/* -- SECTION 7 - Coming Soon Banner ------------------------- */}
      {loaded && (
        <GlassPanel className="relative overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 p-8 shadow-xl text-center">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <HiOutlineRocketLaunch className="w-4 h-4" />
              Real Data Integration Coming Soon
            </div>

            <h2 className="text-2xl font-extrabold text-text">
              We're building live analytics for you
            </h2>

            <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-3 text-left mt-6">
              {[
                { icon: HiOutlineChartBarSquare, text: 'Live acceptance rate data updated annually' },
                { icon: HiOutlineSparkles,       text: 'Personalized recommendations based on your CGPA and major' },
                { icon: HiOutlineBell,           text: 'Scholarship deadline alerts' },
                { icon: HiOutlineGlobeAlt,       text: 'Alumni success stories by country' },
                { icon: HiOutlineAcademicCap,    text: 'Compare your profile against accepted students' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-2xl border border-white/30 bg-white/50 px-4 py-3">
                  <Icon className="w-4 h-4 flex-none text-primary mt-0.5" />
                  <span className="text-sm text-text-muted leading-5">{text}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <PrimaryButton onClick={handleNotifyMe} className="inline-flex items-center gap-2 px-8">
                <HiOutlineBell className="w-4 h-4" />
                Notify Me
              </PrimaryButton>
            </div>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
