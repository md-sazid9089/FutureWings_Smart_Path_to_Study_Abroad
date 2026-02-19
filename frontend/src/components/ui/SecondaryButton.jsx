export default function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full
        bg-white/60 text-secondary font-semibold text-sm
        border border-white/50 backdrop-blur-sm
        hover:bg-white/80 hover:text-primary
        active:scale-[0.97] transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
