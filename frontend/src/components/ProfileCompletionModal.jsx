import { useEffect, useState } from 'react';
import { getProfileCompletion } from '../utils/profileCompletion';
import { HiOutlineUserCircle, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';

export default function ProfileCompletionModal({ user, onClose, onComplete }) {
  const [show, setShow] = useState(false);
  const { percentage, fields } = getProfileCompletion(user);

  useEffect(() => {
    // trigger entrance animation shortly after mount
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300); // Wait for transition
  };

  const handleComplete = () => {
    setShow(false);
    setTimeout(onComplete, 300);
  };

  const progressBarColor = percentage > 75 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 px-4 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className={`bg-white rounded-3xl shadow-2xl max-w-[480px] w-full p-8 transition-transform duration-300 ${
          show ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
        }`}
      >
        <div className="flex justify-center mb-5">
          <div className="bg-primary/10 p-4 rounded-full">
            <HiOutlineUserCircle className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
          Complete Your Profile for Better Matches
        </h2>
        
        <p className="text-slate-600 text-center text-sm mb-6 leading-relaxed">
          Students with complete profiles get 3x better university and scholarship recommendations.
        </p>

        <div className="mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-end mb-2">
            <span className="font-semibold text-slate-800 text-sm">Profile {percentage}% Complete</span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden mb-4">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${progressBarColor}`}
              style={{ width: `${Math.max(percentage, 5)}%` }}
            />
          </div>

          <div className="space-y-2.5 mt-4">
            {fields.map(f => {
              const isFilled = f.value && String(f.value).trim() !== '';
              return (
                <div key={f.key} className="flex items-center gap-2.5 text-sm">
                  {isFilled ? (
                    <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500 flex-none" />
                  ) : (
                    <HiOutlineXCircle className="w-5 h-5 text-red-400 flex-none" />
                  )}
                  <span className={isFilled ? 'text-slate-700' : 'text-slate-500'}>
                    {f.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleComplete}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
          >
            Complete My Profile ->
          </button>
          
          <button
            onClick={handleClose}
            className="w-full bg-transparent hover:bg-slate-100 text-slate-500 font-medium py-3 rounded-xl transition-colors"
          >
            Remind Me Later
          </button>
        </div>
      </div>
    </div>
  );
}
