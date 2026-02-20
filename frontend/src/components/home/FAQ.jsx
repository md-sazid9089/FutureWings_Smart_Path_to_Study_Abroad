import { useState } from 'react';
import { HiOutlineChevronDown } from 'react-icons/hi2';

const faqs = [
  {
    q: 'How does the tier-based recommendation work?',
    a: 'We evaluate your CGPA, major, and financial readiness (fund score) to assign a tier. Each tier maps to a curated set of countries that best match your academic and financial profile.',
  },
  {
    q: 'Is FutureWings free to use?',
    a: 'Yes! Creating an account, getting recommendations, and tracking applications is completely free. We believe in making study abroad accessible to everyone.',
  },
  {
    q: 'How are documents verified?',
    a: 'Once you upload documents (transcripts, SOPs, recommendation letters), our admin team reviews and verifies them. You\'ll see the status update in real-time on your dashboard.',
  },
  {
    q: 'Can I apply to multiple universities?',
    a: 'Absolutely. You can apply to any number of programs across different universities and track each application separately from your dashboard.',
  },
  {
    q: 'What happens after I receive a visa outcome?',
    a: 'After your visa decision, you can rate your overall experience — the country, the process, and the support you received. This helps future applicants.',
  },
  {
    q: 'What countries are currently supported?',
    a: 'We support major study destinations including the US, UK, Canada, Germany, Australia, and more. New countries are added regularly based on demand.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-semibold uppercase tracking-wider mb-3">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-semibold text-text pr-4">{f.q}</span>
                <HiOutlineChevronDown
                  className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-300 ${
                    openIdx === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIdx === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-6 pb-4 text-sm text-text-muted leading-relaxed">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
