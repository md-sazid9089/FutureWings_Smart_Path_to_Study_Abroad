import {
  HiOutlineUserPlus,
  HiOutlineIdentification,
  HiOutlineDocumentArrowUp,
  HiOutlineGlobeAlt,
  HiOutlinePaperAirplane,
  HiOutlineCheckBadge,
} from 'react-icons/hi2';

const steps = [
  { icon: HiOutlineUserPlus, title: 'Create Account', description: 'Sign up in seconds and get started.' },
  { icon: HiOutlineIdentification, title: 'Complete Profile', description: 'Add CGPA, major, and fund score.' },
  { icon: HiOutlineDocumentArrowUp, title: 'Upload Documents', description: 'Submit transcripts and SOPs for verification.' },
  { icon: HiOutlineGlobeAlt, title: 'Get Recommendations', description: 'Receive tier-based country and program matches.' },
  { icon: HiOutlinePaperAirplane, title: 'Apply & Track', description: 'Apply to programs and monitor application status.' },
  { icon: HiOutlineCheckBadge, title: 'Visa & Rate', description: 'Get visa outcome and rate your experience.' },
];

export default function HowItWorks() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
            Process
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text">
            How It Works
          </h2>
          <p className="text-text-muted mt-3 max-w-lg mx-auto">
            Six simple steps from signup to studying abroad.
          </p>
        </div>

        {/* Desktop: horizontal stepper */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-8 left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30" />
            <div className="grid grid-cols-6 gap-4">
              {steps.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center relative">
                  <div className="w-16 h-16 rounded-2xl glass-strong flex items-center justify-center mb-4 relative z-10 group hover:scale-110 transition-transform">
                    <s.icon className="w-7 h-7 text-primary" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-sm">
                      {i + 1}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-text mb-1">{s.title}</h4>
                  <p className="text-xs text-text-muted leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical stepper */}
        <div className="lg:hidden space-y-0">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4">
              {/* Left: icon + connector */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl glass-strong flex items-center justify-center relative shrink-0">
                  <s.icon className="w-6 h-6 text-primary" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 h-full min-h-[40px] bg-gradient-to-b from-primary/30 to-accent/20 my-1" />
                )}
              </div>
              {/* Right: text */}
              <div className="pb-8">
                <h4 className="font-bold text-text">{s.title}</h4>
                <p className="text-sm text-text-muted mt-0.5">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
