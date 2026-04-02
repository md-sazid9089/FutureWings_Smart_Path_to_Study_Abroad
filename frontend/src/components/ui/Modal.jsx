import { useEffect } from 'react';

export default function Modal({ open, onClose, title, wide = false, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className={`relative glass-strong rounded-3xl p-8 shadow-2xl w-full
        ${wide ? 'max-w-3xl' : 'max-w-lg'}
        max-h-[90vh] overflow-y-auto animate-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 transition-colors text-secondary"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
