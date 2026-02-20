import {
  HiOutlineGlobeAlt,
  HiOutlineAcademicCap,
  HiOutlineDocumentCheck,
  HiOutlineClipboardDocumentList,
  HiOutlineShieldCheck,
  HiOutlineStar,
} from 'react-icons/hi2';

const features = [
  {
    icon: HiOutlineGlobeAlt,
    title: 'Tier-Based Recommendations',
    description: 'Get personalized country recommendations based on your CGPA, major, and financial readiness.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: HiOutlineAcademicCap,
    title: 'Scholarships by Country',
    description: 'Discover scholarship opportunities tailored to your destination country and profile.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: HiOutlineClipboardDocumentList,
    title: 'Application Tracking',
    description: 'Track every application from submission to acceptance with real-time status updates.',
    color: 'text-primary',
    bg: 'bg-orange-50',
  },
  {
    icon: HiOutlineDocumentCheck,
    title: 'Document Verification',
    description: 'Upload and get your documents verified — transcripts, recommendation letters, SOPs.',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Visa Outcome',
    description: 'Receive visa decision updates and guidance for next steps after interview.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: HiOutlineStar,
    title: 'Post-Visa Ratings',
    description: 'Rate your experience and help future applicants make informed decisions.',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
];

export default function Features() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text">
            Everything You Need
          </h2>
          <p className="text-text-muted mt-3 max-w-lg mx-auto">
            One platform to manage your entire study abroad journey — from discovery to departure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="text-lg font-bold text-text mb-2">{f.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
